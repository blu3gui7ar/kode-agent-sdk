/**
 * 技能管理器模块(路径1 - 技能管理)
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责技能文件系统的管理操作
 * - 模块化: 单一职责,易于测试和维护
 * - 隔离: 与Agent运行时完全隔离,不参与Agent使用
 *
 * ⚠️ 重要说明:
 * - 此模块专门用于路径1(技能管理)
 * - 与路径2(Agent运行时)完全独立
 * - 请勿与SkillsManager混淆
 *
 * @see docs/skills-management-implementation-plan.md
 */
import type { SkillInfo, ArchivedSkillInfo } from './types';
/**
 * 技能管理器类
 *
 * 职责:
 * - 提供所有技能管理操作的统一接口(导入、复制、重命名、归档、导出)
 * - 处理业务逻辑和权限验证
 * - 所有操作严格遵循Specification.md规范
 * - ❌ 不参与Agent运行时
 * - ❌ 不提供技能加载、扫描等Agent使用的功能
 */
export declare class SkillsManagementManager {
    private skillsDir;
    private archivedDir;
    constructor(skillsDir: string, archivedDir?: string);
    /**
     * 1. 列出在线技能
     * 扫描skills目录,排除.archived子目录
     * 返回技能清单及其元数据信息
     */
    listSkills(): Promise<SkillInfo[]>;
    /**
     * 2. 安装新技能
     * @param source 技能来源(名称/GitHub仓库/Git URL/本地路径)
     * @param onProgress 可选的进度回调函数，用于实时传递安装日志
     * 执行命令: npx -y ai-agent-skills install --agent project [source]
     * 直接安装到.skills目录
     */
    installSkill(source: string, onProgress?: (data: {
        type: 'log' | 'error';
        message: string;
    }) => void): Promise<void>;
    /**
     * 3. 列出归档技能
     * 扫描.archived目录
     * 返回归档技能清单及其元数据信息
     */
    listArchivedSkills(): Promise<ArchivedSkillInfo[]>;
    /**
     * 4. 导入技能
     * @param zipFilePath zip文件路径
     * @param originalFileName 原始上传文件名（可选，用于无嵌套目录时的技能命名）
     * 验证SKILL.md格式,解压并放置在在线技能目录中
     *
     * 检测逻辑：
     * - 如果解压后根目录直接包含SKILL.md，视为无嵌套目录，使用originalFileName作为技能名称
     * - 如果根目录不包含SKILL.md但包含多个子目录，每个子目录都有SKILL.md，则批量导入
     */
    importSkill(zipFilePath: string, originalFileName?: string): Promise<void>;
    /**
     * 5. 复制技能
     * @param skillName 技能名称
     * 新技能名称: {原技能名称}-{XXXXXXXX}
     */
    copySkill(skillName: string): Promise<string>;
    /**
     * 6. 重命名技能
     * @param oldName 旧技能文件夹名称
     * @param newName 新技能文件夹名称
     * 不支持操作归档技能
     */
    renameSkill(oldName: string, newName: string): Promise<void>;
    /**
     * 7. 在线技能转归档
     * @param skillName 技能名称
     * 归档名称: {原技能名称}-{XXXXXXXX}
     */
    archiveSkill(skillName: string): Promise<void>;
    /**
     * 8. 归档技能转在线
     * @param archivedSkillName archived中的技能名称(含后缀)
     * 移入前检测重名
     */
    unarchiveSkill(archivedSkillName: string): Promise<void>;
    /**
     * 9. 查看在线技能内容
     * @param skillName 技能名称
     * 返回SKILL.md完整内容(包含frontmatter和正文)
     */
    getOnlineSkillContent(skillName: string): Promise<string>;
    /**
     * 10. 查看归档技能内容
     * @param archivedSkillName 归档技能名称(含8位后缀)
     * 返回SKILL.md完整内容(包含frontmatter和正文)
     */
    getArchivedSkillContent(archivedSkillName: string): Promise<string>;
    /**
     * 11. 查看在线技能文件目录结构
     * @param skillName 技能名称
     * 返回JSON格式的目录树结构
     */
    getOnlineSkillStructure(skillName: string): Promise<object>;
    /**
     * 12. 查看归档技能文件目录结构
     * @param archivedSkillName 归档技能名称(含8位后缀)
     * 返回JSON格式的目录树结构
     */
    getArchivedSkillStructure(archivedSkillName: string): Promise<object>;
    /**
     * 13. 导出技能
     * @param skillName 技能名称(在线或归档)
     * @param isArchived 是否为归档技能
     * 使用系统zip命令打包,放入临时目录
     */
    exportSkill(skillName: string, isArchived: boolean): Promise<string>;
    /**
     * 递归构建目录树
     */
    private buildDirectoryTree;
    /**
     * 解析SKILL.md的YAML frontmatter
     */
    private parseSkillMd;
    /**
     * 验证SKILL.md格式(遵循Specification.md规范)
     */
    private validateSkillMd;
    /**
     * 生成8位随机后缀
     * 规则: uuidv4 → sha256 → 全小写 → 取前8位
     */
    private generateRandomSuffix;
    /**
     * 验证技能名称
     */
    private isValidSkillName;
    /**
     * 检查文件是否存在
     */
    private fileExists;
    /**
     * 安全获取文件统计信息
     */
    private safeGetFileStat;
    /**
     * 解压zip文件
     */
    private extractZip;
    /**
     * 跨平台的安全重命名方法
     * Windows上使用"复制-删除"方式避免EPERM错误
     */
    private safeRename;
    /**
     * 创建zip文件
     */
    private createZip;
}
