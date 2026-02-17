"use strict";
/**
 * Provider Adapters Module
 *
 * KODE Agent SDK uses Anthropic-style messages as the internal canonical format.
 * Each provider is an adapter that converts to/from this internal format.
 *
 * Message Flow:
 * ```
 * Internal Message[] (Anthropic-style)
 *   -> Provider.formatMessages() -> External API format
 *   -> API call
 *   -> Response -> normalizeContent() -> Internal ContentBlock[]
 * ```
 *
 * Supported Providers:
 * - AnthropicProvider: Claude models with thinking blocks, files API
 * - OpenAIProvider: GPT models via Chat Completions or Responses API
 * - GeminiProvider: Gemini models with thinking support
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAnthropicDelta = exports.normalizeAnthropicContentBlock = exports.normalizeAnthropicContent = exports.mergeAnthropicBetaHeader = exports.hasAnthropicFileBlocks = exports.sanitizeGeminiSchema = exports.buildGeminiFilePart = exports.buildGeminiImagePart = exports.extractReasoningDetails = exports.splitThinkText = exports.normalizeThinkBlocks = exports.joinReasoningBlocks = exports.concatTextWithReasoning = exports.AUDIO_UNSUPPORTED_TEXT = exports.IMAGE_UNSUPPORTED_TEXT = exports.FILE_UNSUPPORTED_TEXT = exports.safeJsonStringify = exports.formatToolResult = exports.joinTextBlocks = exports.markTransportIfDegraded = exports.getMessageBlocks = exports.normalizeGeminiBaseUrl = exports.normalizeAnthropicBaseUrl = exports.normalizeOpenAIBaseUrl = exports.normalizeBaseUrl = exports.withProxy = exports.getProxyDispatcher = exports.resolveProxyUrl = exports.GeminiProvider = exports.OpenAIProvider = exports.AnthropicProvider = void 0;
// Provider implementations
var anthropic_1 = require("./anthropic");
Object.defineProperty(exports, "AnthropicProvider", { enumerable: true, get: function () { return anthropic_1.AnthropicProvider; } });
var openai_1 = require("./openai");
Object.defineProperty(exports, "OpenAIProvider", { enumerable: true, get: function () { return openai_1.OpenAIProvider; } });
var gemini_1 = require("./gemini");
Object.defineProperty(exports, "GeminiProvider", { enumerable: true, get: function () { return gemini_1.GeminiProvider; } });
// Utilities (for custom provider implementations)
var utils_1 = require("./utils");
// Proxy
Object.defineProperty(exports, "resolveProxyUrl", { enumerable: true, get: function () { return utils_1.resolveProxyUrl; } });
Object.defineProperty(exports, "getProxyDispatcher", { enumerable: true, get: function () { return utils_1.getProxyDispatcher; } });
Object.defineProperty(exports, "withProxy", { enumerable: true, get: function () { return utils_1.withProxy; } });
// URL normalization
Object.defineProperty(exports, "normalizeBaseUrl", { enumerable: true, get: function () { return utils_1.normalizeBaseUrl; } });
Object.defineProperty(exports, "normalizeOpenAIBaseUrl", { enumerable: true, get: function () { return utils_1.normalizeOpenAIBaseUrl; } });
Object.defineProperty(exports, "normalizeAnthropicBaseUrl", { enumerable: true, get: function () { return utils_1.normalizeAnthropicBaseUrl; } });
Object.defineProperty(exports, "normalizeGeminiBaseUrl", { enumerable: true, get: function () { return utils_1.normalizeGeminiBaseUrl; } });
// Content blocks
Object.defineProperty(exports, "getMessageBlocks", { enumerable: true, get: function () { return utils_1.getMessageBlocks; } });
Object.defineProperty(exports, "markTransportIfDegraded", { enumerable: true, get: function () { return utils_1.markTransportIfDegraded; } });
// Text formatting
Object.defineProperty(exports, "joinTextBlocks", { enumerable: true, get: function () { return utils_1.joinTextBlocks; } });
Object.defineProperty(exports, "formatToolResult", { enumerable: true, get: function () { return utils_1.formatToolResult; } });
Object.defineProperty(exports, "safeJsonStringify", { enumerable: true, get: function () { return utils_1.safeJsonStringify; } });
// Unsupported content messages
Object.defineProperty(exports, "FILE_UNSUPPORTED_TEXT", { enumerable: true, get: function () { return utils_1.FILE_UNSUPPORTED_TEXT; } });
Object.defineProperty(exports, "IMAGE_UNSUPPORTED_TEXT", { enumerable: true, get: function () { return utils_1.IMAGE_UNSUPPORTED_TEXT; } });
Object.defineProperty(exports, "AUDIO_UNSUPPORTED_TEXT", { enumerable: true, get: function () { return utils_1.AUDIO_UNSUPPORTED_TEXT; } });
// Reasoning/thinking
Object.defineProperty(exports, "concatTextWithReasoning", { enumerable: true, get: function () { return utils_1.concatTextWithReasoning; } });
Object.defineProperty(exports, "joinReasoningBlocks", { enumerable: true, get: function () { return utils_1.joinReasoningBlocks; } });
Object.defineProperty(exports, "normalizeThinkBlocks", { enumerable: true, get: function () { return utils_1.normalizeThinkBlocks; } });
Object.defineProperty(exports, "splitThinkText", { enumerable: true, get: function () { return utils_1.splitThinkText; } });
Object.defineProperty(exports, "extractReasoningDetails", { enumerable: true, get: function () { return utils_1.extractReasoningDetails; } });
// Gemini helpers
Object.defineProperty(exports, "buildGeminiImagePart", { enumerable: true, get: function () { return utils_1.buildGeminiImagePart; } });
Object.defineProperty(exports, "buildGeminiFilePart", { enumerable: true, get: function () { return utils_1.buildGeminiFilePart; } });
Object.defineProperty(exports, "sanitizeGeminiSchema", { enumerable: true, get: function () { return utils_1.sanitizeGeminiSchema; } });
// Anthropic helpers
Object.defineProperty(exports, "hasAnthropicFileBlocks", { enumerable: true, get: function () { return utils_1.hasAnthropicFileBlocks; } });
Object.defineProperty(exports, "mergeAnthropicBetaHeader", { enumerable: true, get: function () { return utils_1.mergeAnthropicBetaHeader; } });
Object.defineProperty(exports, "normalizeAnthropicContent", { enumerable: true, get: function () { return utils_1.normalizeAnthropicContent; } });
Object.defineProperty(exports, "normalizeAnthropicContentBlock", { enumerable: true, get: function () { return utils_1.normalizeAnthropicContentBlock; } });
Object.defineProperty(exports, "normalizeAnthropicDelta", { enumerable: true, get: function () { return utils_1.normalizeAnthropicDelta; } });
// Core module (errors, usage, retry, logging, fork)
__exportStar(require("./core"), exports);
