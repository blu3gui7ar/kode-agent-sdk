export declare const DESCRIPTION = "Delegate a task to a specialized sub-agent";
export declare function generatePrompt(templates: Array<{
    id: string;
    whenToUse?: string;
}>): string;
