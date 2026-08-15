import React, {useState, RefObject, useEffect, useRef} from "react";
import {
    CornerDownLeftIcon,
    SquareStopIcon
} from "lucide-react";
import {
    InputGroup,
    InputGroupAddon, InputGroupButton, InputGroupText,
    InputGroupTextarea
} from "@/components/ui/input-group";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {
    getLastHistory,
    getSlotAndHistories,
    invokeCallback, registerCallback,
    SlotDataModel,
    updateStoryHistory,
    useSlotContext
} from "@/modules/slots/client/models";
import {StoryHistory, StoryInputMessage, StoryOutputMessage} from "@/modules/stories/models";
import {extractVariableChanges, SlotModel} from "@/modules/slots/models";
import {post} from "@/client";
import {
    generateRenderData,
    LlmapiInputContext, LlmapiOutputContext, LlmapiResultContext,
    RenderContext, renderData,
} from "@/modules/slots/client/conversation-models";
import {
    conversationManager,
    generateCurrentVariables,
    generateInputBuildContext,
    getOpeningHistory
} from "@/modules/slots/client/conversation";
import {useTranslations} from "next-intl";
import {readStream, tryGetLastItem} from "@/utils";
import {useErrorHandler} from "@/handler/client/error";
import {handleHistoryPageChange, useHistoryPageState} from "@/modules/slots/client/history-pager";
import {submitTargetFormOnKey} from "@/business/client";
import {llmapiProviderRegistry} from "@/modules/llmapis/client/provider";

export const signalName = "ReplyAbortController";

export function getReplyAbortController(slot: SlotModel, signal: string) {
    return slot.content[signal] as AbortController
}

export function setReplyAbortController(slot: SlotModel, signal: string) {
    let controller = getReplyAbortController(slot, signal);
    if (controller) {
        controller.abort("reset");
    }
    controller = new AbortController();
    slot.content[signal] = controller;
    return controller;
}

export async function generateLlmapiReply(ctx: RefObject<SlotDataModel>) {
    await invokeCallback(ctx, "generateLlmapiReply");
}

export async function* requestLlmapiReply(
    {slot, history, signal}: {
        slot: SlotModel,
        history: StoryHistory,
        signal: string,
    },) {
    // 工具循环：输出还带 toolCalls 就续接当前输出再请求，直到模型不再调工具。
    const llmapi = slot.llmapi;
    const llmapiProvider = llmapiProviderRegistry.records[llmapi.provider!];
    const outputs: StoryOutputMessage[] = [];
    history.outputId = history.outputs.length;
    history.outputs.push(outputs);
    let iterations = Math.max(2, llmapi.content.maxIterations);
    while (iterations > 0) {
        const current = outputs.length > 0;
        const inputContext: LlmapiInputContext = {
            slot,
            content: {},
            history,
            histories: [],
            contentHandlers: [],
            current,
            config: llmapi.content.config,
        };

        generateInputBuildContext(inputContext);

        await conversationManager.inputProcesser.use(provider =>
            provider.onProcessInput(inputContext));

        const reply = setReplyAbortController(slot, signal);
        const {input} = await llmapiProvider.generateInput(inputContext);
        const response: Response = await post(`/llmapis/{id}/chat`, input,
            {
                params: {id: llmapi.id},
                signal: reply.signal
            }
        );

        const output: StoryOutputMessage = {
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
                await llmapiProvider.generateOutput(context);
                yield {outputs, output};
                if (context.stopped) {
                    iterations = 0;
                }
            }
        }
    }
}


export function HistoryChatbox() {
    const [output, setOutput] = useState(false);
    const {handleError} = useErrorHandler();
    const ctx = useSlotContext();
    const t = useTranslations();
    const [inputText, setInputText] = useState("");
    const [summary, setSummary] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // 生成回复，并持续渲染，直接调用将会新生成一个
    const generateLlmapiReply = async () => {
        try {
            let {slot, histories} = getSlotAndHistories(ctx);
            const iframe = ctx.current.iframe.current;
            if (!iframe) {
                console.error('[slot]: failed to get history or iframe');
                return;
            }
            setOutput(true);
            const history = getLastHistory(slot);
            await handleHistoryPageChange(ctx, {
                curPage: histories.length,
                curOutputPage: history.outputId
            });

            for await (const {} of requestLlmapiReply(
                {
                    slot,
                    history,
                    signal: signalName,
                })) {

                // 流式渲染条件
                // 故事页面为最新，输出页面为最新
                const {page} = useHistoryPageState.getState();
                if (page.cur === histories.length &&
                    history.outputId === history.outputs.length - 1) {
                    const streamContext: RenderContext = {
                        content: {},
                        data: generateRenderData(history),
                        window: iframe.contentWindow!,
                        document: iframe.contentDocument!,
                        history: history,
                        slot: slot,
                        variables: generateCurrentVariables(history)
                    };
                    await conversationManager.streamRenderer
                        .use(provider =>
                            provider.onRenderStream(streamContext));
                    renderData(streamContext, "content", streamContext.data);
                }
                await handleHistoryPageChange(ctx, {
                    curPage: histories.length,
                    curOutputPage: history.outputId
                });
            }

            const outputContext: LlmapiResultContext = {content: {}, history: history, slot: slot};
            // 解析输出，填充一些选项或处理，这里应该会缓存世界书
            await conversationManager.outputProcesser.use(provider =>
                provider.onProcessOutput(outputContext));
            await updateStoryHistory(slot.story.id, history);
        } catch
            (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('user abort reply');
                return; // 或者不处理
            }
            handleError(err);
        } finally {
            await handleHistoryPageChange(ctx, {curPage: ctx.current.slot?.story.histories?.length ?? 0});
            setOutput(false);
        }
    };

