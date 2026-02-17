"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
class EventBus {
    constructor() {
        this.cursor = 0;
        this.seq = 0;
        this.timeline = [];
        this.subscribers = new Map();
        this.controlEmitter = new events_1.EventEmitter();
        this.monitorEmitter = new events_1.EventEmitter();
        this.failedEvents = [];
        this.MAX_FAILED_BUFFER = 1000;
        this.subscribers.set('progress', new Set());
        this.subscribers.set('control', new Set());
        this.subscribers.set('monitor', new Set());
        // Prevent Node.js ERR_UNHANDLED_ERROR when emitting 'error' events
        // without a listener. This allows MonitorEvent with type='error' to be
        // emitted safely. Users can still register their own 'error' handlers.
        this.monitorEmitter.on('error', () => {
            // No-op: errors are handled through the subscriber system
        });
    }
    setStore(store, agentId) {
        this.store = store;
        this.agentId = agentId;
    }
    emitProgress(event) {
        const envelope = this.emit('progress', event);
        this.notifySubscribers('progress', envelope);
        return envelope;
    }
    emitControl(event) {
        const envelope = this.emit('control', event);
        this.controlEmitter.emit(event.type, envelope.event);
        this.notifySubscribers('control', envelope);
        return envelope;
    }
    emitMonitor(event) {
        const envelope = this.emit('monitor', event);
        this.monitorEmitter.emit(event.type, envelope.event);
        this.notifySubscribers('monitor', envelope);
        return envelope;
    }
    subscribeProgress(opts) {
        const subscriber = new EventSubscriber(opts?.kinds);
        this.subscribers.get('progress').add(subscriber);
        if (opts?.since) {
            void this.replayHistory('progress', subscriber, opts.since);
        }
        const bus = this;
        return {
            [Symbol.asyncIterator]() {
                return {
                    async next() {
                        const value = (await subscriber.next());
                        if (!value) {
                            bus.subscribers.get('progress').delete(subscriber);
                            return { done: true, value: undefined };
                        }
                        return { done: false, value };
                    },
                    async return() {
                        subscriber.close();
                        bus.subscribers.get('progress').delete(subscriber);
                        return { done: true, value: undefined };
                    },
                };
            },
        };
    }
    subscribe(channels = ['progress', 'control', 'monitor'], opts) {
        const subscriber = new EventSubscriber(opts?.kinds);
        for (const channel of channels) {
            this.subscribers.get(channel).add(subscriber);
            if (opts?.since) {
                void this.replayHistory(channel, subscriber, opts.since);
            }
        }
        return this.iterableFor(channels, subscriber);
    }
    onControl(type, handler) {
        this.controlEmitter.on(type, handler);
        return () => this.controlEmitter.off(type, handler);
    }
    onMonitor(type, handler) {
        this.monitorEmitter.on(type, handler);
        return () => this.monitorEmitter.off(type, handler);
    }
    getTimeline(since) {
        return since !== undefined ? this.timeline.filter((t) => t.cursor >= since) : this.timeline;
    }
    getCursor() {
        return this.cursor;
    }
    getLastBookmark() {
        const last = this.timeline[this.timeline.length - 1];
        return last?.bookmark;
    }
    syncCursor(bookmark) {
        if (!bookmark)
            return;
        const nextSeq = bookmark.seq + 1;
        if (this.seq < nextSeq) {
            this.seq = nextSeq;
        }
        const timelineCursor = this.timeline.length
            ? this.timeline[this.timeline.length - 1].cursor + 1
            : 0;
        const nextCursor = Math.max(this.cursor, nextSeq, timelineCursor);
        if (this.cursor < nextCursor) {
            this.cursor = nextCursor;
        }
    }
    reset() {
        this.cursor = 0;
        this.seq = 0;
        this.timeline = [];
        for (const set of this.subscribers.values()) {
            set.clear();
        }
        this.controlEmitter.removeAllListeners();
        this.monitorEmitter.removeAllListeners();
    }
    emit(channel, event) {
        const bookmark = {
            seq: this.seq++,
            timestamp: Date.now(),
        };
        const eventWithChannel = { ...event, channel };
        const eventWithBookmark = { ...eventWithChannel, bookmark };
        const envelope = {
            cursor: this.cursor++,
            bookmark,
            event: eventWithBookmark,
        };
        const timelineEntry = {
            cursor: envelope.cursor,
            bookmark,
            event: envelope.event,
        };
        this.timeline.push(timelineEntry);
        if (this.timeline.length > 10000) {
            this.timeline = this.timeline.slice(-5000);
        }
        if (this.store && this.agentId) {
            const isCritical = this.isCriticalEvent(event);
            this.store.appendEvent(this.agentId, timelineEntry)
                .then(() => {
                // 成功后尝试重试之前失败的事件
                if (this.failedEvents.length > 0) {
                    void this.retryFailedEvents();
                }
            })
                .catch((err) => {
                if (isCritical) {
                    // 关键事件失败：缓存到内存
                    this.failedEvents.push(timelineEntry);
                    if (this.failedEvents.length > this.MAX_FAILED_BUFFER) {
                        this.failedEvents = this.failedEvents.slice(-this.MAX_FAILED_BUFFER);
                    }
                    // 发送降级的内存 Monitor 事件（不持久化）
                    try {
                        this.monitorEmitter.emit('storage_failure', {
                            type: 'storage_failure',
                            severity: 'critical',
                            failedEvent: event.type,
                            bufferedCount: this.failedEvents.length,
                            error: err.message
                        });
                    }
                    catch {
                        // 降级事件发送失败也不阻塞
                    }
                }
                else {
                    // 非关键事件失败：仅记录日志
                    logger_1.logger.warn(`[EventBus] Failed to persist non-critical event: ${event.type}`, err);
                }
            });
        }
        return envelope;
    }
    isCriticalEvent(event) {
        const criticalTypes = new Set([
            'tool:end',
            'done',
            'permission_decided',
            'agent_resumed',
            'state_changed',
            'breakpoint_changed',
            'error',
        ]);
        return criticalTypes.has(event.type);
    }
    async retryFailedEvents() {
        if (!this.store || !this.agentId || this.failedEvents.length === 0)
            return;
        const toRetry = this.failedEvents.splice(0, 10);
        for (const event of toRetry) {
            try {
                await this.store.appendEvent(this.agentId, event);
            }
            catch (err) {
                this.failedEvents.unshift(event);
                break;
            }
        }
    }
    getFailedEventCount() {
        return this.failedEvents.length;
    }
    async flushFailedEvents() {
        while (this.failedEvents.length > 0) {
            await this.retryFailedEvents();
            if (this.failedEvents.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    notifySubscribers(channel, envelope) {
        const subscribers = this.subscribers.get(channel);
        if (!subscribers)
            return;
        for (const subscriber of subscribers) {
            if (subscriber.accepts(envelope)) {
                subscriber.push(envelope);
            }
        }
    }
    async replayHistory(channel, subscriber, since) {
        if (this.store && this.agentId) {
            try {
                const opts = { channel: channel, since };
                for await (const entry of this.store.readEvents(this.agentId, opts)) {
                    const envelope = entry;
                    if (subscriber.accepts(envelope)) {
                        subscriber.push(envelope);
                    }
                }
                return;
            }
            catch (error) {
                logger_1.logger.error('Failed to replay events from store:', error);
            }
        }
        const past = this.timeline.filter((t) => {
            if (t.event.channel !== channel)
                return false;
            if (!since)
                return true;
            return t.bookmark.seq > since.seq;
        });
        for (const entry of past) {
            const envelope = entry;
            if (subscriber.accepts(envelope)) {
                subscriber.push(envelope);
            }
        }
    }
    iterableFor(channel, subscriber) {
        const channels = Array.isArray(channel) ? channel : [channel];
        const bus = this;
        return {
            [Symbol.asyncIterator]() {
                return {
                    next: async () => {
                        const value = (await subscriber.next());
                        if (!value) {
                            for (const ch of channels)
                                bus.subscribers.get(ch).delete(subscriber);
                            return { done: true, value: undefined };
                        }
                        return { done: false, value };
                    },
                    return: async () => {
                        subscriber.close();
                        for (const ch of channels)
                            bus.subscribers.get(ch).delete(subscriber);
                        return { done: true, value: undefined };
                    },
                };
            },
        };
    }
}
exports.EventBus = EventBus;
class EventSubscriber {
    constructor(kinds) {
        this.kinds = kinds;
        this.queue = [];
        this.waiting = null;
        this.closed = false;
    }
    accepts(envelope) {
        if (!this.kinds || this.kinds.length === 0)
            return true;
        return this.kinds.includes(String(envelope.event.type));
    }
    push(envelope) {
        if (this.closed)
            return;
        if (this.waiting) {
            this.waiting(envelope);
            this.waiting = null;
        }
        else {
            this.queue.push(envelope);
        }
    }
    async next() {
        if (this.closed)
            return null;
        if (this.queue.length > 0)
            return this.queue.shift();
        return new Promise((resolve) => {
            this.waiting = resolve;
        });
    }
    close() {
        this.closed = true;
        if (this.waiting) {
            this.waiting(null);
            this.waiting = null;
        }
    }
}
