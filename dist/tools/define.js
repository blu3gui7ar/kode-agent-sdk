"use strict";
/**
 * 简化的工具定义 API - 提供更好的开发体验
 *
 * 设计目标：
 * 1. 自动从 TypeScript 类型生成 input_schema
 * 2. 简化 metadata 为 readonly/noEffect 布尔值
 * 3. 支持工具内发射自定义事件
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineTool = defineTool;
exports.defineTools = defineTools;
exports.tool = tool;
exports.extractTools = extractTools;
const registry_1 = require("./registry");
/**
 * 从参数定义自动生成 JSON Schema
 */
function generateSchema(params) {
    if (!params) {
        return { type: 'object', properties: {} };
    }
    const properties = {};
    const required = [];
    for (const [key, def] of Object.entries(params)) {
        const prop = { type: def.type };
        if (def.description)
            prop.description = def.description;
        if (def.enum)
            prop.enum = def.enum;
        if (def.default !== undefined)
            prop.default = def.default;
        if (def.type === 'array' && def.items) {
            prop.items = generateSchemaProp(def.items);
        }
        if (def.type === 'object' && def.properties) {
            const nested = generateSchema(def.properties);
            prop.properties = nested.properties;
            if (nested.required?.length > 0) {
                prop.required = nested.required;
            }
        }
        properties[key] = prop;
        if (def.required !== false) { // default required
            required.push(key);
        }
    }
    return {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {}),
    };
}
function generateSchemaProp(def) {
    const prop = { type: def.type };
    if (def.description)
        prop.description = def.description;
    if (def.enum)
        prop.enum = def.enum;
    if (def.type === 'array' && def.items) {
        prop.items = generateSchemaProp(def.items);
    }
    if (def.type === 'object' && def.properties) {
        const nested = generateSchema(def.properties);
        prop.properties = nested.properties;
        if (nested.required?.length > 0) {
            prop.required = nested.required;
        }
    }
    return prop;
}
/**
 * 定义工具（简化版）
 *
 * @example
 * ```ts
 * const greet = defineTool({
 *   name: 'greet',
 *   description: 'Greet a person',
 *   params: {
 *     name: { type: 'string', description: 'Person name' },
 *     formal: { type: 'boolean', description: 'Use formal greeting', required: false }
 *   },
 *   attributes: { readonly: true, noEffect: true },
 *   async exec(args, ctx) {
 *     const greeting = args.formal ? `Good day, ${args.name}` : `Hi ${args.name}!`;
 *
 *     // 自定义事件
 *     ctx.emit('greeting_sent', { name: args.name, greeting });
 *
 *     return { greeting };
 *   }
 * });
 * ```
 */
function defineTool(def, options) {
    // 自动生成 schema 或使用提供的
    const input_schema = def.input_schema || generateSchema(def.params);
    const toolInstance = {
        name: def.name,
        description: def.description,
        input_schema,
        prompt: def.prompt,
        async exec(args, ctx) {
            // 增强上下文，添加 emit 方法
            const enhancedCtx = {
                ...ctx,
                emit(eventType, data) {
                    // 发射自定义事件到 monitor 通道
                    ctx.agent?.events?.emitMonitor({
                        type: 'tool_custom_event',
                        toolName: def.name,
                        eventType,
                        data,
                        timestamp: Date.now(),
                    });
                },
            };
            return await def.exec(args, enhancedCtx);
        },
        toDescriptor() {
            const metadata = {
                tuned: false,
            };
            // 转换简化的 attributes 为内部 metadata
            if (def.attributes?.readonly) {
                metadata.access = 'read';
                metadata.mutates = false;
            }
            else {
                metadata.access = 'write';
                metadata.mutates = true;
            }
            if (def.attributes?.noEffect !== undefined) {
                metadata.safe = def.attributes.noEffect;
            }
            if (def.prompt) {
                metadata.prompt = def.prompt;
            }
            return {
                source: 'registered',
                name: def.name,
                registryId: def.name,
                metadata,
            };
        },
    };
    // 自动注册到全局 registry (支持 Resume)
    if (options?.autoRegister !== false) {
        registry_1.globalToolRegistry.register(def.name, (_config) => {
            // 工厂函数：根据 config 重建工具实例
            // 注意：使用 autoRegister: false 避免重复注册
            return defineTool(def, { autoRegister: false });
        });
    }
    return toolInstance;
}
/**
 * 批量定义工具
 */
function defineTools(defs) {
    return defs.map((def) => defineTool(def));
}
/**
 * 工具装饰器（实验性 - 需要 experimentalDecorators）
 *
 * @example
 * ```ts
 * class MyTools {
 *   @tool({
 *     description: 'Calculate sum',
 *     params: {
 *       a: { type: 'number' },
 *       b: { type: 'number' }
 *     },
 *     attributes: { readonly: true, noEffect: true }
 *   })
 *   async sum(args: { a: number; b: number }, ctx: EnhancedToolContext) {
 *     return args.a + args.b;
 *   }
 * }
 * ```
 */
function tool(config) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        // 存储工具配置到类的元数据
        if (!target.constructor._toolConfigs) {
            target.constructor._toolConfigs = new Map();
        }
        target.constructor._toolConfigs.set(propertyKey, {
            ...config,
            name: propertyKey,
            exec: originalMethod,
        });
    };
}
/**
 * 从带装饰器的类提取所有工具
 */
function extractTools(instance) {
    const configs = instance.constructor._toolConfigs;
    if (!configs)
        return [];
    const tools = [];
    for (const [_methodName, config] of configs) {
        tools.push(defineTool({
            ...config,
            exec: config.exec.bind(instance),
        }, { autoRegister: true } // 装饰器定义的工具也自动注册
        ));
    }
    return tools;
}
