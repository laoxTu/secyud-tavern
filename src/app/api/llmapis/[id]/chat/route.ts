import {NextResponse} from "next/server";

import {llmapiRepository } from "@/llmapis/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {llmapiEngineRegistry} from "@/llmapis/server/engine";
import {Hasher} from "@/utils/hasher";
import {BusinessError} from "@/handler/models";
import {eq} from "drizzle-orm";
import {LlmInputModel} from "@/slots/models";

/**
 * 调用指定 LLM API 进行流式对话
 * @pathParams { id:string }
 * @body LlmInputModel
 * @response {ReadableStream} 返回SSE流，Content-Type为text/event-stream
 * @response-header Content-Type = "text/event-stream"
 * @response-header Cache-Control = "no-cache"
 * @response-header Connection = "keep-alive"
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const input = records.body as LlmInputModel;

        const llmapi = await llmapiRepository.get(id, true, (table) => eq(table.code, id));
        if (!llmapi) {
            throw new BusinessError('entity not found', "default.entity_not_found")
                .withValue("code", id);
        }

        const engine = llmapiEngineRegistry.records[llmapi.code];
        if (!engine) {
            throw new BusinessError('engine not found', "default.entity_not_found")
                .withValue("engine", llmapi.code);
        }

        const apiKey = llmapi.key ? Hasher.instance.decrypt(llmapi.key) : "";

        const config = llmapi.content.config?.parameters ?? {};

        const stream = await engine.run({
            messages: input.messages,
            type: llmapi.code,
            config,
            apiKey,
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    }
);
