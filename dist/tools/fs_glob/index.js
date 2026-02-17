"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsGlob = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const type_inference_1 = require("../type-inference");
const prompt_1 = require("./prompt");
exports.FsGlob = (0, tool_1.tool)({
    name: 'fs_glob',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        pattern: zod_1.z.string().describe('Glob pattern to match'),
        cwd: type_inference_1.patterns.optionalString('Optional directory to resolve from'),
        dot: zod_1.z.boolean().optional().describe('Include dotfiles (default: false)'),
        limit: type_inference_1.patterns.optionalNumber('Maximum number of results (default: 200)'),
    }),
    async execute(args, ctx) {
        const { pattern, cwd, dot = false, limit = 200 } = args;
        const matches = await ctx.sandbox.fs.glob(pattern, {
            cwd,
            dot,
            absolute: false,
        });
        const truncated = matches.length > limit;
        const results = matches.slice(0, limit);
        return {
            ok: true,
            pattern,
            cwd: cwd || '.',
            truncated,
            count: matches.length,
            matches: results,
        };
    },
    metadata: {
        readonly: true,
        version: '1.0',
    },
});
exports.FsGlob.prompt = prompt_1.PROMPT;
