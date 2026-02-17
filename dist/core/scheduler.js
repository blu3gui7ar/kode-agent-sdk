"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
class Scheduler {
    constructor(opts) {
        this.stepTasks = new Map();
        this.listeners = new Set();
        this.queued = Promise.resolve();
        this.onTrigger = opts?.onTrigger;
    }
    everySteps(every, callback) {
        if (!Number.isFinite(every) || every <= 0) {
            throw new Error('everySteps: interval must be positive');
        }
        const id = this.generateId('steps');
        this.stepTasks.set(id, {
            id,
            every,
            callback,
            lastTriggered: 0,
        });
        return id;
    }
    onStep(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    enqueue(callback) {
        this.queued = this.queued.then(() => Promise.resolve(callback())).catch(() => undefined);
    }
    notifyStep(stepCount) {
        for (const listener of this.listeners) {
            void Promise.resolve(listener({ stepCount }));
        }
        for (const task of this.stepTasks.values()) {
            const shouldTrigger = stepCount - task.lastTriggered >= task.every;
            if (!shouldTrigger)
                continue;
            task.lastTriggered = stepCount;
            void Promise.resolve(task.callback({ stepCount }));
            this.onTrigger?.({ taskId: task.id, spec: `steps:${task.every}`, kind: 'steps' });
        }
    }
    cancel(taskId) {
        this.stepTasks.delete(taskId);
    }
    clear() {
        this.stepTasks.clear();
        this.listeners.clear();
    }
    notifyExternalTrigger(info) {
        this.onTrigger?.(info);
    }
    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
}
exports.Scheduler = Scheduler;
