"use strict";
/**
 * Provider Error Hierarchy
 *
 * Typed error classes for all provider operations with retry support.
 * Each error type has a unique code and retryable flag.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseError = exports.StreamError = exports.ThinkingSignatureError = exports.ServiceUnavailableError = exports.QuotaExceededError = exports.ModelNotFoundError = exports.ContentFilterError = exports.NetworkError = exports.TimeoutError = exports.ServerError = exports.InvalidRequestError = exports.ContextLengthError = exports.AuthenticationError = exports.RateLimitError = exports.ProviderError = void 0;
exports.parseProviderError = parseProviderError;
exports.isRetryableError = isRetryableError;
exports.isRateLimitError = isRateLimitError;
exports.isAuthError = isAuthError;
exports.isContextLengthError = isContextLengthError;
exports.isContentFilterError = isContentFilterError;
/**
 * Base class for all provider errors.
 * Provides common properties and JSON serialization.
 */
class ProviderError extends Error {
    constructor(message, provider, options) {
        super(message);
        this.name = this.constructor.name;
        this.provider = provider;
        this.requestId = options?.requestId;
        this.statusCode = options?.statusCode;
        this.timestamp = Date.now();
        // Maintain proper stack trace in V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            provider: this.provider,
            requestId: this.requestId,
            retryable: this.retryable,
            timestamp: this.timestamp,
            statusCode: this.statusCode,
        };
    }
}
exports.ProviderError = ProviderError;
/**
 * Rate limit exceeded (429).
 * Retryable after the specified delay.
 */
