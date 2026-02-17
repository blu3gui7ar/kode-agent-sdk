interface BashProcess {
    id: string;
    cmd: string;
    startTime: number;
    promise: Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    stdout: string;
    stderr: string;
    code?: number;
}
declare const processes: Map<string, BashProcess>;
export declare const BashRun: import("..").ToolInstance;
export { processes };
