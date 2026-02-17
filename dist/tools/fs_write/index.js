"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsWrite = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const type_inference_1 = require("../type-inference");
const prompt_1 = require("./prompt");
exports.FsWrite = (0, tool_1.tool)({
    name: 'fs_write',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        path: type_inference_1.patterns.filePath('Path to file within the sandbox'),
        content: zod_1.z.string().describe('Content to write'),
    }),
    async execute(args, ctx) {
        const { path, content } = args;
        const freshness = await ctx.services?.filePool?.validateWrite(path);
        if (freshness && !freshness.isFresh) {
            return {
                ok: false,
                error: 'File appears to have changed externally. Please read it again before writing.',
            };
        }
        await ctx.sandbox.fs.write(path, content);
        await ctx.services?.filePool?.recordEdit(path);
        const bytes = Buffer.byteLength(content, 'utf8');
        const lines = content.split('\n').length;
        return {
            ok: true,
            path,
            bytes,
            lines,
        };
    },
    metadata: {
        readonly: false,
        version: '1.0',
    },
});
exports.FsWrite.prompt = prompt_1.PROMPT;
