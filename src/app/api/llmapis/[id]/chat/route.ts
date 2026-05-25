import {NextResponse} from "next/server";
import {interceptor} from "@/server/interceptor";
import {llmapiRepository, llmapiEngineRegistry} from "@/server/business/llmapis";
import {Hasher} from "@/server/hasher";
import {BusinessError} from "@/shared/errors";
import type {LlmInputModel} from "@/shared/business/slots";

/**
 * 调用指定 LLM API 进行流式对话
 * @pathParams { id:string }
 * @body LlmInputModel
 * @response ReadableStream SSE
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const input = records.body as LlmInputModel;

        const llmapi = await llmapiRepository.get(id);
        if (!llmapi) {
            throw new BusinessError('entity not found', "default.entity_not_found")
                .withValue("id", id);
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
