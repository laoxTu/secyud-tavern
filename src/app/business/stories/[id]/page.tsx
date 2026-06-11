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
import {CornerDownLeftIcon, SquareStopIcon} from "lucide-react";
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
    const [state, setState] = useState(0);

    const show = () => setState(u => u + 1);
    const hide = () => setState(u => u - 1);
    const isVisible = state > 0;
    return (
        <div
            className={` transition-all duration-100 ${className || ''} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            onTouchStart={show}
            aria-expanded={isVisible}>
            {children}
        </div>
    );
}

interface RenderState {
    maxPage: number;
    curPage: number;
    output: boolean;
    enabled: boolean;
    render: boolean;
}

interface LoadingState {
    loading: boolean;
    success: boolean;
    started: boolean;
}

export default function StoryPage({params}: { params: Promise<{ id: string }> }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [renderState, setRenderState] = useState<RenderState>({
        maxPage: 0, curPage: -1, output: false, enabled: false, render: false
    });
    const [loadingState, setLoadingState] = useState<LoadingState>({
        loading: false, success: false, started: false
    });
    const replyController = useRef<AbortController>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const slotCtx = useRef<{ slot?: SlotModel, output: boolean }>({output: true});

    const manager = useMemo(() => conversationManager, [])

    const handlePageIndexChange = (page: number) => {
        if (!loadingState.success || page < 0 || page > renderState.maxPage) return;
        slotCtx.current.output = page === renderState.maxPage;
        setRenderState(u => ({...u, curPage: page, render: true}));
    };

    const loadingCurrentSlot = useCallback(async () => {
        try {
            setLoadingState(u => ({
                ...u, loading: true
            }))
            const {id} = await params;
            const slot = await get("/stories/{id}/slot", {params: {id}}) as SlotModel;
            const ctx: SlotInitializeContext = {
                slot, content: {}
            }
            await manager.use((provider) => provider.onInitialize(ctx))
            slotCtx.current.slot = slot;
            const histories = slot.story.histories!;
            const maxPage = histories.length;
            setRenderState(u => ({...u, maxPage, curPage: maxPage, render: true, enabled: true}));
            setLoadingState(u => ({
                ...u, loading: false, success: true
            }))
        } catch (err) {
            setLoadingState(u => ({
                ...u, loading: false, success: false
            }))
            handleError(err);
        }
    }, [handleError, manager, params]);

    // 生成回复，并持续渲染，直接调用将会新生成一个
    const generateReply = useCallback(async () => {
        try {
            if (replyController.current) {
                replyController.current.abort("regenerate reply!");
            }
            replyController.current = new AbortController();
            const slot = slotCtx.current.slot!;
            const histories = slot.story.histories!;
            const history = tryGetLastItem(histories)!;

            const ctx: LlmapiInputContext = {messages: [], slot, content: {}, history};
            await manager.use(provider => provider.onProcessInput(ctx));

            const response: Response = await post(
                `/llmapis/{id}/chat` as any,
                {messages: ctx.messages} as LlmapiInputModel,
                {
                    params: {id: slot.llmapi.id},
                    signal: replyController.current.signal
                }
            );

            const currentOutput: StoryOutputMessage = {
                id: 0,
                content: "",
                variables: []
            };

            history.outputs.push(currentOutput);
            history.outputId = history.outputs.length - 1;
            slotCtx.current.output = true;
            const maxPage = histories.length;
            setRenderState(u => ({...u, maxPage, curPage: maxPage, render: true, output: true}));

            if (response.body) {
                let content = '';
                for await (const chunk of readStream(response.body)) {
                    if (replyController.current.signal.aborted) {
                        console.log('reply canceled');
                        break;
                    }

                    if (chunk === '') continue;
                    content += chunk;
                    // 输出时且当前页是最后一页时更新流式页面
                    if (iframeRef.current && slotCtx.current.output) {
                        extractVariableChanges(currentOutput, content);
                        const streamCtx: RenderStreamContext = {
                            content: {},
                            window: iframeRef.current.contentWindow!,
                            document: iframeRef.current.contentDocument!,
                            history: history,
                            slot: slot,
                            stream: chunk,
                            variables: generateCurrentVariables(history)
                        };
                        await manager.use(provider => provider.onRenderStream(streamCtx));
                    }
                }
                extractVariableChanges(currentOutput, content);
                const outputCtx: LlmapiOutputContext = {content: {}, history: history, slot: slot};
                await manager.use(provider => provider.onProcessOutput(outputCtx));
                await put('/stories/{id}/entries/{entryType}/{entryId}', history,
                    {params: {id: slot.story.id, entryType: 'history', entryId: history.id}},
                );
            }

            setRenderState(u => ({...u, maxPage, curPage: maxPage, render: true, output: false}));
        } catch (err) {
            setRenderState(u => ({...u, curPage: u.maxPage, output: false}));
            handleError(err);
        }
    }, [handleError, manager]);

    // 发送输入内容，并尝试创建新历史
    const createHistory = useCallback(async (input: string, summary: boolean) => {
        try {
            const slot = slotCtx.current.slot!;
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
            const maxPage = histories.length;
            setRenderState(u => ({...u, maxPage, curPage: maxPage, render: true, output: true}));
            if (variables) {
                const {id} = await post('/stories/{id}/entries/{entryType}', history,
                    {params: {id: slot.story.id, entryType: 'history'}}
                );
                history.id = id;
            } else {
                await put('/stories/{id}/entries/{entryType}/{entryId}', history,
                    {params: {id: slot.story.id, entryType: 'history', entryId: history.id}}
                );
            }
        } catch (err) {
            handleError(err);
        }
        // 创建并保存历史后需要生成回复
        await generateReply();
    }, [generateReply, handleError]);

    const renderCurrentPage = useCallback(async () => {
        try {
            if (!iframeRef.current || renderState.curPage < 0 ||
                renderState.curPage > renderState.maxPage ||
                !renderState.enabled) return;
            const slot = slotCtx.current.slot!;
            const histories = slot.story.histories!;
            const history: StoryHistory = renderState.curPage === 0 ?
                getOpeningHistory(slot) : histories[renderState.curPage - 1];
            const renderCtx: RenderContext = {
                content: {},
                document: iframeRef.current.contentDocument!,
                window: iframeRef.current.contentWindow!,
                history: history,
                slot: slot,
                variables: generateCurrentVariables(history)
            };
            await manager.use(provider => provider.onRenderPage(renderCtx));
        } catch (err) {
            handleError(err);
        }
    }, [handleError, manager, renderState]);

    useEffect(() => {
        if (!loadingState.started) {
            (async () => {
                setLoadingState(u => ({...u, started: true}));
                await loadingCurrentSlot();
            })();
        } else if (renderState.render) {
            (async () => {
                setRenderState(u => ({...u, render: false}));
                await renderCurrentPage();
            })();
        }
    }, [loadingCurrentSlot, loadingState.started, renderCurrentPage, renderState.render]);

    const curPage = renderState.curPage;
    const maxPage = renderState.maxPage;

    if (loadingState.loading || !loadingState.started) return (
        <iframe className={"w-full h-full"} src="/loading.html"></iframe>
    );

    return (
        <>
            <iframe key={curPage} ref={iframeRef} width={'100%'} height={'100%'}/>
            <AccessibleComponent className={'fixed inset-0 bottom-auto p-2'}>
                <fieldset disabled={!renderState.enabled}>
                    <form className={"m-auto"}
                          action={formData => {
                              const page = Number(formData.get('slot-page-index'));
                              handlePageIndexChange(page);
                          }}>
                        <Pagination key={curPage}>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageIndexChange(curPage - 1)}
                                        className={
                                            curPage > 0 ? 'cursor-pointer' : 'pointer-events-none opacity-50'
                                        }
                                        aria-disabled={curPage <= 0}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <Input defaultValue={curPage}
                                           name='slot-page-index' type={'number'}/>
                                </PaginationItem>
                                <PaginationItem>
                                    /
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => handlePageIndexChange(maxPage)}>
                                        {maxPage}
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageIndexChange(curPage + 1)}
                                        className={
                                            curPage < maxPage ? 'cursor-pointer' : 'pointer-events-none opacity-50'
                                        }
                                        aria-disabled={curPage >= maxPage}
                                    />
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
                                                              replyController.current?.abort("user canceled");
                                                              replyController.current = null;
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