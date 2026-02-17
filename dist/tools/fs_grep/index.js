"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsGrep = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const type_inference_1 = require("../type-inference");
const prompt_1 = require("./prompt");
exports.FsGrep = (0, tool_1.tool)({
    name: 'fs_grep',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        pattern: zod_1.z.string().describe('String or regular expression to search for'),
        path: zod_1.z.string().describe('File path or glob pattern'),
        regex: zod_1.z.boolean().optional().describe('Interpret pattern as regular expression (default: false)'),
        case_sensitive: zod_1.z.boolean().optional().describe('Case sensitive search (default: true)'),
        max_results: type_inference_1.patterns.optionalNumber('Maximum matches to return (default: 200)'),
    }),
    async execute(args, ctx) {
        const { pattern, path, regex = false, case_sensitive = true, max_results = 200 } = args;
        if (!pattern) {
            return { ok: false, error: 'pattern must not be empty' };
        }
        const files = await ctx.sandbox.fs.glob(path, { absolute: false, dot: true });
        const regexPattern = regex
            ? new RegExp(pattern, case_sensitive ? 'g' : 'gi')
            : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), case_sensitive ? 'g' : 'gi');
        const matches = [];
        for (const file of files) {
            if (matches.length >= max_results)
                break;
            const content = await ctx.sandbox.fs.read(file);
            const lines = content.split('\n');
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                if (matches.length >= max_results)
                    break;
                const line = lines[lineIndex];
                regexPattern.lastIndex = 0;
                let match;
                while ((match = regexPattern.exec(line))) {
                    matches.push({
                        path: file,
                        line: lineIndex + 1,
                        column: match.index + 1,
                        preview: line.trim().slice(0, 200),
                    });
                    if (matches.length >= max_results)
                        break;
                    if (!regex)
                        break;
                }
            }
        }
        return {
            ok: true,
            pattern,
            path,
            matches,
            truncated: matches.length >= max_results && files.length > 0,
        };
    },
    metadata: {
        readonly: true,
        version: '1.0',
    },
});
exports.FsGrep.prompt = prompt_1.PROMPT;
