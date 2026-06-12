'use client';
import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {get, post, put} from "@/client";
import {useErrorHandler} from "@/handler/client/error";

import {
    Pagination,
    PaginationContent,
    PaginationItem, PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {
    InputGroup,
    InputGroupAddon, InputGroupButton,
    InputGroupText,
    InputGroupTextarea
} from "@/components/ui/input-group";
import {CornerDownLeftIcon, RotateCcwIcon, SquareStopIcon} from "lucide-react";
import {conversationManager, generateCurrentVariables, getOpeningHistory} from "@/slots/client/conversation";
import {LlmapiInputModel, SlotModel} from "@/slots/models";
import {
    LlmapiInputContext, LlmapiOutputContext,
    RenderContext,
    RenderStreamContext,
    SlotInitializeContext
} from "@/slots/client/conversation-models";
import {extractVariableChanges, StoryHistory, StoryOutputMessage} from "@/stories/models";
import {readStream, tryGetLastItem} from "@/utils";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";


function AccessibleComponent({children, className}: {
    children: React.ReactNode,
    className?: string
}) {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);

    const isVisible = focused || hovered;
    return (
        <div
            className={` transition-all duration-100 ${className || ''} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onTouchStart={() => setFocused(true)}
            aria-expanded={isVisible}>
            {children}
        </div>
    );
}

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

interface StoryPageContext {
    slot?: SlotModel,
    reply?: AbortController,
    curPage: number,
}

export default function StoryPage({params}: { params: Promise<{ id: string }> }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [renderState, setRenderState] = useState<RenderState>({
        prepare: false,
        output: false,
    });
    const [storyPage, setStoryPage] = useState<PageState>({
        max: 0, cur: 0,
    });
    const [outputPage, setOutputPage] = useState<PageState>({
        max: 0, cur: 0,
    });
    const [loadingState, setLoadingState] = useState<LoadingState>({
        loading: false, success: false, started: false
    });
    const iframe = useRef<HTMLIFrameElement>(null);
    const ctx = useRef<StoryPageContext>({curPage: 0});

    const manager = useMemo(() => conversationManager, [])

    const updateHistory = useCallback(async (history: StoryHistory) => {
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
    }, [handleError]);

    const handleOutputPageChange = useCallback(async (curPage: number) => {
        const histories = ctx.current.slot?.story.histories;
        const curStoryPage = ctx.current.curPage;
        if (!histories || histories.length < curStoryPage) return;
        let maxPage = 0;
        if (curStoryPage > 0) {
            const history = histories[curStoryPage - 1];
            maxPage = history.outputs.length;
            if (curPage >= maxPage) curPage = maxPage - 1;
            if (history.outputId != curPage) {
                // eslint-disable-next-line react-hooks/immutability
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

    const handleStoryPageChange = useCallback(async (curPage: number, curOutputPage?: number) => {
        const histories = ctx.current.slot?.story.histories;
        if (!histories || curPage < 0) return;
        const maxPage = histories.length;
        curPage = Math.min(curPage, maxPage);
        ctx.current.curPage = curPage;
        console.debug(`set story page: ${curPage}/${maxPage}`);
        setStoryPage({max: maxPage, cur: curPage});

        if (!curOutputPage) {
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
            await handleStoryPageChange(slot.story.histories?.length ?? 0);
        } catch (err) {
            setLoadingState(u => ({
                ...u, loading: false, success: false
            }))
            handleError(err);
        }
    }, [handleError, handleStoryPageChange, manager, params]);

    // 生成回复，并持续渲染，直接调用将会新生成一个
    const generateReply = useCallback(async () => {
        const slot = ctx.current.slot!;
        const histories = slot.story.histories!;
        const history = tryGetLastItem(histories);
        if (!history) return;
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

            console.debug(`current outputs: ${history.outputs}`);

            // 跳转到最新页，进行输出
            await handleStoryPageChange(histories.length, history.outputs.length - 1);

            if (response.body) {
                let content = '';
                for await (const chunk of readStream(response.body)) {
                    if (reply.signal.aborted) {
                        console.log('reply canceled');
                        break;
                    }

                    if (chunk === '') continue;
                    content += chunk;
                    // 流式渲染条件
                    // iframe存在，故事页面为最新，输出页面为最新
                    if (iframe.current && ctx.current.curPage === histories.length &&
                        history.outputId === history.outputs.length - 1) {
                        // 每次重渲染重新解析变量变化。
                        extractVariableChanges(currentOutput, content);
                        const streamContext: RenderStreamContext = {
                            content: {},
                            window: iframe.current.contentWindow!,
                            document: iframe.current.contentDocument!,
                            history: history,
                            slot: slot,
                            stream: chunk,
                            variables: generateCurrentVariables(history)
                        };
                        await manager.use(provider => provider.onRenderStream(streamContext));
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
            await handleStoryPageChange(ctx.current.slot?.story.histories?.length ?? 0);
            setRenderState(u => ({...u, output: false}))
        }
    }, [handleError, handleStoryPageChange, manager, updateHistory]);

    // 发送输入内容，并尝试创建新历史
    const createHistory = useCallback(async (input: string, summary: boolean) => {
        try {
            const slot = ctx.current.slot!;
            const histories = slot.story.histories!;
            let history = tryGetLastItem(histories)!;
            let variables = undefined;

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
                    outputId: 0,
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

            // 用户输入后立即跳转到最新页面，先渲染用户输入。
            await handleStoryPageChange(histories.length);
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
    }, [generateReply, handleError, handleStoryPageChange]);

    const renderCurrentPage = useCallback(async () => {
        try {
            if (!iframe.current || !loadingState.success) return;
            const curPage = ctx.current.curPage;
            const slot = ctx.current.slot!;
            const histories = slot.story.histories!;
            // page 为 0 时实际是渲染开场白
            const history: StoryHistory = curPage === 0 ?
                getOpeningHistory(slot) : histories[curPage - 1];
            console.debug('render history:');
            console.debug(history);
            const renderCtx: RenderContext = {
                content: {},
                document: iframe.current.contentDocument!,
                window: iframe.current.contentWindow!,
                history: history,
                slot: slot,
                variables: generateCurrentVariables(history)
            };
            await manager.use(provider => provider.onRenderPage(renderCtx));
        } catch (err) {
            handleError(err);
        }
    }, [handleError, loadingState.success, manager]);


    useEffect(() => {
        console.debug(`loadingState.started: ${loadingState.started}`);
        console.debug(`renderState.prepare: ${renderState.prepare}`);
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
    }, [loadingCurrentSlot, loadingState.started, renderCurrentPage, renderState.prepare]);

    if (loadingState.loading || !loadingState.started) return (
        <iframe className={"w-full h-full"} src="/loading.html"></iframe>
    );

    return (
        <>
            <iframe ref={iframe} width={'100%'} height={'100%'}/>
            <AccessibleComponent className={'fixed inset-0 bottom-auto flex p-2 gap-2'}>
                <fieldset className={"m-auto"} disabled={!loadingState.success}>
                    <form action={formData => {
                        const page = Number(formData.get('slot-page-index'));
                        return handleStoryPageChange(page);
                    }}>
                        <Pagination key={storyPage.cur}>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handleStoryPageChange(storyPage.cur - 1)}
                                        className={storyPage.cur > 0 ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
                                        aria-disabled={storyPage.cur <= 0}/>
                                </PaginationItem>
                                <PaginationItem>
                                    <Input defaultValue={storyPage.cur} name='slot-page-index' type={'number'}/>
                                </PaginationItem>
                                <PaginationItem>
                                    /
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink onClick={() => handleStoryPageChange(storyPage.max)}>
                                        {storyPage.max}
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handleStoryPageChange(storyPage.cur + 1)}
                                        className={storyPage.cur < storyPage.max ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
                                        aria-disabled={storyPage.cur >= storyPage.max}/>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </form>
                </fieldset>
                <fieldset className={"m-auto"} disabled={!loadingState.success}>
                    <form>
                        <Pagination key={outputPage.cur}>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handleOutputPageChange(outputPage.cur - 1)}
                                        className={outputPage.cur > 0 ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
                                        aria-disabled={outputPage.cur <= 0}/>
                                </PaginationItem>
                                <PaginationItem>
                                    {outputPage.cur + 1} / {outputPage.max}
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handleOutputPageChange(outputPage.cur + 1)}
                                        className={outputPage.cur < outputPage.max ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
                                        aria-disabled={outputPage.cur >= outputPage.max}/>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink
                                        className={storyPage.max > 0 ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
                                        onClick={() => generateReply()}>
                                        <RotateCcwIcon/>
                                    </PaginationLink>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </form>
                </fieldset>
            </AccessibleComponent>
            <AccessibleComponent className={"fixed inset-0 top-auto p-2 group"}>
                <fieldset disabled={!loadingState.success}>
                    <form className={"w-full"}
                          action={formData => {
                              if (renderState.output) return;
                              const input = formData.get('slot-user-input') as string;
                              const summary = Boolean(formData.get('summary') as string);
                              void createHistory(input, summary);
                          }}>
                        <InputGroup>
                            <InputGroupTextarea id='slot-user-input'
                                                name='slot-user-input'/>
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
        </>
    )
}