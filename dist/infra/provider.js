"use strict";
/**
 * Provider Module
 *
 * Re-exports from the providers module for backward compatibility.
 * The actual implementations are in src/infra/providers/.
 *
 * Usage:
 * ```typescript
 * import { AnthropicProvider, OpenAIProvider, GeminiProvider } from './infra/provider';
 * // or
 * import { AnthropicProvider } from './infra/providers';
 * ```
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
// Re-export provider implementations
var providers_1 = require("./providers");
Object.defineProperty(exports, "AnthropicProvider", { enumerable: true, get: function () { return providers_1.AnthropicProvider; } });
Object.defineProperty(exports, "OpenAIProvider", { enumerable: true, get: function () { return providers_1.OpenAIProvider; } });
Object.defineProperty(exports, "GeminiProvider", { enumerable: true, get: function () { return providers_1.GeminiProvider; } });
// Re-export utilities for backward compatibility
var providers_2 = require("./providers");
Object.defineProperty(exports, "resolveProxyUrl", { enumerable: true, get: function () { return providers_2.resolveProxyUrl; } });
Object.defineProperty(exports, "getProxyDispatcher", { enumerable: true, get: function () { return providers_2.getProxyDispatcher; } });
Object.defineProperty(exports, "withProxy", { enumerable: true, get: function () { return providers_2.withProxy; } });
Object.defineProperty(exports, "normalizeBaseUrl", { enumerable: true, get: function () { return providers_2.normalizeBaseUrl; } });
Object.defineProperty(exports, "normalizeOpenAIBaseUrl", { enumerable: true, get: function () { return providers_2.normalizeOpenAIBaseUrl; } });
Object.defineProperty(exports, "normalizeAnthropicBaseUrl", { enumerable: true, get: function () { return providers_2.normalizeAnthropicBaseUrl; } });
Object.defineProperty(exports, "normalizeGeminiBaseUrl", { enumerable: true, get: function () { return providers_2.normalizeGeminiBaseUrl; } });
Object.defineProperty(exports, "getMessageBlocks", { enumerable: true, get: function () { return providers_2.getMessageBlocks; } });
Object.defineProperty(exports, "markTransportIfDegraded", { enumerable: true, get: function () { return providers_2.markTransportIfDegraded; } });
Object.defineProperty(exports, "joinTextBlocks", { enumerable: true, get: function () { return providers_2.joinTextBlocks; } });
Object.defineProperty(exports, "formatToolResult", { enumerable: true, get: function () { return providers_2.formatToolResult; } });
Object.defineProperty(exports, "safeJsonStringify", { enumerable: true, get: function () { return providers_2.safeJsonStringify; } });
Object.defineProperty(exports, "FILE_UNSUPPORTED_TEXT", { enumerable: true, get: function () { return providers_2.FILE_UNSUPPORTED_TEXT; } });
Object.defineProperty(exports, "IMAGE_UNSUPPORTED_TEXT", { enumerable: true, get: function () { return providers_2.IMAGE_UNSUPPORTED_TEXT; } });
Object.defineProperty(exports, "AUDIO_UNSUPPORTED_TEXT", { enumerable: true, get: function () { return providers_2.AUDIO_UNSUPPORTED_TEXT; } });
Object.defineProperty(exports, "concatTextWithReasoning", { enumerable: true, get: function () { return providers_2.concatTextWithReasoning; } });
Object.defineProperty(exports, "joinReasoningBlocks", { enumerable: true, get: function () { return providers_2.joinReasoningBlocks; } });
Object.defineProperty(exports, "normalizeThinkBlocks", { enumerable: true, get: function () { return providers_2.normalizeThinkBlocks; } });
Object.defineProperty(exports, "splitThinkText", { enumerable: true, get: function () { return providers_2.splitThinkText; } });
Object.defineProperty(exports, "extractReasoningDetails", { enumerable: true, get: function () { return providers_2.extractReasoningDetails; } });
Object.defineProperty(exports, "buildGeminiImagePart", { enumerable: true, get: function () { return providers_2.buildGeminiImagePart; } });
Object.defineProperty(exports, "buildGeminiFilePart", { enumerable: true, get: function () { return providers_2.buildGeminiFilePart; } });
Object.defineProperty(exports, "sanitizeGeminiSchema", { enumerable: true, get: function () { return providers_2.sanitizeGeminiSchema; } });
Object.defineProperty(exports, "hasAnthropicFileBlocks", { enumerable: true, get: function () { return providers_2.hasAnthropicFileBlocks; } });
Object.defineProperty(exports, "mergeAnthropicBetaHeader", { enumerable: true, get: function () { return providers_2.mergeAnthropicBetaHeader; } });
Object.defineProperty(exports, "normalizeAnthropicContent", { enumerable: true, get: function () { return providers_2.normalizeAnthropicContent; } });
Object.defineProperty(exports, "normalizeAnthropicContentBlock", { enumerable: true, get: function () { return providers_2.normalizeAnthropicContentBlock; } });
Object.defineProperty(exports, "normalizeAnthropicDelta", { enumerable: true, get: function () { return providers_2.normalizeAnthropicDelta; } });
// Re-export core module (errors, usage, retry, logging, fork)
__exportStar(require("./providers/core"), exports);
