"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakpointManager = void 0;
class BreakpointManager {
    constructor(onChange) {
        this.onChange = onChange;
        this.current = 'READY';
        this.history = [];
    }
    getCurrent() {
        return this.current;
    }
    getHistory() {
        return this.history;
    }
    set(state, note) {
        if (this.current === state)
            return;
        const entry = {
            state,
            timestamp: Date.now(),
            note,
        };
        const previous = this.current;
        this.current = state;
        this.history.push(entry);
        if (this.onChange) {
            this.onChange(previous, state, entry);
        }
    }
    reset(state = 'READY') {
        this.current = state;
        this.history = [];
    }
}
exports.BreakpointManager = BreakpointManager;
