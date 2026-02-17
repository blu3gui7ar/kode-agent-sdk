"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT = exports.DESCRIPTION = void 0;
exports.DESCRIPTION = 'Get output from a background bash shell';
exports.PROMPT = `Fetch stdout/stderr from a background bash session started via bash_run with "background": true.

Guidelines:
- Provide the shell_id returned by bash_run to retrieve incremental logs.
- Check the status to see if the process is still running or completed.
- Output includes both stdout and stderr streams.

Safety/Limitations:
- Only processes started in the current session are accessible.
- Process history is not persisted across SDK restarts.`;
