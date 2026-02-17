"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoWrite = void 0;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const prompt_1 = require("./prompt");
const todoItemSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique identifier for the todo'),
    title: zod_1.z.string().describe('Clear description of the task'),
    status: zod_1.z.enum(['pending', 'in_progress', 'completed']).describe('Current status'),
    assignee: zod_1.z.string().optional().describe('Who is responsible'),
    notes: zod_1.z.string().optional().describe('Additional context'),
});
exports.TodoWrite = (0, tool_1.tool)({
    name: 'todo_write',
    description: prompt_1.DESCRIPTION,
    parameters: zod_1.z.object({
        todos: zod_1.z.array(todoItemSchema).describe('Array of todo items'),
    }),
    async execute(args, ctx) {
        const { todos } = args;
        const inProgressCount = todos.filter((t) => t.status === 'in_progress').length;
        if (inProgressCount > 1) {
            throw new Error(`Only one todo can be "in_progress" at a time. Found ${inProgressCount} in_progress todos.`);
        }
        if (!ctx.agent?.setTodos) {
            const service = ctx.services?.todo;
            if (!service) {
                throw new Error('Todo service not enabled for this agent');
            }
            await service.setTodos(todos);
            return { ok: true, count: todos.length };
        }
        await ctx.agent.setTodos(todos);
        return { ok: true, count: todos.length };
    },
    metadata: {
        readonly: false,
        version: '1.0',
    },
});
exports.TodoWrite.prompt = prompt_1.PROMPT;
