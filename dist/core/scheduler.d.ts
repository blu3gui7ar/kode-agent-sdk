type StepCallback = (ctx: {
    stepCount: number;
}) => void | Promise<void>;
type TaskCallback = () => void | Promise<void>;
export type AgentSchedulerHandle = string;
type TriggerKind = 'steps' | 'time' | 'cron';
interface SchedulerOptions {
    onTrigger?: (info: {
        taskId: string;
        spec: string;
        kind: TriggerKind;
    }) => void;
}
export declare class Scheduler {
    private readonly stepTasks;
    private readonly listeners;
    private queued;
    private readonly onTrigger?;
    constructor(opts?: SchedulerOptions);
    everySteps(every: number, callback: StepCallback): AgentSchedulerHandle;
    onStep(callback: StepCallback): () => void;
    enqueue(callback: TaskCallback): void;
    notifyStep(stepCount: number): void;
    cancel(taskId: AgentSchedulerHandle): void;
    clear(): void;
    notifyExternalTrigger(info: {
        taskId: string;
        spec: string;
        kind: 'time' | 'cron';
    }): void;
    private generateId;
}
export {};
