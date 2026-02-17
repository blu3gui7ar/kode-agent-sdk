"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoManager = void 0;
class TodoManager {
    constructor(opts) {
        this.opts = opts;
        this.stepsSinceReminder = 0;
    }
    get enabled() {
        return !!this.opts.service && !!this.opts.config?.enabled;
    }
    list() {
        return this.opts.service ? this.opts.service.list() : [];
    }
    async setTodos(todos) {
        if (!this.opts.service)
            throw new Error('Todo service not enabled for this agent');
        const prev = this.opts.service.list();
        await this.opts.service.setTodos(todos);
        this.publishChange(prev, this.opts.service.list());
    }
    async update(todo) {
        if (!this.opts.service)
            throw new Error('Todo service not enabled for this agent');
        const prev = this.opts.service.list();
        await this.opts.service.update(todo);
        this.publishChange(prev, this.opts.service.list());
    }
    async remove(id) {
        if (!this.opts.service)
            throw new Error('Todo service not enabled for this agent');
        const prev = this.opts.service.list();
        await this.opts.service.delete(id);
        this.publishChange(prev, this.opts.service.list());
    }
    handleStartup() {
        if (!this.enabled || !this.opts.config?.reminderOnStart)
            return;
        const todos = this.list().filter((todo) => todo.status !== 'completed');
        if (todos.length === 0) {
            this.sendEmptyReminder();
        }
        else {
            this.sendReminder(todos, 'startup');
        }
    }
    onStep() {
        if (!this.enabled)
            return;
        if (!this.opts.config?.remindIntervalSteps)
            return;
        if (this.opts.config.remindIntervalSteps <= 0)
            return;
        this.stepsSinceReminder += 1;
        if (this.stepsSinceReminder < this.opts.config.remindIntervalSteps)
            return;
        const todos = this.list().filter((todo) => todo.status !== 'completed');
        if (todos.length === 0)
            return;
        this.sendReminder(todos, 'interval');
    }
    publishChange(previous, current) {
        if (!this.opts.events)
            return;
        this.stepsSinceReminder = 0;
        this.opts.events.emitMonitor({ channel: 'monitor', type: 'todo_changed', previous, current });
        if (current.length === 0) {
            this.sendEmptyReminder();
        }
    }
    sendReminder(todos, reason) {
        this.stepsSinceReminder = 0;
        this.opts.events.emitMonitor({ channel: 'monitor', type: 'todo_reminder', todos, reason });
        this.opts.remind(this.formatTodoReminder(todos), { category: 'todo', priority: 'medium' });
    }
    sendEmptyReminder() {
        this.opts.remind('当前 todo 列表为空，如需跟踪任务请使用 todo_write 建立清单。', {
            category: 'todo',
            priority: 'low',
        });
    }
    formatTodoReminder(todos) {
        const bulletList = todos
            .slice(0, 10)
            .map((todo, index) => `${index + 1}. [${todo.status}] ${todo.title}`)
            .join('\n');
        const more = todos.length > 10 ? `\n… 还有 ${todos.length - 10} 项` : '';
        return `Todo 列表仍有未完成项：\n${bulletList}${more}\n请结合 todo_write 及时更新进度，不要向用户直接提及本提醒。`;
    }
}
exports.TodoManager = TodoManager;
