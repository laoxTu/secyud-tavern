import {OpenAI} from "openai";
import {LlmapiEngine, LlmapiRequestContext} from "@/llmapis/server/engine-models";
import {engineName} from "../models";


export class DeepseekEngine implements LlmapiEngine {
    readonly id: string = engineName;

    iteratorToStream(iterator: AsyncIterator<Uint8Array>) {
        return new ReadableStream({
            async pull(controller) {
                const {value, done} = await iterator.next();
                if (done) {
                    controller.close();
                } else {
                    controller.enqueue(value);
                }
            },
        });
    }

    async run(context: LlmapiRequestContext) {
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: context.apiKey,
        });

        const completion = await openai.chat.completions.create({
            ...context.config,
            messages: context.messages,
            stream: true,
        });

        const encoder = new TextEncoder();

        async function* makeIterator() {
            // @ts-expect-error use chat completion
            for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    // 将每个数据块包装成 JSON 并发送
                    yield encoder.encode(JSON.stringify({content}) + '\n');
                }
            }
        }

        return this.iteratorToStream(makeIterator());
    }

}