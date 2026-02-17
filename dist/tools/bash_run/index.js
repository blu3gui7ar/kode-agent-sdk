"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processes = exports.BashRun = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const type_inference_1 = require("../type-inference");
const prompt_1 = require("./prompt");
const processes = new Map();
exports.processes = processes;
exports.BashRun = (0, tool_1.tool)({
    name: 'bash_run',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        cmd: zod_1.z.string().describe('Command to execute'),
        timeout_ms: type_inference_1.patterns.optionalNumber('Timeout in milliseconds (default: 120000)'),
        background: zod_1.z.boolean().optional().describe('Run in background and return shell_id'),
    }),
    async execute(args, ctx) {
        const { cmd, timeout_ms = 120000, background = false } = args;
        if (background) {
            const id = `shell-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const promise = ctx.sandbox.exec(cmd, { timeoutMs: timeout_ms });
            const proc = {
                id,
                cmd,
                startTime: Date.now(),
                promise,
                stdout: '',
                stderr: '',
            };
            processes.set(id, proc);
            promise.then((result) => {
                proc.code = result.code;
                proc.stdout = result.stdout;
                proc.stderr = result.stderr;
            }).catch((error) => {
                proc.code = -1;
                proc.stderr = error?.message || String(error);
            });
            return {
                background: true,
                shell_id: id,
                message: `Background shell started: ${id}`,
            };
        }
        else {
            const result = await ctx.sandbox.exec(cmd, { timeoutMs: timeout_ms });
            const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
            return {
                background: false,
                code: result.code,
                output: output || '(no output)',
            };
        }
    },
    metadata: {
        readonly: false,
        version: '1.0',
    },
});
exports.BashRun.prompt = prompt_1.PROMPT;
