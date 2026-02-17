import { ExtendedStore, SessionFilters, MessageFilters, ToolCallFilters, SessionInfo, AgentStats, PostgresConfig, StoreHealthStatus, ConsistencyCheckResult, StoreMetrics, LockReleaseFn } from '../../store';
import { Message, Timeline, Snapshot, AgentInfo, ToolCallRecord, Bookmark, AgentChannel } from '../../../core/types';
import { TodoSnapshot } from '../../../core/todo';
import { HistoryWindow, CompressionRecord, RecoveredFile, MediaCacheRecord } from '../../store';
/**
 * PostgresStore 实现
 *
 * 混合存储策略：
 * - 数据库：AgentInfo, Messages, ToolCallRecords, Snapshots（支持查询）
 * - 文件系统：Events, Todos, History, MediaCache（高频写入）
 *
 * PostgreSQL 特性：
 * - JSONB 类型 + GIN 索引
 * - 连接池管理
 * - 事务支持
 */
export declare class PostgresStore implements ExtendedStore {
    private pool;
    private fileStore;
    private initPromise;
    private metrics;
    constructor(config: PostgresConfig, fileStoreBaseDir: string);
    /**
     * 确保数据库已初始化
     * 在所有公开的数据库操作方法开头调用
     */
    private ensureInitialized;
    private initialize;
    private createTables;
    private createIndexes;
    saveMessages(agentId: string, messages: Message[]): Promise<void>;
    loadMessages(agentId: string): Promise<Message[]>;
    private generateMessageId;
    saveToolCallRecords(agentId: string, records: ToolCallRecord[]): Promise<void>;
    loadToolCallRecords(agentId: string): Promise<ToolCallRecord[]>;
    saveTodos(agentId: string, snapshot: TodoSnapshot): Promise<void>;
    loadTodos(agentId: string): Promise<TodoSnapshot | undefined>;
    appendEvent(agentId: string, timeline: Timeline): Promise<void>;
    readEvents(agentId: string, opts?: {
        since?: Bookmark;
        channel?: AgentChannel;
    }): AsyncIterable<Timeline>;
    saveHistoryWindow(agentId: string, window: HistoryWindow): Promise<void>;
    loadHistoryWindows(agentId: string): Promise<HistoryWindow[]>;
    saveCompressionRecord(agentId: string, record: CompressionRecord): Promise<void>;
    loadCompressionRecords(agentId: string): Promise<CompressionRecord[]>;
    saveRecoveredFile(agentId: string, file: RecoveredFile): Promise<void>;
    loadRecoveredFiles(agentId: string): Promise<RecoveredFile[]>;
    saveMediaCache(agentId: string, records: MediaCacheRecord[]): Promise<void>;
    loadMediaCache(agentId: string): Promise<MediaCacheRecord[]>;
    saveSnapshot(agentId: string, snapshot: Snapshot): Promise<void>;
    loadSnapshot(agentId: string, snapshotId: string): Promise<Snapshot | undefined>;
    listSnapshots(agentId: string): Promise<Snapshot[]>;
    saveInfo(agentId: string, info: AgentInfo): Promise<void>;
    loadInfo(agentId: string): Promise<AgentInfo | undefined>;
    exists(agentId: string): Promise<boolean>;
    delete(agentId: string): Promise<void>;
    list(prefix?: string): Promise<string[]>;
    querySessions(filters: SessionFilters): Promise<SessionInfo[]>;
    queryMessages(filters: MessageFilters): Promise<Message[]>;
    queryToolCalls(filters: ToolCallFilters): Promise<ToolCallRecord[]>;
    aggregateStats(agentId: string): Promise<AgentStats>;
    /**
     * 关闭连接池
     */
    close(): Promise<void>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<StoreHealthStatus>;
    /**
     * 一致性检查
     * 检查数据库和文件系统之间的数据一致性
     */
    checkConsistency(agentId: string): Promise<ConsistencyCheckResult>;
    /**
     * 获取指标统计
     */
    getMetrics(): Promise<StoreMetrics>;
    /**
     * 获取分布式锁
     * 使用 PostgreSQL Advisory Lock
     */
    acquireAgentLock(agentId: string, timeoutMs?: number): Promise<LockReleaseFn>;
    /**
     * 批量 Fork Agent
     */
    batchFork(agentId: string, count: number): Promise<string[]>;
    /**
     * 将字符串哈希为整数（用于 advisory lock）
     */
    private hashStringToInt;
    /**
     * 生成 Agent ID
     */
    private generateAgentId;
}
