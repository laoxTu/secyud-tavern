import {OpenAI} from "openai";
import {LlmapiProvider, LlmapiRequestContext} from "@/modules/llmapis/server/provider-models";
import {engineName, OpenAIConfigModel} from "../models";
import {Stream} from "openai/streaming";

export async function generateOpenAIReadableStreamReply(
    context: LlmapiRequestContext,
    parameter: OpenAI.ChatCompletionCreateParamsNonStreaming,
    openai: OpenAI) {
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
                        const choice = chunk.choices[0];
                        if (choice.delta || choice.finish_reason) {
                            controller.enqueue(encode({
                                ...choice.delta,
                                finish_reason: choice.finish_reason
                            }));
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

    // 非流式请求也包装成流：完成前靠 300ms 心跳空包保活，让前端持续收到数据
    return new ReadableStream({
        async start(controller) {
            // 心跳定时器
            const heartbeatInterval = setInterval(() => {
                controller.enqueue(encode({content: ""})); // 发送心跳
            }, 300);
            try {
                const completion = await openai.chat.completions.create(parameter as any);
                const choice = completion.choices[0];

                clearInterval(heartbeatInterval);

                controller.enqueue(encode({...choice.message, finish_reason: choice.finish_reason}));
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

export function mapToOpenAIMessage(context: LlmapiRequestContext) {
    const res: OpenAI.ChatCompletionCreateParamsNonStreaming = {
        ...context.config.parameters,
        ...context.input
    };

    return res;
}

export class OpenAIProvider implements LlmapiProvider {
    readonly id: string = engineName;

    async run(context: LlmapiRequestContext) {
        const config: OpenAIConfigModel = context.config;
        const openai = new OpenAI({
            baseURL: config.url,
            apiKey: context.apiKey,
        });
        const parameter = mapToOpenAIMessage(context);

        return await generateOpenAIReadableStreamReply(context, parameter, openai);
    }

}