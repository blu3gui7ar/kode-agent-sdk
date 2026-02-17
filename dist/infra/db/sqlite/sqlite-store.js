"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteStore = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const store_1 = require("../../store");
const fs = __importStar(require("fs"));
const pathModule = __importStar(require("path"));
/**
 * SqliteStore 实现
 *
 * 混合存储策略：
 * - 数据库：AgentInfo, Messages, ToolCallRecords, Snapshots（支持查询）
 * - 文件系统：Events, Todos, History, MediaCache（高频写入）
 */
class SqliteStore {
    constructor(dbPath, fileStoreBaseDir) {
        // 指标追踪
        this.metrics = {
            saves: 0,
            loads: 0,
            queries: 0,
            deletes: 0,
            latencies: []
        };
        // 内存锁（单进程场景）
        this.locks = new Map();
        this.dbPath = dbPath;
        this.db = new better_sqlite3_1.default(dbPath);
        this.fileStore = new store_1.JSONStore(fileStoreBaseDir || pathModule.dirname(dbPath));
        this.initialize();
    }
    // ========== 数据库初始化 ==========
    initialize() {
        this.createTables();
        this.createIndexes();
    }
    createTables() {
        // 表 1: agents - Agent 元信息
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        agent_id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        config_version TEXT NOT NULL,
        lineage TEXT NOT NULL,
        message_count INTEGER NOT NULL DEFAULT 0,
        last_sfp_index INTEGER NOT NULL DEFAULT -1,
        last_bookmark TEXT,
        breakpoint TEXT,
        metadata TEXT NOT NULL
      );
    `);
        // 表 2: messages - 对话消息
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        seq INTEGER NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE CASCADE
      );
    `);
        // 表 3: tool_calls - 工具调用记录
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS tool_calls (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        name TEXT NOT NULL,
        input TEXT NOT NULL,
        state TEXT NOT NULL,
        approval TEXT NOT NULL,
        result TEXT,
        error TEXT,
        is_error INTEGER DEFAULT 0,
        started_at INTEGER,
        completed_at INTEGER,
        duration_ms INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        audit_trail TEXT NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE CASCADE
      );
    `);
        // 表 4: snapshots - 快照
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS snapshots (
        agent_id TEXT NOT NULL,
        snapshot_id TEXT NOT NULL,
        messages TEXT NOT NULL,
        last_sfp_index INTEGER NOT NULL,
        last_bookmark TEXT NOT NULL,
        created_at TEXT NOT NULL,
        metadata TEXT,
        PRIMARY KEY (agent_id, snapshot_id),
        FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE CASCADE
      );
    `);
    }
    createIndexes() {
        // agents 索引
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_agents_template_id ON agents(template_id);
      CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
    `);
        // messages 索引
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);
      CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_agent_seq ON messages(agent_id, seq);
    `);
        // tool_calls 索引
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tool_calls_agent_id ON tool_calls(agent_id);
      CREATE INDEX IF NOT EXISTS idx_tool_calls_name ON tool_calls(name);
      CREATE INDEX IF NOT EXISTS idx_tool_calls_state ON tool_calls(state);
      CREATE INDEX IF NOT EXISTS idx_tool_calls_created_at ON tool_calls(created_at DESC);
    `);
        // snapshots 索引
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_snapshots_agent_id ON snapshots(agent_id);
      CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON snapshots(created_at DESC);
    `);
    }
    // ========== 运行时状态管理（数据库） ==========
    async saveMessages(agentId, messages) {
        const saveMessagesTransaction = this.db.transaction(() => {
            // 1. 删除旧消息
            this.db.prepare('DELETE FROM messages WHERE agent_id = ?').run(agentId);
            // 2. 批量插入新消息
            const insertStmt = this.db.prepare(`
        INSERT INTO messages (
          id, agent_id, role, content, seq, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
            messages.forEach((msg, index) => {
                const id = this.generateMessageId();
                insertStmt.run(id, agentId, msg.role, JSON.stringify(msg.content), index, // seq: array index
                msg.metadata ? JSON.stringify(msg.metadata) : null, Date.now());
            });
            // 3. 更新 agents 表的 message_count
            this.db.prepare(`
        UPDATE agents
        SET message_count = ?
        WHERE agent_id = ?
      `).run(messages.length, agentId);
        });
        saveMessagesTransaction();
    }
    async loadMessages(agentId) {
        const rows = this.db.prepare(`
      SELECT role, content, metadata
      FROM messages
      WHERE agent_id = ?
      ORDER BY seq ASC
    `).all(agentId);
        return rows.map(row => ({
            role: row.role,
            content: JSON.parse(row.content),
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined
        }));
    }
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async saveToolCallRecords(agentId, records) {
        const saveToolCallsTransaction = this.db.transaction(() => {
            // 1. 删除旧记录
            this.db.prepare('DELETE FROM tool_calls WHERE agent_id = ?').run(agentId);
            // 2. 批量插入新记录
            const insertStmt = this.db.prepare(`
        INSERT INTO tool_calls (
          id, agent_id, name, input, state, approval,
          result, error, is_error,
          started_at, completed_at, duration_ms,
          created_at, updated_at, audit_trail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
            records.forEach(record => {
                insertStmt.run(record.id, agentId, record.name, JSON.stringify(record.input), record.state, JSON.stringify(record.approval), record.result ? JSON.stringify(record.result) : null, record.error || null, record.isError ? 1 : 0, record.startedAt || null, record.completedAt || null, record.durationMs || null, record.createdAt, record.updatedAt, JSON.stringify(record.auditTrail));
            });
        });
        saveToolCallsTransaction();
    }
    async loadToolCallRecords(agentId) {
        const rows = this.db.prepare(`
      SELECT id, name, input, state, approval,
             result, error, is_error,
             started_at, completed_at, duration_ms,
             created_at, updated_at, audit_trail
      FROM tool_calls
      WHERE agent_id = ?
      ORDER BY created_at ASC
    `).all(agentId);
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            input: JSON.parse(row.input),
            state: row.state,
            approval: JSON.parse(row.approval),
            result: row.result ? JSON.parse(row.result) : undefined,
            error: row.error || undefined,
            isError: row.is_error === 1,
            startedAt: row.started_at || undefined,
            completedAt: row.completed_at || undefined,
            durationMs: row.duration_ms || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            auditTrail: JSON.parse(row.audit_trail)
        }));
    }
    // ========== 事件流管理（文件系统） ==========
    async saveTodos(agentId, snapshot) {
        return this.fileStore.saveTodos(agentId, snapshot);
    }
    async loadTodos(agentId) {
        return this.fileStore.loadTodos(agentId);
    }
    async appendEvent(agentId, timeline) {
        return this.fileStore.appendEvent(agentId, timeline);
    }
    async *readEvents(agentId, opts) {
        yield* this.fileStore.readEvents(agentId, opts);
    }
    // ========== 历史与压缩管理（文件系统） ==========
    async saveHistoryWindow(agentId, window) {
        return this.fileStore.saveHistoryWindow(agentId, window);
    }
    async loadHistoryWindows(agentId) {
        return this.fileStore.loadHistoryWindows(agentId);
    }
    async saveCompressionRecord(agentId, record) {
        return this.fileStore.saveCompressionRecord(agentId, record);
    }
    async loadCompressionRecords(agentId) {
        return this.fileStore.loadCompressionRecords(agentId);
    }
    async saveRecoveredFile(agentId, file) {
        return this.fileStore.saveRecoveredFile(agentId, file);
    }
    async loadRecoveredFiles(agentId) {
        return this.fileStore.loadRecoveredFiles(agentId);
    }
    // ========== 多模态缓存管理（文件系统） ==========
    async saveMediaCache(agentId, records) {
        return this.fileStore.saveMediaCache(agentId, records);
    }
    async loadMediaCache(agentId) {
        return this.fileStore.loadMediaCache(agentId);
    }
    // ========== 快照管理（数据库） ==========
    async saveSnapshot(agentId, snapshot) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO snapshots (
        agent_id, snapshot_id, messages, last_sfp_index,
        last_bookmark, created_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(agentId, snapshot.id, JSON.stringify(snapshot.messages), snapshot.lastSfpIndex, JSON.stringify(snapshot.lastBookmark), snapshot.createdAt, snapshot.metadata ? JSON.stringify(snapshot.metadata) : null);
    }
    async loadSnapshot(agentId, snapshotId) {
        const row = this.db.prepare(`
      SELECT snapshot_id, messages, last_sfp_index,
             last_bookmark, created_at, metadata
      FROM snapshots
      WHERE agent_id = ? AND snapshot_id = ?
    `).get(agentId, snapshotId);
        if (!row) {
            return undefined;
        }
        return {
            id: row.snapshot_id,
            messages: JSON.parse(row.messages),
            lastSfpIndex: row.last_sfp_index,
            lastBookmark: JSON.parse(row.last_bookmark),
            createdAt: row.created_at,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined
        };
    }
    async listSnapshots(agentId) {
        const rows = this.db.prepare(`
      SELECT snapshot_id, messages, last_sfp_index,
             last_bookmark, created_at, metadata
      FROM snapshots
      WHERE agent_id = ?
      ORDER BY created_at DESC
    `).all(agentId);
        return rows.map(row => ({
            id: row.snapshot_id,
            messages: JSON.parse(row.messages),
            lastSfpIndex: row.last_sfp_index,
            lastBookmark: JSON.parse(row.last_bookmark),
            createdAt: row.created_at,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined
        }));
    }
    // ========== 元数据管理（数据库） ==========
    async saveInfo(agentId, info) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agents (
        agent_id, template_id, created_at, config_version,
        lineage, message_count, last_sfp_index, last_bookmark,
        breakpoint, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(info.agentId, info.templateId, info.createdAt, info.configVersion, JSON.stringify(info.lineage), info.messageCount, info.lastSfpIndex, info.lastBookmark ? JSON.stringify(info.lastBookmark) : null, info.breakpoint || null, JSON.stringify(info.metadata));
    }
    async loadInfo(agentId) {
        const row = this.db.prepare(`
      SELECT agent_id, template_id, created_at, config_version,
             lineage, message_count, last_sfp_index, last_bookmark,
             breakpoint, metadata
      FROM agents
      WHERE agent_id = ?
    `).get(agentId);
        if (!row) {
            return undefined;
        }
        const info = {
            agentId: row.agent_id,
            templateId: row.template_id,
            createdAt: row.created_at,
            configVersion: row.config_version,
            lineage: JSON.parse(row.lineage),
            messageCount: row.message_count,
            lastSfpIndex: row.last_sfp_index,
            lastBookmark: row.last_bookmark ? JSON.parse(row.last_bookmark) : undefined,
            metadata: JSON.parse(row.metadata)
        };
        // Restore breakpoint to AgentInfo if present
        if (row.breakpoint) {
            info.breakpoint = row.breakpoint;
        }
        return info;
    }
    // ========== 生命周期管理 ==========
    async exists(agentId) {
        const row = this.db.prepare('SELECT 1 FROM agents WHERE agent_id = ?').get(agentId);
        return !!row;
    }
    async delete(agentId) {
        // 删除数据库记录（级联删除）
        this.db.prepare('DELETE FROM agents WHERE agent_id = ?').run(agentId);
        // 删除文件系统数据
        await this.fileStore.delete(agentId);
    }
    async list(prefix) {
        const sql = prefix
            ? 'SELECT agent_id FROM agents WHERE agent_id LIKE ? ORDER BY created_at DESC'
            : 'SELECT agent_id FROM agents ORDER BY created_at DESC';
        const params = prefix ? [`${prefix}%`] : [];
        const rows = this.db.prepare(sql).all(...params);
        return rows.map(row => row.agent_id);
    }
    // ========== QueryableStore 接口实现 ==========
    async querySessions(filters) {
        let sql = `
      SELECT agent_id, template_id, created_at, message_count,
             last_sfp_index, breakpoint
      FROM agents
      WHERE 1=1
    `;
        const params = [];
        if (filters.agentId) {
            sql += ' AND agent_id = ?';
            params.push(filters.agentId);
        }
        if (filters.templateId) {
            sql += ' AND template_id = ?';
            params.push(filters.templateId);
        }
        if (filters.startDate) {
            sql += ' AND created_at >= ?';
            params.push(new Date(filters.startDate).toISOString());
        }
        if (filters.endDate) {
            sql += ' AND created_at <= ?';
            params.push(new Date(filters.endDate).toISOString());
        }
        // Sorting
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        // Pagination
        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }
        const rows = this.db.prepare(sql).all(...params);
        return rows.map(row => ({
            agentId: row.agent_id,
            templateId: row.template_id,
            createdAt: row.created_at,
            messageCount: row.message_count,
            lastSfpIndex: row.last_sfp_index,
            breakpoint: row.breakpoint
        }));
    }
    async queryMessages(filters) {
        let sql = 'SELECT role, content, metadata FROM messages WHERE 1=1';
        const params = [];
        if (filters.agentId) {
            sql += ' AND agent_id = ?';
            params.push(filters.agentId);
        }
        if (filters.role) {
            sql += ' AND role = ?';
            params.push(filters.role);
        }
        if (filters.startDate) {
            sql += ' AND created_at >= ?';
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            sql += ' AND created_at <= ?';
            params.push(filters.endDate);
        }
        sql += ' ORDER BY created_at DESC';
        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }
        const rows = this.db.prepare(sql).all(...params);
        return rows.map(row => ({
            role: row.role,
            content: JSON.parse(row.content),
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined
        }));
    }
    async queryToolCalls(filters) {
        let sql = `
      SELECT id, name, input, state, approval,
             result, error, is_error,
             started_at, completed_at, duration_ms,
             created_at, updated_at, audit_trail
      FROM tool_calls
      WHERE 1=1
    `;
        const params = [];
        if (filters.agentId) {
            sql += ' AND agent_id = ?';
            params.push(filters.agentId);
        }
        if (filters.toolName) {
            sql += ' AND name = ?';
            params.push(filters.toolName);
        }
        if (filters.state) {
            sql += ' AND state = ?';
            params.push(filters.state);
        }
        if (filters.startDate) {
            sql += ' AND created_at >= ?';
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            sql += ' AND created_at <= ?';
            params.push(filters.endDate);
        }
        sql += ' ORDER BY created_at DESC';
        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }
        const rows = this.db.prepare(sql).all(...params);
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            input: JSON.parse(row.input),
            state: row.state,
            approval: JSON.parse(row.approval),
            result: row.result ? JSON.parse(row.result) : undefined,
            error: row.error || undefined,
            isError: row.is_error === 1,
            startedAt: row.started_at || undefined,
            completedAt: row.completed_at || undefined,
            durationMs: row.duration_ms || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            auditTrail: JSON.parse(row.audit_trail)
        }));
    }
    async aggregateStats(agentId) {
        // Total messages
        const messageStats = this.db.prepare(`
      SELECT COUNT(*) as total FROM messages WHERE agent_id = ?
    `).get(agentId);
        // Total tool calls
        const toolCallStats = this.db.prepare(`
      SELECT COUNT(*) as total FROM tool_calls WHERE agent_id = ?
    `).get(agentId);
        // Total snapshots
        const snapshotStats = this.db.prepare(`
      SELECT COUNT(*) as total FROM snapshots WHERE agent_id = ?
    `).get(agentId);
        // Tool calls by name
        const toolCallsByName = this.db.prepare(`
      SELECT name, COUNT(*) as count
      FROM tool_calls
      WHERE agent_id = ?
      GROUP BY name
    `).all(agentId);
        // Tool calls by state
        const toolCallsByState = this.db.prepare(`
      SELECT state, COUNT(*) as count
      FROM tool_calls
      WHERE agent_id = ?
      GROUP BY state
    `).all(agentId);
        return {
            totalMessages: messageStats.total,
            totalToolCalls: toolCallStats.total,
            totalSnapshots: snapshotStats.total,
            avgMessagesPerSession: messageStats.total, // Single agent, so avg = total
            toolCallsByName: toolCallsByName.reduce((acc, row) => {
                acc[row.name] = row.count;
                return acc;
            }, {}),
            toolCallsByState: toolCallsByState.reduce((acc, row) => {
                acc[row.state] = row.count;
                return acc;
            }, {})
        };
    }
    // ========== ExtendedStore 高级功能 ==========
    /**
     * 健康检查
     */
    async healthCheck() {
        const checkedAt = Date.now();
        let dbConnected = false;
        let dbLatencyMs;
        let fsWritable = false;
        // 检查数据库连接
        try {
            const start = Date.now();
            this.db.prepare('SELECT 1').get();
            dbConnected = true;
            dbLatencyMs = Date.now() - start;
        }
        catch (error) {
            dbConnected = false;
        }
        // 检查文件系统
        try {
            const baseDir = this.fileStore.baseDir;
            // 确保目录存在
            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }
            const testFile = pathModule.join(baseDir, '.health-check');
            fs.writeFileSync(testFile, 'ok');
            fs.unlinkSync(testFile);
            fsWritable = true;
        }
        catch (error) {
            fsWritable = false;
        }
        return {
            healthy: dbConnected && fsWritable,
            database: {
                connected: dbConnected,
                latencyMs: dbLatencyMs
            },
            fileSystem: {
                writable: fsWritable
            },
            checkedAt
        };
    }
    /**
     * 一致性检查
     */
    async checkConsistency(agentId) {
        const issues = [];
        const checkedAt = Date.now();
        // 检查 Agent 是否存在于数据库
        const dbExists = await this.exists(agentId);
        if (!dbExists) {
            issues.push(`Agent ${agentId} 不存在于数据库中`);
            return { consistent: false, issues, checkedAt };
        }
        // 检查消息数量一致性
        const info = await this.loadInfo(agentId);
        const messages = await this.loadMessages(agentId);
        if (info && info.messageCount !== messages.length) {
            issues.push(`消息数量不一致: info.messageCount=${info.messageCount}, 实际消息数=${messages.length}`);
        }
        // 检查工具调用记录
        const toolCalls = await this.loadToolCallRecords(agentId);
        for (const call of toolCalls) {
            if (!call.id || !call.name) {
                issues.push(`工具调用记录缺少必要字段: ${JSON.stringify(call)}`);
            }
        }
        return {
            consistent: issues.length === 0,
            issues,
            checkedAt
        };
    }
    /**
     * 获取指标统计
     */
    async getMetrics() {
        // 获取存储统计
        const agentCount = this.db.prepare('SELECT COUNT(*) as count FROM agents').get();
        const messageCount = this.db.prepare('SELECT COUNT(*) as count FROM messages').get();
        const toolCallCount = this.db.prepare('SELECT COUNT(*) as count FROM tool_calls').get();
        // 获取数据库文件大小
        let dbSizeBytes;
        try {
            const stats = fs.statSync(this.dbPath);
            dbSizeBytes = stats.size;
        }
        catch {
            // 忽略
        }
        // 计算性能指标
        const latencies = this.metrics.latencies;
        const avgLatencyMs = latencies.length > 0
            ? latencies.reduce((a, b) => a + b, 0) / latencies.length
            : 0;
        const maxLatencyMs = latencies.length > 0 ? Math.max(...latencies) : 0;
        const minLatencyMs = latencies.length > 0 ? Math.min(...latencies) : 0;
        return {
            operations: {
                saves: this.metrics.saves,
                loads: this.metrics.loads,
                queries: this.metrics.queries,
                deletes: this.metrics.deletes
            },
            performance: {
                avgLatencyMs,
                maxLatencyMs,
                minLatencyMs
            },
            storage: {
                totalAgents: agentCount.count,
                totalMessages: messageCount.count,
                totalToolCalls: toolCallCount.count,
                dbSizeBytes
            },
            collectedAt: Date.now()
        };
    }
    /**
     * 获取分布式锁
     * SQLite 使用内存锁（仅单进程有效）
     * 注意：对于多进程场景，建议使用 PostgreSQL
     */
    async acquireAgentLock(agentId, timeoutMs = 30000) {
        // 检查是否已有锁
        if (this.locks.has(agentId)) {
            throw new Error(`无法获取 Agent ${agentId} 的锁，已被当前进程占用`);
        }
        // 创建锁
        let resolveRelease;
        const lockPromise = new Promise(resolve => {
            resolveRelease = resolve;
        });
        const timeoutId = setTimeout(() => {
            this.locks.delete(agentId);
            resolveRelease();
        }, timeoutMs);
        this.locks.set(agentId, { resolve: resolveRelease, timeout: timeoutId });
        // 返回释放函数
        return async () => {
            const lock = this.locks.get(agentId);
            if (lock) {
                clearTimeout(lock.timeout);
                this.locks.delete(agentId);
                lock.resolve();
            }
        };
    }
    /**
     * 批量 Fork Agent
     */
    async batchFork(agentId, count) {
        // 加载源 Agent 数据
        const sourceInfo = await this.loadInfo(agentId);
        if (!sourceInfo) {
            throw new Error(`源 Agent ${agentId} 不存在`);
        }
        const sourceMessages = await this.loadMessages(agentId);
        const sourceToolCalls = await this.loadToolCallRecords(agentId);
        const newAgentIds = [];
        // 使用事务批量创建
        const transaction = this.db.transaction(() => {
            for (let i = 0; i < count; i++) {
                const newAgentId = this.generateAgentId();
                newAgentIds.push(newAgentId);
                // 创建新 Agent Info
                const newInfo = {
                    ...sourceInfo,
                    agentId: newAgentId,
                    createdAt: new Date().toISOString(),
                    lineage: [...sourceInfo.lineage, agentId]
                };
                // 插入 Agent Info
                this.db.prepare(`
          INSERT INTO agents (
            agent_id, template_id, created_at, config_version,
            lineage, message_count, last_sfp_index, last_bookmark,
            breakpoint, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newInfo.agentId, newInfo.templateId, newInfo.createdAt, newInfo.configVersion, JSON.stringify(newInfo.lineage), newInfo.messageCount, newInfo.lastSfpIndex, newInfo.lastBookmark ? JSON.stringify(newInfo.lastBookmark) : null, newInfo.breakpoint || null, JSON.stringify(newInfo.metadata));
                // 复制消息
                for (let index = 0; index < sourceMessages.length; index++) {
                    const msg = sourceMessages[index];
                    this.db.prepare(`
            INSERT INTO messages (
              id, agent_id, role, content, seq, metadata, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(this.generateMessageId(), newAgentId, msg.role, JSON.stringify(msg.content), index, msg.metadata ? JSON.stringify(msg.metadata) : null, Date.now());
                }
                // 复制工具调用记录
                for (const record of sourceToolCalls) {
                    this.db.prepare(`
            INSERT INTO tool_calls (
              id, agent_id, name, input, state, approval,
              result, error, is_error,
              started_at, completed_at, duration_ms,
              created_at, updated_at, audit_trail
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(`${record.id}_fork_${i}`, newAgentId, record.name, JSON.stringify(record.input), record.state, JSON.stringify(record.approval), record.result ? JSON.stringify(record.result) : null, record.error || null, record.isError ? 1 : 0, record.startedAt || null, record.completedAt || null, record.durationMs || null, record.createdAt, record.updatedAt, JSON.stringify(record.auditTrail));
                }
            }
        });
        transaction();
        return newAgentIds;
    }
    /**
     * 关闭数据库连接
     */
    async close() {
        this.db.close();
    }
    /**
     * 生成 Agent ID
     */
    generateAgentId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 18);
        return `agt-${timestamp}${random}`;
    }
}
exports.SqliteStore = SqliteStore;
