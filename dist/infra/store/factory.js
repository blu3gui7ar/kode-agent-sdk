"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = createStore;
exports.createExtendedStore = createExtendedStore;
const json_store_1 = require("./json-store");
/**
 * Store 工厂函数
 * 根据配置创建对应类型的 Store 实例
 *
 * @param config - Store 配置
 * @returns Store 实例
 *
 * @example
 * ```typescript
 * // 创建 JSON Store
 * const jsonStore = createStore({ type: 'json', baseDir: './data' });
 *
 * // 创建 SQLite Store
 * const sqliteStore = createStore({
 *   type: 'sqlite',
 *   dbPath: './agents.db',
 *   fileStoreBaseDir: './data'
 * });
 *
 * // 创建 PostgreSQL Store
 * const pgStore = createStore({
 *   type: 'postgres',
 *   connection: {
 *     host: 'localhost',
 *     port: 5432,
 *     database: 'agents',
 *     user: 'postgres',
 *     password: 'secret'
 *   },
 *   fileStoreBaseDir: './data'
 * });
 * ```
 */
function createStore(config) {
    switch (config.type) {
        case 'json':
            return new json_store_1.JSONStore(config.baseDir);
        case 'sqlite': {
            // 动态导入避免不需要时加载依赖
            const { SqliteStore } = require('../db/sqlite/sqlite-store');
            return new SqliteStore(config.dbPath, config.fileStoreBaseDir);
        }
        case 'postgres': {
            // 动态导入避免不需要时加载依赖
            const { PostgresStore } = require('../db/postgres/postgres-store');
            return new PostgresStore(config.connection, config.fileStoreBaseDir);
        }
        default:
            // TypeScript exhaustive check
            const _exhaustive = config;
            throw new Error(`未知的 Store 类型: ${_exhaustive.type}`);
    }
}
/**
 * 创建 ExtendedStore（带高级功能）
 * 仅支持 SQLite 和 PostgreSQL
 *
 * @param config - Store 配置（必须是 sqlite 或 postgres）
 * @returns ExtendedStore 实例
 */
function createExtendedStore(config) {
    switch (config.type) {
        case 'sqlite': {
            const { SqliteStore } = require('../db/sqlite/sqlite-store');
            return new SqliteStore(config.dbPath, config.fileStoreBaseDir);
        }
        case 'postgres': {
            const { PostgresStore } = require('../db/postgres/postgres-store');
            return new PostgresStore(config.connection, config.fileStoreBaseDir);
        }
        default:
            const _exhaustive = config;
            throw new Error(`未知的 Store 类型: ${_exhaustive.type}`);
    }
}
