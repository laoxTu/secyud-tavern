import {Registerable} from "@/utils/register";
import {SseMessage} from "@/utils/sse/models";

export interface SseEvent extends Registerable {
    send: (message: SseMessage) => void;
}
