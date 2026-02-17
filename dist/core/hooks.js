"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HookManager = void 0;
class HookManager {
    constructor() {
        this.hooks = [];
    }
    register(hooks, origin = 'agent') {
        this.hooks.push({ hooks, origin });
    }
    getRegistered() {
        return this.hooks.map(({ hooks, origin }) => ({
            origin,
            names: [
                hooks.preToolUse && 'preToolUse',
                hooks.postToolUse && 'postToolUse',
                hooks.preModel && 'preModel',
                hooks.postModel && 'postModel',
            ].filter(Boolean),
        }));
    }
    async runPreToolUse(call, ctx) {
        for (const { hooks } of this.hooks) {
            if (hooks.preToolUse) {
                const result = await hooks.preToolUse(call, ctx);
                if (result)
                    return result;
            }
        }
        return undefined;
    }
    async runPostToolUse(outcome, ctx) {
        let current = outcome;
        for (const { hooks } of this.hooks) {
            if (hooks.postToolUse) {
                const result = await hooks.postToolUse(current, ctx);
                if (result && typeof result === 'object') {
                    if ('replace' in result) {
                        current = result.replace;
                    }
                    else if ('update' in result) {
                        current = { ...current, ...result.update };
                    }
                }
            }
        }
        return current;
    }
    async runPreModel(request) {
        for (const { hooks } of this.hooks) {
            if (hooks.preModel) {
                await hooks.preModel(request);
            }
        }
    }
    async runPostModel(response) {
        for (const { hooks } of this.hooks) {
            if (hooks.postModel) {
                await hooks.postModel(response);
            }
        }
    }
    async runMessagesChanged(snapshot) {
        for (const { hooks } of this.hooks) {
            if (hooks.messagesChanged) {
                await hooks.messagesChanged(snapshot);
            }
        }
    }
}
exports.HookManager = HookManager;
