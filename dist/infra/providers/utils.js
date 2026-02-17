"use strict";
/**
 * Shared utilities for provider implementations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_SUPPORTED_AUDIO_FORMATS = exports.VIDEO_UNSUPPORTED_TEXT = exports.AUDIO_UNSUPPORTED_TEXT = exports.IMAGE_UNSUPPORTED_TEXT = exports.FILE_UNSUPPORTED_TEXT = void 0;
exports.resolveProxyUrl = resolveProxyUrl;
exports.getProxyDispatcher = getProxyDispatcher;
exports.withProxy = withProxy;
exports.normalizeBaseUrl = normalizeBaseUrl;
exports.normalizeOpenAIBaseUrl = normalizeOpenAIBaseUrl;
exports.normalizeAnthropicBaseUrl = normalizeAnthropicBaseUrl;
exports.normalizeGeminiBaseUrl = normalizeGeminiBaseUrl;
exports.getMessageBlocks = getMessageBlocks;
exports.markTransportIfDegraded = markTransportIfDegraded;
exports.joinTextBlocks = joinTextBlocks;
exports.formatToolResult = formatToolResult;
exports.safeJsonStringify = safeJsonStringify;
exports.concatTextWithReasoning = concatTextWithReasoning;
exports.joinReasoningBlocks = joinReasoningBlocks;
exports.normalizeThinkBlocks = normalizeThinkBlocks;
exports.splitThinkText = splitThinkText;
exports.extractReasoningDetails = extractReasoningDetails;
exports.buildGeminiImagePart = buildGeminiImagePart;
exports.buildGeminiFilePart = buildGeminiFilePart;
exports.buildGeminiAudioPart = buildGeminiAudioPart;
exports.buildGeminiVideoPart = buildGeminiVideoPart;
exports.extractOpenAIAudioFormat = extractOpenAIAudioFormat;
exports.buildOpenAIAudioPart = buildOpenAIAudioPart;
exports.sanitizeGeminiSchema = sanitizeGeminiSchema;
exports.hasAnthropicFileBlocks = hasAnthropicFileBlocks;
exports.mergeAnthropicBetaHeader = mergeAnthropicBetaHeader;
exports.normalizeAnthropicContent = normalizeAnthropicContent;
exports.normalizeAnthropicContentBlock = normalizeAnthropicContentBlock;
exports.normalizeAnthropicDelta = normalizeAnthropicDelta;
// =============================================================================
// Proxy Handling
// =============================================================================
const proxyAgents = new Map();
function resolveProxyUrl(explicit) {
    if (explicit)
        return explicit;
    const flag = process.env.KODE_USE_ENV_PROXY;
    if (!flag || ['0', 'false', 'no'].includes(flag.toLowerCase())) {
        return undefined;
    }
    return (process.env.HTTPS_PROXY ||
        process.env.https_proxy ||
        process.env.HTTP_PROXY ||
        process.env.http_proxy ||
        process.env.ALL_PROXY ||
        process.env.all_proxy);
}
function getProxyDispatcher(proxyUrl) {
    const resolved = resolveProxyUrl(proxyUrl);
    if (!resolved)
        return undefined;
    const cached = proxyAgents.get(resolved);
    if (cached)
        return cached;
    let ProxyAgent;
    try {
        ({ ProxyAgent } = require('undici'));
    }
    catch (error) {
        throw new Error(`Proxy support requires undici. Install it to use proxyUrl (${error?.message || error}).`);
    }
    const agent = new ProxyAgent(resolved);
    proxyAgents.set(resolved, agent);
    return agent;
}
function withProxy(init, dispatcher) {
    if (!dispatcher)
        return init;
    return { ...init, dispatcher };
}
// =============================================================================
// URL Normalization
// =============================================================================
function normalizeBaseUrl(url) {
    return url.replace(/\/+$/, '');
}
function normalizeOpenAIBaseUrl(url) {
    let normalized = url.replace(/\/+$/, '');
    // Auto-append /v1 if not present (for OpenAI-compatible APIs)
    if (!normalized.endsWith('/v1')) {
        normalized += '/v1';
    }
    return normalized;
}
function normalizeAnthropicBaseUrl(url) {
    let normalized = url.replace(/\/+$/, '');
    if (normalized.endsWith('/v1')) {
        normalized = normalized.slice(0, -3);
    }
    return normalized;
}
function normalizeGeminiBaseUrl(url) {
    let normalized = url.replace(/\/+$/, '');
    // Auto-append /v1beta if no version path present
    if (!normalized.endsWith('/v1beta') && !normalized.endsWith('/v1')) {
        normalized += '/v1beta';
    }
    return normalized;
}
// =============================================================================
// Content Block Utilities
// =============================================================================
function getMessageBlocks(message) {
    if (message.metadata?.transport === 'omit') {
        return message.content;
    }
    return message.metadata?.content_blocks ?? message.content;
}
function markTransportIfDegraded(message, blocks) {
    if (message.metadata?.transport === 'omit') {
        return;
    }
    if (!message.metadata) {
        message.metadata = { content_blocks: blocks, transport: 'text' };
        return;
    }
    if (!message.metadata.content_blocks) {
        message.metadata.content_blocks = blocks;
    }
    message.metadata.transport = 'text';
}
// =============================================================================
// Text Formatting
// =============================================================================
function joinTextBlocks(blocks) {
    return blocks
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');
}
function formatToolResult(content) {
    if (typeof content === 'string')
        return content;
    return safeJsonStringify(content);
}
function safeJsonStringify(value) {
    try {
        const json = JSON.stringify(value ?? {});
        return json === undefined ? '{}' : json;
    }
    catch {
        return '{}';
    }
}
// =============================================================================
// Unsupported Content Messages
// =============================================================================
exports.FILE_UNSUPPORTED_TEXT = '[file unsupported] This model does not support PDF input. Please extract text or images first.';
exports.IMAGE_UNSUPPORTED_TEXT = '[image unsupported] This model does not support image URLs; please provide base64 data if supported.';
exports.AUDIO_UNSUPPORTED_TEXT = '[audio unsupported] This model does not support audio input; please provide a text transcript instead.';
exports.VIDEO_UNSUPPORTED_TEXT = '[video unsupported] This model does not support video input; please provide text description or extracted frames instead.';
// =============================================================================
// Reasoning/Thinking Utilities
// =============================================================================
function concatTextWithReasoning(blocks, reasoningTransport = 'text') {
    let text = '';
    for (const block of blocks) {
        if (block.type === 'text') {
            text += block.text;
        }
        else if (block.type === 'reasoning' && reasoningTransport === 'text') {
            text += `<think>${block.reasoning}</think>`;
        }
    }
    return text;
}
function joinReasoningBlocks(blocks) {
    return blocks
        .filter((block) => block.type === 'reasoning')
        .map((block) => block.reasoning)
        .join('\n');
}
/**
 * Parse <think> tags in text blocks and convert to reasoning blocks.
 */
