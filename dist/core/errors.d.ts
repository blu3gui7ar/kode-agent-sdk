export type ResumeErrorCode = 'SESSION_NOT_FOUND' | 'AGENT_NOT_FOUND' | 'TEMPLATE_NOT_FOUND' | 'TEMPLATE_VERSION_MISMATCH' | 'SANDBOX_INIT_FAILED' | 'CORRUPTED_DATA';
export declare class ResumeError extends Error {
    readonly code: ResumeErrorCode;
    constructor(code: ResumeErrorCode, message: string);
}
export declare function assert(condition: any, code: ResumeErrorCode, message: string): asserts condition;
export declare class MultimodalValidationError extends Error {
    readonly code = "ERR_MULTIMODAL_INVALID";
    constructor(message: string);
}
export declare class UnsupportedContentBlockError extends Error {
    readonly code = "ERR_CONTENTBLOCK_UNSUPPORTED";
    constructor(message: string);
}
export declare class UnsupportedProviderError extends Error {
    readonly code = "ERR_PROVIDER_UNSUPPORTED";
    constructor(message: string);
}
export declare class ProviderCapabilityError extends Error {
    readonly code = "ERR_PROVIDER_CAPABILITY";
    constructor(message: string);
}
