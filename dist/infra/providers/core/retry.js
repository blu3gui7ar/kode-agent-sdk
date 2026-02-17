"use strict";
/**
 * Retry Strategy Module
 *
 * Exponential backoff with jitter for handling transient failures.
 * Respects provider-specific retry-after headers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGGRESSIVE_RETRY_CONFIG = exports.DEFAULT_RETRY_CONFIG = void 0;
exports.withRetry = withRetry;
exports.createRetryWrapper = createRetryWrapper;
exports.withRetryAndTimeout = withRetryAndTimeout;
exports.shouldRetry = shouldRetry;
exports.getRetryDelay = getRetryDelay;
const errors_1 = require("./errors");
/**
 * Default retry configuration.
 * Suitable for most provider API calls.
 */
exports.DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 60000,
    jitterFactor: 0.2,
};
/**
 * Aggressive retry configuration for critical operations.
 */
exports.AGGRESSIVE_RETRY_CONFIG = {
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 120000,
    jitterFactor: 0.3,
};
/**
 * Execute a function with retry logic.
 *
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @param onRetry - Optional callback before each retry
 * @returns Result of the function
 * @throws Last error if all retries exhausted
 */
async function withRetry(fn, config = exports.DEFAULT_RETRY_CONFIG, onRetry) {
    let lastError;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            // Convert to ProviderError if needed
            const providerError = error instanceof errors_1.ProviderError
                ? error
                : (0, errors_1.parseProviderError)(error, config.provider || 'unknown');
            lastError = providerError;
            // Don't retry non-retryable errors
            if (!providerError.retryable) {
                throw providerError;
            }
            // Don't retry if we've exhausted attempts
            if (attempt === config.maxRetries) {
                throw providerError;
            }
            // Calculate delay with exponential backoff
            let delay = calculateBackoffDelay(attempt, config);
            // Respect retry-after header if available
            if (providerError instanceof errors_1.RateLimitError && providerError.retryAfter) {
                delay = Math.max(delay, providerError.retryAfter * 1000);
            }
            else if (providerError instanceof errors_1.ServiceUnavailableError && providerError.retryAfter) {
                delay = Math.max(delay, providerError.retryAfter * 1000);
            }
            // Apply jitter
            delay = applyJitter(delay, config.jitterFactor);
            // Invoke callback
            onRetry?.(providerError, attempt + 1, delay);
            // Wait before retry
            await sleep(delay);
        }
    }
    // Should not reach here, but TypeScript needs this
    throw lastError || new Error('Unexpected retry loop exit');
}
/**
 * Calculate exponential backoff delay.
 */
function calculateBackoffDelay(attempt, config) {
    const delay = config.baseDelayMs * Math.pow(2, attempt);
    return Math.min(delay, config.maxDelayMs);
}
/**
 * Apply jitter to a delay value.
 */
function applyJitter(delay, jitterFactor) {
    const jitter = delay * jitterFactor * (Math.random() - 0.5) * 2;
    return Math.max(0, Math.floor(delay + jitter));
}
/**
 * Sleep for a specified duration.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Create a retry wrapper for a provider.
 *
 * @param provider - Provider name for error context
 * @param config - Retry configuration
 * @returns Configured retry function
 */
function createRetryWrapper(provider, config = {}) {
    const mergedConfig = {
        ...exports.DEFAULT_RETRY_CONFIG,
        ...config,
        provider,
    };
    return (fn, onRetry) => withRetry(fn, mergedConfig, onRetry);
}
/**
 * Retry with timeout.
 * Aborts if total time exceeds timeout even if retries remain.
 */
async function withRetryAndTimeout(fn, timeoutMs, config = exports.DEFAULT_RETRY_CONFIG, onRetry) {
    const startTime = Date.now();
    let lastError;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        // Check if we've exceeded timeout
        if (Date.now() - startTime > timeoutMs) {
            throw lastError || new Error(`Operation timed out after ${timeoutMs}ms`);
        }
        try {
            // Create a timeout promise
            const remainingTime = timeoutMs - (Date.now() - startTime);
            return await Promise.race([
                fn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), remainingTime)),
            ]);
        }
        catch (error) {
            const providerError = error instanceof errors_1.ProviderError
                ? error
                : (0, errors_1.parseProviderError)(error, config.provider || 'unknown');
            lastError = providerError;
            if (!providerError.retryable || attempt === config.maxRetries) {
                throw providerError;
            }
            let delay = calculateBackoffDelay(attempt, config);
            if (providerError instanceof errors_1.RateLimitError && providerError.retryAfter) {
                delay = Math.max(delay, providerError.retryAfter * 1000);
            }
            delay = applyJitter(delay, config.jitterFactor);
            // Don't wait longer than remaining timeout
            const remainingTime = timeoutMs - (Date.now() - startTime);
            if (delay > remainingTime) {
                throw lastError;
            }
            onRetry?.(providerError, attempt + 1, delay);
            await sleep(delay);
        }
    }
    throw lastError;
}
/**
 * Check if an operation should be retried.
 * Useful for manual retry logic.
 */
function shouldRetry(error, attempt, maxRetries) {
    if (attempt >= maxRetries) {
        return false;
    }
    if (error instanceof errors_1.ProviderError) {
        return error.retryable;
    }
    // For unknown errors, be conservative
    return false;
}
/**
 * Get recommended delay for next retry.
 */
function getRetryDelay(error, attempt, config = exports.DEFAULT_RETRY_CONFIG) {
    let delay = calculateBackoffDelay(attempt, config);
    if (error instanceof errors_1.RateLimitError && error.retryAfter) {
        delay = Math.max(delay, error.retryAfter * 1000);
    }
    else if (error instanceof errors_1.ServiceUnavailableError && error.retryAfter) {
        delay = Math.max(delay, error.retryAfter * 1000);
    }
    return applyJitter(delay, config.jitterFactor);
}
