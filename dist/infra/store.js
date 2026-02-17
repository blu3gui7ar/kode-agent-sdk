"use strict";
/**
 * Store 模块 - Agent 持久化
 *
 * 本文件已重构为模块化结构，实际实现已拆分到 store/ 目录下：
 * - store/types.ts        - 接口和类型定义
 * - store/json-store.ts   - JSONStore 文件存储实现
 * - db/sqlite/            - SQLite 数据库实现
 * - db/postgres/          - PostgreSQL 数据库实现
 *
 * 本文件仅做向后兼容的导出
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// 重导出所有内容以保持向后兼容
__exportStar(require("./store/index"), exports);
