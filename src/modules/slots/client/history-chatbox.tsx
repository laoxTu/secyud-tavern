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
import {slotContext,} from "@/modules/slots/client/context";
import {post} from "@/client";
import {conversationManager,} from "@/modules/slots/client/conversation";
import {useTranslations} from "next-intl";
import {tryGetLastItem} from "@/utils";
import {useErrorHandler} from "@/handler/client/error";
import {useHistoryPageState} from "@/modules/slots/client/history-pager";
import {submitTargetFormOnKey} from "@/business/client";
import {create} from "zustand";
import {historyUtils, messageUtils} from "@/modules/models";
import {slotUtils} from "@/modules/slots/client/conversation-models";
import {SlotMessageInput} from "@/modules/models/message";


export interface StoryChatboxState {
    content: string,
    setContent: (content: string) => void,
    summary: boolean,
    setSummary: (summary: boolean) => void,
    signal?: AbortController,
    setSignal: (signal?: AbortController, reason?: string) => void,
    generating: boolean,
    generate: () => Promise<void>,
    create: () => Promise<void>,
}

export const useStoryChatboxState =
    create<StoryChatboxState>((set, get) =>
        ({
            content: "",
            setContent: (content: string) => set({content}),
            summary: false,
            setSummary: (summary: boolean) => set({summary}),
            setSignal: (signal, reason) => {
                const origin = get().signal;
                if (origin) {
                    origin.abort(reason ?? "reset");
                }
                set({signal});
            },
            generating: false,
            generate: async () => {
                const {
                    slotData: {histories},
                    getHistory, setHistory,
                } = slotContext;
                set({generating: true});
                try {
                    const history = getHistory();
                    const {setPage} = useHistoryPageState.getState();
                    const setHistoryPage = async () => {
                        history.outputId = history.outputs.length - 1;
                        await setPage(histories.length);
                    }
                    for await (const {} of conversationManager.inputProcesser
                        .requestReply(history, async signal => {
                            await setHistoryPage();
                            set({signal});
                        })) {
                        // 流式渲染条件
                        // 故事页面为最新，输出页面为最新
                        const {page} = useHistoryPageState.getState();
                        if (page.cur === histories.length &&
                            history.outputId === history.outputs.length - 1) {
                            await conversationManager.streamRenderer
                                .renderStream(history);
                        }
                    }
                    await setHistoryPage();
                    // 解析输出，填充一些选项或处理，这里应该会缓存世界书
                    await conversationManager.outputProcesser
                        .processOutput(history);
                    await setHistory(histories.length);
                } catch (err) {
                    if (err instanceof Error && err.name === 'AbortError') {
                        console.log('user abort reply');
                    } else throw err;
                } finally {
                    await useHistoryPageState.getState()
                        .setPage(histories.length);
                    set({generating: false});
                }
            },
            create: async () => {
                try {
                    const {
                        slotData: {slot, histories}, iframeData: {iframe},
                    } = slotContext;
                    const {generating, content, summary} = get();
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
                    let history = tryGetLastItem(histories)!;
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
                            id: 0,
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
                        const {id} = await post('/stories/{id}/entries/{entryType}', history,
                            {params: {id: slot.id, entryType: 'history'}}
                        );
                        history.id = id;
                        history.name = String(id);
                    }
                } finally {
                    set({summary: false, content: ""});
                }
                // 创建并保存历史后需要生成回复
                await get().generate();
            },
        })
    );


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

    return (
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
        </form>);
}