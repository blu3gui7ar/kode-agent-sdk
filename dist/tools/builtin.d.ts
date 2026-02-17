import { ToolInstance } from './registry';
import { AgentTemplate } from './task_run';
export declare const builtin: {
    fs: () => ToolInstance[];
    bash: () => ToolInstance[];
    todo: () => ToolInstance[];
    task: (templates?: AgentTemplate[]) => ToolInstance | null;
};
export { AgentTemplate };
