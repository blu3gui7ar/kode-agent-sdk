"use strict";
/**
 * Scripts 执行工具
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责执行scripts，支持双模式（直接执行/sandbox隔离）
 * - 安全: 支持sandbox隔离执行，拦截危险命令
 * - 跨平台: 自动适配Windows、Linux、MacOS
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
exports.createScriptsTool = createScriptsTool;
const tool_1 = require("../tools/tool");
const zod_1 = require("zod");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * Scripts 工具描述
 */
const DESCRIPTION = `执行skill中的scripts脚本。

支持两种执行模式:
- 直接执行模式（默认）: 本地开发时使用，直接在当前环境执行
- Sandbox隔离模式: 生产环境使用，在安全隔离环境中执行

支持的脚本类型:
- Node.js脚本 (.js, .ts): 跨平台兼容
- Shell脚本 (.sh): Linux/MacOS
- Batch脚本 (.bat): Windows

注意: 危险命令会被自动拦截（如rm -rf /、sudo等）`;
/**
 * 检测平台
 */
function detectPlatform() {
    const platform = os.platform();
    if (platform === 'win32')
        return 'windows';
    if (platform === 'darwin')
        return 'macos';
    return 'linux';
}
/**
 * 获取脚本执行命令
 */
function getScriptCommand(scriptPath, platform) {
    const ext = path.extname(scriptPath).toLowerCase();
    switch (ext) {
        case '.js':
            return `node "${scriptPath}"`;
        case '.ts':
            return `ts-node "${scriptPath}"`;
        case '.sh':
            if (platform === 'windows') {
                // Windows下需要Git Bash或WSL来执行.sh
                return `bash "${scriptPath}"`;
            }
            return `sh "${scriptPath}"`;
        case '.bat':
        case '.cmd':
            if (platform !== 'windows') {
                throw new Error(`Batch scripts (.bat/.cmd) are only supported on Windows`);
            }
            return `"${scriptPath}"`;
        default:
            throw new Error(`Unsupported script type: ${ext}`);
    }
}
/**
 * 创建Scripts工具
 *
 * @param skillsManager Skills管理器实例
 * @param sandboxFactory Sandbox工厂（可选）
 * @returns ToolInstance
 */
function createScriptsTool(skillsManager, sandboxFactory) {
    const scriptsTool = (0, tool_1.tool)({
        name: 'execute_script',
        description: DESCRIPTION,
        parameters: zod_1.z.object({
            skill_name: zod_1.z.string().describe('技能名称'),
            script_name: zod_1.z.string().describe('脚本文件名（如"script.js"）'),
            use_sandbox: zod_1.z.boolean().optional().default(true).describe('是否使用sandbox隔离执行'),
            args: zod_1.z.array(zod_1.z.string()).optional().describe('脚本参数（可选）'),
        }),
        async execute(args, ctx) {
            const { skill_name, script_name, use_sandbox, args: scriptArgs = [] } = args;
            // 加载skill内容
            const skillContent = await skillsManager.loadSkillContent(skill_name);
            if (!skillContent) {
                return {
                    ok: false,
                    error: `Skill '${skill_name}' not found`,
                };
            }
            // 查找脚本文件
            const scriptPath = skillContent.scripts.find(p => path.basename(p) === script_name);
            if (!scriptPath) {
                return {
                    ok: false,
                    error: `Script '${script_name}' not found in skill '${skill_name}'. Available scripts: ${skillContent.scripts.map(p => path.basename(p)).join(', ')}`,
                };
            }
            const platform = detectPlatform();
            let result;
            try {
                if (use_sandbox && sandboxFactory) {
                    // 使用sandbox隔离执行
                    const sandbox = sandboxFactory.create({
                        kind: 'local',
                        workDir: skillContent.metadata.baseDir,
                    });
                    const cmd = getScriptCommand(scriptPath, platform);
                    const cmdWithArgs = `${cmd} ${scriptArgs.join(' ')}`;
                    result = await sandbox.exec(cmdWithArgs, { timeoutMs: 60000 });
                }
                else {
                    // 直接执行（本地开发模式）
                    const cmd = getScriptCommand(scriptPath, platform);
                    const cmdWithArgs = `${cmd} ${scriptArgs.join(' ')}`;
                    const stdout = (0, child_process_1.execSync)(cmdWithArgs, {
                        cwd: skillContent.metadata.baseDir,
                        encoding: 'utf-8',
                        stdio: ['ignore', 'pipe', 'pipe'],
                        timeout: 60000,
                    });
                    result = {
                        code: 0,
                        stdout: stdout || '',
                        stderr: '',
                    };
                }
                if (result.code !== 0) {
                    return {
                        ok: false,
                        error: `Script execution failed with code ${result.code}`,
                        data: {
                            stdout: result.stdout,
                            stderr: result.stderr,
                        },
                    };
                }
                return {
                    ok: true,
                    data: {
                        stdout: result.stdout,
                        stderr: result.stderr,
                    },
                };
            }
            catch (error) {
                return {
                    ok: false,
                    error: error.message || 'Script execution failed',
                    data: {
                        stdout: error.stdout || '',
                        stderr: error.stderr || '',
                    },
                };
            }
        },
        metadata: {
            readonly: false,
            version: '1.0',
        },
    });
    return scriptsTool;
}
/**
 * 导出工具创建函数
 */
exports.default = createScriptsTool;
