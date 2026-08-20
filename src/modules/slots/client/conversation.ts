'use client';
import {SlotModel} from "@/modules/slots/models";
import {
    check,
    LlmapiHistory,
    LlmapiInputContext,
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    LlmapiResultContext,
    RenderContext,
    SlotContentRenderer,
    SlotInitializeContext,
    SlotInitializer,
    SlotStreamRenderer,
    slotUtils,
} from "./conversation-models";
import {ClientRegistry} from "@/plugins/client";
import {slotContext} from "@/modules/slots/client/context";
import {SlotHistory} from "@/modules/models";
import {BusinessError} from "@/handler/models";
import {llmapiProviderRegistry} from "@/modules/llmapis/client/provider";
import {readStream} from "@/utils";
import {LlmapiOutputContext} from "@/modules/llmapis/client/provider-models";
import {SlotMessageOutput} from "@/modules/models/message";
import {post} from "@/client";
import {LlmapiModel} from "@/modules/llmapis/models";


class SlotInitializerRegistry extends ClientRegistry<SlotInitializer> {
    constructor() {
        super("SlotInitializer");
    }

    async initialize(slot?: SlotModel) {
        slot = check.slot(slot);
        const context: SlotInitializeContext = {
            content: {},
            slot,
        }
        await this.use(provider =>
            provider.onInitialize(context));
    }
}

class LlmapiOutputProcesserRegistry extends ClientRegistry<LlmapiOutputProcesser> {
    constructor() {
        super("LlmapiOutputProcesser");
    }

    async processOutput(history: SlotHistory,
                        slot?: SlotModel) {
        slot = check.slot(slot);
        const outputContext: LlmapiResultContext = {
            content: {},
            history,
            slot,
        };
        // 解析输出，填充一些选项或处理，这里应该会缓存世界书
        await conversationManager.outputProcesser.use(provider =>
            provider.onProcessOutput(outputContext));
    }
}

class LlmapiInputProcesserRegistry extends ClientRegistry<LlmapiInputProcesser> {
    constructor() {
        super("LlmapiInputProcesser");
    }

    getLlmapiProvider(llmapi: LlmapiModel) {
        // 工具循环：输出还带 toolCalls 就续接当前输出再请求，直到模型不再调工具。
        const providerName = llmapi.provider;
        if (!providerName) {
            throw new BusinessError(`[slot](input): llmapi provider is not set. (${llmapi.code})`);
        }
        const provider = llmapiProviderRegistry
            .records[providerName];
        if (!provider) {
            throw new BusinessError(`[slot](input): llmapi provider is not registered. (${providerName})`);
        }
        return {
            llmapi, provider,
            config: llmapi.content.config,
            maxIterations: Math.max(2, llmapi.content.maxIterations ?? 20)
        };
    }

    async* requestReply(history: SlotHistory,
                        signal: (c: AbortController) => Promise<void>,
                        slot?: SlotModel) {
        slot = check.slot(slot);
        const {llmapi, provider, maxIterations} = this.getLlmapiProvider(slot.llmapi);
        const outputs: SlotMessageOutput[] = [];
        history.outputId = history.outputs.length;
        history.outputs.push(outputs);
        let iterations = maxIterations;
        while (iterations > 0) {
            const current = outputs.length > 0;

            const {input} = await this
                .processInput(history, current, slot);

            const reply = new AbortController();
            await signal(reply);
            const response: Response = await post(`/llmapis/{id}/chat`, input,
                {
                    params: {id: llmapi.id},
                    signal: reply.signal
                }
            );

            const output: SlotMessageOutput = {
                content: "",
                thought: "",
                variables: [],
                properties: {}
            };
            if (response.body) {
                outputs?.push(output);
                const cache: Record<string, any> = {};
                for await (const chunk of readStream(response.body)) {
                    if (reply.signal.aborted) {
                        console.warn('[HistoryChatbox] reply canceled');
                        break;
                    }
                    const context: LlmapiOutputContext = {
                        content: cache,
                        message: output,
                        output: chunk,
                        slot,
                        stopped: false,
                    };
                    await provider.generateOutput(context);
                    yield {outputs, output};
                    if (context.stopped) {
                        iterations = 0;
                    }
                }
            }
        }
    }

    async processInput(history: SlotHistory,
                       current: boolean,
                       slot?: SlotModel) {
        slot = check.slot(slot);
        const {provider} = this.getLlmapiProvider(slot.llmapi);
        const histories = slot.histories;
        const context: LlmapiInputContext = {
            slot,
            history,
            content: {},
            current,
            histories: [],
            contentHandlers: [],
        };
        // 从最后一个 summary 历史开始发送（更早的历史已总结过）；无 summary 时补开场白作为起点
        let start = histories.slice(0, histories.length - 1)
            .findLastIndex(u => u.summary);
        if (start === -1) {
            const opening = slotUtils.getOpening(slot);
            context.histories.push(map(opening));
        }

        for (let i = Math.max(start, 0); i < histories.length; i++) {
            context.histories.push(map(histories[i]));
        }

        console.log("[slot](input): ", context);

        await conversationManager.inputProcesser.use(provider =>
            provider.onProcessInput(context));


        return await provider.generateInput(context);

        function map(storyHistory: SlotHistory): LlmapiHistory {
            return {
                ...storyHistory,
                content: {}
            }
        }
    }
}

class SlotContentRendererRegistry extends ClientRegistry<SlotContentRenderer> {
    constructor() {
        super("SlotContentRenderer");
    }

    async renderContent(history: SlotHistory, slot?: SlotModel) {
        slot = check.slot(slot);
        const {
            postMessageContent,
            postMessageVariables,
        } = slotContext;
        const context: RenderContext = {
            content: {},
            history,
            slot,
            contentHandlers: []
        };
        await conversationManager.contentRenderer
            .use(provider =>
                provider.onRenderContent(context));
        await postMessageContent(history,
            async (str, type, role) =>
                slotUtils.handleContent(context.contentHandlers, {
                    str, type, role
                })
        );
        postMessageVariables(history);
    }
}

class SlotStreamRendererRegistry extends ClientRegistry<SlotStreamRenderer> {
    constructor() {
        super("SlotStreamRenderer");
    }

    async renderStream(history: SlotHistory, slot?: SlotModel) {
        slot = check.slot(slot);
        const context: RenderContext = {
            content: {},
            history,
            slot,
            contentHandlers: []
        };
        const {
            postMessageContent,
        } = slotContext;
        await conversationManager.streamRenderer
            .use(provider =>
                provider.onRenderStream(context));
        await postMessageContent(history,
            async (str, type, role) =>
                slotUtils.handleContent(context.contentHandlers, {
                    str, type, role
                })
        );
    }
}

export const conversationManager = {
    // 加载存档后需要做的事情，一般是初始化资源，将该排序的排序，该请求的请求。
    initializer: new SlotInitializerRegistry(),
    // 输入处理，用于处理输入，这里输入各个注册的是有依赖顺序的，否则一些字段不存在。
    inputProcesser: new LlmapiInputProcesserRegistry(),
    // 处理输出，有些东西需要保存，这里进行保存的准备。
    outputProcesser: new LlmapiOutputProcesserRegistry(),
    // 渲染画面，这里是非流式的渲染画面，可以重载一些东西。
    contentRenderer: new SlotContentRendererRegistry(),
    // 流式渲染，这里快速替换内容，不宜处理复杂逻辑。
    streamRenderer: new SlotStreamRendererRegistry(),
};