function normalizeThinkBlocks(blocks, reasoningTransport = 'text') {
    if (reasoningTransport !== 'text') {
        return blocks;
    }
    const output = [];
    for (const block of blocks) {
        if (block.type !== 'text') {
            output.push(block);
            continue;
        }
        const parts = splitThinkText(block.text);
        if (parts.length === 0) {
            output.push(block);
        }
        else {
            output.push(...parts);
        }
    }
    return output;
}
function splitThinkText(text) {
    const blocks = [];
    const regex = /<think>([\s\S]*?)<\/think>/g;
    let match;
    let cursor = 0;
    let matched = false;
    while ((match = regex.exec(text)) !== null) {
        matched = true;
        const before = text.slice(cursor, match.index);
        if (before) {
            blocks.push({ type: 'text', text: before });
        }
        const reasoning = match[1] || '';
        blocks.push({ type: 'reasoning', reasoning });
        cursor = match.index + match[0].length;
    }
    if (!matched) {
        return [];
    }
    const after = text.slice(cursor);
    if (after) {
        blocks.push({ type: 'text', text: after });
    }
    return blocks;
}
/**
 * Extract reasoning details from OpenAI response (for reasoning models).
 */
function extractReasoningDetails(message) {
    const details = Array.isArray(message?.reasoning_details) ? message.reasoning_details : [];
    const content = typeof message?.reasoning_content === 'string' ? message.reasoning_content : undefined;
    const blocks = [];
    for (const detail of details) {
        if (typeof detail?.text === 'string') {
            blocks.push({ type: 'reasoning', reasoning: detail.text });
        }
    }
    if (content) {
        blocks.push({ type: 'reasoning', reasoning: content });
    }
    return blocks;
}
// =============================================================================
// Gemini Helpers
// =============================================================================
function buildGeminiImagePart(block) {
    if (block.file_id) {
        return { file_data: { mime_type: block.mime_type, file_uri: block.file_id } };
    }
    if (block.url) {
        if (block.url.startsWith('gs://')) {
            return { file_data: { mime_type: block.mime_type, file_uri: block.url } };
        }
        return null;
    }
    if (block.base64 && block.mime_type) {
        return { inline_data: { mime_type: block.mime_type, data: block.base64 } };
    }
    return null;
}
function buildGeminiFilePart(block) {
    const mimeType = block.mime_type || 'application/pdf';
    if (block.file_id) {
        return { file_data: { mime_type: mimeType, file_uri: block.file_id } };
    }
    if (block.url) {
        if (block.url.startsWith('gs://')) {
            return { file_data: { mime_type: mimeType, file_uri: block.url } };
        }
        return null;
    }
    if (block.base64) {
        return { inline_data: { mime_type: mimeType, data: block.base64 } };
    }
    return null;
}
function buildGeminiAudioPart(block) {
    const mimeType = block.mime_type || 'audio/wav';
    if (block.file_id) {
        return { file_data: { mime_type: mimeType, file_uri: block.file_id } };
    }
    if (block.url) {
        if (block.url.startsWith('gs://')) {
            return { file_data: { mime_type: mimeType, file_uri: block.url } };
        }
        // Gemini supports https URLs for audio via file_data
        return { file_data: { mime_type: mimeType, file_uri: block.url } };
    }
    if (block.base64) {
        return { inline_data: { mime_type: mimeType, data: block.base64 } };
    }
    return null;
}
function buildGeminiVideoPart(block) {
    const mimeType = block.mime_type || 'video/mp4';
    if (block.file_id) {
        return { file_data: { mime_type: mimeType, file_uri: block.file_id } };
    }
    if (block.url) {
        if (block.url.startsWith('gs://')) {
            return { file_data: { mime_type: mimeType, file_uri: block.url } };
        }
        // Gemini supports https URLs for video via file_data
        return { file_data: { mime_type: mimeType, file_uri: block.url } };
    }
    if (block.base64) {
        return { inline_data: { mime_type: mimeType, data: block.base64 } };
    }
    return null;
}
// =============================================================================
// OpenAI Audio Helpers
// =============================================================================
/** Supported OpenAI audio formats */
exports.OPENAI_SUPPORTED_AUDIO_FORMATS = ['wav', 'mp3'];
/**
 * Extract and validate OpenAI audio format from MIME type.
 * OpenAI Chat Completions API only supports wav and mp3.
 * @returns The audio format if supported, null otherwise
 */
