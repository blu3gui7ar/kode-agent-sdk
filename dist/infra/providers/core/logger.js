"use strict";
/**
 * Logging and Debugging Module
 *
 * Unified logging interfaces for provider operations,
 * request/response tracking, and audit trail.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DEBUG_CONFIG = void 0;
exports.createConsoleLogger = createConsoleLogger;
exports.createProviderLogger = createProviderLogger;
exports.redactSensitive = redactSensitive;
exports.truncateContent = truncateContent;
exports.generateAuditId = generateAuditId;
/**
 * Default debug configuration.
 */
exports.DEFAULT_DEBUG_CONFIG = {
    verbose: false,
    logRawRequests: false,
    logRawResponses: false,
    logThinking: false,
    logTokenUsage: true,
    logCache: true,
    logRetries: true,
    redactSensitive: true,
    maxContentLength: 500,
};
/**
 * Create a console-based logger.
 */
function createConsoleLogger(context = {}, debugConfig = {}) {
    const config = { ...exports.DEFAULT_DEBUG_CONFIG, ...debugConfig };
    const log = (level, message, ctx) => {
        if (!config.verbose && level === 'debug')
            return;
        const entry = {
            level,
            message,
            timestamp: Date.now(),
            context: { ...context, ...ctx },
        };
        const prefix = `[${level.toUpperCase()}]`;
        const contextStr = Object.keys(entry.context || {}).length > 0
            ? ` ${JSON.stringify(entry.context)}`
            : '';
        const output = `${prefix} ${message}${contextStr}`;
        switch (level) {
            case 'debug':
                console.debug(output);
                break;
            case 'info':
                console.info(output);
                break;
            case 'warn':
                console.warn(output);
                break;
            case 'error':
                console.error(output);
                break;
        }
    };
    return {
        debug: (message, ctx) => log('debug', message, ctx),
        info: (message, ctx) => log('info', message, ctx),
        warn: (message, ctx) => log('warn', message, ctx),
        error: (message, ctx) => log('error', message, ctx),
        child: (childContext) => createConsoleLogger({ ...context, ...childContext }, debugConfig),
    };
}
/**
 * Create a provider logger with request/response tracking.
 */
function createProviderLogger(provider, debugConfig = {}) {
    const config = { ...exports.DEFAULT_DEBUG_CONFIG, ...debugConfig };
    const base = createConsoleLogger({ provider }, debugConfig);
    return {
        ...base,
        logRequest(request) {
            if (!config.verbose)
                return;
            base.info('Provider request', {
                model: request.model,
                requestId: request.requestId,
                messageCount: request.messageCount,
                estimatedTokens: request.estimatedTokens,
                streaming: request.streaming,
                toolCount: request.toolCount,
            });
        },
        logResponse(response, durationMs) {
            if (config.logTokenUsage) {
                base.info('Provider response', {
                    model: response.model,
                    requestId: response.requestId,
                    inputTokens: response.usage.inputTokens,
                    outputTokens: response.usage.outputTokens,
                    durationMs,
                    stopReason: response.stopReason,
                });
            }
        },
        logError(error) {
            base.error('Provider error', {
                code: error.code,
                requestId: error.requestId,
                retryable: error.retryable,
            });
        },
        logStreamStart(requestId) {
            if (config.verbose) {
                base.debug('Stream started', { requestId });
            }
        },
        logStreamChunk(requestId, chunkSize) {
            if (config.verbose) {
                base.debug('Stream chunk', { requestId, chunkSize });
            }
        },
        logStreamEnd(requestId, totalChunks) {
            if (config.verbose) {
                base.debug('Stream ended', { requestId, totalChunks });
            }
        },
        logCacheHit(tokens) {
            if (config.logCache) {
                base.info('Cache hit', { tokens });
            }
        },
        logCacheWrite(tokens, ttl) {
            if (config.logCache) {
                base.info('Cache write', { tokens, ttl });
            }
        },
        logRetry(attempt, delayMs, error) {
            if (config.logRetries) {
                base.warn('Retrying request', {
                    attempt,
                    delayMs,
                    errorCode: error.code,
                });
            }
        },
        child(childContext) {
            return createProviderLogger(provider, debugConfig);
        },
    };
}
/**
 * Redact sensitive data from an object.
 */
function redactSensitive(obj) {
    const sensitiveKeys = [
        'apiKey',
        'api_key',
        'authorization',
        'Authorization',
        'token',
        'secret',
        'password',
        'credential',
    ];
    const redacted = {};
    for (const [key, value] of Object.entries(obj)) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
            redacted[key] = '[REDACTED]';
        }
        else if (typeof value === 'object' && value !== null) {
            redacted[key] = redactSensitive(value);
        }
        else {
            redacted[key] = value;
        }
    }
    return redacted;
}
/**
 * Truncate content for logging.
 */
function truncateContent(content, maxLength) {
    if (content.length <= maxLength) {
        return content;
    }
    return content.slice(0, maxLength) + `... [truncated, ${content.length - maxLength} more chars]`;
}
/**
 * Generate unique audit ID.
 */
function generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
