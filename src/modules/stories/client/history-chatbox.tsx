import React, {useCallback, useEffect, useRef} from "react";
import {CornerDownLeftIcon, SquareStopIcon} from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupTextarea
} from "@/components/ui/input-group";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {slotContext,} from "@/modules/stories/client/context";
import {post} from "@/client";
import {conversationManager,} from "@/modules/stories/client/conversation";
import {useTranslations} from "next-intl";
import {useErrorHandler} from "@/handler/client/error";
import {useHistoryPageState} from "@/modules/stories/client/history-pager";
import {submitTargetFormOnKey} from "@/business/client";
import {create} from "zustand";
import {historyUtils, messageUtils, SlotHistory} from "@/modules/models";
import {slotUtils} from "@/modules/stories/client/conversation-models";
import {SlotMessageInput} from "@/modules/models/message";
import {setAbort} from "@/utils";
import {Item, ItemContent, ItemMedia, ItemTitle} from "@/components/ui/item";
import {Spinner} from "@/components/ui/spinner";
import {EntryOperation} from "@/business/models";

interface GenerateInfo {
    title: string,
    content: string
}

export interface StoryChatboxState {
    content: string,
    setContent: (content: string) => void,
    summary: boolean,
    setSummary: (summary: boolean) => void,
    signal?: AbortController,
    setSignal: (signal?: AbortController, reason?: string) => void,
    setAbort: (func: () => void) => void,
    generateInfo: GenerateInfo,
    setGenerateInfo: (info: GenerateInfo) => void,
    generating: boolean,
    generate: () => Promise<void>,
    create: () => Promise<void>,
}

export const useStoryChatboxState =
    create<StoryChatboxState>((set, get) =>
        ({
            content: "",
            setContent: (content: string | ((t: string) => string)) =>
                typeof content === "string" ? set({content}) :
                    set(u => ({content: content(u.content)})),
            summary: false,
            setSummary: (summary: boolean) => set({summary}),
            setSignal: (signal, reason) => {
                const origin = get().signal;
                if (origin && reason) {
                    origin.abort(reason);
                }
                set({signal});
            },
            setAbort: (action) => {
                const signal = get().signal?.signal;
                if (!signal) {
                    console.debug(`[signal]: not set`)
                    return;
                }
                console.debug(`[signal]: set abort`);
                setAbort(signal, action);
            },
            generateInfo: {title: "slot.generating", content: ""},
            setGenerateInfo: (generateInfo: GenerateInfo) => get().generating && set({generateInfo}),
            generating: false,
            generate: async () => {
                const {
                    slotData: {histories},
                    getHistory, setHistory,
                } = slotContext;
                set({
                    generating: true,
                    generateInfo: {
                        title: "slot.generating",
                        content: "",
                    }
                });
                try {
                    const history = await getHistory();
                    const {setPage} = useHistoryPageState.getState();
                    const setHistoryPage = async () => {
                        history.outputId = history.outputs.length - 1;
                        await setPage(histories.length);
                    }
                    const {setSignal, setGenerateInfo} = get();

                    let thoughtLen = 0;
                    let toolArgLen = 0;
                    for await (const {output} of conversationManager.inputProcesser
                        .requestReply({
                            history, signal: async signal => {
                                await setHistoryPage();
                                setSignal(signal);
                            }
                        })) {
                        const curThoughtLen = output.thought.length;
                        const curToolArgLen = output.callings
                            ?.reduce((u, c) =>
                                u + c.arguments.length, 0) ?? 0;
                        if (curThoughtLen !== thoughtLen) {
                            thoughtLen = curThoughtLen;
                            setGenerateInfo({
                                content: `${thoughtLen}`,
                                title: "slot.thinking",
                            });
                        } else if (curToolArgLen !== toolArgLen) {
                            toolArgLen = curToolArgLen;
                            setGenerateInfo({
                                content: `${toolArgLen}`,
                                title: "slot.generating_tool",
                            });
                        } else {
                            setGenerateInfo({
                                content: `${output.content.length}`,
                                title: "slot.generating",
                            });
                        }
                        // 流式渲染条件
                        // 故事页面为最新，输出页面为最新
                        const {page} = useHistoryPageState.getState();
                        if (page.cur === histories.length &&
                            history.outputId === history.outputs.length - 1) {
                            await conversationManager.streamRenderer
                                .renderStream({history});
                        }
                    }
                    await setHistoryPage();
                    // 解析输出，填充一些选项或处理，这里应该会缓存世界书
                    await conversationManager.outputProcesser
                        .processOutput({history});
                } catch (err) {
                    if (err instanceof Error && err.name === 'AbortError') {
                        console.log('user abort reply');
                    } else throw err;
                } finally {
                    set({generating: false});
                    await useHistoryPageState.getState()
                        .setPage(histories.length);
                    await setHistory(histories.length);
                }
            },
            create: async () => {
                const {generating, content, summary} = get();
                try {
                    set({summary: false, content: ""});
                    const {
                        slotData: {slot, histories}, iframeData: {iframe},
                    } = slotContext;
                    if (generating || !content.trim()) return;
                    let variables = undefined;
                    let input = content.trim();
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
                    let history = histories.at(-1)!;
                    if (history) {
                        if (history.outputs.length > 0) {
                            variables = historyUtils.getVariables(history);
                        }
                    } else {
                        const openingHistory = slotUtils.getOpening(slot);
                        variables = historyUtils.getVariables(openingHistory);
                    }
                    if (variables) {
                        history = {
                            outputId: -1,
                            entryId: 0,
                            disabled: false,
                            code: input.substring(0, 10),
                            name: "0",
                            inputs: [],
                            outputs: [],
                            summary,
                            variables: variables
                        };
                        histories.push(history);
                    }

                    const message: SlotMessageInput = {
                        content: '',
                        variables: [],
                        properties: {}
                    };
                    messageUtils.setContent(message, input);
                    history.inputs.push(message);
                    // 用户输入后立即跳转到最新页面，先渲染用户输入。
                    await useHistoryPageState.getState()
                        .setPage(histories.length);
                    if (variables) {
                        const {entryId} = await post<EntryOperation<SlotHistory>>('/stories/{id}/entries/{entryType}',
                            history,
                            {params: {id: slot.id, entryType: 'history'}}
                        );
                        history.entryId = entryId;
                    }
                } catch (err) {
                    set({summary: false, content: ""});
                    throw err;
                }
                // 创建并保存历史后需要生成回复
                await get().generate();
            },
        })
    );

