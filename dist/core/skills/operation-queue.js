"use strict";
/**
 * 操作队列模块
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责队列管理，单一职责
 * - 模块化: 独立的队列逻辑，易于测试和维护
 * - 隔离: 与技能管理逻辑分离，专注于并发控制
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationQueue = exports.OperationStatus = exports.OperationType = void 0;
const logger_1 = require("../../utils/logger");
/**
 * 操作类型枚举
 */
var OperationType;
(function (OperationType) {
    OperationType["CREATE"] = "create";
    OperationType["RENAME"] = "rename";
    OperationType["EDIT"] = "edit";
    OperationType["DELETE"] = "delete";
    OperationType["RESTORE"] = "restore";
})(OperationType || (exports.OperationType = OperationType = {}));
/**
 * 操作状态枚举
 */
var OperationStatus;
(function (OperationStatus) {
    OperationStatus["PENDING"] = "pending";
    OperationStatus["PROCESSING"] = "processing";
    OperationStatus["COMPLETED"] = "completed";
    OperationStatus["FAILED"] = "failed";
})(OperationStatus || (exports.OperationStatus = OperationStatus = {}));
/**
 * 操作队列类
 *
 * 职责:
 * - 管理技能管理操作的并发执行
 * - 按FIFO顺序处理操作
 * - 防止操作冲突
 */
class OperationQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.maxConcurrent = 1; // 串行执行，避免冲突
    }
    /**
     * 入队操作
     */
    async enqueue(task) {
        this.queue.push(task);
        logger_1.logger.log(`[OperationQueue] 操作已入队: ${task.type} - ${task.targetSkill}`);
        // 如果没有正在处理，启动处理（不等待，异步执行）
        if (!this.processing) {
            // 不使用await，让队列异步处理
            this.processQueue().catch(error => {
                logger_1.logger.error('[OperationQueue] Queue processing error:', error);
            });
        }
    }
    /**
     * 出队操作
     */
    dequeue() {
        return this.queue.shift() || null;
    }
    /**
     * 处理队列
     */
    async processQueue() {
        this.processing = true;
        while (this.queue.length > 0) {
            const task = this.dequeue();
            if (!task)
                break;
            task.status = OperationStatus.PROCESSING;
            task.startedAt = new Date();
            try {
                logger_1.logger.log(`[OperationQueue] 开始处理: ${task.type} - ${task.targetSkill}`);
                await task.execute();
                task.status = OperationStatus.COMPLETED;
                task.completedAt = new Date();
                logger_1.logger.log(`[OperationQueue] 操作完成: ${task.type} - ${task.targetSkill}`);
            }
            catch (error) {
                task.status = OperationStatus.FAILED;
                task.completedAt = new Date();
                task.error = error;
                logger_1.logger.error(`[OperationQueue] 操作失败: ${task.type} - ${task.targetSkill}`, error);
            }
        }
        this.processing = false;
    }
    /**
     * 获取队列状态
     */
    getQueueStatus() {
        return {
            length: this.queue.length,
            processing: this.processing,
            tasks: [...this.queue],
        };
    }
    /**
     * 清空队列
     */
    clear() {
        this.queue = [];
        logger_1.logger.log('[OperationQueue] 队列已清空');
    }
}
exports.OperationQueue = OperationQueue;
