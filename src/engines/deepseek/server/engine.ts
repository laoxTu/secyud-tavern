import {OpenAI} from "openai";
import {LlmapiEngine, LlmapiRequestContext} from "@/llmapis/server/engine-models";
import {DeepseekConfigModel, engineName} from "../models";
import {Stream} from "openai/streaming";


export class DeepseekEngine implements LlmapiEngine {
    readonly id: string = engineName;

    async run(context: LlmapiRequestContext) {
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: context.apiKey,
        });
        const config: DeepseekConfigModel = context.config;
        const parameter = {
            ...config.parameters,
            messages: context.messages.map(u => ({
                role: u.role,
                content: u.content,
            })),
        };

        // 流式请求
        if (parameter.stream) {
            const completion: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> =
                await openai.chat.completions.create(parameter as any) as any;
            return new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of completion) {
                            const content = chunk.choices[0]?.delta?.content || '';
                            if (content) {
                                // 每个 chunk 作为一个字符串块推送
                                controller.enqueue(content);
                            }
                        }
                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                }
            });
        }

        // 非流式模拟
        return new ReadableStream({
            async start(controller) {
                // 心跳定时器
                const heartbeatInterval = setInterval(() => {
                    controller.enqueue(''); // 发送心跳
                }, 300);
                try {
                    const completion = await openai.chat.completions.create(parameter as any);
                    const reply = completion.choices[0]?.message?.content || "";

                    clearInterval(heartbeatInterval);

                    // 发送完整结果
                    controller.enqueue(reply);
                    controller.close();

                } catch (e) {
                    clearInterval(heartbeatInterval);
                    controller.error(e);
                }
            }
        });
    }

}