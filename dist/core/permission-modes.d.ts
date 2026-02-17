import { PermissionConfig } from './template';
import { ToolDescriptor } from '../tools/registry';
export type PermissionDecision = 'allow' | 'deny' | 'ask';
export interface PermissionEvaluationContext {
    toolName: string;
    descriptor?: ToolDescriptor;
    config: PermissionConfig;
}
export type PermissionModeHandler = (ctx: PermissionEvaluationContext) => PermissionDecision;
export interface SerializedPermissionMode {
    name: string;
    builtIn: boolean;
}
export declare class PermissionModeRegistry {
    private handlers;
    private customModes;
    register(mode: string, handler: PermissionModeHandler, isBuiltIn?: boolean): void;
    get(mode: string): PermissionModeHandler | undefined;
    list(): string[];
    /**
     * 序列化权限模式配置
     * 仅序列化自定义模式的名称，内置模式在 Resume 时自动恢复
     */
    serialize(): SerializedPermissionMode[];
    /**
     * 验证序列化的权限模式是否可恢复
     * 返回缺失的自定义模式列表
     */
    validateRestore(serialized: SerializedPermissionMode[]): string[];
}
export declare const permissionModes: PermissionModeRegistry;
