"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskRunTool = createTaskRunTool;
const tool_1 = require("../tool");
const zod_1 = require("zod");
const prompt_1 = require("./prompt");
function createTaskRunTool(templates) {
    if (!templates || templates.length === 0) {
        throw new Error('Cannot create task_run tool: no agent templates provided');
    }
    const TaskRun = (0, tool_1.tool)({
        name: 'task_run',
        description: prompt_1.DESCRIPTION,
        parameters: zod_1.z.object({
            description: zod_1.z.string().describe('Short description of the task (3-5 words)'),
            prompt: zod_1.z.string().describe('Detailed instructions for the sub-agent'),
            agentTemplateId: zod_1.z.string().describe('Agent template ID to use for this task'),
            context: zod_1.z.string().optional().describe('Additional context to append'),
        }),
        async execute(args, ctx) {
            const { description, prompt, agentTemplateId, context } = args;
            const template = templates.find((tpl) => tpl.id === agentTemplateId);
            if (!template) {
                const availableTemplates = templates
                    .map((tpl) => `  - ${tpl.id}: ${tpl.whenToUse || 'General purpose agent'}`)
                    .join('\n');
                throw new Error(`Agent template '${agentTemplateId}' not found.\n\nAvailable templates:\n${availableTemplates}\n\nPlease choose one of the available template IDs.`);
            }
            const detailedPrompt = [
                `# Task: ${description}`,
                prompt,
                context ? `\n# Additional Context\n${context}` : undefined,
            ]
                .filter(Boolean)
                .join('\n\n');
            if (!ctx.agent?.delegateTask) {
                throw new Error('Task delegation not supported by this agent version');
            }
            const result = await ctx.agent.delegateTask({
                templateId: template.id,
                prompt: detailedPrompt,
                tools: template.tools,
            });
            return {
                status: result.status,
                template: template.id,
                text: result.text,
                permissionIds: result.permissionIds,
            };
        },
        metadata: {
            readonly: false,
            version: '1.0',
        },
    });
    TaskRun.prompt = (0, prompt_1.generatePrompt)(templates);
    return TaskRun;
}
