/**
 * Provider Error Hierarchy
 *
 * Typed error classes for all provider operations with retry support.
 * Each error type has a unique code and retryable flag.
 */
export type ProviderErrorCode = 'RATE_LIMIT' | 'AUTH_FAILED' | 'CONTEXT_LENGTH' | 'INVALID_REQUEST' | 'SERVER_ERROR' | 'TIMEOUT' | 'NETWORK_ERROR' | 'CONTENT_FILTER' | 'MODEL_NOT_FOUND' | 'QUOTA_EXCEEDED' | 'SERVICE_UNAVAILABLE' | 'THINKING_SIGNATURE_INVALID' | 'STREAM_ERROR' | 'PARSE_ERROR';
export interface ProviderErrorDetails {
    name: string;
    code: ProviderErrorCode;
    message: string;
    provider: string;
    requestId?: string;
    retryable: boolean;
    timestamp: number;
    statusCode?: number;
}
/**
 * Base class for all provider errors.
 * Provides common properties and JSON serialization.
 */
export declare abstract class ProviderError extends Error {
    abstract readonly code: ProviderErrorCode;
    abstract readonly retryable: boolean;
    readonly provider: string;
    readonly requestId?: string;
    readonly timestamp: number;
    readonly statusCode?: number;
    constructor(message: string, provider: string, options?: {
        requestId?: string;
        statusCode?: number;
    });
    toJSON(): ProviderErrorDetails;
}
/**
 * Rate limit exceeded (429).
 * Retryable after the specified delay.
 */
export declare class RateLimitError extends ProviderError {
    readonly code: "RATE_LIMIT";
    readonly retryable = true;
    readonly retryAfter?: number;
    readonly limitType?: 'requests' | 'tokens';
    constructor(provider: string, options?: {
        retryAfter?: number;
        limitType?: 'requests' | 'tokens';
        requestId?: string;
    });
}
/**
 * Authentication failed (401/403).
 * Not retryable - API key or permissions issue.
 */
export declare class AuthenticationError extends ProviderError {
    readonly code: "AUTH_FAILED";
    readonly retryable = false;
    constructor(provider: string, options?: {
        requestId?: string;
        statusCode?: number;
    });
}
/**
 * Context/token length exceeded.
 * Not retryable - need to reduce input size.
 */
export declare class ContextLengthError extends ProviderError {
    readonly code: "CONTEXT_LENGTH";
    readonly retryable = false;
    readonly maxTokens: number;
    readonly requestedTokens: number;
    constructor(provider: string, maxTokens: number, requestedTokens: number, options?: {
        requestId?: string;
    });
}
/**
 * Invalid request (400).
 * Not retryable - request format issue.
 */
export declare class InvalidRequestError extends ProviderError {
    readonly code: "INVALID_REQUEST";
    readonly retryable = false;
    readonly details?: Record<string, unknown>;
    constructor(provider: string, message: string, options?: {
        requestId?: string;
        details?: Record<string, unknown>;
    });
}
/**
 * Server error (500/502/503/529).
 * Retryable with exponential backoff.
 */
export declare class ServerError extends ProviderError {
    readonly code: "SERVER_ERROR";
    readonly retryable = true;
    constructor(provider: string, options?: {
        statusCode?: number;
        requestId?: string;
        message?: string;
    });
}
/**
 * Request timeout.
 * Retryable - may be transient.
 */
export declare class TimeoutError extends ProviderError {
    readonly code: "TIMEOUT";
    readonly retryable = true;
    readonly timeoutMs: number;
    constructor(provider: string, timeoutMs: number, options?: {
        requestId?: string;
    });
}
/**
 * Network error (connection failed, DNS, etc).
 * Retryable - may be transient.
 */
export declare class NetworkError extends ProviderError {
    readonly code: "NETWORK_ERROR";
    readonly retryable = true;
    readonly cause?: Error;
    constructor(provider: string, message: string, options?: {
        cause?: Error;
        requestId?: string;
    });
}
/**
 * Content filtered by provider safety systems.
 * Not retryable - content policy violation.
 */
export declare class ContentFilterError extends ProviderError {
    readonly code: "CONTENT_FILTER";
    readonly retryable = false;
    readonly category?: string;
    readonly severity?: string;
    constructor(provider: string, options?: {
        category?: string;
        severity?: string;
        requestId?: string;
    });
}
/**
 * Model not found or not available.
 * Not retryable - model doesn't exist.
 */
export declare class ModelNotFoundError extends ProviderError {
    readonly code: "MODEL_NOT_FOUND";
    readonly retryable = false;
    readonly modelId: string;
    constructor(provider: string, modelId: string, options?: {
        requestId?: string;
    });
}
/**
 * Quota exceeded (different from rate limit).
 * Not retryable without billing action.
 */
export declare class QuotaExceededError extends ProviderError {
    readonly code: "QUOTA_EXCEEDED";
    readonly retryable = false;
    readonly quotaType?: 'daily' | 'monthly' | 'total';
    constructor(provider: string, options?: {
        quotaType?: 'daily' | 'monthly' | 'total';
        requestId?: string;
    });
}
/**
 * Service temporarily unavailable.
 * Retryable - usually overload or maintenance.
 */
export declare class ServiceUnavailableError extends ProviderError {
    readonly code: "SERVICE_UNAVAILABLE";
    readonly retryable = true;
    readonly retryAfter?: number;
    constructor(provider: string, options?: {
        retryAfter?: number;
        requestId?: string;
    });
}
/**
 * Thinking signature invalid (Anthropic/Gemini multi-turn).
 * Not retryable - message history was modified.
 */
export declare class ThinkingSignatureError extends ProviderError {
    readonly code: "THINKING_SIGNATURE_INVALID";
    readonly retryable = false;
    constructor(provider: string, options?: {
        requestId?: string;
    });
}
/**
 * Stream error during SSE processing.
 * Retryable - stream may have been interrupted.
 */
export declare class StreamError extends ProviderError {
    readonly code: "STREAM_ERROR";
    readonly retryable = true;
    readonly cause?: Error;
    constructor(provider: string, message: string, options?: {
        cause?: Error;
        requestId?: string;
    });
}
/**
 * Parse error in response.
 * Not retryable - unexpected response format.
 */
export declare class ParseError extends ProviderError {
    readonly code: "PARSE_ERROR";
    readonly retryable = false;
    readonly rawResponse?: string;
    constructor(provider: string, message: string, options?: {
        rawResponse?: string;
        requestId?: string;
    });
}
/**
 * Parse error response from provider API and return appropriate ProviderError.
 */
export declare function parseProviderError(error: any, provider: string): ProviderError;
/**
 * Check if an error is retryable.
 */
export declare function isRetryableError(error: unknown): boolean;
/**
 * Check if error is a specific type.
 */
export declare function isRateLimitError(error: unknown): error is RateLimitError;
export declare function isAuthError(error: unknown): error is AuthenticationError;
export declare function isContextLengthError(error: unknown): error is ContextLengthError;
export declare function isContentFilterError(error: unknown): error is ContentFilterError;
