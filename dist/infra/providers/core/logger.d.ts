/**
 * Logging and Debugging Module
 *
 * Unified logging interfaces for provider operations,
 * request/response tracking, and audit trail.
 */
import { UsageStatistics } from './usage';
import { ProviderErrorDetails } from './errors';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
/**
 * Log entry structure.
 */
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: number;
    context?: Record<string, unknown>;
    requestId?: string;
    agentId?: string;
    sessionId?: string;
}
/**
 * Core logger interface.
 */
export interface Logger {
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
    child(context: Record<string, unknown>): Logger;
}
/**
 * Provider-specific logger with request/response tracking.
 */
export interface ProviderLogger extends Logger {
    logRequest(request: ProviderRequest): void;
    logResponse(response: ProviderResponse, durationMs: number): void;
    logError(error: ProviderErrorDetails): void;
    logStreamStart(requestId: string): void;
    logStreamChunk(requestId: string, chunkSize: number): void;
    logStreamEnd(requestId: string, totalChunks: number): void;
    logCacheHit(tokens: number): void;
    logCacheWrite(tokens: number, ttl: string): void;
    logRetry(attempt: number, delayMs: number, error: ProviderErrorDetails): void;
}
/**
 * Provider request details for logging.
 */
export interface ProviderRequest {
    provider: string;
    model: string;
    requestId?: string;
    timestamp: number;
    messageCount: number;
    estimatedTokens?: number;
    maxTokens?: number;
    temperature?: number;
    toolCount?: number;
    streaming: boolean;
    cacheEnabled?: boolean;
    cacheBreakpoints?: number;
}
/**
 * Provider response details for logging.
 */
export interface ProviderResponse {
    provider: string;
    model: string;
    requestId?: string;
    timestamp: number;
    usage: UsageStatistics;
    stopReason?: string;
    contentBlockCount: number;
    hasToolUse: boolean;
    durationMs: number;
    timeToFirstTokenMs?: number;
}
/**
 * Debug configuration options.
 */
export interface DebugConfig {
    verbose: boolean;
    logRawRequests: boolean;
    logRawResponses: boolean;
    logThinking: boolean;
    logTokenUsage: boolean;
    logCache: boolean;
    logRetries: boolean;
    redactSensitive: boolean;
    maxContentLength: number;
}
/**
 * Default debug configuration.
 */
export declare const DEFAULT_DEBUG_CONFIG: DebugConfig;
/**
 * Audit record for compliance and debugging.
 */
export interface AuditRecord {
    id: string;
    timestamp: number;
    provider: string;
    model: string;
    requestId?: string;
    usage: UsageStatistics;
    cacheHit: boolean;
    cacheSavings?: number;
    error?: ProviderErrorDetails;
    latencyMs: number;
    timeToFirstTokenMs?: number;
    agentId?: string;
    sessionId?: string;
    stepNumber?: number;
}
/**
 * Audit filter for querying records.
 */
export interface AuditFilter {
    provider?: string;
    model?: string;
    agentId?: string;
    sessionId?: string;
    startTime?: number;
    endTime?: number;
    hasError?: boolean;
    errorCode?: string;
    limit?: number;
    offset?: number;
}
/**
 * Audit aggregation results.
 */
export interface AuditAggregation {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    cacheHitRate: number;
    averageLatencyMs: number;
    errorRate: number;
    byProvider: Map<string, {
        requests: number;
        tokens: number;
        cost: number;
        errorRate: number;
    }>;
    byModel: Map<string, {
        requests: number;
        tokens: number;
        cost: number;
        errorRate: number;
    }>;
    hourly?: Array<{
        hour: number;
        requests: number;
        tokens: number;
        cost: number;
    }>;
}
/**
 * Audit store interface.
 */
export interface AuditStore {
    record(audit: AuditRecord): Promise<void>;
    query(filter: AuditFilter): Promise<AuditRecord[]>;
    aggregate(filter: AuditFilter): Promise<AuditAggregation>;
}
/**
 * Create a console-based logger.
 */
export declare function createConsoleLogger(context?: Record<string, unknown>, debugConfig?: Partial<DebugConfig>): Logger;
/**
 * Create a provider logger with request/response tracking.
 */
export declare function createProviderLogger(provider: string, debugConfig?: Partial<DebugConfig>): ProviderLogger;
/**
 * Redact sensitive data from an object.
 */
export declare function redactSensitive(obj: Record<string, unknown>): Record<string, unknown>;
/**
 * Truncate content for logging.
 */
export declare function truncateContent(content: string, maxLength: number): string;
/**
 * Generate unique audit ID.
 */
export declare function generateAuditId(): string;
