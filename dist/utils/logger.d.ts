/**
 * 日志工具模块
 *
 * 仅在 NODE_ENV=local 时输出日志，生产环境静默
 */
/**
 * 日志输出（仅在 NODE_ENV=local 时输出）
 */
export declare const logger: {
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
};
