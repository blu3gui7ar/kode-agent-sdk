"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BashLogs = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const prompt_1 = require("./prompt");
const bash_run_1 = require("../bash_run");
exports.BashLogs = (0, tool_1.tool)({
    name: 'bash_logs',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        shell_id: zod_1.z.string().describe('Shell ID from bash_run'),
    }),
    async execute(args) {
        const { shell_id } = args;
        const proc = bash_run_1.processes.get(shell_id);
        if (!proc) {
            return {
                ok: false,
                error: `Shell not found: ${shell_id}`,
            };
        }
        const isRunning = proc.code === undefined;
        const status = isRunning ? 'running' : `completed (exit code ${proc.code})`;
        const output = [proc.stdout, proc.stderr].filter(Boolean).join('\n').trim();
        return {
            ok: true,
            shell_id,
            status,
            running: isRunning,
            code: proc.code,
            output: output || '(no output yet)',
        };
    },
    metadata: {
        readonly: true,
        version: '1.0',
    },
});
exports.BashLogs.prompt = prompt_1.PROMPT;
