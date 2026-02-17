import { Scheduler } from './scheduler';
export interface TimeBridgeOptions {
    scheduler: Scheduler;
    driftToleranceMs?: number;
    logger?: (msg: string, meta?: Record<string, any>) => void;
}
export declare class TimeBridge {
    private readonly scheduler;
    private readonly driftTolerance;
    private readonly logger?;
    private readonly timers;
    constructor(opts: TimeBridgeOptions);
    everyMinutes(minutes: number, callback: () => void | Promise<void>): string;
    cron(expr: string, callback: () => void | Promise<void>): string;
    stop(timerId: string): void;
    dispose(): void;
    private generateId;
}
