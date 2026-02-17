export interface SessionIdComponents {
    orgId?: string;
    teamId?: string;
    userId?: string;
    agentTemplate: string;
    rootId: string;
    forkIds: string[];
}
export declare class SessionId {
    static parse(id: string): SessionIdComponents;
    static generate(opts: {
        orgId?: string;
        teamId?: string;
        userId?: string;
        agentTemplate: string;
        parentSessionId?: string;
    }): string;
    static snapshot(sessionId: string, sfpIndex: number): string;
    static label(sessionId: string, label: string): string;
    private static randomId;
}
