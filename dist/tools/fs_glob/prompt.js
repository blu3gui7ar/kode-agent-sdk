"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT = exports.DESCRIPTION = void 0;
exports.DESCRIPTION = 'List files matching glob patterns';
exports.PROMPT = `Use this tool to locate files with glob patterns (e.g. "src/**/*.ts").

Guidelines:
- It respects sandbox boundaries and returns relative paths by default.
- Use standard glob syntax: * (any chars), ** (recursive directories), ? (single char).
- Set "dot" to true to include hidden files (starting with .).
- Results are limited to prevent overwhelming responses.

Safety/Limitations:
- All paths are restricted to the sandbox root directory.
- Large result sets are truncated with a warning.`;
