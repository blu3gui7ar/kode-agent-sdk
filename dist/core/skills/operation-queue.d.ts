/**
 * 操作队列模块
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责队列管理，单一职责
 * - 模块化: 独立的队列逻辑，易于测试和维护
 * - 隔离: 与技能管理逻辑分离，专注于并发控制
 */
/**
 * 操作类型枚举
 */
export declare enum OperationType {
    CREATE = "create",
    RENAME = "rename",
    EDIT = "edit",
    DELETE = "delete",
    RESTORE = "restore"
}
/**
 * 操作状态枚举
 */
export declare enum OperationStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
/**
 * 操作任务接口
 */
export interface OperationTask {
    /** 操作ID */
    id: string;
    /** 操作类型 */
    type: OperationType;
    /** 目标技能 */
    targetSkill: string;
    /** 操作状态 */
    status: OperationStatus;
    /** 执行操作 */
    execute(): Promise<void>;
    /** 创建时间 */
    createdAt: Date;
    /** 开始时间 */
    startedAt?: Date;
    /** 完成时间 */
    completedAt?: Date;
    /** 错误信息 */
    error?: Error;
}
/**
 * 操作队列类
 *
 * 职责:
 * - 管理技能管理操作的并发执行
 * - 按FIFO顺序处理操作
 * - 防止操作冲突
 */
export declare class OperationQueue {
    private queue;
    private processing;
    private readonly maxConcurrent;
    /**
     * 入队操作
     */
    enqueue(task: OperationTask): Promise<void>;
    /**
     * 出队操作
     */
    private dequeue;
    /**
     * 处理队列
     */
    private processQueue;
    /**
     * 获取队列状态
     */
    getQueueStatus(): {
        length: number;
        processing: boolean;
        tasks: OperationTask[];
    };
    /**
     * 清空队列
     */
    clear(): void;
}
