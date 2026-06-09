'use client';
import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {get, post} from "@/client";
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
import {CornerDownLeftIcon} from "lucide-react";
import {v4 as uuidv4} from "uuid";
import {conversationManager} from "@/slots/client/conversation";
import {LlmInputModel, SlotModel} from "@/slots/models";
import {
    LlmInputContext, LlmOutputContext,
    RenderContext,
    RenderStreamContext,
    SlotInitializeContext
} from "@/slots/client/conversation-models";
import {StoryHistory, StoryHistoryMessage} from "@/stories/models";


export default function StoryPage({params}: { params: { id: string } }) {
    const {id} = params;
    const {handleError} = useErrorHandler();
    const [loading, setLoading] = useState<boolean | undefined>(undefined);
    const [page, setPage] = useState<number>(-1);
    const [maxPage, setMaxPage] = useState<number>(0);
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
            const histories = slot.story.entries!.histories as StoryHistory[];
            const maxPage = histories?.length ?? 0;
            setMaxPage(maxPage)
            setPage(maxPage - 1);
        } catch (err) {
            handleError(err);
        }
    }, [handleError, id, manager]);

    const renderCurrentPage = useCallback(async () => {
        if (!iframeRef.current) return;
        const slot = slotCtx.current.slot;
        if (!slot) return;
        const histories = slot.story.entries!.histories as StoryHistory[];
        if (!histories || histories.length <= page || page < 0) return;
        const storyHistory = histories[page];
        const iframeDoc = iframeRef.current.contentDocument!;
        const renderCtx: RenderContext = {
            content: {},
            document: iframeDoc,
            history: storyHistory,
            slot: slot
        };
        iframeDoc.head.innerHTML = '';
        iframeDoc.body.innerHTML = '';
        await manager.use(provider => provider.onRenderPage(renderCtx));
    }, [manager, page])

    const generateReply = useCallback(async (input: string) => {
        try {
            const slot = slotCtx.current.slot;
            const llmapiCode = slot?.story?.llmapi?.code;
            if (!llmapiCode) return;

            const ctx: LlmInputContext = {messages: [], slot: slot, userInput: input, content: {}};
            await manager.use(provider => provider.onProcessInput(ctx));

            const response: Response = await post(
                `/llmapis/{id}/chat` as any,
                {messages: ctx.messages} as LlmInputModel,
                {params: {id: llmapiCode}}
            );

            const currentOutput: StoryHistoryMessage = {
                id: 0,
                content: ""
            };
            const storyHistory: StoryHistory = {
                id: uuidv4(),
                inputs: [{
                    id: 0,
                    content: input
                }],
                outputIndex: 0,
                outputs: [currentOutput],
                timestamp: new Date().toISOString(),
                variables: {}
            };
            slot.story.entries!.histories ??= [];
            slot.story.entries!.histories.push(storyHistory);

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
                    currentOutput.content = fullContent;
                    if (!iframeRef.current || page !== maxPage - 1) {
                        continue;
                    }
                    const streamCtx: RenderStreamContext = {
                        content: {},
                        document: iframeRef.current.contentDocument!,
                        history: storyHistory,
                        slot: slot,
                        stream: fullContent
                    };
                    await manager.use(provider => provider.onRenderStream(streamCtx));
                }
            }

            const outputCtx: LlmOutputContext = {content: {}, history: storyHistory, slot: slot};
            await manager.use(provider => provider.onProcessOutput(outputCtx));
            await renderCurrentPage();
        } catch (err) {
            handleError(err);
        }
    }, [manager, renderCurrentPage, page, handleError]);

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
                    void generateReply(input);
                }}>
                    <InputGroup>
                        <InputGroupTextarea id='slot-user-input'/>
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
                                    <InputGroupInput id='slot-page-index' value={page} type={'number'}/>
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