/**
 * Anthropic Provider Adapter
 *
 * Converts internal Anthropic-style messages to Anthropic API format.
 * Supports:
 * - Extended thinking with interleaved-thinking-2025-05-14 beta
 * - Files API with files-api-2025-04-14 beta
 * - Streaming with SSE
 * - Signature preservation for multi-turn conversations
 */
import { Message } from '../../core/types';
import { ModelProvider, ModelResponse, ModelStreamChunk, ModelConfig, UploadFileInput, UploadFileResult, CompletionOptions, ReasoningTransport, ThinkingOptions } from './types';
export interface AnthropicProviderOptions {
    reasoningTransport?: ReasoningTransport;
    extraHeaders?: Record<string, string>;
    extraBody?: Record<string, any>;
    providerOptions?: Record<string, any>;
    multimodal?: ModelConfig['multimodal'];
    thinking?: ThinkingOptions;
}
export declare class AnthropicProvider implements ModelProvider {
    private apiKey;
    readonly maxWindowSize = 200000;
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
    constructor(apiKey: string, model?: string, baseUrl?: string, proxyUrl?: string, options?: AnthropicProviderOptions);
    complete(messages: Message[], opts?: CompletionOptions): Promise<ModelResponse>;
    stream(messages: Message[], opts?: CompletionOptions): AsyncIterable<ModelStreamChunk>;
    private formatMessages;
    private buildThinkingConfig;
    uploadFile(input: UploadFileInput): Promise<UploadFileResult | null>;
    toConfig(): ModelConfig;
}
