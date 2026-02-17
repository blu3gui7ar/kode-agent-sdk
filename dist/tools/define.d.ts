/**
 * 简化的工具定义 API - 提供更好的开发体验
 *
 * 设计目标：
 * 1. 自动从 TypeScript 类型生成 input_schema
 * 2. 简化 metadata 为 readonly/noEffect 布尔值
 * 3. 支持工具内发射自定义事件
 */
import { ToolContext } from '../core/types';
import { ToolInstance } from './registry';
export interface ToolAttributes {
    /** 工具是否为只读（不修改任何状态） */
    readonly?: boolean;
    /** 工具是否无副作用（可安全重试） */
    noEffect?: boolean;
}
export interface ParamDef {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description?: string;
    required?: boolean;
    default?: any;
    enum?: any[];
    items?: ParamDef;
    properties?: Record<string, ParamDef>;
}
export interface EnhancedToolContext extends ToolContext {
    /** 发射自定义事件（会自动添加到 monitor 通道） */
    emit(eventType: string, data?: any): void;
}
export interface SimpleToolDef<TArgs = any, TResult = any> {
    /** 工具名称 */
    name: string;
    /** 工具描述 */
    description: string;
    /** 参数定义（可选，如果提供则自动生成 schema） */
    params?: Record<string, ParamDef>;
    /** 或者直接提供 JSON Schema（兼容老方式） */
    input_schema?: any;
    /** 工具属性 */
    attributes?: ToolAttributes;
    /** Prompt 说明书 */
    prompt?: string;
    /** 执行函数 */
    exec(args: TArgs, ctx: EnhancedToolContext): Promise<TResult> | TResult;
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
export declare function defineTool<TArgs = any, TResult = any>(def: SimpleToolDef<TArgs, TResult>, options?: {
    autoRegister?: boolean;
}): ToolInstance;
/**
 * 批量定义工具
 */
export declare function defineTools(defs: SimpleToolDef[]): ToolInstance[];
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
export declare function tool(config: Omit<SimpleToolDef, 'name' | 'exec'>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * 从带装饰器的类提取所有工具
 */
export declare function extractTools(instance: any): ToolInstance[];
