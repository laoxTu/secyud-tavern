'use client';
import {SlotModel} from "@/modules/stories/models";
import {
    check,
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
import {slotContext} from "@/modules/stories/client/context";
import {SlotHistory} from "@/modules/models";
import {BusinessError} from "@/handler/models";
import {llmapiProviderRegistry} from "@/modules/llmapis/client/provider";
import {readSseStream, setAbort} from "@/utils";
import {LlmapiOutputContext} from "@/modules/llmapis/client/provider-models";
import {SlotMessageOutput} from "@/modules/models/message";
import {post} from "@/client";
import {LlmapiModel} from "@/modules/llmapis/models";


class SlotInitializerRegistry extends ClientRegistry<SlotInitializer> {
    constructor() {
        super("SlotInitializer");
    }

    async initialize(
        {slot}: {
            slot?: SlotModel
        }) {
        slot = check.slot(slot);
        const context: SlotInitializeContext = {
            properties: {},
            slot,
        }
        await this.use(provider =>
            provider.onInitialize(context));
        console.debug("[slot]: ", slot);
        slot.initialized = true;
    }
}

class LlmapiOutputProcesserRegistry extends ClientRegistry<LlmapiOutputProcesser> {
    constructor() {
        super("LlmapiOutputProcesser");
    }

    async processOutput(
        {history, slot}: {
            history: SlotHistory,
            slot?: SlotModel
        }) {
        slot = check.slot(slot);
        const outputContext: LlmapiResultContext = {
            properties: {},
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

    async* requestReply(
        {history, args, signal, slot}: {
            history: SlotHistory,
            args?: any,
            signal: (c: AbortController) => Promise<void>,
            slot?: SlotModel
        }) {
        slot = check.slot(slot);
        const {llmapi, provider, maxIterations} = this.getLlmapiProvider(slot.llmapi);
        const outputs: SlotMessageOutput[] = [];
        history.outputId = history.outputs.length;
        history.outputs.push(outputs);
        let iterations = maxIterations;
        while (iterations > 0) {
            iterations--;
            const current = outputs.length > 0;

            const {input} = await this
                .processInput({args, history, current, slot});

            const reply = new AbortController();
            await signal(reply);
            setAbort(reply.signal, () => {
                console.debug("[slot]: reset signal");
                iterations = 0;
            });
            console.debug(`[slot]: iterations ${iterations}`);
            const response = await post(`/llmapis/{id}/chat`, input,
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
            outputs.push(output);
            const content: Record<string, any> = {};
            const setOutput =
                async (stream: boolean, delta: any) => {
                    const context: LlmapiOutputContext = {
                        properties: content,
                        message: output,
                        output: delta,
                        stream: stream,
                        slot,
                        stopped: false,
                    };
                    await provider.generateOutput(context);
                    if (context.stopped) {
                        iterations = 0;
                    }
                    return {outputs, output};
                };
            if (slot.llmapi.stream) {
                if (response.body) {
                    for await (const chunk of readSseStream(response.body)) {
                        if (reply.signal.aborted) {
                            console.warn('[HistoryChatbox] reply canceled');
                            break;
                        }
                        yield setOutput(true, chunk);
                    }
                }
            } else {
                yield setOutput(true, response);
            }
        }
    }

    async processInput(
        {history, current, args, slot}: {
            history: SlotHistory,
            args?: any,
            current: boolean,
            slot?: SlotModel
        }) {
        slot = check.slot(slot);
        const {provider} = this.getLlmapiProvider(slot.llmapi);
        const histories = slot.histories;
        const context: LlmapiInputContext = {
            slot,
            history,
            properties: {args},
            current,
            histories: [],
            contentHandlers: [],
            injectorCreators: [],
        };
        // 从最后一个 summary 历史开始发送（更早的历史已总结过）；无 summary 时补开场白作为起点
        let start = histories.slice(0, histories.length - 1)
            .findLastIndex(u => u.summary);
        if (start === -1) {
            const opening = slotUtils.getOpening(slot);
            context.histories.push(opening);
        }

        for (let i = Math.max(start, 0); i < histories.length; i++) {
            context.histories.push(histories[i]);
        }

        console.debug("[slot](input): ", context);

        await conversationManager.inputProcesser.use(provider =>
            provider.onProcessInput(context));


        return await provider.generateInput(context);
    }

    private getLlmapiProvider(llmapi: LlmapiModel) {
        // 工具循环：输出还带 toolCalls 就续接当前输出再请求，直到模型不再调工具。
        const providerName = llmapi.provider;
        if (!providerName) {
            throw new BusinessError(`[slot](input): llmapi provider is not set. (${llmapi.code})`);
        }
        const provider = llmapiProviderRegistry.records[providerName];
        if (!provider) {
            throw new BusinessError(`[slot](input): llmapi provider is not registered. (${providerName})`);
        }
        return {
            llmapi, provider,
            config: llmapi.content.config,
            maxIterations: Math.max(2, llmapi.content.maxIterations ?? 20)
        };
    }
}

class SlotContentRendererRegistry extends ClientRegistry<SlotContentRenderer> {
    constructor() {
        super("SlotContentRenderer");
    }

    async renderContent(
        {history, slot}: {
            history: SlotHistory,
            slot?: SlotModel
        }) {
        slot = check.slot(slot);
        if (!slot.initialized) {
            // 副作用问题, 开发模式会渲染两次, 第一次渲染会读到第二次设置的slot.
            // 它还未初始化就会引发错误, 这里直接停止第一次渲染. 让第二次渲染自己渲染.
            return;
        }
        const {
            postMessageContent,
            postMessageVariables,
        } = slotContext;
        const context: RenderContext = {
            properties: {},
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

    async renderStream(
        {history, slot}: {
            history: SlotHistory,
            slot?: SlotModel
        }) {
        slot = check.slot(slot);
        const context: RenderContext = {
            properties: {},
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

