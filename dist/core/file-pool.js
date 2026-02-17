"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePool = void 0;
const logger_1 = require("../utils/logger");
class FilePool {
    constructor(sandbox, opts) {
        this.sandbox = sandbox;
        this.records = new Map();
        this.watchers = new Map();
        this.watchPending = new Map(); // per-path 锁，防止并发创建 watcher
        this.watchEnabled = opts?.watch ?? true;
        this.onChange = opts?.onChange;
    }
    async getMtime(path) {
        try {
            const stat = await this.sandbox.fs.stat(path);
            return stat.mtimeMs;
        }
        catch {
            return undefined;
        }
    }
    async recordRead(path) {
        const resolved = this.sandbox.fs.resolve(path);
        const record = this.records.get(resolved) || { path: resolved };
        record.lastRead = Date.now();
        record.lastReadMtime = await this.getMtime(resolved);
        record.lastKnownMtime = record.lastReadMtime;
        this.records.set(resolved, record);
        await this.ensureWatch(resolved);
    }
    async recordEdit(path) {
        const resolved = this.sandbox.fs.resolve(path);
        const record = this.records.get(resolved) || { path: resolved };
        record.lastEdit = Date.now();
        record.lastKnownMtime = await this.getMtime(resolved);
        this.records.set(resolved, record);
        await this.ensureWatch(resolved);
    }
    async validateWrite(path) {
        const resolved = this.sandbox.fs.resolve(path);
        const record = this.records.get(resolved);
        const currentMtime = await this.getMtime(resolved);
        if (!record) {
            return { isFresh: true, currentMtime };
        }
        const isFresh = record.lastRead !== undefined &&
            (currentMtime === undefined || record.lastReadMtime === undefined || currentMtime === record.lastReadMtime);
        return {
            isFresh,
            lastRead: record.lastRead,
            lastEdit: record.lastEdit,
            currentMtime,
        };
    }
    async checkFreshness(path) {
        const resolved = this.sandbox.fs.resolve(path);
        const record = this.records.get(resolved);
        const currentMtime = await this.getMtime(resolved);
        if (!record) {
            return { isFresh: false, currentMtime };
        }
        const isFresh = record.lastRead !== undefined &&
            (currentMtime === undefined || record.lastKnownMtime === undefined || currentMtime === record.lastKnownMtime);
        return {
            isFresh,
            lastRead: record.lastRead,
            lastEdit: record.lastEdit,
            currentMtime,
        };
    }
    getTrackedFiles() {
        return Array.from(this.records.keys());
    }
    async ensureWatch(path) {
        if (!this.watchEnabled)
            return;
        if (!this.sandbox.watchFiles)
            return;
        if (this.watchers.has(path))
            return;
        // 检查是否有正在进行的 watch 操作（per-path 锁）
        const pending = this.watchPending.get(path);
        if (pending) {
            await pending; // 等待已有操作完成
            return;
        }
        // 创建 watch 操作并存储 Promise
        const watchPromise = this.doWatch(path);
        this.watchPending.set(path, watchPromise);
        try {
            await watchPromise;
        }
        finally {
            this.watchPending.delete(path);
        }
    }
    async doWatch(path) {
        // 再次检查（可能在等待期间已被设置）
        if (this.watchers.has(path))
            return;
        if (!this.sandbox.watchFiles)
            return;
        try {
            const id = await this.sandbox.watchFiles([path], (event) => {
                const record = this.records.get(path);
                if (record) {
                    record.lastKnownMtime = event.mtimeMs;
                }
                this.onChange?.({ path, mtime: event.mtimeMs });
            });
            this.watchers.set(path, id);
        }
        catch (err) {
            // 记录 watch 失败，但不中断流程
            logger_1.logger.warn(`[FilePool] Failed to watch file: ${path}`, err);
        }
    }
    getAccessedFiles() {
        return Array.from(this.records.values())
            .filter((r) => r.lastKnownMtime !== undefined)
            .map((r) => ({ path: r.path, mtime: r.lastKnownMtime }));
    }
}
exports.FilePool = FilePool;
