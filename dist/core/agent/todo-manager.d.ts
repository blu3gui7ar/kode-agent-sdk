import { TodoService, TodoInput, TodoItem } from '../todo';
import { TodoConfig } from '../template';
import { ReminderOptions } from '../types';
import { EventBus } from '../events';
export interface TodoManagerOptions {
    service?: TodoService;
    config?: TodoConfig;
    events: EventBus;
    remind: (content: string, options?: ReminderOptions) => void;
}
export declare class TodoManager {
    private readonly opts;
    private stepsSinceReminder;
    constructor(opts: TodoManagerOptions);
    get enabled(): boolean;
    list(): TodoItem[];
    setTodos(todos: TodoInput[]): Promise<void>;
    update(todo: TodoInput): Promise<void>;
    remove(id: string): Promise<void>;
    handleStartup(): void;
    onStep(): void;
    private publishChange;
    private sendReminder;
    private sendEmptyReminder;
    private formatTodoReminder;
}
