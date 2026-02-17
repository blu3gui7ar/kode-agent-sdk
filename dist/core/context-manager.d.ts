import { Message, Timeline } from './types';
import { Store, HistoryWindow, CompressionRecord, RecoveredFile } from '../infra/store';
import { Sandbox } from '../infra/sandbox';
export interface ContextUsage {
    totalTokens: number;
    messageCount: number;
    shouldCompress: boolean;
}
export interface CompressionResult {
    summary: Message;
    removedMessages: Message[];
    retainedMessages: Message[];
    windowId: string;
    compressionId: string;
    ratio: number;
}
export interface ContextManagerOptions {
    maxTokens?: number;
    compressToTokens?: number;
    compressionModel?: string;
    compressionPrompt?: string;
    multimodalRetention?: {
        keepRecent?: number;
    };
}
export interface FilePoolState {
    getAccessedFiles(): Array<{
        path: string;
        mtime: number;
    }>;
}
/**
 * ContextManager v2 - 带完整历史追踪的上下文管理器
 *
 * 职责：
 * 1. 分析上下文使用情况（token 估算）
 * 2. 压缩超限上下文并保存历史窗口
 * 3. 保存压缩记录与文件快照
 * 4. 发送 Monitor 事件以供审计
 */
export declare class ContextManager {
    private readonly store;
    private readonly agentId;
    private readonly maxTokens;
    private readonly compressToTokens;
    private readonly compressionModel;
    private readonly compressionPrompt;
    private readonly keepRecentMultimodal;
    constructor(store: Store, agentId: string, opts?: ContextManagerOptions);
    /**
     * 分析上下文使用情况（粗略的 token 估算）
     */
    analyze(messages: Message[]): ContextUsage;
    /**
     * 压缩上下文并保存历史
     *
     * 流程：
     * 1. 保存 HistoryWindow（压缩前的完整快照）
     * 2. 执行压缩（简单版：保留后半部分 + 生成摘要）
     * 3. 保存 CompressionRecord（压缩元信息）
     * 4. 保存重要文件快照（如果有 FilePool）
     * 5. 返回压缩结果
     */
    compress(messages: Message[], events: Timeline[], filePool?: FilePoolState, sandbox?: Sandbox): Promise<CompressionResult | undefined>;
    /**
     * 生成压缩摘要
     */
    private generateSummary;
    private findKeepFromIndexForMultimodal;
    /**
     * 恢复历史窗口（用于审计或调试）
     */
    loadHistory(): Promise<HistoryWindow[]>;
    /**
     * 加载压缩记录
     */
    loadCompressions(): Promise<CompressionRecord[]>;
    /**
     * 加载恢复的文件
     */
    loadRecoveredFiles(): Promise<RecoveredFile[]>;
}
