import {getInstance, ServerRegistry} from "@/plugins/server";
import {SseEvent} from "@/utils/sse/server/models";
import {SseMessage} from "@/utils/sse/models";


class SseManager extends ServerRegistry<SseEvent> {
    constructor(name: string) {
        super(name);
    }

    send<TM>(message: SseMessage<TM>) {
        for (const record of Object.values(this.records)) {
            try {
                record.send(message);
            } catch (error) {
                console.error(error);
            }
        }
    }
}

export const sseManager = getInstance<SseManager>("sse-manager", n => new SseManager(n));