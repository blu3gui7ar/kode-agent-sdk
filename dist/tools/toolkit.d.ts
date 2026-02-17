import { ZodType } from 'zod';
import type { ToolInstance } from '../index';
/**
 * ToolKit 装饰器元数据
 */
interface ToolMethodMetadata {
    description?: string;
    parameters?: ZodType;
    metadata?: any;
}
/**
 * 工具方法装饰器
 *
 * @example
 * ```ts
 * class WeatherKit extends ToolKit {
 *   @toolMethod({ description: 'Get current weather' })
 *   async getWeather(args: { city: string }, ctx: ToolContext) {
 *     return { temperature: 25, city: args.city };
 *   }
 * }
 * ```
 */
export declare function toolMethod(metadata?: ToolMethodMetadata): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * ToolKit 基类
 *
 * 提供组织化的工具定义方式
 *
 * @example
 * ```ts
 * class DatabaseKit extends ToolKit {
 *   constructor(private db: Database) {
 *     super('db');
 *   }
 *
 *   @toolMethod({
 *     description: 'Query database',
 *     parameters: z.object({ query: z.string() })
 *   })
 *   async query(args: { query: string }, ctx: ToolContext) {
 *     return await this.db.query(args.query);
 *   }
 *
 *   @toolMethod({ description: 'Insert record' })
 *   async insert(args: { table: string; data: any }, ctx: ToolContext) {
 *     return await this.db.insert(args.table, args.data);
 *   }
 * }
 *
 * // 使用
 * const dbKit = new DatabaseKit(myDatabase);
 * const tools = dbKit.getTools();
 * // 返回: [db__query, db__insert]
 * ```
 */
export declare class ToolKit {
    private readonly namespace?;
    constructor(namespace?: string | undefined);
    /**
     * 获取所有工具实例
     */
    getTools(): ToolInstance[];
    /**
     * 获取工具名称列表
     */
    getToolNames(): string[];
}
export {};
