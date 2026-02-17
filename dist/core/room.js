"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    constructor(pool) {
        this.pool = pool;
        this.members = new Map();
    }
    join(name, agentId) {
        if (this.members.has(name)) {
            throw new Error(`Member already exists: ${name}`);
        }
        this.members.set(name, agentId);
    }
    leave(name) {
        this.members.delete(name);
    }
    async say(from, text) {
        const mentions = this.extractMentions(text);
        if (mentions.length > 0) {
            // Directed message
            for (const mention of mentions) {
                const agentId = this.members.get(mention);
                if (agentId) {
                    const agent = this.pool.get(agentId);
                    if (agent) {
                        await agent.complete(`[from:${from}] ${text}`);
                    }
                }
            }
        }
        else {
            // Broadcast to all except sender
            for (const [name, agentId] of this.members) {
                if (name !== from) {
                    const agent = this.pool.get(agentId);
                    if (agent) {
                        await agent.complete(`[from:${from}] ${text}`);
                    }
                }
            }
        }
    }
    getMembers() {
        return Array.from(this.members.entries()).map(([name, agentId]) => ({ name, agentId }));
    }
    extractMentions(text) {
        const regex = /@(\w+)/g;
        const mentions = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        return mentions;
    }
}
exports.Room = Room;
