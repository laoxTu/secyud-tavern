import {
    getSlotAndHistories,
    invokeCallback,
    registerCallback,
    SlotContextModel,
    updateStoryHistory,
    useSlotContext
} from "@/slots/client/models";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import React, {RefObject, useCallback, useEffect, useState} from "react";
import {getCurrentOutput, StoryHistory} from "@/stories/models";
import {conversationManager, generateCurrentVariables, getOpeningHistory} from "@/slots/client/conversation";
import {RenderContext} from "@/slots/client/conversation-models";
import {useErrorHandler} from "@/handler/client/error";
import {PageState} from "@/business/models";
import {getStoryHistoryPage} from "@/slots/client/history-pager";

export async function handleOutputPageChange(ctx: RefObject<SlotContextModel>, curPage: number) {
    await invokeCallback(ctx, "handleOutputPageChange", curPage);
}

export function OutputPagerButtonGroup() {
    const {handleError} = useErrorHandler();
    const ctx = useSlotContext();
    const state: PageState = {
        max: 0, cur: 0,
    };
    try {
        const {cur} = getStoryHistoryPage(ctx);
        const {histories} = getSlotAndHistories(ctx);
        if (histories.length !== 0) {
            const current = histories[cur];
            state.max = current.outputs.length;
            state.cur = current.outputId;
        }
    } catch (error) {
        console.debug(error);
    }
    const [page, setPage] = useState<PageState>(state);

    const [prepare, setPrepare] = useState<boolean>(true);

    const handleOutputPageChange = useCallback(async (curPage: number) => {
        try {
            const {slot, histories} = getSlotAndHistories(ctx);
            const historyPage = getStoryHistoryPage(ctx);
            const curStoryPage = historyPage.cur;
            if (!histories || histories.length < curStoryPage) return;
            let maxPage = 0;
            if (curStoryPage > 0) {
                const history = histories[curStoryPage - 1];
                maxPage = history.outputs.length;
                if (curPage >= maxPage)
                    curPage = maxPage - 1;
                if (history.outputId != curPage) {
                    history.outputId = curPage;
                    await updateStoryHistory(slot.story.id, history);
                }
            } else {
                curPage = -1;
            }
            console.debug(`[OutputPager] set output page: ${curPage}/${maxPage}`);
            setPage({max: maxPage, cur: curPage});
            setPrepare(true);
        } catch (error) {
            handleError(error);
        }
    }, []);

    const renderCurrentPage = useCallback(async () => {
        try {
            const {slot, histories} = getSlotAndHistories(ctx);
            const iframe = ctx.current.iframe.current;
            if (!iframe || !slot) return;
            const historyPage = getStoryHistoryPage(ctx);
            // page 为 0 时实际是渲染开场白
            const history: StoryHistory = historyPage.cur === 0 ?
                getOpeningHistory(slot) : histories[historyPage.cur - 1];

            console.debug('[OutputPager] render history: ', history);
            console.debug('[OutputPager] render iframe: ', iframe);
            const currentOutput = getCurrentOutput(history);
            const renderContext: RenderContext = {
                content: {},
                data: {
                    inputs: history.inputs.map(u => u.content),
                    output: currentOutput?.content ?? "",
                    reasoningContent: currentOutput?.reasoningContent ?? "",
                },
                variables: generateCurrentVariables(history),
                document: iframe.contentDocument!,
                window: iframe.contentWindow!,
                history: history,
                slot: slot,
            };
            await conversationManager.contentRenderer
                .use(provider =>
                    provider.onRenderContent(renderContext));
            renderContext.window.postMessage({
                type: "renderContent", data: renderContext.data
            }, "*");
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);


    useEffect(() => {
        registerCallback(ctx, "handleOutputPageChange", handleOutputPageChange);
        if (prepare) {
            (async () => {
                console.debug('[OutputPager] start render page');
                setPrepare(false);
                await renderCurrentPage();
            })();
        }
    }, []);

    return (<ButtonGroup>
        <Button onClick={() => handleOutputPageChange(page.cur - 1)}
                disabled={page.cur <= 0} variant="outline">
            <ChevronLeftIcon/>
        </Button>
        <Button disabled variant={'ghost'}>
            {page.cur + 1} / {page.max}
        </Button>
        <Button onClick={() => handleOutputPageChange(page.cur + 1)}
                disabled={page.cur + 1 >= page.max} variant="outline">
            <ChevronRightIcon/>
        </Button>
    </ButtonGroup>);
}