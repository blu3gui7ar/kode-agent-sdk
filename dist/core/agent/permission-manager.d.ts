import { PermissionConfig } from '../template';
import { ToolDescriptor } from '../../tools/registry';
import { PermissionDecision } from '../permission-modes';
export declare class PermissionManager {
    private readonly config;
    private readonly descriptors;
    constructor(config: PermissionConfig, descriptors: Map<string, ToolDescriptor>);
    evaluate(toolName: string): PermissionDecision;
}
