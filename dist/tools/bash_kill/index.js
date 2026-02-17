"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BashKill = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const prompt_1 = require("./prompt");
const bash_run_1 = require("../bash_run");
exports.BashKill = (0, tool_1.tool)({
    name: 'bash_kill',
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
        bash_run_1.processes.delete(shell_id);
        return {
            ok: true,
            shell_id,
            message: `Killed shell ${shell_id}`,
        };
    },
    metadata: {
        readonly: false,
        version: '1.0',
    },
});
exports.BashKill.prompt = prompt_1.PROMPT;
