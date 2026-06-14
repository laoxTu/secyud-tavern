'use client';
import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {get, post, put} from "@/client";
import {useErrorHandler} from "@/handler/client/error";
import {conversationManager, generateCurrentVariables, getOpeningHistory} from "@/slots/client/conversation";
import {LlmapiInputModel, SlotModel} from "@/slots/models";
import {extractVariableChanges, getCurrentOutput, StoryHistory, StoryOutputMessage} from "@/stories/models";
import {readStream, tryGetLastItem} from "@/utils";
import {useTranslations} from "next-intl";
import {
    ArrowBigLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CornerDownLeftIcon,
    RotateCcwIcon,
    SquareStopIcon
} from "lucide-react";
import {
    InputGroup,
    InputGroupAddon, InputGroupButton, InputGroupText,
    InputGroupTextarea
} from "@/components/ui/input-group";
import {
    LlmapiInputContext, LlmapiOutputContext,
    RenderContext,
    SlotInitializeContext
} from "@/slots/client/conversation-models";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {AccessibleComponent} from "@/components/custom/accessible";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {SlotContext, SlotContextModel} from "@/slots/client/models";
import {HistoryDeleter} from "@/slots/client/history-deleter";
import {useRouter} from "next/navigation";

interface RenderState {
    // 准备渲染，意味着已经添加到渲染队列
    prepare: boolean;
    // 正在输出，控制发送消息功能
    output: boolean;
}

interface PageState {
    max: number;
    cur: number;
}

interface LoadingState {
    // 加载中
    loading: boolean;
    // 加载成功
    success: boolean;
    // 已开始加载
    started: boolean;
}


