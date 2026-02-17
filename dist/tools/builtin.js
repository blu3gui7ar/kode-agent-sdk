"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtin = void 0;
const fs_read_1 = require("./fs_read");
const fs_write_1 = require("./fs_write");
const fs_edit_1 = require("./fs_edit");
const fs_glob_1 = require("./fs_glob");
const fs_grep_1 = require("./fs_grep");
const fs_multi_edit_1 = require("./fs_multi_edit");
const bash_run_1 = require("./bash_run");
const bash_logs_1 = require("./bash_logs");
const bash_kill_1 = require("./bash_kill");
const todo_read_1 = require("./todo_read");
const todo_write_1 = require("./todo_write");
const task_run_1 = require("./task_run");
exports.builtin = {
    fs: () => [fs_read_1.FsRead, fs_write_1.FsWrite, fs_edit_1.FsEdit, fs_glob_1.FsGlob, fs_grep_1.FsGrep, fs_multi_edit_1.FsMultiEdit],
    bash: () => [bash_run_1.BashRun, bash_logs_1.BashLogs, bash_kill_1.BashKill],
    todo: () => [todo_read_1.TodoRead, todo_write_1.TodoWrite],
    task: (templates) => {
        if (!templates || templates.length === 0) {
            return null;
        }
        return (0, task_run_1.createTaskRunTool)(templates);
    },
};
