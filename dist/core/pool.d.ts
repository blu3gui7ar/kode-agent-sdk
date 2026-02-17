import { Agent, AgentConfig, AgentDependencies } from './agent';
import { AgentStatus, SnapshotId } from './types';
export interface AgentPoolOptions {
    dependencies: AgentDependencies;
    maxAgents?: number;
}
export interface GracefulShutdownOptions {
    /** Maximum time to wait for agents to complete current step (ms), default 30000 */
    timeout?: number;
    /** Save running agents list for resumeFromShutdown(), default true */
    saveRunningList?: boolean;
    /** Force interrupt agents that don't complete within timeout, default true */
    forceInterrupt?: boolean;
}
export interface ShutdownResult {
    /** Agents that completed gracefully */
    completed: string[];
    /** Agents that were interrupted due to timeout */
    interrupted: string[];
    /** Agents that failed to save state */
    failed: string[];
    /** Total shutdown time in ms */
    durationMs: number;
}
export declare class AgentPool {
    private agents;
    private deps;
    private maxAgents;
    constructor(opts: AgentPoolOptions);
    create(agentId: string, config: AgentConfig): Promise<Agent>;
    get(agentId: string): Agent | undefined;
    list(opts?: {
        prefix?: string;
    }): string[];
    status(agentId: string): Promise<AgentStatus | undefined>;
    fork(agentId: string, snapshotSel?: SnapshotId | {
        at?: string;
    }): Promise<Agent>;
    resume(agentId: string, config: AgentConfig, opts?: {
        autoRun?: boolean;
        strategy?: 'crash' | 'manual';
    }): Promise<Agent>;
    resumeAll(configFactory: (agentId: string) => AgentConfig, opts?: {
        autoRun?: boolean;
        strategy?: 'crash' | 'manual';
    }): Promise<Agent[]>;
    delete(agentId: string): Promise<void>;
    size(): number;
    /**
     * Gracefully shutdown all agents in the pool
     * 1. Stop accepting new operations
     * 2. Wait for running agents to complete current step
     * 3. Persist all agent states
     * 4. Optionally save running agents list for recovery
     */
    gracefulShutdown(opts?: GracefulShutdownOptions): Promise<ShutdownResult>;
    /**
     * Resume agents from a previous graceful shutdown
     * Reads the running agents list and resumes each agent
     */
    resumeFromShutdown(configFactory: (agentId: string) => AgentConfig, opts?: {
        autoRun?: boolean;
        strategy?: 'crash' | 'manual';
    }): Promise<Agent[]>;
    /**
     * Register signal handlers for graceful shutdown
     * Call this in your server setup code
     */
    registerShutdownHandlers(configFactory?: (agentId: string) => AgentConfig, opts?: GracefulShutdownOptions): void;
    private waitForAgentReady;
    private persistAgentState;
    private saveRunningAgentsList;
    private loadRunningAgentsList;
    private clearRunningAgentsList;
    private sleep;
}
