import {interceptor} from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {SseEvent} from "@/utils/sse/server/models";
import {v4 as uuidv4} from "uuid";
import {sseManager} from "@/utils/sse/server/manager";

export const GET = interceptor.createRoute(
    async (request) => {
        const id = uuidv4();
        const unregisterEvent = () => {
            sseManager.unregister(id);
        };
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                const event: SseEvent = {
                    id,
                    send: (message) => {
                        controller.enqueue(
                            encoder.encode(`event: ${message.type}\ndata: ${JSON.stringify(message.data)}\n\n`)
                        );
                    }
                };
                sseManager.register(event);
                request.signal.addEventListener('abort', unregisterEvent);
            },
            cancel() {
                unregisterEvent();
            }
        });
        return new NextResponse(stream, {
            // 设置 Server-Sent Events (SSE) 相关的 headers
            headers: {
                "Connection": "keep-alive",
                "Content-Encoding": "none",
                "Cache-Control": "no-cache, no-transform",
                "Content-Type": "text/event-stream; charset=utf-8",
            },
        });
    }
)