"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueue = void 0;
const logger_1 = require("../../utils/logger");
const errors_1 = require("../errors");
class MessageQueue {
    constructor(options) {
        this.options = options;
        this.pending = [];
    }
    send(content, opts = {}) {
        const kind = opts.kind ?? 'user';
        const isText = typeof content === 'string';
        if (kind === 'reminder' && !isText) {
            throw new errors_1.MultimodalValidationError('Reminder messages must be plain text.');
        }
        const payload = isText
            ? kind === 'reminder'
                ? this.options.wrapReminder(content, opts.reminder)
                : content
            : content;
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        this.pending.push({
            message: {
                role: 'user',
                content: isText ? [{ type: 'text', text: payload }] : payload,
            },
            kind,
            metadata: { id, ...(opts.metadata || {}) },
        });
        if (kind === 'user') {
            this.options.ensureProcessing();
        }
        return id;
    }
    async flush() {
        if (this.pending.length === 0)
            return;
        const queue = this.pending;
        try {
            // 先添加到消息历史
            for (const entry of queue) {
                this.options.addMessage(entry.message, entry.kind);
            }
            // 持久化成功后才清空队列
            await this.options.persist();
            // 成功：从队列中移除已处理的消息
            this.pending = this.pending.filter(item => !queue.includes(item));
        }
        catch (err) {
            // 失败：保留队列，下次重试
            logger_1.logger.error('[MessageQueue] Flush failed, messages retained:', err);
            throw err; // 重新抛出让调用者知道失败
        }
    }
}
exports.MessageQueue = MessageQueue;