// 发送输入内容，并尝试创建新历史
    const createStoryHistory = async () => {
        try {
            if (output || !inputText?.trim()) return;
            const {slot, histories} = getSlotAndHistories(ctx);
            const iframe = ctx.current.iframe.current;
            if (!iframe) {
                console.error('[HistoryChatbox] failed to get iframe');
                return;
            }
            let variables = undefined;
            let input = inputText.trim();
            if (iframe.contentWindow) {
                const window = iframe.contentWindow as any;
                (window?.userInput?.inputBuilders as {
                    id: string, sequence?: number,
                    build: (text: string) => string,
                }[])
                    ?.sort((a, b) =>
                        (a.sequence ?? 0) - (b.sequence ?? 0))
                    .forEach((builder) => {
                        input = builder.build(input);
                    });
            }

            // 如果上一个历史还未输出，合并到上一个历史。
            // 如果上一个历史已经输出，创建新的历史。
            // 如果还没有历史，使用开场白变量。
            let history = tryGetLastItem(histories)!;
            if (history) {
                if (history.outputs.length > 0) {
                    variables = generateCurrentVariables(history);
                }
            } else {
                const openingHistory = getOpeningHistory(slot);
                variables = generateCurrentVariables(openingHistory);
            }
            if (variables) {
                history = {
                    id: 0,
                    disabled: false,
                    code: input.substring(0, 10),
                    name: "0",
                    inputs: [],
                    summary: summary,
                    outputId: -1,
                    outputs: [],
                    variables: variables
                };
                histories.push(history);
            }

            const inputs = history.inputs;
            const message: StoryInputMessage = {
                id: (tryGetLastItem(inputs)?.id ?? 0) + 1,
                content: '',
                variables: [],
                properties: {}
            };
            extractVariableChanges(message, input);
            inputs.push(message);

            // 用户输入后立即跳转到最新页面，先渲染用户输入。
            await handleHistoryPageChange(ctx, {curPage: histories.length});

            if (variables) {
                const {id} = await post('/stories/{id}/entries/{entryType}', history,
                    {params: {id: slot.story.id, entryType: 'history'}}
                );
                history.id = id;
                history.name = String(id);
            }
        } catch (err) {
            handleError(err);
        }
        setSummary(false);
        setInputText("");
        // 创建并保存历史后需要生成回复
        await generateLlmapiReply();
    };

    useEffect(() => {
        registerCallback(ctx, "generateLlmapiReply", generateLlmapiReply);
        registerCallback(ctx, "createStoryHistory", createStoryHistory);
    }, []);

    useEffect(() => {
        const iframe = ctx.current.iframe.current;
        const window = iframe?.contentWindow as any;

        if (!window) return;
        window.userInput = {
            text: {
                element: () => inputRef.current,
                get: () => inputText,
                set: (value: any) => setInputText(value)
            },
            summary: {get: () => summary, set: (value: any) => setSummary(value)},
            inputBuilders: [], // { id: string, sequence?: number, build: (text: string) => string }
        };

    }, [setInputText, setSummary]);

    return (
        <form action={createStoryHistory}>
            <InputGroup className={"bg-white"}>
                <InputGroupTextarea ref={inputRef}
                                    id='slot-user-input'
                                    name='slot-user-input'
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={t('default.ctrl_enter_submit')}
                                    onKeyDown={submitTargetFormOnKey}/>
                <InputGroupAddon align="inline-end">
                    <InputGroupText>
                        <Checkbox name={'summary'} id={'summary-checkbox'}
                                  checked={summary} onCheckedChange={setSummary}/>
                        <Label htmlFor={'summary-checkbox'}>{t("default.summary")}</Label>
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupAddon align={'inline-end'}>
                    {
                        output ?
                            <InputGroupButton type="button" disabled={false}
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  const controller = getReplyAbortController(
                                                      ctx.current.slot!, signalName);
                                                  controller.abort("user canceled.");
                                              }}>
                                <SquareStopIcon/>
                            </InputGroupButton> :
                            <InputGroupButton type="submit">
                                <CornerDownLeftIcon/>
                            </InputGroupButton>
                    }
                </InputGroupAddon>
            </InputGroup>
        </form>);
}