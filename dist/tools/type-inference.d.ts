import { z, ZodType, ZodTypeAny } from 'zod';
/**
 * TypeScript 类型到 Zod schema 的自动推断
 *
 * 注意：由于 TypeScript 类型在运行时被擦除，我们无法直接从类型生成 schema。
 * 这个模块提供了一些辅助函数来简化 schema 定义。
 */
/**
 * 从示例对象推断 Zod schema
 *
 * @example
 * ```ts
 * const schema = inferFromExample({
 *   name: 'string',
 *   age: 0,
 *   active: true,
 *   tags: ['string']
 * });
 * // 等价于:
 * z.object({
 *   name: z.string(),
 *   age: z.number(),
 *   active: z.boolean(),
 *   tags: z.array(z.string())
 * })
 * ```
 */
export declare function inferFromExample<T extends Record<string, any>>(example: T): ZodType<any>;
/**
 * Schema 构建器 - 提供流畅的 API
 *
 * @example
 * ```ts
 * const schema = schema()
 *   .string('name', 'User name')
 *   .number('age', 'User age').optional()
 *   .boolean('active').default(true)
 *   .array('tags', z.string())
 *   .build();
 * ```
 */
export declare class SchemaBuilder {
    private fields;
    string(name: string, description?: string): this;
    number(name: string, description?: string): this;
    boolean(name: string, description?: string): this;
    array(name: string, itemSchema: ZodTypeAny, description?: string): this;
    object(name: string, shape: Record<string, ZodTypeAny>, description?: string): this;
    enum(name: string, values: readonly [string, ...string[]], description?: string): this;
    optional(name: string): this;
    default(name: string, defaultValue: any): this;
    custom(name: string, schema: ZodTypeAny): this;
    build(): ZodType<any>;
}
/**
 * 创建 schema 构建器
 */
export declare function schema(): SchemaBuilder;
/**
 * 快速定义常用的 schema 模式
 */
export declare const patterns: {
    /**
     * 文件路径
     */
    filePath: (description?: string) => z.ZodString;
    /**
     * 目录路径
     */
    dirPath: (description?: string) => z.ZodString;
    /**
     * URL
     */
    url: (description?: string) => z.ZodString;
    /**
     * Email
     */
    email: (description?: string) => z.ZodString;
    /**
     * 正整数
     */
    positiveInt: (description?: string) => z.ZodNumber;
    /**
     * 非负整数
     */
    nonNegativeInt: (description?: string) => z.ZodNumber;
    /**
     * 字符串数组
     */
    stringArray: (description?: string) => z.ZodArray<z.ZodString>;
    /**
     * 可选字符串
     */
    optionalString: (description?: string) => z.ZodOptional<z.ZodString>;
    /**
     * 可选数字
     */
    optionalNumber: (description?: string) => z.ZodOptional<z.ZodNumber>;
    /**
     * JSON 对象
     */
    json: (description?: string) => z.ZodRecord<z.ZodString, z.ZodAny>;
};
/**
 * 从 JSDoc 注释推断 schema（实验性）
 *
 * 这需要在构建时使用 TypeScript Compiler API 解析
 * 当前仅提供接口，实际实现需要编译时支持
 */
export interface JSDocSchema {
    /**
     * @param name - Parameter name
     * @param type - TypeScript type string (e.g., 'string', 'number', 'Array<string>')
     * @param description - Parameter description
     * @param optional - Whether parameter is optional
     */
    param(name: string, type: string, description?: string, optional?: boolean): this;
    build(): ZodType<any>;
}
/**
 * 辅助函数：合并多个 schema
 */
export declare function mergeSchemas(...schemas: ZodType<any>[]): ZodType<any>;
/**
 * 辅助函数：扩展 schema
 */
export declare function extendSchema<T extends ZodType<any>>(base: T, extension: Record<string, ZodTypeAny>): ZodType<any>;
