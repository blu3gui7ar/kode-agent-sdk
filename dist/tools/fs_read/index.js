"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsRead = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const type_inference_1 = require("../type-inference");
const prompt_1 = require("./prompt");
exports.FsRead = (0, tool_1.tool)({
    name: 'fs_read',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        path: type_inference_1.patterns.filePath('Path to file relative to sandbox root'),
        offset: type_inference_1.patterns.optionalNumber('Line offset (1-indexed)'),
        limit: type_inference_1.patterns.optionalNumber('Max lines to read'),
    }),
    async execute(args, ctx) {
        const { path, offset, limit } = args;
        const content = await ctx.sandbox.fs.read(path);
        const lines = content.split('\n');
        const startLine = offset ? offset - 1 : 0;
        const endLine = limit ? startLine + limit : lines.length;
        const selected = lines.slice(startLine, endLine);
        await ctx.services?.filePool?.recordRead(path);
        const truncated = endLine < lines.length;
        const result = selected.join('\n');
        return {
            path,
            offset: startLine + 1,
            limit: selected.length,
            truncated,
            totalLines: lines.length,
            content: result,
        };
    },
    metadata: {
        readonly: true,
        version: '1.0',
    },
});
exports.FsRead.prompt = prompt_1.PROMPT;
