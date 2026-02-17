import { Message, Timeline, Snapshot, AgentInfo, ToolCallRecord, AgentChannel } from '../../core/types';
import { TodoSnapshot } from '../../core/todo';
import { Store, HistoryWindow, CompressionRecord, RecoveredFile, MediaCacheRecord } from './types';
export declare class JSONStore implements Store {
    private baseDir;
    private flushIntervalMs;
    private eventWriters;
    private walQueue;
    private walRecovered;
    constructor(baseDir: string, flushIntervalMs?: number);
    private getAgentDir;
    private getRuntimePath;
    private getEventsPath;
    private getHistoryDir;
    private getMediaCachePath;
    private getSnapshotsDir;
    private getMetaPath;
    private writeFileSafe;
    private appendFileSafe;
    private renameSafe;
    saveMessages(agentId: string, messages: Message[]): Promise<void>;
    loadMessages(agentId: string): Promise<Message[]>;
    saveToolCallRecords(agentId: string, records: ToolCallRecord[]): Promise<void>;
    loadToolCallRecords(agentId: string): Promise<ToolCallRecord[]>;
    saveTodos(agentId: string, snapshot: TodoSnapshot): Promise<void>;
    loadTodos(agentId: string): Promise<TodoSnapshot | undefined>;
    private saveWithWal;
    private loadWithWal;
    private queueWalWrite;
    /**
     * Store 初始化时主动恢复所有 WAL 文件
     */
    private recoverAllWALs;
    /**
     * 恢复运行时数据的 WAL
     */
    private recoverRuntimeWAL;
    /**
     * 恢复事件流的 WAL
     */
    private recoverEventWALFile;
    appendEvent(agentId: string, timeline: Timeline): Promise<void>;
    readEvents(agentId: string, opts?: {
        since?: any;
        channel?: AgentChannel;
    }): AsyncIterable<Timeline>;
    private getEventWriters;
    private flushEvents;
    private recoverEventWal;
    private writeEventWal;
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
}
