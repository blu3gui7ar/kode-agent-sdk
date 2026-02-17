"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsEdit = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const type_inference_1 = require("../type-inference");
const prompt_1 = require("./prompt");
exports.FsEdit = (0, tool_1.tool)({
    name: 'fs_edit',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        path: type_inference_1.patterns.filePath('Path to file within the sandbox'),
        old_string: zod_1.z.string().describe('String to replace'),
        new_string: zod_1.z.string().describe('Replacement string'),
        replace_all: zod_1.z.boolean().optional().describe('Replace all occurrences (default: false)'),
    }),
    async execute(args, ctx) {
        const { path, old_string, new_string, replace_all = false } = args;
        const content = await ctx.sandbox.fs.read(path);
        if (replace_all) {
            const occurrences = content.split(old_string).length - 1;
            if (occurrences === 0) {
                return { ok: false, error: 'old_string not found in file' };
            }
            const updated = content.split(old_string).join(new_string);
            await ctx.sandbox.fs.write(path, updated);
            await ctx.services?.filePool?.recordEdit(path);
            return {
                ok: true,
                path,
                replacements: occurrences,
                lines: updated.split('\n').length,
            };
        }
        else {
            const occurrences = content.split(old_string).length - 1;
            if (occurrences === 0) {
                return { ok: false, error: 'old_string not found in file' };
            }
            if (occurrences > 1) {
                return {
                    ok: false,
                    error: `old_string appears ${occurrences} times; set replace_all=true or provide more specific text`,
                };
            }
            const updated = content.replace(old_string, new_string);
            await ctx.sandbox.fs.write(path, updated);
            await ctx.services?.filePool?.recordEdit(path);
            return {
                ok: true,
                path,
                replacements: 1,
                lines: updated.split('\n').length,
            };
        }
    },
    metadata: {
        readonly: false,
        version: '1.0',
    },
});
exports.FsEdit.prompt = prompt_1.PROMPT;
