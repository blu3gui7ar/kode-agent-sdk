"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionModes = exports.PermissionModeRegistry = void 0;
class PermissionModeRegistry {
    constructor() {
        this.handlers = new Map();
        this.customModes = new Set();
    }
    register(mode, handler, isBuiltIn = false) {
        this.handlers.set(mode, handler);
        if (!isBuiltIn) {
            this.customModes.add(mode);
        }
    }
    get(mode) {
        return this.handlers.get(mode);
    }
    list() {
        return Array.from(this.handlers.keys());
    }
    /**
     * 序列化权限模式配置
     * 仅序列化自定义模式的名称，内置模式在 Resume 时自动恢复
     */
    serialize() {
        return Array.from(this.handlers.keys()).map(name => ({
            name,
            builtIn: !this.customModes.has(name)
        }));
    }
    /**
     * 验证序列化的权限模式是否可恢复
     * 返回缺失的自定义模式列表
     */
    validateRestore(serialized) {
        const missing = [];
        for (const mode of serialized) {
            if (!mode.builtIn && !this.handlers.has(mode.name)) {
                missing.push(mode.name);
            }
        }
        return missing;
    }
}
exports.PermissionModeRegistry = PermissionModeRegistry;
exports.permissionModes = new PermissionModeRegistry();
const MUTATING_ACCESS = new Set(['write', 'execute', 'manage', 'mutate']);
// 内置模式
exports.permissionModes.register('auto', () => 'allow', true);
exports.permissionModes.register('approval', () => 'ask', true);
exports.permissionModes.register('readonly', (ctx) => {
    const metadata = ctx.descriptor?.metadata || {};
    if (metadata.mutates === true)
        return 'deny';
    if (metadata.mutates === false)
        return 'allow';
    const access = typeof metadata.access === 'string' ? metadata.access.toLowerCase() : undefined;
    if (access && MUTATING_ACCESS.has(access))
        return 'deny';
    return 'ask';
}, true);
