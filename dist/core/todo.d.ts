import { Store } from '../infra/store';
export type TodoStatus = 'pending' | 'in_progress' | 'completed';
export interface TodoItem {
    id: string;
    title: string;
    status: TodoStatus;
    assignee?: string;
    notes?: string;
    createdAt: number;
    updatedAt: number;
}
export interface TodoSnapshot {
    todos: TodoItem[];
    version: number;
    updatedAt: number;
}
export type TodoInput = Omit<TodoItem, 'createdAt' | 'updatedAt'> & {
    createdAt?: number;
    updatedAt?: number;
};
export declare class TodoService {
    private readonly store;
    private readonly agentId;
    private snapshot;
    constructor(store: Store, agentId: string);
    load(): Promise<void>;
    list(): TodoItem[];
    setTodos(todos: TodoInput[]): Promise<void>;
    update(todo: TodoInput): Promise<void>;
    delete(id: string): Promise<void>;
    private validateTodos;
    private persist;
    private normalize;
}
