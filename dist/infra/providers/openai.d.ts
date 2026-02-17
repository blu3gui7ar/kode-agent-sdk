/**
 * OpenAI Provider Adapter
 *
 * Converts internal Anthropic-style messages to OpenAI API format.
 * Supports:
 * - Chat Completions API (GPT-4.x)
 * - Responses API (GPT-5.x with reasoning)
 * - Streaming with SSE
 * - Tool calls
 * - Reasoning tokens (reasoning_content, reasoning_details)
 */
import { Message } from '../../core/types';
import { ModelProvider, ModelResponse, ModelStreamChunk, ModelConfig, UploadFileInput, UploadFileResult, CompletionOptions, ReasoningTransport, ThinkingOptions } from './types';
/**
 * Reasoning/thinking configuration for OpenAI-compatible providers.
 *
 * Different providers use different field names and parameters:
 * - DeepSeek: reasoning_content (must strip from history)
 * - GLM: reasoning_content + thinking param
 * - Minimax: reasoning_details + reasoning_split param
 * - Qwen: reasoning_content + enable_thinking param
 */
export interface ReasoningConfig {
    /**
     * Field name for reasoning content in API response.
     * - 'reasoning_content': DeepSeek, GLM, Qwen
     * - 'reasoning_details': Minimax (array format)
     */
    fieldName?: 'reasoning_content' | 'reasoning_details';
    /**
     * Additional request parameters to enable reasoning mode.
     * Examples:
     * - GLM: { thinking: { type: 'enabled', clear_thinking: false } }
     * - Minimax: { reasoning_split: true }
     * - Qwen: { enable_thinking: true }
     */
    requestParams?: Record<string, any>;
    /**
     * Whether to strip reasoning from message history.
     * DeepSeek returns 400 if reasoning_content is included in subsequent turns.
     * Default: false
     */
    stripFromHistory?: boolean;
}
/**
 * Responses API specific configuration (GPT-5.x and future models).
 */
export interface ResponsesApiConfig {
    /**
     * Reasoning effort level for o1/o3 series models.
     */
    reasoning?: {
        effort: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
    };
    /**
     * Enable response storage for multi-turn continuation.
     */
    store?: boolean;
    /**
     * Previous response ID for continuing a conversation.
     * When set, the API uses stored state instead of full message history.
     */
    previousResponseId?: string;
}
export interface OpenAIProviderOptions {
    /**
     * API type to use.
     * - 'chat': Chat Completions API (default, GPT-4.x compatible)
     * - 'responses': Responses API (GPT-5.x, supports files and reasoning)
     */
    api?: 'chat' | 'responses';
    /**
     * Responses API specific options.
     */
    responses?: ResponsesApiConfig;
    /**
     * Reasoning/thinking configuration for providers that support it.
     * Configure field names and request parameters for DeepSeek, GLM, Minimax, Qwen, etc.
     */
    reasoning?: ReasoningConfig;
    /**
     * How reasoning content is transported in message history.
     * - 'provider': Native format (reasoning_content/reasoning_details fields)
     * - 'text': Wrapped in <think></think> tags
     * - 'omit': Excluded from history
     */
    reasoningTransport?: ReasoningTransport;
    extraHeaders?: Record<string, string>;
    extraBody?: Record<string, any>;
    providerOptions?: Record<string, any>;
    multimodal?: ModelConfig['multimodal'];
    thinking?: ThinkingOptions;
}
export declare class OpenAIProvider implements ModelProvider {
    private apiKey;
    readonly maxWindowSize = 128000;
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
    private readonly openaiApi;
    private readonly thinking?;
    private readonly reasoning?;
    private readonly responsesConfig?;
    constructor(apiKey: string, model?: string, baseUrl?: string, proxyUrl?: string, options?: OpenAIProviderOptions);
    private applyReasoningDefaults;
    uploadFile(input: UploadFileInput): Promise<UploadFileResult | null>;
    complete(messages: Message[], opts?: CompletionOptions): Promise<ModelResponse>;
    stream(messages: Message[], opts?: CompletionOptions): AsyncIterable<ModelStreamChunk>;
    toConfig(): ModelConfig;
    private resolveOpenAIApi;
    private completeWithResponses;
    private buildOpenAITools;
    private buildOpenAIMessages;
    private buildOpenAIUserMessages;
    private buildOpenAIResponsesInput;
}
