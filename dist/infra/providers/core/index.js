"use strict";
/**
 * Core Provider Module
 *
 * Re-exports all core utilities for provider implementations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiChatResumeHandler = exports.qwenResumeHandler = exports.deepseekResumeHandler = exports.anthropicResumeHandler = exports.serializeForResume = exports.getLastSafeForkPoint = exports.findSafeForkPoints = exports.generateAuditId = exports.truncateContent = exports.redactSensitive = exports.createProviderLogger = exports.createConsoleLogger = exports.DEFAULT_DEBUG_CONFIG = exports.getRetryDelay = exports.shouldRetry = exports.createRetryWrapper = exports.withRetryAndTimeout = exports.withRetry = exports.AGGRESSIVE_RETRY_CONFIG = exports.DEFAULT_RETRY_CONFIG = exports.formatUsageString = exports.aggregateUsage = exports.normalizeDeepSeekUsage = exports.normalizeGeminiUsage = exports.normalizeOpenAIUsage = exports.normalizeAnthropicUsage = exports.calculateCost = exports.createEmptyUsage = exports.PROVIDER_PRICING = exports.isContentFilterError = exports.isContextLengthError = exports.isAuthError = exports.isRateLimitError = exports.isRetryableError = exports.parseProviderError = exports.ParseError = exports.StreamError = exports.ThinkingSignatureError = exports.ServiceUnavailableError = exports.QuotaExceededError = exports.ModelNotFoundError = exports.ContentFilterError = exports.NetworkError = exports.TimeoutError = exports.ServerError = exports.InvalidRequestError = exports.ContextLengthError = exports.AuthenticationError = exports.RateLimitError = exports.ProviderError = void 0;
exports.forkAt = exports.canForkAt = exports.validateMessagesForResume = exports.prepareMessagesForResume = exports.getResumeHandler = exports.geminiResumeHandler = exports.openaiResponsesResumeHandler = void 0;
// Error types and utilities
var errors_1 = require("./errors");
Object.defineProperty(exports, "ProviderError", { enumerable: true, get: function () { return errors_1.ProviderError; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return errors_1.RateLimitError; } });
Object.defineProperty(exports, "AuthenticationError", { enumerable: true, get: function () { return errors_1.AuthenticationError; } });
Object.defineProperty(exports, "ContextLengthError", { enumerable: true, get: function () { return errors_1.ContextLengthError; } });
Object.defineProperty(exports, "InvalidRequestError", { enumerable: true, get: function () { return errors_1.InvalidRequestError; } });
Object.defineProperty(exports, "ServerError", { enumerable: true, get: function () { return errors_1.ServerError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return errors_1.TimeoutError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return errors_1.NetworkError; } });
Object.defineProperty(exports, "ContentFilterError", { enumerable: true, get: function () { return errors_1.ContentFilterError; } });
Object.defineProperty(exports, "ModelNotFoundError", { enumerable: true, get: function () { return errors_1.ModelNotFoundError; } });
Object.defineProperty(exports, "QuotaExceededError", { enumerable: true, get: function () { return errors_1.QuotaExceededError; } });
Object.defineProperty(exports, "ServiceUnavailableError", { enumerable: true, get: function () { return errors_1.ServiceUnavailableError; } });
Object.defineProperty(exports, "ThinkingSignatureError", { enumerable: true, get: function () { return errors_1.ThinkingSignatureError; } });
Object.defineProperty(exports, "StreamError", { enumerable: true, get: function () { return errors_1.StreamError; } });
Object.defineProperty(exports, "ParseError", { enumerable: true, get: function () { return errors_1.ParseError; } });
Object.defineProperty(exports, "parseProviderError", { enumerable: true, get: function () { return errors_1.parseProviderError; } });
Object.defineProperty(exports, "isRetryableError", { enumerable: true, get: function () { return errors_1.isRetryableError; } });
Object.defineProperty(exports, "isRateLimitError", { enumerable: true, get: function () { return errors_1.isRateLimitError; } });
Object.defineProperty(exports, "isAuthError", { enumerable: true, get: function () { return errors_1.isAuthError; } });
Object.defineProperty(exports, "isContextLengthError", { enumerable: true, get: function () { return errors_1.isContextLengthError; } });
Object.defineProperty(exports, "isContentFilterError", { enumerable: true, get: function () { return errors_1.isContentFilterError; } });
// Usage statistics and cost calculation
var usage_1 = require("./usage");
Object.defineProperty(exports, "PROVIDER_PRICING", { enumerable: true, get: function () { return usage_1.PROVIDER_PRICING; } });
Object.defineProperty(exports, "createEmptyUsage", { enumerable: true, get: function () { return usage_1.createEmptyUsage; } });
Object.defineProperty(exports, "calculateCost", { enumerable: true, get: function () { return usage_1.calculateCost; } });
Object.defineProperty(exports, "normalizeAnthropicUsage", { enumerable: true, get: function () { return usage_1.normalizeAnthropicUsage; } });
Object.defineProperty(exports, "normalizeOpenAIUsage", { enumerable: true, get: function () { return usage_1.normalizeOpenAIUsage; } });
Object.defineProperty(exports, "normalizeGeminiUsage", { enumerable: true, get: function () { return usage_1.normalizeGeminiUsage; } });
Object.defineProperty(exports, "normalizeDeepSeekUsage", { enumerable: true, get: function () { return usage_1.normalizeDeepSeekUsage; } });
Object.defineProperty(exports, "aggregateUsage", { enumerable: true, get: function () { return usage_1.aggregateUsage; } });
Object.defineProperty(exports, "formatUsageString", { enumerable: true, get: function () { return usage_1.formatUsageString; } });
// Retry strategy
var retry_1 = require("./retry");
Object.defineProperty(exports, "DEFAULT_RETRY_CONFIG", { enumerable: true, get: function () { return retry_1.DEFAULT_RETRY_CONFIG; } });
Object.defineProperty(exports, "AGGRESSIVE_RETRY_CONFIG", { enumerable: true, get: function () { return retry_1.AGGRESSIVE_RETRY_CONFIG; } });
Object.defineProperty(exports, "withRetry", { enumerable: true, get: function () { return retry_1.withRetry; } });
Object.defineProperty(exports, "withRetryAndTimeout", { enumerable: true, get: function () { return retry_1.withRetryAndTimeout; } });
Object.defineProperty(exports, "createRetryWrapper", { enumerable: true, get: function () { return retry_1.createRetryWrapper; } });
Object.defineProperty(exports, "shouldRetry", { enumerable: true, get: function () { return retry_1.shouldRetry; } });
Object.defineProperty(exports, "getRetryDelay", { enumerable: true, get: function () { return retry_1.getRetryDelay; } });
// Logging and debugging
var logger_1 = require("./logger");
Object.defineProperty(exports, "DEFAULT_DEBUG_CONFIG", { enumerable: true, get: function () { return logger_1.DEFAULT_DEBUG_CONFIG; } });
Object.defineProperty(exports, "createConsoleLogger", { enumerable: true, get: function () { return logger_1.createConsoleLogger; } });
Object.defineProperty(exports, "createProviderLogger", { enumerable: true, get: function () { return logger_1.createProviderLogger; } });
Object.defineProperty(exports, "redactSensitive", { enumerable: true, get: function () { return logger_1.redactSensitive; } });
Object.defineProperty(exports, "truncateContent", { enumerable: true, get: function () { return logger_1.truncateContent; } });
Object.defineProperty(exports, "generateAuditId", { enumerable: true, get: function () { return logger_1.generateAuditId; } });
// Fork point detection and resume
var fork_1 = require("./fork");
Object.defineProperty(exports, "findSafeForkPoints", { enumerable: true, get: function () { return fork_1.findSafeForkPoints; } });
Object.defineProperty(exports, "getLastSafeForkPoint", { enumerable: true, get: function () { return fork_1.getLastSafeForkPoint; } });
Object.defineProperty(exports, "serializeForResume", { enumerable: true, get: function () { return fork_1.serializeForResume; } });
Object.defineProperty(exports, "anthropicResumeHandler", { enumerable: true, get: function () { return fork_1.anthropicResumeHandler; } });
Object.defineProperty(exports, "deepseekResumeHandler", { enumerable: true, get: function () { return fork_1.deepseekResumeHandler; } });
Object.defineProperty(exports, "qwenResumeHandler", { enumerable: true, get: function () { return fork_1.qwenResumeHandler; } });
Object.defineProperty(exports, "openaiChatResumeHandler", { enumerable: true, get: function () { return fork_1.openaiChatResumeHandler; } });
Object.defineProperty(exports, "openaiResponsesResumeHandler", { enumerable: true, get: function () { return fork_1.openaiResponsesResumeHandler; } });
Object.defineProperty(exports, "geminiResumeHandler", { enumerable: true, get: function () { return fork_1.geminiResumeHandler; } });
Object.defineProperty(exports, "getResumeHandler", { enumerable: true, get: function () { return fork_1.getResumeHandler; } });
Object.defineProperty(exports, "prepareMessagesForResume", { enumerable: true, get: function () { return fork_1.prepareMessagesForResume; } });
Object.defineProperty(exports, "validateMessagesForResume", { enumerable: true, get: function () { return fork_1.validateMessagesForResume; } });
Object.defineProperty(exports, "canForkAt", { enumerable: true, get: function () { return fork_1.canForkAt; } });
Object.defineProperty(exports, "forkAt", { enumerable: true, get: function () { return fork_1.forkAt; } });
