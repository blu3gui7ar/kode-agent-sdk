"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionId = void 0;
class SessionId {
    static parse(id) {
        const parts = id.split('/');
        const components = {
            agentTemplate: '',
            rootId: '',
            forkIds: [],
        };
        for (const part of parts) {
            if (part.startsWith('org-')) {
                components.orgId = part.slice(4);
            }
            else if (part.startsWith('team-')) {
                components.teamId = part.slice(5);
            }
            else if (part.startsWith('user-')) {
                components.userId = part.slice(5);
            }
            else if (part.startsWith('agent-')) {
                components.agentTemplate = part.slice(6);
            }
            else if (part.startsWith('session-')) {
                components.rootId = part.slice(8);
            }
            else if (part.startsWith('fork-')) {
                components.forkIds.push(part.slice(5));
            }
        }
        return components;
    }
    static generate(opts) {
        const parts = [];
        if (opts.orgId)
            parts.push(`org-${opts.orgId}`);
        if (opts.teamId)
            parts.push(`team-${opts.teamId}`);
        if (opts.userId)
            parts.push(`user-${opts.userId}`);
        parts.push(`agent-${opts.agentTemplate}`);
        if (opts.parentSessionId) {
            const parent = SessionId.parse(opts.parentSessionId);
            parts.push(`session-${parent.rootId}`);
            parts.push(...parent.forkIds.map((id) => `fork-${id}`));
            parts.push(`fork-${this.randomId()}`);
        }
        else {
            parts.push(`session-${this.randomId()}`);
        }
        return parts.join('/');
    }
    static snapshot(sessionId, sfpIndex) {
        return `${sessionId}@sfp-${sfpIndex}`;
    }
    static label(sessionId, label) {
        return `${sessionId}@label-${label}`;
    }
    static randomId() {
        return Math.random().toString(36).slice(2, 8);
    }
}
exports.SessionId = SessionId;
