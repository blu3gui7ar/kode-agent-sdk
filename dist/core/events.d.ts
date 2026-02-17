import { AgentEvent, AgentEventEnvelope, ControlEvent, MonitorEvent, ProgressEvent, Timeline, Bookmark } from '../core/types';
import { Store } from '../infra/store';
type ControlEventType = ControlEvent['type'];
type MonitorEventType = MonitorEvent['type'];
type SubscriberChannel = 'progress' | 'control' | 'monitor';
export declare class EventBus {
    private cursor;
    private seq;
    private timeline;
    private subscribers;
    private controlEmitter;
    private monitorEmitter;
    private store?;
    private agentId?;
    private failedEvents;
    private readonly MAX_FAILED_BUFFER;
    constructor();
    setStore(store: Store, agentId: string): void;
    emitProgress(event: ProgressEvent): AgentEventEnvelope<ProgressEvent>;
    emitControl(event: ControlEvent): AgentEventEnvelope<ControlEvent>;
    emitMonitor(event: MonitorEvent): AgentEventEnvelope<MonitorEvent>;
    subscribeProgress(opts?: {
        since?: Bookmark;
        kinds?: Array<ProgressEvent['type']>;
    }): AsyncIterable<AgentEventEnvelope<ProgressEvent>>;
    subscribe(channels?: SubscriberChannel[], opts?: {
        since?: Bookmark;
        kinds?: Array<AgentEvent['type']>;
    }): AsyncIterable<AgentEventEnvelope>;
    onControl<T extends ControlEventType>(type: T, handler: (evt: Extract<ControlEvent, {
        type: T;
    }>) => void): () => void;
    onMonitor<T extends MonitorEventType>(type: T, handler: (evt: Extract<MonitorEvent, {
        type: T;
    }>) => void): () => void;
    getTimeline(since?: number): Timeline[];
    getCursor(): number;
    getLastBookmark(): Bookmark | undefined;
    syncCursor(bookmark?: Bookmark): void;
    reset(): void;
    private emit;
    private isCriticalEvent;
    private retryFailedEvents;
    getFailedEventCount(): number;
    flushFailedEvents(): Promise<void>;
    private notifySubscribers;
    private replayHistory;
    private iterableFor;
}
export {};
