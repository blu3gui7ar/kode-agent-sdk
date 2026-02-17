/**
 * Shared utilities for provider implementations.
 */
import { ContentBlock, Message, ImageContentBlock, FileContentBlock, AudioContentBlock, VideoContentBlock } from '../../core/types';
import { ReasoningTransport } from './types';
export declare function resolveProxyUrl(explicit?: string): string | undefined;
export declare function getProxyDispatcher(proxyUrl?: string): any | undefined;
export declare function withProxy(init: RequestInit, dispatcher?: any): RequestInit;
export declare function normalizeBaseUrl(url: string): string;
export declare function normalizeOpenAIBaseUrl(url: string): string;
export declare function normalizeAnthropicBaseUrl(url: string): string;
export declare function normalizeGeminiBaseUrl(url: string): string;
export declare function getMessageBlocks(message: Message): ContentBlock[];
export declare function markTransportIfDegraded(message: Message, blocks: ContentBlock[]): void;
export declare function joinTextBlocks(blocks: ContentBlock[]): string;
export declare function formatToolResult(content: any): string;
export declare function safeJsonStringify(value: any): string;
export declare const FILE_UNSUPPORTED_TEXT = "[file unsupported] This model does not support PDF input. Please extract text or images first.";
export declare const IMAGE_UNSUPPORTED_TEXT = "[image unsupported] This model does not support image URLs; please provide base64 data if supported.";
export declare const AUDIO_UNSUPPORTED_TEXT = "[audio unsupported] This model does not support audio input; please provide a text transcript instead.";
export declare const VIDEO_UNSUPPORTED_TEXT = "[video unsupported] This model does not support video input; please provide text description or extracted frames instead.";
export declare function concatTextWithReasoning(blocks: ContentBlock[], reasoningTransport?: ReasoningTransport): string;
export declare function joinReasoningBlocks(blocks: ContentBlock[]): string;
/**
 * Parse <think> tags in text blocks and convert to reasoning blocks.
 */
export declare function normalizeThinkBlocks(blocks: ContentBlock[], reasoningTransport?: ReasoningTransport): ContentBlock[];
export declare function splitThinkText(text: string): ContentBlock[];
/**
 * Extract reasoning details from OpenAI response (for reasoning models).
 */
export declare function extractReasoningDetails(message: any): ContentBlock[];
export declare function buildGeminiImagePart(block: ImageContentBlock): any | null;
export declare function buildGeminiFilePart(block: FileContentBlock): any | null;
export declare function buildGeminiAudioPart(block: AudioContentBlock): any | null;
export declare function buildGeminiVideoPart(block: VideoContentBlock): any | null;
/** Supported OpenAI audio formats */
export declare const OPENAI_SUPPORTED_AUDIO_FORMATS: readonly ["wav", "mp3"];
export type OpenAIAudioFormat = (typeof OPENAI_SUPPORTED_AUDIO_FORMATS)[number];
/**
 * Extract and validate OpenAI audio format from MIME type.
 * OpenAI Chat Completions API only supports wav and mp3.
 * @returns The audio format if supported, null otherwise
 */
export declare function extractOpenAIAudioFormat(mimeType?: string): OpenAIAudioFormat | null;
/**
 * Build OpenAI input_audio content part from AudioContentBlock.
 * OpenAI only supports base64 encoded audio (no URLs).
 * @returns The OpenAI input_audio part or null if not supported
 */
export declare function buildOpenAIAudioPart(block: AudioContentBlock): any | null;
export declare function sanitizeGeminiSchema(schema: any): any;
export declare function hasAnthropicFileBlocks(messages: Message[]): boolean;
export declare function mergeAnthropicBetaHeader(existing: string | undefined, entries: string[]): string | undefined;
/**
 * Normalize Anthropic response content to internal format.
 */
export declare function normalizeAnthropicContent(content: any[], reasoningTransport?: ReasoningTransport): ContentBlock[];
/**
 * Normalize a single Anthropic content block.
 * Handles thinking blocks with signature preservation.
 */
export declare function normalizeAnthropicContentBlock(block: any, reasoningTransport?: ReasoningTransport): ContentBlock | null;
/**
 * Normalize Anthropic streaming delta.
 */
export declare function normalizeAnthropicDelta(delta: any): {
    type: 'text_delta' | 'input_json_delta' | 'reasoning_delta';
    text?: string;
    partial_json?: string;
};
