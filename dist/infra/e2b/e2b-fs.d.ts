import { SandboxFS } from '../sandbox';
export interface E2BFSHost {
    workDir: string;
    getE2BInstance(): any;
}
export declare class E2BFS implements SandboxFS {
    private host;
    constructor(host: E2BFSHost);
    resolve(p: string): string;
    isInside(_p: string): boolean;
    read(p: string): Promise<string>;
    write(p: string, content: string): Promise<void>;
    temp(name?: string): string;
    stat(p: string): Promise<{
        mtimeMs: number;
    }>;
    glob(pattern: string, opts?: {
        cwd?: string;
        ignore?: string[];
        dot?: boolean;
        absolute?: boolean;
    }): Promise<string[]>;
    private globViaFind;
    private globViaList;
    /** @internal */
    globToFindPattern(pattern: string): string;
    /** @internal */
    matchGlob(pattern: string, target: string): boolean;
}
