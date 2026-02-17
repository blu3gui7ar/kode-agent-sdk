import { Sandbox as E2BSdk } from 'e2b';
import { Sandbox, SandboxKind, SandboxFS, SandboxExecResult } from '../sandbox';
import { E2BSandboxOptions } from './types';
import { E2BFSHost } from './e2b-fs';
export declare class E2BSandbox implements Sandbox, E2BFSHost {
    kind: SandboxKind;
    workDir: string;
    fs: SandboxFS;
    private e2b;
    private options;
    private watchers;
    constructor(options?: E2BSandboxOptions);
    /** Initialize sandbox connection (create or resume) */
    init(): Promise<void>;
    /** Get underlying E2B SDK instance */
    getE2BInstance(): E2BSdk;
    /** Get sandbox ID (for persistence and resume) */
    getSandboxId(): string;
    /** Get accessible URL for a given port */
    getHostUrl(port: number): string;
    exec(cmd: string, opts?: {
        timeoutMs?: number;
    }): Promise<SandboxExecResult>;
    watchFiles(paths: string[], listener: (event: {
        path: string;
        mtimeMs: number;
    }) => void): Promise<string>;
    unwatchFiles(id: string): void;
    dispose(): Promise<void>;
    /** Extend sandbox lifetime */
    setTimeout(timeoutMs: number): Promise<void>;
    /** Check if sandbox is running */
    isRunning(): Promise<boolean>;
    /** Custom JSON serialization to avoid circular reference */
    toJSON(): Record<string, unknown>;
    private withRetry;
}
