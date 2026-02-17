import { ZodType } from 'zod';
import { ToolInstance } from './registry';
import { ToolContext } from '../core/types';
import { Hooks } from '../core/hooks';
/**
 * 工具定义接口
 */
export interface ToolDefinition<TArgs = any, TResult = any> {
    name: string;
    description?: string;
    parameters?: ZodType<TArgs>;
    execute: (args: TArgs, ctx: EnhancedToolContext) => Promise<TResult> | TResult;
    metadata?: {
        version?: string;
        tags?: string[];
        cacheable?: boolean;
        cacheTTL?: number;
        timeout?: number;
        concurrent?: boolean;
        readonly?: boolean;
    };
    hooks?: Hooks;
}
/**
 * 工具上下文增强接口
 */
export interface EnhancedToolContext extends ToolContext {
    emit(eventType: string, data?: any): void;
}
/**
 * 重载 1: tool(name, executeFn)
 * 零配置模式，自动推断类型
 */
export declare function tool<TArgs = any, TResult = any>(name: string, executeFn: (args: TArgs, ctx?: EnhancedToolContext) => Promise<TResult> | TResult): ToolInstance;
/**
 * 重载 2: tool(definition)
 * 完整配置模式
 */
export declare function tool<TArgs = any, TResult = any>(definition: ToolDefinition<TArgs, TResult>): ToolInstance;
/**
 * 批量定义工具
 */
export declare function tools(definitions: ToolDefinition[]): ToolInstance[];
