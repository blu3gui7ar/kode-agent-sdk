/**
 * Scripts 执行工具
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责执行scripts，支持双模式（直接执行/sandbox隔离）
 * - 安全: 支持sandbox隔离执行，拦截危险命令
 * - 跨平台: 自动适配Windows、Linux、MacOS
 */
import type { SkillsManager } from '../core/skills/manager';
import type { SandboxFactory } from '../infra/sandbox-factory';
/**
 * 创建Scripts工具
 *
 * @param skillsManager Skills管理器实例
 * @param sandboxFactory Sandbox工厂（可选）
 * @returns ToolInstance
 */
export declare function createScriptsTool(skillsManager: SkillsManager, sandboxFactory?: SandboxFactory): import("./registry").ToolInstance;
/**
 * 导出工具创建函数
 */
export default createScriptsTool;
