"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderCapabilityError = exports.UnsupportedProviderError = exports.UnsupportedContentBlockError = exports.MultimodalValidationError = exports.ResumeError = void 0;
exports.assert = assert;
class ResumeError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'ResumeError';
    }
}
exports.ResumeError = ResumeError;
function assert(condition, code, message) {
    if (!condition) {
        throw new ResumeError(code, message);
    }
}
class MultimodalValidationError extends Error {
    constructor(message) {
        super(message);
        this.code = 'ERR_MULTIMODAL_INVALID';
        this.name = 'MultimodalValidationError';
    }
}
exports.MultimodalValidationError = MultimodalValidationError;
class UnsupportedContentBlockError extends Error {
    constructor(message) {
        super(message);
        this.code = 'ERR_CONTENTBLOCK_UNSUPPORTED';
        this.name = 'UnsupportedContentBlockError';
    }
}
exports.UnsupportedContentBlockError = UnsupportedContentBlockError;
class UnsupportedProviderError extends Error {
    constructor(message) {
        super(message);
        this.code = 'ERR_PROVIDER_UNSUPPORTED';
        this.name = 'UnsupportedProviderError';
    }
}
exports.UnsupportedProviderError = UnsupportedProviderError;
class ProviderCapabilityError extends Error {
    constructor(message) {
        super(message);
        this.code = 'ERR_PROVIDER_CAPABILITY';
        this.name = 'ProviderCapabilityError';
    }
}
exports.ProviderCapabilityError = ProviderCapabilityError;
