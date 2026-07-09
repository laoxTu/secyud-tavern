import {OpenAI} from "openai";
import {LlmapiEngine, LlmapiRequestContext} from "@/modules/llmapis/server/engine-models";
import {OpenAIConfigModel, engineName} from "../models";
import {Stream} from "openai/streaming";


export async function generateOpenAIReadableStreamReply(context: LlmapiRequestContext, parameter: any, openai: OpenAI) {
    const externalSignal = context.signal;
    const encoder = new TextEncoder();
    // 流式请求
    if (parameter.stream) {
        const completion: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> =
            await openai.chat.completions.create(parameter) as any;
        return new ReadableStream({
            async start(controller) {
                // 4. 监听外部 abort 信号（前端断开时触发）
                const onAbort = () => {
                    console.warn('client abort the api stream.');
                    completion.controller.abort();
                    controller.close();
                };

                // 关键：这里的 signal 是从外部传入的
                // 需要从外层获取 request 的 abort signal
                // 这里假设外部有 signal 变量
                externalSignal.addEventListener('abort', onAbort);

                try {
                    for await (const chunk of completion) {
                        if (externalSignal.aborted) {
                            break;
                        }
                        const delta = chunk.choices[0]?.delta;
                        if (delta) {
                            controller.enqueue(encode(delta));
                        }
                    }
                    controller.close();
                } catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') {
                        console.warn('client abort the api stream. (Abort Error)');
                    } else {
                        console.error('流处理出错:', error);
                        controller.error(error);
                    }
                } finally {
                    externalSignal.removeEventListener('abort', onAbort);
                }
            }
        });
    }

    // 非流式模拟
    return new ReadableStream({
        async start(controller) {
            // 心跳定时器
            const heartbeatInterval = setInterval(() => {
                controller.enqueue(encode({content: ""})); // 发送心跳
            }, 300);
            try {
                const completion = await openai.chat.completions.create(parameter as any);
                const message = completion.choices[0]?.message ?? {
                    content: ""
                };

                clearInterval(heartbeatInterval);

                // 发送完整结果 逗号做分隔符，方便解析
                controller.enqueue(encode(message));
                controller.close();

            } catch (e) {
                clearInterval(heartbeatInterval);
                controller.error(e);
            }
        }
    });

    function encode(value: any) {
        return encoder.encode(`${JSON.stringify(value)}\n\n`);
    }
}

export class OpenAIEngine implements LlmapiEngine {
    readonly id: string = engineName;

    async run(context: LlmapiRequestContext) {
        const config: OpenAIConfigModel = context.config;
        const openai = new OpenAI({
            baseURL: config.url,
            apiKey: context.apiKey,
        });
        const parameter: any = {
            ...config.parameters,
            messages: context.messages.map(u => ({
                role: u.role,
                content: u.content,
            })),
        };

        if (!config.parameters.max_tokens) {
            parameter.max_tokens = undefined;
        }

        return await generateOpenAIReadableStreamReply(context, parameter, openai);
    }

}