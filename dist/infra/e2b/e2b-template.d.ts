import { E2BTemplateConfig } from './types';
/**
 * Build E2B custom templates.
 * Uses E2B Template API to create pre-configured sandbox environments.
 */
export declare class E2BTemplateBuilder {
    /**
     * Build a template from config.
     * @returns Build result containing templateId
     */
    static build(config: E2BTemplateConfig, opts?: {
        apiKey?: string;
        onLog?: (log: string) => void;
    }): Promise<{
        templateId: string;
        alias: string;
    }>;
    /**
     * Check if a template alias already exists.
     */
    static exists(alias: string, opts?: {
        apiKey?: string;
    }): Promise<boolean>;
}
