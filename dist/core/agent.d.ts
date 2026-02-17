import { AgentEvent, AgentEventEnvelope, AgentInfo, AgentStatus, Bookmark, ContentBlock, ControlEvent, MonitorEvent, ProgressEvent, ReminderOptions, ResumeStrategy, SnapshotId } from './types';
import { Hooks } from './hooks';
import { Scheduler } from './scheduler';
import { TodoInput, TodoItem } from './todo';
import { AgentTemplateRegistry, AgentTemplateDefinition, PermissionConfig, SubAgentConfig, TodoConfig } from './template';
import { Store } from '../infra/store';
import { Sandbox, SandboxKind } from '../infra/sandbox';
import { SandboxFactory } from '../infra/sandbox-factory';
import { ModelProvider, ModelConfig } from '../infra/provider';
import { ToolRegistry, ToolInstance, ToolDescriptor } from '../tools/registry';
import { ContextManagerOptions } from './context-manager';
import { ResumeError } from './errors';
import { SendOptions as QueueSendOptions } from './agent/message-queue';
export interface ModelFactory {
    (config: ModelConfig): ModelProvider;
}
export interface AgentDependencies {
    store: Store;
    templateRegistry: AgentTemplateRegistry;
    sandboxFactory: SandboxFactory;
    toolRegistry: ToolRegistry;
    modelFactory?: ModelFactory;
    skillsManager?: import('./skills/manager').SkillsManager;
}
export type SendOptions = QueueSendOptions;
export interface SandboxConfig {
    kind: SandboxKind;
    workDir?: string;
    enforceBoundary?: boolean;
    allowPaths?: string[];
    watchFiles?: boolean;
    [key: string]: any;
}
export interface AgentConfig {
    agentId?: string;
    templateId: string;
    templateVersion?: string;
    model?: ModelProvider;
    modelConfig?: ModelConfig;
    sandbox?: Sandbox | SandboxConfig;
    tools?: string[];
    exposeThinking?: boolean;
    retainThinking?: boolean;
    multimodalContinuation?: 'history';
    multimodalRetention?: {
        keepRecent?: number;
    };
    overrides?: {
        permission?: PermissionConfig;
        todo?: TodoConfig;
        subagents?: SubAgentConfig;
        hooks?: Hooks;
    };
    context?: ContextManagerOptions;
    metadata?: Record<string, any>;
}
interface SubAgentRuntime {
    depthRemaining: number;
}
export interface CompleteResult {
    status: 'ok' | 'paused';
    text?: string;
    last?: Bookmark;
    permissionIds?: string[];
}
export interface StreamOptions {
    since?: Bookmark;
    kinds?: Array<ProgressEvent['type']>;
}
export interface SubscribeOptions {
    since?: Bookmark;
    kinds?: Array<AgentEvent['type']>;
}
export declare class Agent {
    private readonly config;
    private readonly deps;
    private readonly events;
    private readonly hooks;
    private readonly scheduler;
    private readonly todoService?;
    private readonly contextManager;
    private readonly filePool;
    private readonly breakpoints;
    private readonly permissions;
    private readonly model;
    private readonly sandbox;
    private readonly sandboxConfig?;
    private readonly todoConfig?;
    private readonly messageQueue;
    private readonly todoManager;
    private readonly ajv;
    private readonly validatorCache;
    private readonly toolControllers;
    private readonly toolTimeoutMs;
    private readonly maxToolConcurrency;
    private readonly tools;
    private readonly toolDescriptors;
    private readonly toolDescriptorIndex;
    private skillsManager?;
    private createdAt;
    private readonly pendingPermissions;
    private readonly toolRunner;
    private messages;
    private state;
    private toolRecords;
    private interrupted;
    private processingPromise;
    private pendingNextRound;
    private lastProcessingStart;
    private readonly PROCESSING_TIMEOUT;
    private stepCount;
    private lastSfpIndex;
    private lastBookmark?;
    private exposeThinking;
    private retainThinking;
    private multimodalContinuation;
    private multimodalRetentionKeepRecent;
    private permission;
    private subagents?;
    private template;
    private lineage;
    private mediaCache;
    private get persistentStore();
    private static requireStore;
    constructor(config: AgentConfig, deps: AgentDependencies, runtime: {
        template: AgentTemplateDefinition;
        model: ModelProvider;
        sandbox: Sandbox;
        sandboxConfig?: SandboxConfig;
        tools: ToolInstance[];
        toolDescriptors: ToolDescriptor[];
        permission: PermissionConfig;
        todoConfig?: TodoConfig;
        subagents?: SubAgentConfig;
        context?: ContextManagerOptions;
    });
    get agentId(): string;
    static create(config: AgentConfig, deps: AgentDependencies): Promise<Agent>;
    private initialize;
    chatStream(input: string | ContentBlock[], opts?: StreamOptions): AsyncIterable<AgentEventEnvelope<ProgressEvent>>;
    chat(input: string | ContentBlock[], opts?: StreamOptions): Promise<CompleteResult>;
    complete(input: string | ContentBlock[], opts?: StreamOptions): Promise<CompleteResult>;
    stream(input: string | ContentBlock[], opts?: StreamOptions): AsyncIterable<AgentEventEnvelope<ProgressEvent>>;
    send(message: string | ContentBlock[], options?: SendOptions): Promise<string>;
    schedule(): Scheduler;
    on<T extends ControlEvent['type'] | MonitorEvent['type']>(event: T, handler: (evt: any) => void): () => void;
    subscribe(channels?: Array<'progress' | 'control' | 'monitor'>, opts?: SubscribeOptions): AsyncIterable<AgentEventEnvelope<AgentEvent>>;
    getTodos(): TodoItem[];
    setTodos(todos: TodoInput[]): Promise<void>;
    updateTodo(todo: TodoInput): Promise<void>;
    deleteTodo(id: string): Promise<void>;
    decide(permissionId: string, decision: 'allow' | 'deny', note?: string): Promise<void>;
    interrupt(opts?: {
        note?: string;
    }): Promise<void>;
    snapshot(label?: string): Promise<SnapshotId>;
    fork(sel?: SnapshotId | {
        at?: string;
    }): Promise<Agent>;
    status(): Promise<AgentStatus>;
    info(): Promise<AgentInfo>;
    private setBreakpoint;
    remind(content: string, options?: ReminderOptions): void;
    spawnSubAgent(templateId: string, prompt: string, runtime?: SubAgentRuntime): Promise<CompleteResult>;
    /**
     * Create and run a sub-agent with a task, without requiring subagents config.
     * This is useful for tools that want to delegate work to specialized agents.
     */
    delegateTask(config: {
        templateId: string;
        prompt: string;
        model?: string;
        tools?: string[];
    }): Promise<CompleteResult>;
    static resume(agentId: string, config: AgentConfig, deps: AgentDependencies, opts?: {
        autoRun?: boolean;
        strategy?: ResumeStrategy;
    }): Promise<Agent>;
    static resumeFromStore(agentId: string, deps: AgentDependencies, opts?: {
        autoRun?: boolean;
        strategy?: ResumeStrategy;
        overrides?: Partial<AgentConfig>;
    }): Promise<Agent>;
    static resumeOrCreate(agentId: string, config: AgentConfig, deps: AgentDependencies, opts?: {
        autoRun?: boolean;
        strategy?: ResumeStrategy;
        overrides?: Partial<AgentConfig>;
        onCorrupted?: (agentId: string, error: ResumeError) => Promise<void> | void;
    }): Promise<Agent>;
    private ensureProcessing;
    private runStep;
    private executeTools;
    private processToolCall;
    private registerToolRecord;
    private updateToolRecord;
    private snapshotToolRecord;
    private normalizeToolRecord;
    private preview;
    private validateBlocks;
    private estimateBase64Bytes;
    private resolveMultimodalBlocks;
    private applyMediaCache;
    private computeSha256;
    private persistMediaCache;
    private splitThinkBlocksIfNeeded;
    private splitThinkText;
    private shouldPreserveBlocks;
    private buildMessageMetadata;
    private requestPermission;
    private findLastSfp;
    private appendSyntheticToolResults;
    private autoSealIncompleteCalls;
    private validateToolArgs;
    private makeToolResult;
    private buildSealPayload;
    private wrapReminder;
    private getToolSchemas;
    private setState;
    private persistMessages;
    private persistToolRecords;
    private persistInfo;
    private registerTodoTools;
    /**
     * 收集所有工具的使用说明
     */
    private collectToolPrompts;
    /**
     * 渲染工具手册
     */
    private renderManual;
    /**
     * 刷新工具手册（运行时工具变更时调用）
     */
    private refreshToolManual;
    /**
     * 根据错误类型生成建议
     */
    private getErrorRecommendations;
    /**
     * 将工具手册注入到系统提示中
     */
    private injectManualIntoSystemPrompt;
    /**
     * 将skills元数据注入到系统提示中
     * 参考openskills设计，使用<available_skills> XML格式
     */
    private injectSkillsMetadataIntoSystemPrompt;
    /**
     * 刷新skills元数据（运行时skills变更时调用）
     * 由于支持热更新，可在执行过程中调用此方法
     */
    private refreshSkillsMetadata;
    private enqueueMessage;
    private handleExternalFileChange;
    private relativePath;
    private static generateAgentId;
}
export {};
