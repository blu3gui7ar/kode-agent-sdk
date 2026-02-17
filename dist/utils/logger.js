"use strict";
/**
 * 日志工具模块
 *
 * 仅在 NODE_ENV=local 时输出日志，生产环境静默
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * 检查是否启用日志（仅在本地开发环境）
 */
function isLoggingEnabled() {
    return process.env.NODE_ENV === 'local';
}
/**
 * 日志输出（仅在 NODE_ENV=local 时输出）
 */
exports.logger = {
    log: (...args) => {
        if (isLoggingEnabled()) {
            console.log(...args);
        }
    },
    info: (...args) => {
        if (isLoggingEnabled()) {
            console.info(...args);
        }
    },
    warn: (...args) => {
        if (isLoggingEnabled()) {
            console.warn(...args);
        }
    },
    error: (...args) => {
        if (isLoggingEnabled()) {
            console.error(...args);
        }
    },
    debug: (...args) => {
        if (isLoggingEnabled()) {
            console.debug(...args);
        }
    },
};
