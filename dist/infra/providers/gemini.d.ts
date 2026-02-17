/**
 * Gemini Provider Adapter
 *
 * Converts internal Anthropic-style messages to Gemini API format.
 * Supports:
 * - Thinking with thinkingBudget (2.5 models) or thinkingLevel (3.x models)
 * - Files API with GCS URIs
 * - Streaming with SSE
 * - Function calling
 */
import { Message } from '../../core/types';
import { ModelProvider, ModelResponse, ModelStreamChunk, ModelConfig, UploadFileInput, UploadFileResult, CompletionOptions, ReasoningTransport, ThinkingOptions } from './types';
export interface GeminiProviderOptions {
    reasoningTransport?: ReasoningTransport;
    extraHeaders?: Record<string, string>;
    extraBody?: Record<string, any>;
    providerOptions?: Record<string, any>;
    multimodal?: ModelConfig['multimodal'];
    thinking?: ThinkingOptions;
}
export declare class GeminiProvider implements ModelProvider {
    private apiKey;
    readonly maxWindowSize = 1000000;
    readonly maxOutputTokens = 4096;
    readonly temperature = 0.7;
    readonly model: string;
    private readonly baseUrl;
    private readonly dispatcher?;
    private readonly reasoningTransport;
    private readonly extraHeaders?;
    private readonly extraBody?;
    private readonly providerOptions?;
    private readonly multimodal?;
    private readonly thinking?;
    constructor(apiKey: string, model?: string, baseUrl?: string, proxyUrl?: string, options?: GeminiProviderOptions);
    uploadFile(input: UploadFileInput): Promise<UploadFileResult | null>;
    complete(messages: Message[], opts?: CompletionOptions): Promise<ModelResponse>;
    stream(messages: Message[], opts?: CompletionOptions): AsyncIterable<ModelStreamChunk>;
    toConfig(): ModelConfig;
    private buildGeminiUrl;
    private buildGeminiRequestBody;
    private buildGeminiSystemInstruction;
    private buildGeminiContents;
    private buildGeminiTools;
    private normalizeGeminiArgs;
    private formatGeminiToolResult;
    private extractGeminiContentBlocks;
    private parseGeminiChunk;
}
