import {LlmEngine, LlmRequestContext} from ".";
import {name} from "@/shared/business/llmapis/engines/deepseek";
import {OpenAI} from "openai";


export class DeepseekEngine implements LlmEngine {
    readonly id: string = name;

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

    async run(context: LlmRequestContext) {
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