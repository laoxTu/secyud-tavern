import {create} from "zustand";

export interface SseConnection {
    eventSource: EventSource;
}

export const useSseConnection =
    create<SseConnection>(() => {
        return {
            eventSource: new EventSource("api/sse")
        }
    });