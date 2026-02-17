/**
 * Skills 管理器
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责扫描和加载skills，不处理业务逻辑
 * - 模块化: 单一职责，易于测试和维护
 * - 热更新: 每次调用都重新扫描文件系统，确保数据最新
 */
import type { SkillMetadata, SkillContent } from './types';
/**
 * Skills 管理器
 */
export declare class SkillsManager {
    private skillsDir;
    private cache;
    private allowedSkills?;
    private skillsDisabled;
    constructor(skillsDir?: string, allowedSkills?: string[]);
    /**
     * 扫描skills目录（支持热更新）
     * 每次调用时重新扫描，确保读取最新数据
     */
    scan(): Promise<SkillMetadata[]>;
    /**
     * 获取所有skills的元数据列表（供LLM选择）
     */
    getSkillsMetadata(): Promise<SkillMetadata[]>;
    /**
     * 加载指定skill的完整内容
     */
    loadSkillContent(skillName: string): Promise<SkillContent | null>;
    /**
     * 递归扫描目录，查找所有SKILL.md
     * 返回格式: { skillMdPath: string, folderName: string }[]
     */
    private scanDirectory;
    /**
     * 解析SKILL.md，提取元数据
     * @param skillMdPath SKILL.md文件的完整路径
     * @param folderName 技能文件夹名称（作为技能标识符）
     */
    private parseSkillMetadata;
    /**
     * 列出子目录下的文件
     */
    private listSubdirectory;
    /**
     * 检查文件是否存在
     */
    private fileExists;
}
