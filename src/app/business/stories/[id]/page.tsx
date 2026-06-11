'use client';
import React, {useEffect, useState, useCallback, useMemo, useRef, use} from "react";
import {get, post, put} from "@/client";
import {useErrorHandler} from "@/handler/client/error";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {
    InputGroup,
    InputGroupAddon, InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea
} from "@/components/ui/input-group";
import {AppWindowMacIcon, CornerDownLeftIcon} from "lucide-react";
import {conversationManager} from "@/slots/client/conversation";
import {LlmapiInputModel, SlotModel} from "@/slots/models";
import {
    generateCurrentVariables,
    LlmapiInputContext, LlmapiOutputContext,
    RenderContext,
    RenderStreamContext,
    SlotInitializeContext
} from "@/slots/client/conversation-models";
import {extractVariableChanges, StoryHistory, StoryOutputMessage} from "@/stories/models";
import {tryGetLastItem} from "@/utils";
import {useRouter} from "next/navigation";


export default function StoryPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params);
    const router = useRouter();
    const {handleError} = useErrorHandler();
    const [loading, setLoading] = useState<boolean | undefined>(undefined);
    const [page, setPage] = useState<number>(-1);
    const [maxPage, setMaxPage] = useState<number>(0);
    const [isSummary, setIsSummary] = useState<boolean>(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const slotCtx = useRef<{ slot?: SlotModel }>({});

    const manager = useMemo(() => conversationManager, [])

    const loadSlot = useCallback(async () => {
        try {
            const slot = await get("/stories/{id}/slot", {params: {id}}) as SlotModel;
            const ctx: SlotInitializeContext = {
                slot, content: {}
            }
            await manager.use((provider) => provider.onInitialize(ctx))
            slotCtx.current.slot = slot;
            const maxPage = slot.story.histories!.length;
            setMaxPage(maxPage)
            setPage(maxPage - 1);
        } catch (err) {
            handleError(err);
            router.replace("/business")
        }
    }, [handleError, id, manager, router]);

    const renderCurrentPage = useCallback(async () => {
        if (!iframeRef.current) return;
        const slot = slotCtx.current.slot;
        if (!slot) return;
        const histories = slot.story.entries!.histories as StoryHistory[];
        if (!histories || histories.length <= page || page < 0) return;
        const history = histories[page];
        const iframeDoc = iframeRef.current.contentDocument!;
        const renderCtx: RenderContext = {
            content: {},
            document: iframeDoc,
            history: history,
            slot: slot,
            variables: generateCurrentVariables(history)
        };
        iframeDoc.head.innerHTML = '';
        iframeDoc.body.innerHTML = '';
        await manager.use(provider => provider.onRenderPage(renderCtx));
    }, [manager, page]);

    // 生成回复，并持续渲染，直接调用将会新生成一个
    const generateReply = useCallback(async () => {
        try {
            const slot = slotCtx.current.slot;
            const llmapiCode = slot?.story?.llmapi?.code;
            if (!llmapiCode) return;
            const histories = slot.story.histories!;
            const history = histories[histories.length - 1];

            const ctx: LlmapiInputContext = {messages: [], slot: slot, content: {}, history: history};
            await manager.use(provider => provider.onProcessInput(ctx));

            const response: Response = await post(
                `/llmapis/{id}/chat` as any,
                {messages: ctx.messages} as LlmapiInputModel,
                {params: {id: llmapiCode}}
            );

            const currentOutput: StoryOutputMessage = {
                id: 0,
                content: "",
                variables: []
            };

            history.outputs.push(currentOutput);
            history.outputId = history.outputs.length - 1;

            const maxPage = slot.story.entries!.histories.length;
            setMaxPage(maxPage);
            setPage(maxPage - 1);

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            let done = false;
            let fullContent = '';

            while (!done) {
                const {value, done: streamDone} = await reader.read();
                done = streamDone;
                if (value) {
                    const chunk = decoder.decode(value, {stream: !done});
                    fullContent += chunk;
                    extractVariableChanges(currentOutput, fullContent);
                    if (!iframeRef.current || page !== maxPage - 1) {
                        continue;
                    }
                    const streamCtx: RenderStreamContext = {
                        content: {},
                        document: iframeRef.current.contentDocument!,
                        history: history,
                        slot: slot,
                        stream: fullContent,
                        variables: generateCurrentVariables(history)
                    };
                    await manager.use(provider => provider.onRenderStream(streamCtx));
                }
            }

            const outputCtx: LlmapiOutputContext = {content: {}, history: history, slot: slot};
            await manager.use(provider => provider.onProcessOutput(outputCtx));

            await put('/stories/{id}/entries/{entryType}/{entryId}', history,
                {params: {id: slot.story.id, entryType: 'history', entryId: history.id}},
            );
            await renderCurrentPage();
        } catch (err) {
            handleError(err);
        }
    }, [manager, renderCurrentPage, page, handleError]);

    // 这是创建回复
    const createHistory = useCallback(async (input: string) => {
        try {
            const slot = slotCtx.current.slot;
            const llmapiCode = slot?.story?.llmapi?.code;
            if (!llmapiCode) return;
            const histories = slot.story.histories!;
            const lastHistory = tryGetLastItem(histories);

            let variables = {};
            let history: StoryHistory | undefined = undefined;
            if (lastHistory) {
                if (lastHistory.outputs.length > 0) {
                    variables = generateCurrentVariables(lastHistory);
                } else {
                    history = lastHistory;
                }
            }

            // 这是新消息，且上面有回复。
            if (!history) {
                history = {
                    id: 0,
                    inputs: [],
                    isSummary: isSummary,
                    outputId: 0,
                    outputs: [],
                    variables: variables
                };
                histories.push(history);
            }


            const historyMessage = {
                id: history.inputs.length == 0 ? 1 :
                    Math.max(...history.inputs.map(i => i.id + 1)),
                content: '',
                variables: []
            };

            extractVariableChanges(historyMessage, input);
            history.inputs.push(historyMessage);

            history.id = await post('/stories/{id}/entries/{entryType}', history,
                {params: {id: slot.story.id, entryType: 'history'}}
            );
        } catch (err) {
            handleError(err);
        }
        await generateReply();
    }, [generateReply, handleError, isSummary]);

    useEffect(() => {
        if (loading || slotCtx.current.slot) return;

        (async () => {
            setLoading(true);
            await loadSlot();
            setLoading(false);
        })();
    }, [id, handleError, loading, loadSlot]);

    const handlePageIndexChange = (page: number) => {
        if (page < 0 || page >= maxPage) return;
        setPage(page);
        void renderCurrentPage();
    };

    if (loading || loading === undefined) return (
        <iframe className={"w-full h-full"} src="/loading.html"></iframe>
    );

    return (
        <div className="w-full h-full">
            <iframe ref={iframeRef}/>

            <div>
                <form action={formData => {
                    const input = formData.get('slot-user-input') as string;
                    void createHistory(input);
                }}>
                    <InputGroup>
                        <InputGroupTextarea id='slot-user-input'
                                            name='slot-user-input'/>
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                onClick={() => setIsSummary(!isSummary)}
                                size="icon-xs"
                            >
                                <AppWindowMacIcon
                                    data-summary={isSummary}
                                    className="data-[summary=true]:fill-gray-400 data-[summary=true]:stroke-white"
                                />
                            </InputGroupButton>
                        </InputGroupAddon>
                        <InputGroupAddon align={'inline-end'}>
                            <InputGroupButton type="submit">
                                <CornerDownLeftIcon/>
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </form>
                <form action={formData => {
                    const page = Number(formData.get('slot-page-index'));
                    handlePageIndexChange(page);
                }}>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageIndexChange(page - 1)}
                                    className={
                                        page > 0 ? 'cursor-pointer' : 'pointer-events-none opacity-50'
                                    }
                                    aria-disabled={page <= 0}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <InputGroup>
                                    <InputGroupInput id='slot-page-index' type={'number'}
                                                     defaultValue={page}/>
                                    <InputGroupAddon align={'inline-end'}>
                                        <InputGroupText content={`/${maxPage}`}/>
                                    </InputGroupAddon>
                                </InputGroup>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageIndexChange(page + 1)}
                                    className={
                                        page < maxPage - 1 ? 'cursor-pointer' : 'pointer-events-none opacity-50'
                                    }
                                    aria-disabled={page >= maxPage - 1}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </form>
            </div>
        </div>
    )
}