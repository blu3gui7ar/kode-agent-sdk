/**
 * Retry Strategy Module
 *
 * Exponential backoff with jitter for handling transient failures.
 * Respects provider-specific retry-after headers.
 */
import { ProviderError } from './errors';
/**
 * Retry configuration options.
 */
export interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    jitterFactor: number;
    provider?: string;
}
/**
 * Default retry configuration.
 * Suitable for most provider API calls.
 */
export declare const DEFAULT_RETRY_CONFIG: RetryConfig;
/**
 * Aggressive retry configuration for critical operations.
 */
export declare const AGGRESSIVE_RETRY_CONFIG: RetryConfig;
/**
 * Callback invoked before each retry attempt.
 */
export type OnRetryCallback = (error: ProviderError, attempt: number, delayMs: number) => void;
/**
 * Execute a function with retry logic.
 *
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @param onRetry - Optional callback before each retry
 * @returns Result of the function
 * @throws Last error if all retries exhausted
 */
export declare function withRetry<T>(fn: () => Promise<T>, config?: RetryConfig, onRetry?: OnRetryCallback): Promise<T>;
/**
 * Create a retry wrapper for a provider.
 *
 * @param provider - Provider name for error context
 * @param config - Retry configuration
 * @returns Configured retry function
 */
export declare function createRetryWrapper(provider: string, config?: Partial<RetryConfig>): <T>(fn: () => Promise<T>, onRetry?: OnRetryCallback) => Promise<T>;
/**
 * Retry with timeout.
 * Aborts if total time exceeds timeout even if retries remain.
 */
export declare function withRetryAndTimeout<T>(fn: () => Promise<T>, timeoutMs: number, config?: RetryConfig, onRetry?: OnRetryCallback): Promise<T>;
/**
 * Check if an operation should be retried.
 * Useful for manual retry logic.
 */
export declare function shouldRetry(error: unknown, attempt: number, maxRetries: number): boolean;
/**
 * Get recommended delay for next retry.
 */
export declare function getRetryDelay(error: ProviderError, attempt: number, config?: RetryConfig): number;
