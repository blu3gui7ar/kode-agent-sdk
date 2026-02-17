import { Hooks } from '../core/hooks';
import { ToolContext } from '../core/types';
export type ToolSource = 'builtin' | 'registered' | 'mcp';
export interface ToolDescriptor {
    source: ToolSource;
    name: string;
    registryId?: string;
    config?: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface ToolInstance {
    name: string;
    description: string;
    input_schema: any;
    hooks?: Hooks;
    permissionDetails?: (call: any, ctx: ToolContext) => any;
    exec(args: any, ctx: ToolContext): Promise<any>;
    prompt?: string | ((ctx: ToolContext) => string | Promise<string>);
    toDescriptor(): ToolDescriptor;
}
export type ToolFactory = (config?: Record<string, any>) => ToolInstance;
export declare class ToolRegistry {
    private factories;
    register(id: string, factory: ToolFactory): void;
    has(id: string): boolean;
    create(id: string, config?: Record<string, any>): ToolInstance;
    list(): string[];
}
export declare const globalToolRegistry: ToolRegistry;
