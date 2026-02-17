"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRunner = void 0;
class ToolRunner {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.active = 0;
        this.queue = [];
        if (!Number.isFinite(concurrency) || concurrency <= 0) {
            throw new Error('ToolRunner requires a positive concurrency limit');
        }
    }
    run(task) {
        return new Promise((resolve, reject) => {
            const execute = () => {
                this.active += 1;
                task()
                    .then(resolve, reject)
                    .finally(() => {
                    this.active -= 1;
                    this.flush();
                });
            };
            if (this.active < this.concurrency) {
                execute();
            }
            else {
                this.queue.push(execute);
            }
        });
    }
    clear() {
        this.queue.length = 0;
    }
    flush() {
        if (this.queue.length === 0)
            return;
        if (this.active >= this.concurrency)
            return;
        const next = this.queue.shift();
        if (next)
            next();
    }
}
exports.ToolRunner = ToolRunner;