function extractOpenAIAudioFormat(mimeType) {
    if (!mimeType)
        return null;
    const lower = mimeType.toLowerCase();
    if (lower === 'audio/wav' || lower === 'audio/x-wav' || lower === 'audio/wave') {
        return 'wav';
    }
    if (lower === 'audio/mpeg' || lower === 'audio/mp3') {
        return 'mp3';
    }
    return null;
}
/**
 * Build OpenAI input_audio content part from AudioContentBlock.
 * OpenAI only supports base64 encoded audio (no URLs).
 * @returns The OpenAI input_audio part or null if not supported
 */
function buildOpenAIAudioPart(block) {
    const format = extractOpenAIAudioFormat(block.mime_type);
    if (!format)
        return null;
    if (!block.base64)
        return null;
    return {
        type: 'input_audio',
        input_audio: {
            data: block.base64,
            format,
        },
    };
}
function sanitizeGeminiSchema(schema) {
    if (schema === null || schema === undefined)
        return schema;
    if (Array.isArray(schema))
        return schema.map((item) => sanitizeGeminiSchema(item));
    if (typeof schema !== 'object')
        return schema;
    const cleaned = {};
    for (const [key, value] of Object.entries(schema)) {
        if (key === 'additionalProperties' || key === '$schema' || key === '$defs' || key === 'definitions') {
            continue;
        }
        cleaned[key] = sanitizeGeminiSchema(value);
    }
    return cleaned;
}
// =============================================================================
// Anthropic Helpers
// =============================================================================
function hasAnthropicFileBlocks(messages) {
    for (const msg of messages) {
        const blocks = getMessageBlocks(msg);
        for (const block of blocks) {
            if (block.type === 'file' && block.file_id) {
                return true;
            }
        }
    }
    return false;
}
function mergeAnthropicBetaHeader(existing, entries) {
    const set = new Set();
    if (existing) {
        for (const e of existing.split(',')) {
            const trimmed = e.trim();
            if (trimmed)
                set.add(trimmed);
        }
    }
    for (const e of entries) {
        if (e)
            set.add(e);
    }
    return set.size > 0 ? Array.from(set).join(',') : undefined;
}
/**
 * Normalize Anthropic response content to internal format.
 */
