import { ToolCall, ToolOutcome, HookDecision, PostHookResult, ToolContext } from '../core/types';
import { ModelResponse } from '../infra/provider';
export interface Hooks {
    preToolUse?: (call: ToolCall, ctx: ToolContext) => HookDecision | Promise<HookDecision>;
    postToolUse?: (outcome: ToolOutcome, ctx: ToolContext) => PostHookResult | Promise<PostHookResult>;
    preModel?: (request: any) => void | Promise<void>;
    postModel?: (response: ModelResponse) => void | Promise<void>;
    messagesChanged?: (snapshot: any) => void | Promise<void>;
}
export interface RegisteredHook {
    origin: 'agent' | 'toolTune';
    names: Array<'preToolUse' | 'postToolUse' | 'preModel' | 'postModel'>;
}
export declare class HookManager {
    private hooks;
    register(hooks: Hooks, origin?: 'agent' | 'toolTune'): void;
    getRegistered(): ReadonlyArray<RegisteredHook>;
    runPreToolUse(call: ToolCall, ctx: ToolContext): Promise<HookDecision>;
    runPostToolUse(outcome: ToolOutcome, ctx: ToolContext): Promise<ToolOutcome>;
    runPreModel(request: any): Promise<void>;
    runPostModel(response: ModelResponse): Promise<void>;
    runMessagesChanged(snapshot: any): Promise<void>;
}
