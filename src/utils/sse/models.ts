export interface SseMessage<T = any> {
    type: string;
    data: T;
}