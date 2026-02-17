"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoRead = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const prompt_1 = require("./prompt");
exports.TodoRead = (0, tool_1.tool)({
    name: 'todo_read',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({}),
    async execute(_args, ctx) {
        if (ctx.agent?.getTodos) {
            return { todos: ctx.agent.getTodos() };
        }
        const service = ctx.services?.todo;
        if (!service) {
            return {
                todos: [],
                note: 'Todo service not enabled for this agent'
            };
        }
        return { todos: service.list() };
    },
    metadata: {
        readonly: true,
        version: '1.0',
    },
});
exports.TodoRead.prompt = prompt_1.PROMPT;