class RateLimitError extends ProviderError {
    constructor(provider, options) {
        super(`Rate limit exceeded${options?.retryAfter ? `, retry after ${options.retryAfter}s` : ''}`, provider, { requestId: options?.requestId, statusCode: 429 });
        this.code = 'RATE_LIMIT';
        this.retryable = true;
        this.retryAfter = options?.retryAfter;
        this.limitType = options?.limitType;
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Authentication failed (401/403).
 * Not retryable - API key or permissions issue.
 */
class AuthenticationError extends ProviderError {
    constructor(provider, options) {
        super('Authentication failed - check API key and permissions', provider, { requestId: options?.requestId, statusCode: options?.statusCode || 401 });
        this.code = 'AUTH_FAILED';
        this.retryable = false;
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Context/token length exceeded.
 * Not retryable - need to reduce input size.
 */
class ContextLengthError extends ProviderError {
    constructor(provider, maxTokens, requestedTokens, options) {
        super(`Context length ${requestedTokens} exceeds maximum ${maxTokens}`, provider, { requestId: options?.requestId, statusCode: 400 });
        this.code = 'CONTEXT_LENGTH';
        this.retryable = false;
        this.maxTokens = maxTokens;
        this.requestedTokens = requestedTokens;
    }
}
exports.ContextLengthError = ContextLengthError;
/**
 * Invalid request (400).
 * Not retryable - request format issue.
 */
class InvalidRequestError extends ProviderError {
    constructor(provider, message, options) {
        super(message, provider, { requestId: options?.requestId, statusCode: 400 });
        this.code = 'INVALID_REQUEST';
        this.retryable = false;
        this.details = options?.details;
    }
}
exports.InvalidRequestError = InvalidRequestError;
/**
 * Server error (500/502/503/529).
 * Retryable with exponential backoff.
 */
class ServerError extends ProviderError {
    constructor(provider, options) {
        super(options?.message || `Server error${options?.statusCode ? ` (${options.statusCode})` : ''}`, provider, { requestId: options?.requestId, statusCode: options?.statusCode || 500 });
        this.code = 'SERVER_ERROR';
        this.retryable = true;
    }
}
exports.ServerError = ServerError;
/**
 * Request timeout.
 * Retryable - may be transient.
 */
class TimeoutError extends ProviderError {
    constructor(provider, timeoutMs, options) {
        super(`Request timed out after ${timeoutMs}ms`, provider, { requestId: options?.requestId });
        this.code = 'TIMEOUT';
        this.retryable = true;
        this.timeoutMs = timeoutMs;
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Network error (connection failed, DNS, etc).
 * Retryable - may be transient.
 */
class NetworkError extends ProviderError {
    constructor(provider, message, options) {
        super(message, provider, { requestId: options?.requestId });
        this.code = 'NETWORK_ERROR';
        this.retryable = true;
        this.cause = options?.cause;
    }
}
exports.NetworkError = NetworkError;
/**
 * Content filtered by provider safety systems.
 * Not retryable - content policy violation.
 */
class ContentFilterError extends ProviderError {
    constructor(provider, options) {
        super(`Content filtered${options?.category ? `: ${options.category}` : ''}`, provider, { requestId: options?.requestId });
        this.code = 'CONTENT_FILTER';
        this.retryable = false;
        this.category = options?.category;
        this.severity = options?.severity;
    }
}
exports.ContentFilterError = ContentFilterError;
/**
 * Model not found or not available.
 * Not retryable - model doesn't exist.
 */
class ModelNotFoundError extends ProviderError {
    constructor(provider, modelId, options) {
        super(`Model not found: ${modelId}`, provider, { requestId: options?.requestId, statusCode: 404 });
        this.code = 'MODEL_NOT_FOUND';
        this.retryable = false;
        this.modelId = modelId;
    }
}
exports.ModelNotFoundError = ModelNotFoundError;
/**
 * Quota exceeded (different from rate limit).
 * Not retryable without billing action.
 */
class QuotaExceededError extends ProviderError {
    constructor(provider, options) {
        super(`Quota exceeded${options?.quotaType ? ` (${options.quotaType})` : ''}`, provider, { requestId: options?.requestId, statusCode: 402 });
        this.code = 'QUOTA_EXCEEDED';
        this.retryable = false;
        this.quotaType = options?.quotaType;
    }
}
exports.QuotaExceededError = QuotaExceededError;
/**
 * Service temporarily unavailable.
 * Retryable - usually overload or maintenance.
 */
class ServiceUnavailableError extends ProviderError {
    constructor(provider, options) {
        super('Service temporarily unavailable', provider, { requestId: options?.requestId, statusCode: 503 });
        this.code = 'SERVICE_UNAVAILABLE';
        this.retryable = true;
        this.retryAfter = options?.retryAfter;
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
/**
 * Thinking signature invalid (Anthropic/Gemini multi-turn).
 * Not retryable - message history was modified.
 */
class ThinkingSignatureError extends ProviderError {
    constructor(provider, options) {
        super('Thinking signature invalid - thinking blocks may have been modified', provider, { requestId: options?.requestId, statusCode: 400 });
        this.code = 'THINKING_SIGNATURE_INVALID';
        this.retryable = false;
    }
}
exports.ThinkingSignatureError = ThinkingSignatureError;
/**
 * Stream error during SSE processing.
 * Retryable - stream may have been interrupted.
 */
class StreamError extends ProviderError {
    constructor(provider, message, options) {
        super(message, provider, { requestId: options?.requestId });
        this.code = 'STREAM_ERROR';
        this.retryable = true;
        this.cause = options?.cause;
    }
}
exports.StreamError = StreamError;
/**
 * Parse error in response.
 * Not retryable - unexpected response format.
 */
class ParseError extends ProviderError {
    constructor(provider, message, options) {
        super(message, provider, { requestId: options?.requestId });
        this.code = 'PARSE_ERROR';
        this.retryable = false;
        this.rawResponse = options?.rawResponse;
    }
}
exports.ParseError = ParseError;
/**
 * Parse error response from provider API and return appropriate ProviderError.
 */
function parseProviderError(error, provider) {
    const statusCode = error.status || error.statusCode || error.response?.status;
    const requestId = error.request_id || error.requestId ||
        error.headers?.['x-request-id'] ||
        error.response?.headers?.['x-request-id'];
    const message = error.message || error.error?.message || 'Unknown error';
    // Rate limit (429)
    if (statusCode === 429) {
        const retryAfter = parseRetryAfter(error);
        return new RateLimitError(provider, { retryAfter, requestId });
    }
    // Auth errors (401/403)
    if (statusCode === 401 || statusCode === 403) {
        return new AuthenticationError(provider, { requestId, statusCode });
    }
    // Server overload (529 - Anthropic specific)
    if (statusCode === 529) {
        return new ServerError(provider, {
            statusCode,
            requestId,
            message: 'API temporarily overloaded',
        });
    }
    // Server errors (500+)
    if (statusCode && statusCode >= 500) {
        if (statusCode === 503) {
            const retryAfter = parseRetryAfter(error);
            return new ServiceUnavailableError(provider, { retryAfter, requestId });
        }
        return new ServerError(provider, { statusCode, requestId });
    }
    // Context length / token errors
    if (error.code === 'context_length_exceeded' ||
        message.toLowerCase().includes('context') ||
        message.toLowerCase().includes('token limit') ||
        message.toLowerCase().includes('too many tokens')) {
        return new ContextLengthError(provider, error.max_tokens || 0, error.requested_tokens || 0, { requestId });
    }
    // Content filter
    if (error.code === 'content_policy_violation' ||
        message.toLowerCase().includes('safety') ||
        message.toLowerCase().includes('content filter') ||
        message.toLowerCase().includes('blocked')) {
        return new ContentFilterError(provider, {
            category: error.category,
            requestId,
        });
    }
    // Thinking signature (Anthropic)
    if (message.toLowerCase().includes('signature')) {
        return new ThinkingSignatureError(provider, { requestId });
    }
    // Model not found (404)
    if (statusCode === 404 || message.toLowerCase().includes('model not found')) {
        return new ModelNotFoundError(provider, error.model || 'unknown', { requestId });
    }
    // Quota exceeded (402)
    if (statusCode === 402 || message.toLowerCase().includes('quota')) {
        return new QuotaExceededError(provider, { requestId });
    }
    // Network errors
    if (error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET') {
        return new NetworkError(provider, message, { cause: error, requestId });
    }
    // Timeout
    if (error.code === 'TIMEOUT' || message.toLowerCase().includes('timeout')) {
        return new TimeoutError(provider, error.timeout || 0, { requestId });
    }
    // Default to invalid request for 400
    if (statusCode === 400) {
        return new InvalidRequestError(provider, message, {
            requestId,
            details: error.error || error.details,
        });
    }
    // Fallback to server error
    return new ServerError(provider, { statusCode, requestId, message });
}
/**
 * Parse retry-after header value.
 */
function parseRetryAfter(error) {
    const header = error.headers?.['retry-after'] ||
        error.response?.headers?.['retry-after'];
    if (header) {
        const seconds = parseInt(header, 10);
        if (!isNaN(seconds))
            return seconds;
    }
    // Some providers include retry info in error body
    if (error.retry_after) {
        return error.retry_after;
    }
    return undefined;
}
/**
 * Check if an error is retryable.
 */
function isRetryableError(error) {
    if (error instanceof ProviderError) {
        return error.retryable;
    }
    return false;
}
/**
 * Check if error is a specific type.
 */
function isRateLimitError(error) {
    return error instanceof RateLimitError;
}
function isAuthError(error) {
    return error instanceof AuthenticationError;
}
function isContextLengthError(error) {
    return error instanceof ContextLengthError;
}
function isContentFilterError(error) {
    return error instanceof ContentFilterError;
}
