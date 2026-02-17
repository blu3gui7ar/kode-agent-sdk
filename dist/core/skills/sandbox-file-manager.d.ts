/**
 * Sandbox文件管理器模块
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责sandbox中的文件操作
 * - 模块化: 独立的文件操作逻辑
 * - 安全: 强制边界控制，确保只能访问技能目录内文件
 */
import { SandboxFactory } from '../../infra/sandbox-factory';
/**
 * 文件树节点接口
 */
export interface SkillFileTree {
    /** 文件/目录名 */
    name: string;
    /** 类型 */
    type: 'file' | 'dir';
    /** 相对于技能根目录的路径 */
    path: string;
    /** 文件大小（字节） */
    size?: number;
    /** 修改时间 */
    modifiedTime?: string;
    /** 子节点（目录） */
    children?: SkillFileTree[];
}
/**
 * Sandbox文件管理器类
 *
 * 职责:
 * - 在sandbox隔离环境中执行文件操作
 * - 确保文件访问边界在技能目录内
 * - 提供read、write、delete、list等基础文件操作
 */
export declare class SandboxFileManager {
    private sandboxFactory;
    constructor(sandboxFactory: SandboxFactory);
    /**
     * 在sandbox中读取文件
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     */
    readFile(skillBaseDir: string, relativePath: string): Promise<string>;
    /**
     * 在sandbox中写入文件
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     * @param content 文件内容
     */
    writeFile(skillBaseDir: string, relativePath: string, content: string): Promise<void>;
    /**
     * 在sandbox中删除文件
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     */
    deleteFile(skillBaseDir: string, relativePath: string): Promise<void>;
    /**
     * 在sandbox中列出目录
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     */
    listFiles(skillBaseDir: string, relativePath?: string): Promise<SkillFileTree>;
    /**
     * 在sandbox中创建目录
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     */
    createDir(skillBaseDir: string, relativePath: string): Promise<void>;
    /**
     * 创建技能的sandbox实例
     * 关键：设置enforceBoundary=true，确保只能在技能目录内操作
     */
    private createSkillSandbox;
    /**
     * 获取删除命令（跨平台）
     */
    private getDeleteCommand;
    /**
     * 构建文件树
     */
    private buildFileTree;
}
