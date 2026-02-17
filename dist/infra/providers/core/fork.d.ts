/**
 * Fork Point Detection and Resume Support
 *
 * Provides utilities for detecting safe fork points in message history
 * and preparing messages for resume across different providers.
 */
import { Message } from '../../../core/types';
/**
 * Fork point analysis result.
 */
export interface ForkPoint {
    messageIndex: number;
    isSafe: boolean;
    reason?: string;
}
/**
 * Validation result for resume.
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
}
/**
 * Resume handler interface for provider-specific logic.
 */
export interface ResumeHandler {
    prepareForResume(messages: Message[]): Message[];
    validateForResume(messages: Message[]): ValidationResult;
}
/**
 * Serialization options for message persistence.
 */
export interface SerializationOptions {
    reasoningTransport: 'provider' | 'text' | 'omit';
    preserveSignatures: boolean;
    maxContentLength?: number;
}
/**
 * Find all safe fork points in a message sequence.
 *
 * Safe fork points are:
 * 1. User messages
 * 2. Assistant messages without tool_use
 * 3. After a user message containing all tool_results for preceding tool_uses
 */
export declare function findSafeForkPoints(messages: Message[]): ForkPoint[];
/**
 * Get the last safe fork point index.
 */
export declare function getLastSafeForkPoint(messages: Message[]): number;
/**
 * Serialize messages for persistence.
 */
export declare function serializeForResume(messages: Message[], options: SerializationOptions): Message[];
/**
 * Anthropic resume handler.
 * Preserves thinking blocks with signatures for Claude 4+.
 */
export declare const anthropicResumeHandler: ResumeHandler;
/**
 * DeepSeek resume handler.
 * CRITICAL: Must NOT include reasoning_content in message history.
 */
export declare const deepseekResumeHandler: ResumeHandler;
/**
 * Qwen resume handler.
 * Similar to DeepSeek - reasoning should be omitted.
 */
export declare const qwenResumeHandler: ResumeHandler;
/**
 * OpenAI Chat resume handler.
 * Reasoning is converted to text with <think> tags.
 */
export declare const openaiChatResumeHandler: ResumeHandler;
/**
 * OpenAI Responses API resume handler.
 * Uses previous_response_id for state persistence.
 */
export declare const openaiResponsesResumeHandler: ResumeHandler;
/**
 * Gemini resume handler.
 * Preserves thoughtSignature for function calls.
 */
export declare const geminiResumeHandler: ResumeHandler;
/**
 * Get resume handler for a provider.
 */
export declare function getResumeHandler(provider: string): ResumeHandler;
/**
 * Prepare messages for resume with a specific provider.
 */
export declare function prepareMessagesForResume(messages: Message[], provider: string): Message[];
/**
 * Validate messages for resume with a specific provider.
 */
export declare function validateMessagesForResume(messages: Message[], provider: string): ValidationResult;
/**
 * Check if a message sequence can be safely forked at a given index.
 */
export declare function canForkAt(messages: Message[], index: number): boolean;
/**
 * Fork messages at a given index.
 * Returns messages up to and including the fork point.
 */
export declare function forkAt(messages: Message[], index: number): Message[];
