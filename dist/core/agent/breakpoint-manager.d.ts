import { BreakpointState } from '../types';
export interface BreakpointEntry {
    state: BreakpointState;
    timestamp: number;
    note?: string;
}
export declare class BreakpointManager {
    private readonly onChange?;
    private current;
    private history;
    constructor(onChange?: ((previous: BreakpointState, next: BreakpointState, entry: BreakpointEntry) => void) | undefined);
    getCurrent(): BreakpointState;
    getHistory(): ReadonlyArray<BreakpointEntry>;
    set(state: BreakpointState, note?: string): void;
    reset(state?: BreakpointState): void;
}
