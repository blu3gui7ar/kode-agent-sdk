import { Hooks } from './hooks';
export type PermissionDecisionMode = 'auto' | 'approval' | 'readonly' | (string & {});
export interface PermissionConfig {
    mode: PermissionDecisionMode;
    requireApprovalTools?: string[];
    allowTools?: string[];
    denyTools?: string[];
    metadata?: Record<string, any>;
}
export interface SubAgentConfig {
    templates?: string[];
    depth: number;
    inheritConfig?: boolean;
    overrides?: {
        permission?: PermissionConfig;
        todo?: TodoConfig;
    };
}
export interface TodoConfig {
    enabled: boolean;
    remindIntervalSteps?: number;
    storagePath?: string;
    reminderOnStart?: boolean;
}
export interface AgentTemplateDefinition {
    id: string;
    name?: string;
    desc?: string;
    version?: string;
    systemPrompt: string;
    model?: string;
    sandbox?: Record<string, any>;
    tools?: '*' | string[];
    permission?: PermissionConfig;
    runtime?: TemplateRuntimeConfig;
    hooks?: Hooks;
    metadata?: Record<string, any>;
}
export interface TemplateRuntimeConfig {
    exposeThinking?: boolean;
    retainThinking?: boolean;
    multimodalContinuation?: 'history';
    multimodalRetention?: {
        keepRecent?: number;
    };
    todo?: TodoConfig;
    subagents?: SubAgentConfig;
    metadata?: Record<string, any>;
}
export declare class AgentTemplateRegistry {
    private templates;
    register(template: AgentTemplateDefinition): void;
    bulkRegister(templates: AgentTemplateDefinition[]): void;
    has(id: string): boolean;
    get(id: string): AgentTemplateDefinition;
    list(): AgentTemplateDefinition[];
}
