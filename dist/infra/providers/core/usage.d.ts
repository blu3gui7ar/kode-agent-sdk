/**
 * Usage Statistics Module
 *
 * Unified usage tracking, cache metrics, and cost calculation
 * across all supported model providers.
 */
/**
 * Unified usage statistics for all providers.
 * Normalized from provider-specific usage formats.
 */
export interface UsageStatistics {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
    cache: CacheMetrics;
    cost: CostBreakdown;
    request: RequestMetrics;
    raw?: Record<string, unknown>;
}
/**
 * Cache performance metrics.
 */
export interface CacheMetrics {
    cacheCreationTokens: number;
    cacheReadTokens: number;
    cacheSavingsEstimate?: number;
    provider: {
        anthropic?: {
            breakpointsUsed: number;
            ttlUsed: '5m' | '1h';
        };
        gemini?: {
            cachedContentName?: string;
            implicitCacheHit: boolean;
        };
        openai?: {
            automaticCacheHit: boolean;
        };
        deepseek?: {
            prefixCacheHit: boolean;
        };
        qwen?: {
            cacheHit: boolean;
        };
    };
}
/**
 * Cost breakdown in USD.
 */
export interface CostBreakdown {
    inputCost: number;
    outputCost: number;
    cacheWriteCost: number;
    totalCost: number;
    cacheSavings: number;
    currency: 'USD';
}
/**
 * Request performance metrics.
 */
export interface RequestMetrics {
    startTime: number;
    endTime: number;
    latencyMs: number;
    timeToFirstTokenMs?: number;
    tokensPerSecond?: number;
    requestId?: string;
    modelUsed: string;
    stopReason?: string;
    retryCount?: number;
}
/**
 * Model pricing information (per 1M tokens in USD).
 */
export interface ModelPricing {
    input: number;
    output: number;
    cacheWrite?: number;
    cacheRead?: number;
    reasoning?: number;
}
/**
 * Provider pricing table (per 1M tokens).
 */
export declare const PROVIDER_PRICING: Record<string, Record<string, ModelPricing>>;
/**
 * Create empty usage statistics.
 */
export declare function createEmptyUsage(): UsageStatistics;
/**
 * Calculate cost based on usage and pricing.
 */
export declare function calculateCost(usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
    reasoningTokens?: number;
}, pricing: ModelPricing, cacheTtl?: '5m' | '1h'): CostBreakdown;
/**
 * Normalize Anthropic usage to unified format.
 */
export declare function normalizeAnthropicUsage(raw: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
}, model: string, startTime: number, requestId?: string, cacheTtl?: '5m' | '1h'): UsageStatistics;
/**
 * Normalize OpenAI usage to unified format.
 */
export declare function normalizeOpenAIUsage(raw: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    prompt_tokens_details?: {
        cached_tokens?: number;
    };
    completion_tokens_details?: {
        reasoning_tokens?: number;
    };
}, model: string, api: 'chat' | 'responses', startTime: number, requestId?: string): UsageStatistics;
/**
 * Normalize Gemini usage to unified format.
 */
export declare function normalizeGeminiUsage(raw: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    cachedContentTokenCount?: number;
    thoughtsTokenCount?: number;
}, model: string, startTime: number, cachedContentName?: string): UsageStatistics;
/**
 * Normalize DeepSeek usage to unified format.
 */
export declare function normalizeDeepSeekUsage(raw: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
}, model: string, startTime: number, requestId?: string): UsageStatistics;
/**
 * Aggregate multiple usage statistics.
 */
export declare function aggregateUsage(usages: UsageStatistics[]): UsageStatistics;
/**
 * Format usage as human-readable string.
 */
export declare function formatUsageString(usage: UsageStatistics): string;
