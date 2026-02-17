"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsMultiEdit = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const type_inference_1 = require("../type-inference");
const prompt_1 = require("./prompt");
const editSchema = zod_1.z.object({
    path: type_inference_1.patterns.filePath('File path'),
    find: zod_1.z.string().describe('Existing text to replace'),
    replace: zod_1.z.string().describe('Replacement text'),
    replace_all: zod_1.z.boolean().optional().describe('Replace all occurrences (default: false)'),
});
exports.FsMultiEdit = (0, tool_1.tool)({
    name: 'fs_multi_edit',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        edits: zod_1.z.array(editSchema).describe('List of edit operations'),
    }),
    async execute(args, ctx) {
        const { edits } = args;
        const results = [];
        for (const edit of edits) {
            try {
                const freshness = await ctx.services?.filePool?.validateWrite(edit.path);
                if (freshness && !freshness.isFresh) {
                    results.push({
                        path: edit.path,
                        replacements: 0,
                        status: 'skipped',
                        message: 'File changed externally',
                    });
                    continue;
                }
                const content = await ctx.sandbox.fs.read(edit.path);
                if (edit.replace_all) {
                    const occurrences = content.split(edit.find).length - 1;
                    if (occurrences === 0) {
                        results.push({
                            path: edit.path,
                            replacements: 0,
                            status: 'skipped',
                            message: 'Pattern not found',
                        });
                        continue;
                    }
                    const updated = content.split(edit.find).join(edit.replace);
                    await ctx.sandbox.fs.write(edit.path, updated);
                    await ctx.services?.filePool?.recordEdit(edit.path);
                    results.push({
                        path: edit.path,
                        replacements: occurrences,
                        status: 'ok',
                    });
                }
                else {
                    const index = content.indexOf(edit.find);
                    if (index === -1) {
                        results.push({
                            path: edit.path,
                            replacements: 0,
                            status: 'skipped',
                            message: 'Pattern not found',
                        });
                        continue;
                    }
                    const occurrences = content.split(edit.find).length - 1;
                    if (occurrences > 1) {
                        results.push({
                            path: edit.path,
                            replacements: 0,
                            status: 'skipped',
                            message: `Pattern occurs ${occurrences} times; set replace_all=true if intended`,
                        });
                        continue;
                    }
                    const updated = content.replace(edit.find, edit.replace);
                    await ctx.sandbox.fs.write(edit.path, updated);
                    await ctx.services?.filePool?.recordEdit(edit.path);
                    results.push({
                        path: edit.path,
                        replacements: 1,
                        status: 'ok',
                    });
                }
            }
            catch (error) {
                results.push({
                    path: edit.path,
                    replacements: 0,
                    status: 'error',
                    message: error?.message || String(error),
                });
            }
        }
        return {
            ok: results.every((r) => r.status === 'ok'),
            results,
        };
    },
    metadata: {
        readonly: false,
        version: '1.0',
    },
});
exports.FsMultiEdit.prompt = prompt_1.PROMPT;
