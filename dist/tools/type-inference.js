"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patterns = exports.SchemaBuilder = void 0;
exports.inferFromExample = inferFromExample;
exports.schema = schema;
exports.mergeSchemas = mergeSchemas;
exports.extendSchema = extendSchema;
const zod_1 = require("zod");
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
function inferFromExample(example) {
    const shape = {};
    for (const [key, value] of Object.entries(example)) {
        shape[key] = inferValueType(value);
    }
    return zod_1.z.object(shape);
}
/**
 * 推断单个值的类型
 */
function inferValueType(value) {
    if (value === null || value === undefined) {
        return zod_1.z.any();
    }
    const type = typeof value;
    switch (type) {
        case 'string':
            return zod_1.z.string();
        case 'number':
            return zod_1.z.number();
        case 'boolean':
            return zod_1.z.boolean();
        case 'object':
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return zod_1.z.array(zod_1.z.any());
                }
                return zod_1.z.array(inferValueType(value[0]));
            }
            return inferFromExample(value);
        default:
            return zod_1.z.any();
    }
}
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
class SchemaBuilder {
    constructor() {
        this.fields = {};
    }
    string(name, description) {
        this.fields[name] = description ? zod_1.z.string().describe(description) : zod_1.z.string();
        return this;
    }
    number(name, description) {
        this.fields[name] = description ? zod_1.z.number().describe(description) : zod_1.z.number();
        return this;
    }
    boolean(name, description) {
        this.fields[name] = description ? zod_1.z.boolean().describe(description) : zod_1.z.boolean();
        return this;
    }
    array(name, itemSchema, description) {
        const schema = zod_1.z.array(itemSchema);
        this.fields[name] = description ? schema.describe(description) : schema;
        return this;
    }
    object(name, shape, description) {
        const schema = zod_1.z.object(shape);
        this.fields[name] = description ? schema.describe(description) : schema;
        return this;
    }
    enum(name, values, description) {
        const schema = zod_1.z.enum(values);
        this.fields[name] = description ? schema.describe(description) : schema;
        return this;
    }
    optional(name) {
        if (this.fields[name]) {
            this.fields[name] = this.fields[name].optional();
        }
        return this;
    }
    default(name, defaultValue) {
        if (this.fields[name]) {
            this.fields[name] = this.fields[name].default(defaultValue);
        }
        return this;
    }
    custom(name, schema) {
        this.fields[name] = schema;
        return this;
    }
    build() {
        return zod_1.z.object(this.fields);
    }
}
exports.SchemaBuilder = SchemaBuilder;
/**
 * 创建 schema 构建器
 */
function schema() {
    return new SchemaBuilder();
}
/**
 * 快速定义常用的 schema 模式
 */
exports.patterns = {
    /**
     * 文件路径
     */
    filePath: (description = 'File path') => zod_1.z.string().describe(description),
    /**
     * 目录路径
     */
    dirPath: (description = 'Directory path') => zod_1.z.string().describe(description),
    /**
     * URL
     */
    url: (description = 'URL') => zod_1.z.string().url().describe(description),
    /**
     * Email
     */
    email: (description = 'Email address') => zod_1.z.string().email().describe(description),
    /**
     * 正整数
     */
    positiveInt: (description = 'Positive integer') => zod_1.z.number().int().positive().describe(description),
    /**
     * 非负整数
     */
    nonNegativeInt: (description = 'Non-negative integer') => zod_1.z.number().int().nonnegative().describe(description),
    /**
     * 字符串数组
     */
    stringArray: (description = 'Array of strings') => zod_1.z.array(zod_1.z.string()).describe(description),
    /**
     * 可选字符串
     */
    optionalString: (description) => zod_1.z.string().optional().describe(description || 'Optional string'),
    /**
     * 可选数字
     */
    optionalNumber: (description) => zod_1.z.number().optional().describe(description || 'Optional number'),
    /**
     * JSON 对象
     */
    json: (description = 'JSON object') => zod_1.z.record(zod_1.z.string(), zod_1.z.any()).describe(description),
};
/**
 * 辅助函数：合并多个 schema
 */
function mergeSchemas(...schemas) {
    if (schemas.length === 0) {
        return zod_1.z.object({});
    }
    if (schemas.length === 1) {
        return schemas[0];
    }
    // 使用 z.intersection 合并
    return schemas.reduce((acc, schema) => acc.and(schema));
}
/**
 * 辅助函数：扩展 schema
 */
function extendSchema(base, extension) {
    if (base instanceof zod_1.z.ZodObject) {
        return base.extend(extension);
    }
    // 如果不是 object schema，创建新的 object schema
    return zod_1.z.object(extension);
}