function normalizeAnthropicContent(content, reasoningTransport) {
    if (!Array.isArray(content))
        return [];
    const blocks = [];
    for (const block of content) {
        const normalized = normalizeAnthropicContentBlock(block, reasoningTransport);
        if (normalized)
            blocks.push(normalized);
    }
    return blocks;
}
/**
 * Normalize a single Anthropic content block.
 * Handles thinking blocks with signature preservation.
 */
function normalizeAnthropicContentBlock(block, reasoningTransport) {
    if (!block || typeof block !== 'object')
        return null;
    // Handle thinking blocks - preserve signature for conversation continuity
    if (block.type === 'thinking') {
        if (reasoningTransport === 'text') {
            return { type: 'text', text: `<think>${block.thinking ?? ''}</think>` };
        }
        const result = { type: 'reasoning', reasoning: block.thinking ?? '' };
        // Preserve signature for multi-turn conversations (critical for Claude 4+)
        if (block.signature) {
            result.meta = { signature: block.signature };
        }
        return result;
    }
    if (block.type === 'text') {
        return { type: 'text', text: block.text ?? '' };
    }
    if (block.type === 'image' && block.source?.type === 'base64') {
        return {
            type: 'image',
            base64: block.source.data,
            mime_type: block.source.media_type,
        };
    }
    if (block.type === 'document' && block.source?.type === 'file') {
        return {
            type: 'file',
            file_id: block.source.file_id,
            mime_type: block.source.media_type,
        };
    }
    if (block.type === 'tool_use') {
        return {
            type: 'tool_use',
            id: block.id,
            name: block.name,
            input: block.input ?? {},
        };
    }
    if (block.type === 'tool_result') {
        return {
            type: 'tool_result',
            tool_use_id: block.tool_use_id,
            content: block.content,
            is_error: block.is_error,
        };
    }
    return null;
}
/**
 * Normalize Anthropic streaming delta.
 */
function normalizeAnthropicDelta(delta) {
    if (!delta) {
        return { type: 'text_delta', text: '' };
    }
    if (delta.type === 'thinking_delta') {
        return { type: 'reasoning_delta', text: delta.thinking ?? '' };
    }
    if (delta.type === 'input_json_delta') {
        return { type: 'input_json_delta', partial_json: delta.partial_json ?? '' };
    }
    return { type: 'text_delta', text: delta.text ?? '' };
}
