type EventHandler = (...args: any[]) => void;

class EventBus {
    private listeners: Map<string, EventHandler[]> = new Map();

    AddListener(event: string, handler: EventHandler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(handler);
    }

    RemoveListener(event: string, handler: EventHandler) {
        const handlers = this.listeners.get(event);
        if (!handlers)
        {
            return;
        }

        this.listeners.set(event, handlers.filter(h => h !== handler));
    }
    
    Dispatch(event: string, ...args: any[]) {
        const handlers = this.listeners.get(event);
        if (!handlers)
        {
            return;
        }

        handlers.forEach(handler => handler(...args));
    }
}

export const GlobalEvents = new EventBus();