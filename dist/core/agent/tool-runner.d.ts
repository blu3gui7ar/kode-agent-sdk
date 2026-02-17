export declare class ToolRunner {
    private readonly concurrency;
    private active;
    private readonly queue;
    constructor(concurrency: number);
    run<T>(task: () => Promise<T>): Promise<T>;
    clear(): void;
    private flush;
}
