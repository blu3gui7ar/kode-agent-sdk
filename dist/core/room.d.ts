import { AgentPool } from '../core/pool';
export interface RoomMember {
    name: string;
    agentId: string;
}
export declare class Room {
    private pool;
    private members;
    constructor(pool: AgentPool);
    join(name: string, agentId: string): void;
    leave(name: string): void;
    say(from: string, text: string): Promise<void>;
    getMembers(): RoomMember[];
    private extractMentions;
}
