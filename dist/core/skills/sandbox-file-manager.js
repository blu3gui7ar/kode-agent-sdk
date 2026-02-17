"use strict";
/**
 * Sandbox文件管理器模块
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责sandbox中的文件操作
 * - 模块化: 独立的文件操作逻辑
 * - 安全: 强制边界控制，确保只能访问技能目录内文件
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxFileManager = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
/**
 * Sandbox文件管理器类
 *
 * 职责:
 * - 在sandbox隔离环境中执行文件操作
 * - 确保文件访问边界在技能目录内
 * - 提供read、write、delete、list等基础文件操作
 */
class SandboxFileManager {
    constructor(sandboxFactory) {
        this.sandboxFactory = sandboxFactory;
    }
    /**
     * 在sandbox中读取文件
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     */
    async readFile(skillBaseDir, relativePath) {
        const sandbox = this.createSkillSandbox(skillBaseDir);
        // 使用sandbox的fs接口读取文件（自动边界检查）
        const content = await sandbox.fs.read(relativePath);
        return content;
    }
    /**
     * 在sandbox中写入文件
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     * @param content 文件内容
     */
    async writeFile(skillBaseDir, relativePath, content) {
        const sandbox = this.createSkillSandbox(skillBaseDir);
        // 使用sandbox的fs接口写入文件（自动边界检查）
        await sandbox.fs.write(relativePath, content);
    }
    /**
     * 在sandbox中删除文件
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     */
    async deleteFile(skillBaseDir, relativePath) {
        const sandbox = this.createSkillSandbox(skillBaseDir);
        // 注意：sandbox.fs没有直接删除接口，需要通过exec执行
        const cmd = this.getDeleteCommand(relativePath);
        await sandbox.exec(cmd, { timeoutMs: 5000 });
    }
    /**
     * 在sandbox中列出目录
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     */
    async listFiles(skillBaseDir, relativePath = '.') {
        const sandbox = this.createSkillSandbox(skillBaseDir);
        // 使用glob获取文件列表
        const pattern = path.join(relativePath, '**/*').replace(/\\/g, '/');
        const files = await sandbox.fs.glob(pattern, {
            absolute: true,
        });
        // 构建文件树
        return this.buildFileTree(files, skillBaseDir, relativePath);
    }
    /**
     * 在sandbox中创建目录
     * @param skillBaseDir 技能根目录
     * @param relativePath 相对路径
     */
    async createDir(skillBaseDir, relativePath) {
        const sandbox = this.createSkillSandbox(skillBaseDir);
        // 使用write创建一个临时文件来创建目录（sandbox.fs.write会自动创建目录）
        const tempFile = path.join(relativePath, '.gitkeep');
        await sandbox.fs.write(tempFile, '');
    }
    /**
     * 创建技能的sandbox实例
     * 关键：设置enforceBoundary=true，确保只能在技能目录内操作
     */
    createSkillSandbox(skillBaseDir) {
        const config = {
            kind: 'local',
            workDir: skillBaseDir, // 工作目录为技能根目录
            baseDir: skillBaseDir, // 基础目录为技能根目录
            enforceBoundary: true, // 强制边界检查
            allowPaths: [], // 不允许访问额外路径
        };
        return this.sandboxFactory.create(config);
    }
    /**
     * 获取删除命令（跨平台）
     */
    getDeleteCommand(filePath) {
        const platform = os.platform();
        if (platform === 'win32') {
            return `del /F /Q "${filePath}"`;
        }
        return `rm -f "${filePath}"`;
    }
    /**
     * 构建文件树
     */
    buildFileTree(files, basePath, relativePath) {
        const fs = require('fs');
        const path = require('path');
        // 递归构建树结构
        const buildNode = (dirPath, name) => {
            const fullPath = path.join(dirPath, name);
            const relative = path.relative(basePath, fullPath);
            const stat = fs.statSync(fullPath);
            const node = {
                name,
                type: stat.isDirectory() ? 'dir' : 'file',
                path: relative.replace(/\\/g, '/'),
                size: stat.size,
                modifiedTime: stat.mtime.toISOString(),
            };
            if (stat.isDirectory()) {
                try {
                    const entries = fs.readdirSync(fullPath);
                    node.children = entries
                        .filter((entry) => !entry.startsWith('.'))
                        .map((entry) => buildNode(fullPath, entry))
                        .sort((a, b) => {
                        // 目录优先，然后按名称排序
                        if (a.type !== b.type) {
                            return a.type === 'dir' ? -1 : 1;
                        }
                        return a.name.localeCompare(b.name);
                    });
                }
                catch (error) {
                    node.children = [];
                }
            }
            return node;
        };
        return buildNode(basePath, relativePath);
    }
}
exports.SandboxFileManager = SandboxFileManager;
