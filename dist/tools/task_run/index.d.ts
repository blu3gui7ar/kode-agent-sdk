export interface AgentTemplate {
    id: string;
    system?: string;
    tools?: string[];
    whenToUse?: string;
}
export declare function createTaskRunTool(templates: AgentTemplate[]): import("..").ToolInstance;