export function GenerateTips() {
    const t = useTranslations();
    const {generateInfo, generating,} = useStoryChatboxState();
    return (<>
        {generating && <div className="fixed right-2 top-2">
            <Item>
                <ItemMedia>
                    <Spinner/>
                </ItemMedia>
                <ItemContent>
                    <ItemTitle className="line-clamp-1">{t(generateInfo.title)}</ItemTitle>
                </ItemContent>
                <ItemContent className="flex-none justify-end">
                    <span className="text-sm tabular-nums">{generateInfo.content}</span>
                </ItemContent>
            </Item>
        </div>}
    </>);
}

export function HistoryChatbox() {
    const {
        create,
        generating, setSignal,
        content, setContent,
        summary, setSummary
    } = useStoryChatboxState();
    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // 发送输入内容，并尝试创建新历史
    const triggerCreate = useCallback(async () => {
        try {
            await create();
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    useEffect(() => {
        const window = slotContext.iframeData.window;
        if (!window) return;
        window.userInput = {
            text: {
                element: () => inputRef.current,
                get: () => content,
                set: (value: any) => setContent(value)
            },
            summary: {get: () => summary, set: (value: any) => setSummary(value)},
            inputBuilders: [], // { id: string, sequence?: number, build: (text: string) => string }
        };

    }, [inputRef]);

    return (<>

        <form action={triggerCreate}>
            <InputGroup className={"bg-white"}>
                <InputGroupTextarea ref={inputRef}
                                    id='slot-user-input'
                                    name='slot-user-input'
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
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
                        generating ?
                            <InputGroupButton type="button" disabled={false}
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                  setSignal(undefined, "user canceled")
                                              }}>
                                <SquareStopIcon/>
                            </InputGroupButton> :
                            <InputGroupButton type="submit">
                                <CornerDownLeftIcon/>
                            </InputGroupButton>
                    }
                </InputGroupAddon>
            </InputGroup>
        </form>
    </>);
}