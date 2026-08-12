import {NextResponse} from "next/server";

import {llmapiRepository} from "@/modules/llmapis/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {llmapiProviderRegistry} from "@/modules/llmapis/server/provider";
import {hasher} from "@/utils/server/hasher";
import {BusinessError} from "@/handler/models";
import {getCache} from "@/utils/server/cache";

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
        const {id} = await records.params;
        const input = await request.json();
        console.debug("llmapi chat: ", input);

        const llmapi = await getCache(`llmapi_chat_${id}`,
            async () => {
                const entity = await llmapiRepository.get(id);
                if (!entity) {
                    throw new BusinessError('entity not found', "default.entity_not_found")
                        .withValue("id", id);
                }
                return {
                    provider: entity.provider,
                    key: entity.key,
                    iv: entity.iv,
                    content: {
                        config: entity.content.config,
                    },
                };
            }, {minute: 5});


        const provider = llmapi.provider as string;
        console.debug("use engine " + provider);
        const engine = llmapiProviderRegistry.records[provider];
        if (!engine) {
            throw new BusinessError('engine not found', "default.entity_not_found")
                .withValue("id", provider);
        }

        const apiKey = llmapi.key && llmapi.iv ?
            hasher.decrypt(llmapi.key, llmapi.iv) : "";

        const config = llmapi.content.config ?? {};

        const stream = await engine.run({
            type: provider,
            config,
            apiKey,
            signal: request.signal,
            input,
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
