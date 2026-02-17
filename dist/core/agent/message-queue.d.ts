import { ContentBlock, Message } from '../types';
import { ReminderOptions } from '../types';
export type PendingKind = 'user' | 'reminder';
export interface PendingMessage {
    message: Message;
    kind: PendingKind;
    metadata?: Record<string, any>;
}
export interface SendOptions {
    kind?: PendingKind;
    metadata?: Record<string, any>;
    reminder?: ReminderOptions;
}
export interface MessageQueueOptions {
    wrapReminder(content: string, options?: ReminderOptions): string;
    addMessage(message: Message, kind: PendingKind): void;
    persist(): Promise<void>;
    ensureProcessing(): void;
}
export declare class MessageQueue {
    private readonly options;
    private pending;
    constructor(options: MessageQueueOptions);
    send(content: string | ContentBlock[], opts?: SendOptions): string;
    flush(): Promise<void>;
}
