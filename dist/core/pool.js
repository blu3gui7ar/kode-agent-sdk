"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPool = void 0;
const agent_1 = require("./agent");
const logger_1 = require("../utils/logger");
class AgentPool {
    constructor(opts) {
        this.agents = new Map();
        this.deps = opts.dependencies;
        this.maxAgents = opts.maxAgents || 50;
    }
    async create(agentId, config) {
        if (this.agents.has(agentId)) {
            throw new Error(`Agent already exists: ${agentId}`);
        }
        if (this.agents.size >= this.maxAgents) {
            throw new Error(`Pool is full (max ${this.maxAgents} agents)`);
        }
        const agent = await agent_1.Agent.create({ ...config, agentId }, this.deps);
        this.agents.set(agentId, agent);
        return agent;
    }
    get(agentId) {
        return this.agents.get(agentId);
    }
    list(opts) {
        const ids = Array.from(this.agents.keys());
        return opts?.prefix ? ids.filter((id) => id.startsWith(opts.prefix)) : ids;
    }
    async status(agentId) {
        const agent = this.agents.get(agentId);
        return agent ? await agent.status() : undefined;
    }
    async fork(agentId, snapshotSel) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }
        return agent.fork(snapshotSel);
    }
    async resume(agentId, config, opts) {
        // 1. Check if already in pool
        if (this.agents.has(agentId)) {
            return this.agents.get(agentId);
        }
        // 2. Check pool capacity
        if (this.agents.size >= this.maxAgents) {
            throw new Error(`Pool is full (max ${this.maxAgents} agents)`);
        }
        // 3. Verify session exists
        const exists = await this.deps.store.exists(agentId);
        if (!exists) {
            throw new Error(`Agent not found in store: ${agentId}`);
        }
        // 4. Use Agent.resume() to restore
        const agent = await agent_1.Agent.resume(agentId, { ...config, agentId }, this.deps, opts);
        // 5. Add to pool
        this.agents.set(agentId, agent);
        return agent;
    }
    async resumeAll(configFactory, opts) {
        const agentIds = await this.deps.store.list();
        const resumed = [];
        for (const agentId of agentIds) {
            if (this.agents.size >= this.maxAgents)
                break;
            if (this.agents.has(agentId))
                continue;
            try {
                const config = configFactory(agentId);
                const agent = await this.resume(agentId, config, opts);
                resumed.push(agent);
            }
            catch (error) {
                logger_1.logger.error(`Failed to resume ${agentId}:`, error);
            }
        }
        return resumed;
    }
    async delete(agentId) {
        this.agents.delete(agentId);
        await this.deps.store.delete(agentId);
    }
    size() {
        return this.agents.size;
    }
    /**
     * Gracefully shutdown all agents in the pool
     * 1. Stop accepting new operations
     * 2. Wait for running agents to complete current step
     * 3. Persist all agent states
     * 4. Optionally save running agents list for recovery
     */
    async gracefulShutdown(opts) {
        const startTime = Date.now();
        const timeout = opts?.timeout ?? 30000;
        const saveRunningList = opts?.saveRunningList ?? true;
        const forceInterrupt = opts?.forceInterrupt ?? true;
        const result = {
            completed: [],
            interrupted: [],
            failed: [],
            durationMs: 0,
        };
        const agentIds = Array.from(this.agents.keys());
        logger_1.logger.info(`[AgentPool] Starting graceful shutdown for ${agentIds.length} agents`);
        // Group agents by state
        const workingAgents = [];
        const readyAgents = [];
        for (const [id, agent] of this.agents) {
            const status = await agent.status();
            if (status.state === 'WORKING') {
                workingAgents.push({ id, agent });
            }
            else {
                readyAgents.push({ id, agent });
            }
        }
        // 1. Persist ready agents immediately
        for (const { id, agent } of readyAgents) {
            try {
                await this.persistAgentState(agent);
                result.completed.push(id);
            }
            catch (error) {
                logger_1.logger.error(`[AgentPool] Failed to persist agent ${id}:`, error);
                result.failed.push(id);
            }
        }
        // 2. Wait for working agents with timeout
        if (workingAgents.length > 0) {
            logger_1.logger.info(`[AgentPool] Waiting for ${workingAgents.length} working agents...`);
            const waitPromises = workingAgents.map(async ({ id, agent }) => {
                try {
                    const completed = await this.waitForAgentReady(agent, timeout);
                    if (completed) {
                        await this.persistAgentState(agent);
                        return { id, status: 'completed' };
                    }
                    else if (forceInterrupt) {
                        await agent.interrupt({ note: 'Graceful shutdown timeout' });
                        await this.persistAgentState(agent);
                        return { id, status: 'interrupted' };
                    }
                    else {
                        return { id, status: 'interrupted' };
                    }
                }
                catch (error) {
                    logger_1.logger.error(`[AgentPool] Error during shutdown for agent ${id}:`, error);
                    return { id, status: 'failed' };
                }
            });
            const results = await Promise.all(waitPromises);
            for (const { id, status } of results) {
                if (status === 'completed') {
                    result.completed.push(id);
                }
                else if (status === 'interrupted') {
                    result.interrupted.push(id);
                }
                else {
                    result.failed.push(id);
                }
            }
        }
        // 3. Save running agents list for recovery
        if (saveRunningList) {
            try {
                await this.saveRunningAgentsList(agentIds);
                logger_1.logger.info(`[AgentPool] Saved running agents list: ${agentIds.length} agents`);
            }
            catch (error) {
                logger_1.logger.error(`[AgentPool] Failed to save running agents list:`, error);
            }
        }
        result.durationMs = Date.now() - startTime;
        logger_1.logger.info(`[AgentPool] Graceful shutdown completed in ${result.durationMs}ms`, {
            completed: result.completed.length,
            interrupted: result.interrupted.length,
            failed: result.failed.length,
        });
        return result;
    }
    /**
     * Resume agents from a previous graceful shutdown
     * Reads the running agents list and resumes each agent
     */
    async resumeFromShutdown(configFactory, opts) {
        const runningList = await this.loadRunningAgentsList();
        if (!runningList || runningList.length === 0) {
            logger_1.logger.info('[AgentPool] No running agents list found, nothing to resume');
            return [];
        }
        logger_1.logger.info(`[AgentPool] Resuming ${runningList.length} agents from shutdown`);
        const resumed = [];
        for (const agentId of runningList) {
            if (this.agents.size >= this.maxAgents) {
                logger_1.logger.warn(`[AgentPool] Pool is full, cannot resume more agents`);
                break;
            }
            try {
                const config = configFactory(agentId);
                const agent = await this.resume(agentId, config, {
                    autoRun: opts?.autoRun ?? false,
                    strategy: opts?.strategy ?? 'crash',
                });
                resumed.push(agent);
            }
            catch (error) {
                logger_1.logger.error(`[AgentPool] Failed to resume agent ${agentId}:`, error);
            }
        }
        // Clear the running agents list after successful resume
        await this.clearRunningAgentsList();
        logger_1.logger.info(`[AgentPool] Resumed ${resumed.length}/${runningList.length} agents`);
        return resumed;
    }
    /**
     * Register signal handlers for graceful shutdown
     * Call this in your server setup code
     */
    registerShutdownHandlers(configFactory, opts) {
        const handler = async (signal) => {
            logger_1.logger.info(`[AgentPool] Received ${signal}, initiating graceful shutdown...`);
            try {
                const result = await this.gracefulShutdown(opts);
                logger_1.logger.info(`[AgentPool] Shutdown complete:`, result);
                process.exit(0);
            }
            catch (error) {
                logger_1.logger.error(`[AgentPool] Shutdown failed:`, error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => handler('SIGTERM'));
        process.on('SIGINT', () => handler('SIGINT'));
        logger_1.logger.info('[AgentPool] Shutdown handlers registered for SIGTERM and SIGINT');
    }
    // ========== Private Helper Methods ==========
    async waitForAgentReady(agent, timeout) {
        const startTime = Date.now();
        const pollInterval = 100; // ms
        while (Date.now() - startTime < timeout) {
            const status = await agent.status();
            if (status.state !== 'WORKING') {
                return true;
            }
            await this.sleep(pollInterval);
        }
        return false;
    }
    async persistAgentState(agent) {
        // Agent's internal persist methods are private, so we rely on the fact that
        // state is automatically persisted during normal operation.
        // This is a no-op placeholder for potential future explicit persist calls.
        // The agent's state is already persisted via WAL mechanism.
    }
    async saveRunningAgentsList(agentIds) {
        const meta = {
            agentIds,
            shutdownAt: new Date().toISOString(),
            version: '1.0.0',
        };
        // Use the store's saveInfo to persist to a special key
        // We use a well-known agent ID prefix for pool metadata
        const poolMetaId = '__pool_meta__';
        await this.deps.store.saveInfo(poolMetaId, {
            agentId: poolMetaId,
            templateId: '__pool_meta__',
            createdAt: new Date().toISOString(),
            runningAgents: meta,
        });
    }
    async loadRunningAgentsList() {
        const poolMetaId = '__pool_meta__';
        try {
            const info = await this.deps.store.loadInfo(poolMetaId);
            if (info && info.runningAgents) {
                return info.runningAgents.agentIds;
            }
        }
        catch {
            // Ignore errors, return null
        }
        return null;
    }
    async clearRunningAgentsList() {
        const poolMetaId = '__pool_meta__';
        try {
            await this.deps.store.delete(poolMetaId);
        }
        catch {
            // Ignore errors
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.AgentPool = AgentPool;