export default function StoryPage({params}: { params: Promise<{ id: string }> }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const route = useRouter();
    const [renderState, setRenderState] = useState<RenderState>({
        prepare: false,
        output: false,
    });
    const [loadingState, setLoadingState] = useState<LoadingState>({
        loading: false, success: false, started: false
    });
    const [storyPage, setStoryPage] = useState<PageState>({
        max: 0, cur: 0,
    });
    const [outputPage, setOutputPage] = useState<PageState>({
        max: 0, cur: 0,
    });
    const iframe = useRef<HTMLIFrameElement>(null);
    const ctx = useRef<SlotContextModel>({
        curPage: 0,
    });

    const manager = useMemo(() => conversationManager, [])
    const updateHistory = async (history: StoryHistory) => {
        try {
            const id = ctx.current.slot?.story.id;
            if (!id) {
                console.error('failed to update history, due to undefined id.');
                return;
            }
            await put('/stories/{id}/entries/{entryType}/{entryId}', history,
                {params: {id: id, entryType: 'history', entryId: history.id}},
            );
        } catch (error) {
            handleError(error);
        }
    };

    const handleOutputPageChange = useCallback(async (curPage: number) => {
        const histories = ctx.current.slot?.story.histories;
        const curStoryPage = ctx.current.curPage;
        if (!histories || histories.length < curStoryPage) return;
        let maxPage = 0;
        if (curStoryPage > 0) {
            const history = histories[curStoryPage - 1];
            maxPage = history.outputs.length;
            if (curPage >= maxPage)
                curPage = maxPage - 1;
            if (history.outputId != curPage) {
                history.outputId = curPage;
                await updateHistory(history);
            }
        } else {
            curPage = -1;
        }
        console.debug(`set output page: ${curPage}/${maxPage}`);
        setOutputPage({max: maxPage, cur: curPage});
        setRenderState(u => ({...u, prepare: true}));
    }, [updateHistory]);

    const handleHistoryPageChange = useCallback(async (curPage: number, curOutputPage?: number) => {
        const histories = ctx.current.slot?.story.histories;
        if (!histories || curPage < 0) return;
        const maxPage = histories.length;
        curPage = Math.min(curPage, maxPage);
        ctx.current.curPage = curPage;
        console.debug(`set story page: ${curPage}/${maxPage}`);
        setStoryPage({max: maxPage, cur: curPage});

        if (curOutputPage === undefined) {
            curOutputPage = 99999;
            if (curPage > 0) {
                curOutputPage = histories[curPage - 1].outputId
            }
        }

        // 页面变化时，输出的数量也会变，取最大页
        await handleOutputPageChange(curOutputPage);
    }, [handleOutputPageChange])

    const loadingCurrentSlot = useCallback(async () => {
        try {
            setLoadingState(u => ({
                ...u, loading: true
            }))
            const {id} = await params;
            const slot = await get("/stories/{id}/slot", {params: {id}}) as SlotModel;
            const context: SlotInitializeContext = {
                slot, content: {}
            }
            await manager.use((provider) => provider.onInitialize(context))
            ctx.current.slot = slot;
            setLoadingState(u => ({
                ...u, loading: false, success: true
            }))
            await handleHistoryPageChange(slot.story.histories?.length ?? 0);
        } catch (err) {
            setLoadingState(u => ({
                ...u, loading: false, success: false
            }))
            handleError(err);
        }
    }, [handleError, handleHistoryPageChange, manager, params]);

    // 生成回复，并持续渲染，直接调用将会新生成一个
    const generateReply = useCallback(async () => {
        const slot = ctx.current.slot!;
        const histories = slot.story.histories!;
        const history = tryGetLastItem(histories);
        const frame = iframe.current;
        if (!history || !frame) {
            console.debug('failed to get history or iframe');
            return;
        }
        try {

            setRenderState(u => ({...u, output: true}))
            const inputContext: LlmapiInputContext = {messages: [], slot, content: {}, history};
            await manager.use(provider => provider.onProcessInput(inputContext));

            if (ctx.current.reply) {
                ctx.current.reply.abort("regenerate reply!");
            }
            const reply = new AbortController();
            ctx.current.reply = reply;
            console.debug(inputContext.messages);
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
                variables: []
            };

            history.outputs.push(currentOutput);

            console.debug(`current outputs: `);
            console.debug(history.outputs);

            // 跳转到最新页，进行输出
            console.debug(`current output index: ${history.outputs.length - 1}`);
            await handleHistoryPageChange(histories.length, history.outputs.length - 1);

            if (response.body) {
                let content = '';
                const streamContext: RenderContext = {
                    content: {},
                    inputs: history.inputs.map(u => u.content),
                    output: "",
                    window: frame.contentWindow!,
                    document: frame.contentDocument!,
                    history: history,
                    slot: slot,
                    variables: generateCurrentVariables(history)
                };
                for await (const chunk of readStream(response.body)) {
                    if (reply.signal.aborted) {
                        console.warn('reply canceled');
                        break;
                    }

                    if (chunk === '') continue;
                    content += chunk;
                    // 流式渲染条件
                    // 故事页面为最新，输出页面为最新
                    if (ctx.current.curPage === histories.length &&
                        history.outputId === history.outputs.length - 1) {
                        // 每次重渲染重新解析变量变化。
                        extractVariableChanges(currentOutput, content);
                        streamContext.output = currentOutput.content;
                        await manager.use(provider => provider.onRenderStream(streamContext));
                        streamContext.window.postMessage({
                            type: "content", data: {
                                inputs: streamContext.inputs,
                                output: streamContext.output
                            }
                        }, "*");
                    }
                }
                // for 循环内可能不渲染，所以重新解析一下变量
                extractVariableChanges(currentOutput, content);
                const outputContext: LlmapiOutputContext = {content: {}, history: history, slot: slot};
                // 解析输出，填充一些选项或处理，这里应该会缓存世界书
                await manager.use(provider => provider.onProcessOutput(outputContext));
            }
        } catch (err) {
            handleError(err);
        } finally {
            await updateHistory(history);
            // 跳转到最新页，作为用户通知
            await handleHistoryPageChange(ctx.current.slot?.story.histories?.length ?? 0);
            setRenderState(u => ({...u, output: false}))
        }
    }, [handleError, handleHistoryPageChange, manager, updateHistory]);

    // 发送输入内容，并尝试创建新历史
    const createHistory = useCallback(async (input: string, summary: boolean) => {
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
                    code: input.length > 10 ? input.substring(0, 10) : input,
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
                variables: []
            };
            extractVariableChanges(message, input);
            inputs.push(message);

        } catch (err) {
            handleError(err);
        }

        // 用户输入后立即跳转到最新页面，先渲染用户输入。
        await handleHistoryPageChange(histories.length);

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
        await generateReply();
    }, [generateReply, handleError, handleHistoryPageChange]);

    const renderCurrentPage = useCallback(async () => {
        const frame = iframe.current;
        if (!frame || !loadingState.success) return;
        const curPage = ctx.current.curPage;
        const slot = ctx.current.slot!;
        const histories = slot.story.histories!;
        // page 为 0 时实际是渲染开场白
        const history: StoryHistory = curPage === 0 ?
            getOpeningHistory(slot) : histories[curPage - 1];
        try {
            console.debug('render history: ');
            console.debug(history);
            console.debug('render iframe: ');
            console.debug(iframe.current);
            const renderCtx: RenderContext = {
                content: {},
                inputs: history.inputs.map(u => u.content),
                output: getCurrentOutput(history)?.content ?? "",
                variables: generateCurrentVariables(history),
                document: frame.contentDocument!,
                window: frame.contentWindow!,
                history: history,
                slot: slot,
            };
            await manager.use(provider => provider.onRenderPage(renderCtx));
        } catch (err) {
            handleError(err);
        }
    }, [handleError, loadingState.success, manager]);

    useEffect(() => {
        console.debug(`loadingState.started: ${loadingState.started}`);
        console.debug(`renderState.prepare: ${renderState.prepare}`);
        ctx.current.updateHistory = updateHistory;
        ctx.current.changeCurPage = handleHistoryPageChange;
        if (!loadingState.started) {
            (async () => {
                setLoadingState(u => ({...u, started: true}));
                await loadingCurrentSlot();
            })();
        } else if (renderState.prepare) {
            (async () => {
                console.debug('start render page');
                setRenderState(u => ({...u, prepare: false}));
                await renderCurrentPage();
            })();
        }
    }, [loadingCurrentSlot, renderCurrentPage, loadingState.started, renderState.prepare]);

    if (loadingState.loading || !loadingState.started) return (
        <iframe className={"w-full h-full"} src="/loading.html"></iframe>
    );

    return (
        <SlotContext.Provider value={ctx}>
            {/* key不要删除。发布后，如果没有这个key，会导致引用有问题，原因不明，开发环境无此问题。 */}
            <iframe key={1} ref={iframe} width={'100%'} height={'100%'}/>
            <AccessibleComponent className={"fixed inset-0 top-auto bg-white border-b flex flex-col gap-2  p-2 "}>
                <fieldset className={"m-auto"} disabled={!loadingState.success}>
                    <ButtonGroup>
                        <form action={formData => {
                            const page = Number(formData
                                .get('slot-page-index'));
                            return handleHistoryPageChange(page);
                        }}>
                            <ButtonGroup>
                                <Button onClick={() => handleHistoryPageChange(storyPage.cur - 1)}
                                        disabled={storyPage.cur <= 0} variant="outline">
                                    <ChevronLeftIcon/>
                                </Button>
                                <Input defaultValue={storyPage.cur} name='slot-page-index'
                                       disabled={storyPage.max === 0} type={'number'}/>
                                <Button onClick={() => handleHistoryPageChange(storyPage.max)}
                                        disabled={storyPage.cur === storyPage.max} variant="outline">
                                    {storyPage.max}
                                </Button>
                                <Button onClick={() => handleHistoryPageChange(storyPage.cur + 1)}
                                        disabled={storyPage.cur >= storyPage.max} variant="outline">
                                    <ChevronRightIcon/>
                                </Button>
                            </ButtonGroup>
                        </form>
                        <ButtonGroup>
                            <Button onClick={() => handleOutputPageChange(outputPage.cur - 1)}
                                    disabled={outputPage.cur <= 0} variant="outline">
                                <ChevronLeftIcon/>
                            </Button>
                            <Button disabled variant={'ghost'}>
                                {outputPage.cur + 1} / {outputPage.max}
                            </Button>
                            <Button onClick={() => handleOutputPageChange(outputPage.cur + 1)}
                                    disabled={outputPage.cur + 1 >= outputPage.max} variant="outline">
                                <ChevronRightIcon/>
                            </Button>
                            <Button onClick={() => generateReply()}
                                    disabled={storyPage.max === 0} variant="outline">
                                <RotateCcwIcon/>
                            </Button>
                            <HistoryDeleter/>
                            <Button onClick={() => route.replace("/business")}
                                    variant={'outline'}>
                                <ArrowBigLeftIcon/>
                            </Button>
                        </ButtonGroup>
                    </ButtonGroup>
                </fieldset>
                <fieldset disabled={!loadingState.success}>
                    <form className={"w-full"}
                          action={formData => {
                              if (renderState.output) return;
                              const input = formData.get('slot-user-input') as string;
                              if (input.trim() === '') return;
                              const summary = Boolean(formData.get('summary') as string);
                              void createHistory(input, summary);
                          }}>
                        <InputGroup>
                            <InputGroupTextarea id='slot-user-input'
                                                name='slot-user-input'
                                                placeholder={t('default.ctrl_enter_submit')}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.ctrlKey) {
                                                        e.preventDefault();
                                                        e.currentTarget.form?.requestSubmit();
                                                    }
                                                }}/>
                            <InputGroupAddon align="inline-end">
                                <InputGroupText>
                                    <Checkbox name={'summary'} id={'summary-checkbox'}/>
                                    <Label htmlFor={'summary-checkbox'}>{t("default.summary")}</Label>
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupAddon align={'inline-end'}>
                                {
                                    renderState.output ?
                                        <InputGroupButton type="button" disabled={false}
                                                          onClick={() => {
                                                              ctx.current.reply?.abort("user canceled");
                                                              ctx.current.reply = undefined;
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
                </fieldset>
            </AccessibleComponent>
        </SlotContext.Provider>
    )
}