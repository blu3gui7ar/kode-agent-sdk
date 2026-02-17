"use strict";
/**
 * Provider Adapter Types
 *
 * KODE Agent SDK uses Anthropic-style messages as the internal canonical format.
 * All providers act as adapters that convert to/from this format.
 *
 * Internal Flow:
 *   Internal Message[] (Anthropic-style ContentBlocks)
 *     -> Provider.formatMessages() -> External API format
 *     -> API call
 *     -> Response -> normalizeContent() -> Internal ContentBlock[]
 *
 * Provider-Specific Requirements:
 * - Anthropic: Preserve thinking signatures for multi-turn
 * - OpenAI Responses: Use previous_response_id for state
 * - DeepSeek/Qwen: Must NOT include reasoning_content in history
 * - Gemini: Use thinkingLevel (not thinkingBudget) for 3.x
 */
Object.defineProperty(exports, "__esModule", { value: true });
