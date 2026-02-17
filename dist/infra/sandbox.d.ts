export type SandboxKind = 'local' | 'docker' | 'k8s' | 'remote' | 'vfs' | 'e2b';
export interface SandboxFS {
    resolve(path: string): string;
    isInside(path: string): boolean;
    read(path: string): Promise<string>;
    write(path: string, content: string): Promise<void>;
    temp(name?: string): string;
    stat(path: string): Promise<{
        mtimeMs: number;
    }>;
    glob(pattern: string, opts?: {
        cwd?: string;
        ignore?: string[];
        dot?: boolean;
        absolute?: boolean;
    }): Promise<string[]>;
}
export interface SandboxExecResult {
    code: number;
    stdout: string;
    stderr: string;
}
export interface Sandbox {
    kind: SandboxKind;
    workDir?: string;
    fs: SandboxFS;
    exec(cmd: string, opts?: {
        timeoutMs?: number;
    }): Promise<SandboxExecResult>;
    watchFiles?(paths: string[], listener: (event: {
        path: string;
        mtimeMs: number;
    }) => void): Promise<string>;
    unwatchFiles?(id: string): void;
    dispose?(): Promise<void> | void;
}
export interface LocalSandboxOptions {
    workDir?: string;
    baseDir?: string;
    pwd?: string;
    enforceBoundary?: boolean;
    allowPaths?: string[];
    watchFiles?: boolean;
}
export declare class LocalSandbox implements Sandbox {
    kind: SandboxKind;
    workDir: string;
    fs: SandboxFS;
    private watchers;
    private readonly enforceBoundary;
    private readonly allowPaths;
    private readonly watchEnabled;
    constructor(opts?: LocalSandboxOptions);
    exec(cmd: string, opts?: {
        timeoutMs?: number;
    }): Promise<SandboxExecResult>;
    static local(opts: {
        workDir?: string;
        baseDir?: string;
        pwd?: string;
    }): LocalSandbox;
    watchFiles(paths: string[], listener: (event: {
        path: string;
        mtimeMs: number;
    }) => void): Promise<string>;
    unwatchFiles(id: string): void;
    dispose(): Promise<void>;
}
