"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionManager = void 0;
const permission_modes_1 = require("../permission-modes");
class PermissionManager {
    constructor(config, descriptors) {
        this.config = config;
        this.descriptors = descriptors;
    }
    evaluate(toolName) {
        if (this.config.denyTools?.includes(toolName)) {
            return 'deny';
        }
        if (this.config.allowTools && this.config.allowTools.length > 0 && !this.config.allowTools.includes(toolName)) {
            return 'deny';
        }
        if (this.config.requireApprovalTools?.includes(toolName)) {
            return 'ask';
        }
        const handler = permission_modes_1.permissionModes.get(this.config.mode || 'auto') || permission_modes_1.permissionModes.get('auto');
        if (!handler) {
            return 'allow';
        }
        const context = {
            toolName,
            descriptor: this.descriptors.get(toolName),
            config: this.config,
        };
        return handler(context);
    }
}
exports.PermissionManager = PermissionManager;
