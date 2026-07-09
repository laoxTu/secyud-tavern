import React, {useState, RefObject, useEffect} from "react";
import {
    CornerDownLeftIcon,
    SquareStopIcon
} from "lucide-react";
import {
    InputGroup,
    InputGroupAddon, InputGroupButton, InputGroupText,
    InputGroupTextarea
} from "@/components/ui/input-group";
import {
    LlmapiInputContext, LlmapiOutputContext,
    RenderContext, renderData,
} from "@/modules/slots/client/conversation-models";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {
    getSlotAndHistories,
    invokeCallback, registerCallback,
    SlotDataModel,
    updateStoryHistory,
    useSlotContext
} from "@/modules/slots/client/models";
import {extractVariableChanges, StoryOutputMessage} from "@/modules/stories/models";
import {LlmapiInputModel} from "@/modules/slots/models";
import {post} from "@/client";
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

export function getReplyAbortController(ctx: RefObject<SlotDataModel>) {
    return ctx.current.content["ReplyAbortController"] as AbortController
}

export function setReplyAbortController(ctx: RefObject<SlotDataModel>) {
    let controller = getReplyAbortController(ctx);
    if (controller) {
        controller.abort("reset");
    }
    controller = new AbortController();
    ctx.current.content["ReplyAbortController"] = controller;
    return controller;
}

export async function generateLlmapiReply(ctx: RefObject<SlotDataModel>) {
    await invokeCallback(ctx, "generateLlmapiReply");
}

export function HistoryChatbox() {
    const [output, setOutput] = useState(false);
    const {handleError} = useErrorHandler();
    const ctx = useSlotContext();
    const t = useTranslations();

    // 生成回复，并持续渲染，直接调用将会新生成一个
    const generateLlmapiReply = async () => {
        try {
            const {slot, histories} = getSlotAndHistories(ctx);
            const iframe = ctx.current.iframe.current;
            const history = tryGetLastItem(histories);
            if (!iframe || !history) {
                console.debug('[HistoryChatbox] failed to get history or iframe');
                return;
            }

            setOutput(true);
            const inputContext: LlmapiInputContext = {
                slot,
                content: {},
                history,
                histories: [],
                messages: [],
            };

            generateInputBuildContext(inputContext);

            await conversationManager.inputProcesser.use(provider =>
                provider.onProcessInput(inputContext));

            const reply = setReplyAbortController(ctx);

            console.debug("[HistoryChatbox] chat messages: ", inputContext.messages);
            const response: Response = await post(
                `/llmapis/{id}/chat` as any,
                {messages: inputContext.messages} as LlmapiInputModel,
                {
                    params: {id: slot.llmapi.id},
                    signal: reply.signal
                }
            );

            const currentOutput: StoryOutputMessage = {
                id: (tryGetLastItem(history.outputs)?.id ?? 0) + 1,
                content: "",
                reasoningContent: "",
                variables: [],
                properties: {}
            };

            history.outputs.push(currentOutput);
            console.debug(`[HistoryChatbox] current outputs: `, history.outputs);
            await handleHistoryPageChange(ctx, {
                curPage: histories.length,
                curOutputPage: history.outputs.length - 1
            });

            if (response.body) {
                let content = "";

                for await (const chunk of readStream(response.body)) {
                    if (reply.signal.aborted) {
                        console.warn('[HistoryChatbox] reply canceled');
                        break;
                    }
                    let render = false;
                    if (chunk?.reasoning_content) {
                        currentOutput.reasoningContent += chunk.reasoning_content;
                        render = true;
                    }
                    if (chunk?.content) {
                        content += chunk.content;
                        render = true;
                    }
                    if (!render) {
                        continue;
                    }
                    // 流式渲染条件
                    // 故事页面为最新，输出页面为最新
                    const {page} = useHistoryPageState.getState();
                    if (page.cur === histories.length &&
                        history.outputId === history.outputs.length - 1) {
                        // 每次重渲染重新解析变量变化。
                        extractVariableChanges(currentOutput, content);
                        const streamContext: RenderContext = {
                            content: {},
                            data: {
                                inputs: [],
                                output: currentOutput.content,
                                reasoningContent: currentOutput.reasoningContent,
                            },
                            window: iframe.contentWindow!,
                            document: iframe.contentDocument!,
                            history: history,
                            slot: slot,
                            variables: generateCurrentVariables(history)
                        };
                        await conversationManager.streamRenderer
                            .use(provider =>
                                provider.onRenderStream(streamContext));
                        renderData(streamContext, "content", {
                            output: streamContext.data.output,
                            reasoningContent: streamContext.data.reasoningContent
                        });
                    }
                }
                // for 循环内可能不渲染，所以重新解析一下变量
                extractVariableChanges(currentOutput, content);
                const outputContext: LlmapiOutputContext = {content: {}, history: history, slot: slot};
                // 解析输出，填充一些选项或处理，这里应该会缓存世界书
                await conversationManager.outputProcesser.use(provider =>
                    provider.onProcessOutput(outputContext));
                await updateStoryHistory(slot.story.id, history);
            }
        } catch (err) {
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
    const createStoryHistory = async ({input, summary}: { input: string, summary: boolean }) => {
        const slot = ctx.current.slot!;
        const histories = slot.story.histories!;
        let history = tryGetLastItem(histories)!;
        let variables = undefined;
        try {

            // 如果上一个历史还未输出，合并到上一个历史。
            // 如果上一个历史已经输出，创建新的历史。
            // 如果还没有历史，使用开场白变量。
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
            const message = {
                id: (tryGetLastItem(inputs)?.id ?? 0) + 1,
                content: '',
                reasoningContent: '',
                variables: [],
                properties: {},
            };
            extractVariableChanges(message, input);
            inputs.push(message);

        } catch (err) {
            handleError(err);
        }

        // 用户输入后立即跳转到最新页面，先渲染用户输入。
        await handleHistoryPageChange(ctx, {curPage: histories.length});

        try {
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

        // 创建并保存历史后需要生成回复
        await generateLlmapiReply();
    };

    useEffect(() => {
        registerCallback(ctx, "generateLlmapiReply", generateLlmapiReply);
        registerCallback(ctx, "createStoryHistory", createStoryHistory);
    }, [])

    return (
        <form action={formData => {
            if (output) return;
            const input = formData.get('slot-user-input') as string;
            if (input.trim() === '') return;
            const summary = Boolean(formData.get('summary') as string);
            void createStoryHistory({input, summary});
        }}>
            <InputGroup className={"bg-white"}>
                <InputGroupTextarea id='slot-user-input'
                                    name='slot-user-input'
                                    placeholder={t('default.ctrl_enter_submit')}
                                    onKeyDown={submitTargetFormOnKey}/>
                <InputGroupAddon align="inline-end">
                    <InputGroupText>
                        <Checkbox name={'summary'} id={'summary-checkbox'}/>
                        <Label htmlFor={'summary-checkbox'}>{t("default.summary")}</Label>
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupAddon align={'inline-end'}>
                    {
                        output ?
                            <InputGroupButton type="button" disabled={false}
                                              onClick={() => {
                                                  const controller = getReplyAbortController(ctx);
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