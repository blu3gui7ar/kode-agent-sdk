/**
 * Skills 工具
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责列出和加载skills，不处理业务逻辑
 * - 模块化: 复用SkillsManager进行实际操作
 * - 组合: 与SDK工具系统无缝集成
 */
import type { SkillsManager } from '../core/skills/manager';
/**
 * 创建Skills工具
 *
 * @param skillsManager Skills管理器实例
 * @returns ToolInstance
 */
export declare function createSkillsTool(skillsManager: SkillsManager): import("./registry").ToolInstance;
/**
 * 导出工具创建函数
 */
export default createSkillsTool;
