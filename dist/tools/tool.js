"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tool = tool;
exports.tools = tools;
const zod_1 = require("zod");
const registry_1 = require("./registry");
/**
 * 实现
 */
function tool(nameOrDef, executeFn) {
    // 解析参数
    const def = typeof nameOrDef === 'string'
        ? {
            name: nameOrDef,
            description: `Execute ${nameOrDef}`,
            parameters: zod_1.z.any(),
            execute: executeFn,
        }
        : nameOrDef;
    // 生成 JSON Schema (使用 Zod v4 原生方法)
    let input_schema;
    if (def.parameters) {
        // Zod v4: 使用 zodToJsonSchema 的替代方案
        // 由于 zod-to-json-schema 已被弃用，我们需要手动转换 Zod schema 为 JSON Schema
        input_schema = zodToJsonSchemaManual(def.parameters);
    }
    else {
        input_schema = { type: 'object', properties: {} };
    }
    // 创建工具实例
    const toolInstance = {
        name: def.name,
        description: def.description || `Execute ${def.name}`,
        input_schema,
        hooks: def.hooks,
        async exec(args, ctx) {
            try {
                // 参数验证
                if (def.parameters) {
                    const parseResult = def.parameters.safeParse(args);
                    if (!parseResult.success) {
                        return {
                            ok: false,
                            error: `Invalid parameters: ${parseResult.error.message}`,
                            _validationError: true,
                        };
                    }
                    args = parseResult.data;
                }
                // 增强上下文
                const enhancedCtx = {
                    ...ctx,
                    emit(eventType, data) {
                        ctx.agent?.events?.emitMonitor({
                            type: 'tool_custom_event',
                            toolName: def.name,
                            eventType,
                            data,
                            timestamp: Date.now(),
                        });
                    },
                };
                // 执行工具
                const result = await def.execute(args, enhancedCtx);
                // 如果工具返回 {ok: false}，保持原样
                if (result && typeof result === 'object' && 'ok' in result && result.ok === false) {
                    return result;
                }
                // 正常结果
                return result;
            }
            catch (error) {
                // 捕获工具执行中的所有错误，统一返回格式
                return {
                    ok: false,
                    error: error?.message || String(error),
                    _thrownError: true,
                };
            }
        },
        toDescriptor() {
            return {
                source: 'registered',
                name: def.name,
                registryId: def.name,
                metadata: {
                    version: def.metadata?.version,
                    tags: def.metadata?.tags,
                    cacheable: def.metadata?.cacheable,
                    cacheTTL: def.metadata?.cacheTTL,
                    timeout: def.metadata?.timeout,
                    concurrent: def.metadata?.concurrent,
                    access: def.metadata?.readonly ? 'read' : 'write',
                    mutates: !def.metadata?.readonly,
                },
            };
        },
    };
    // 自动注册到全局 registry
    registry_1.globalToolRegistry.register(def.name, () => toolInstance);
    return toolInstance;
}
/**
 * 批量定义工具
 */
function tools(definitions) {
    return definitions.map((def) => tool(def));
}
/**
 * 手动转换 Zod Schema 为 JSON Schema (替代已弃用的 zod-to-json-schema)
 *
 * 设计原则：
 * - 简洁：只处理工具定义中常用的 Zod 类型
 * - 健壮：对于不支持的类型，返回默认的 object schema
 * - 可扩展：可以根据需要添加更多类型的支持
 */
function zodToJsonSchemaManual(zodType) {
    // 处理 ZodEffects 类型（经过 .transform()、.refine() 等转换的 schema）
    const typeName = zodType._def?.typeName;
    if (typeName === 'ZodEffects' || (typeof typeName === 'string' && typeName.includes('ZodEffects'))) {
        const innerSchema = zodType._def.schema;
        if (innerSchema) {
            return zodToJsonSchemaManual(innerSchema);
        }
        return { type: 'object', properties: {}, required: [] };
    }
    // 如果是 ZodObject
    if (zodType instanceof zod_1.z.ZodObject) {
        // Zod v4: shape 是属性而非方法
        const shape = zodType.shape || zodType._def.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            const fieldSchema = convertZodType(value);
            properties[key] = fieldSchema;
            // 检查是否可选
            const isOptional = isZodTypeOptional(value);
            if (!isOptional) {
                required.push(key);
            }
        }
        return {
            type: 'object',
            properties,
            required,
        };
    }
    // 默认返回空对象
    return {
        type: 'object',
        properties: {},
        required: [],
    };
}
/**
 * 转换 Zod 类型为 JSON Schema 类型
 */
function convertZodType(zodType) {
    // 处理可选类型
    if (zodType instanceof zod_1.z.ZodOptional) {
        const innerType = zodType._def.innerType;
        return convertZodType(innerType);
    }
    // 处理默认值类型
    if (zodType instanceof zod_1.z.ZodDefault) {
        const innerType = zodType._def.innerType;
        return convertZodType(innerType);
    }
    // 基本类型映射
    if (zodType instanceof zod_1.z.ZodString) {
        return { type: 'string' };
    }
    if (zodType instanceof zod_1.z.ZodNumber) {
        return { type: 'number' };
    }
    if (zodType instanceof zod_1.z.ZodBoolean) {
        return { type: 'boolean' };
    }
    if (zodType instanceof zod_1.z.ZodArray) {
        const elementType = zodType._def.type;
        return {
            type: 'array',
            items: convertZodType(elementType),
        };
    }
    if (zodType instanceof zod_1.z.ZodObject) {
        return zodToJsonSchemaManual(zodType);
    }
    if (zodType instanceof zod_1.z.ZodEnum) {
        return {
            type: 'string',
            enum: zodType._def.values,
        };
    }
    if (zodType instanceof zod_1.z.ZodLiteral) {
        return {
            type: typeof zodType._def.value,
            const: zodType._def.value,
        };
    }
    // 未知类型，默认为 object（避免意外返回 string）
    return { type: 'object', properties: {}, required: [] };
}
/**
 * 检查 Zod 类型是否可选
 */
function isZodTypeOptional(zodType) {
    return (zodType instanceof zod_1.z.ZodOptional ||
        zodType instanceof zod_1.z.ZodDefault ||
        zodType.isNullable?.() === true);
}
