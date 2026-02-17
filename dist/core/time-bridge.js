"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeBridge = void 0;
class TimeBridge {
    constructor(opts) {
        this.timers = new Map();
        this.scheduler = opts.scheduler;
        this.driftTolerance = opts.driftToleranceMs ?? 5000;
        this.logger = opts.logger;
    }
    everyMinutes(minutes, callback) {
        if (!Number.isFinite(minutes) || minutes <= 0) {
            throw new Error('everyMinutes: interval must be positive');
        }
        const interval = minutes * 60 * 1000;
        const id = this.generateId('minutes');
        const scheduleNext = () => {
            const due = Date.now() + interval;
            const handle = setTimeout(() => tick(due), interval);
            entry.cancel = () => clearTimeout(handle);
        };
        const spec = `every:${minutes}m`;
        const tick = (due) => {
            this.scheduler.enqueue(async () => {
                const drift = Math.abs(Date.now() - due);
                if (drift > this.driftTolerance) {
                    this.logger?.('timebridge:drift', { id, drift, expectedInterval: interval });
                }
                await callback();
                this.scheduler.notifyExternalTrigger({ taskId: id, spec, kind: 'time' });
            });
            scheduleNext();
        };
        const entry = {
            id,
            cancel: () => undefined,
        };
        this.timers.set(id, entry);
        scheduleNext();
        return id;
    }
    cron(expr, callback) {
        const parts = expr.trim().split(/\s+/);
        if (parts.length !== 5) {
            throw new Error(`Unsupported cron expression: ${expr}`);
        }
        const minute = Number(parts[0]);
        const hour = Number(parts[1]);
        if (!Number.isInteger(minute) || !Number.isInteger(hour)) {
            throw new Error(`Cron expression must be numeric minutes/hours: ${expr}`);
        }
        const id = this.generateId('cron');
        const scheduleNext = () => {
            const now = new Date();
            const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
            if (next <= now) {
                next.setDate(next.getDate() + 1);
            }
            const due = next.getTime();
            const delay = Math.max(0, due - Date.now());
            const handle = setTimeout(() => tick(due), delay);
            entry.cancel = () => clearTimeout(handle);
        };
        const tick = (due) => {
            this.scheduler.enqueue(async () => {
                const drift = Math.abs(Date.now() - due);
                if (drift > this.driftTolerance) {
                    this.logger?.('timebridge:drift', { id, drift, spec: expr });
                }
                await callback();
                this.scheduler.notifyExternalTrigger({ taskId: id, spec: expr, kind: 'cron' });
            });
            scheduleNext();
        };
        const entry = {
            id,
            cancel: () => undefined,
        };
        this.timers.set(id, entry);
        scheduleNext();
        return id;
    }
    stop(timerId) {
        const entry = this.timers.get(timerId);
        if (!entry)
            return;
        entry.cancel();
        this.timers.delete(timerId);
    }
    dispose() {
        for (const entry of this.timers.values()) {
            entry.cancel();
        }
        this.timers.clear();
    }
    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
}
exports.TimeBridge = TimeBridge;
