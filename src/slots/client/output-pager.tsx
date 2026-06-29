import {
    getSlotAndHistories,
    invokeCallback,
    registerCallback,
    SlotDataModel,
    updateStoryHistory,
    useSlotContext
} from "@/slots/client/models";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import React, {RefObject, useEffect, useState} from "react";
import {getCurrentOutput, StoryHistory} from "@/stories/models";
import {conversationManager, generateCurrentVariables, getOpeningHistory} from "@/slots/client/conversation";
import {renderData, RenderContext} from "@/slots/client/conversation-models";
import {useErrorHandler} from "@/handler/client/error";
import {PageState} from "@/business/models";
import {useHistoryPageState} from "@/slots/client/history-pager";
import {Input} from "@/components/ui/input";

export async function handleOutputPageChange(ctx: RefObject<SlotDataModel>, curPage: number) {
    await invokeCallback(ctx, "handleOutputPageChange", curPage);
}

export function OutputPagerButtonGroup() {
    const {handleError} = useErrorHandler();
    const ctx = useSlotContext();
    const outstate: PageState = {
        max: 0, cur: -1,
    };
    try {
        const {page} = useHistoryPageState();
        const {histories} = getSlotAndHistories(ctx);
        if (histories.length > 0 && page.cur > 0) {
            const current = histories[page.cur - 1];
            outstate.max = current.outputs.length;
            outstate.cur = current.outputId;
        }
    } catch (error) {
        console.debug("[OutputPagerButtonGroup] err", error);
    }
    const [page, setPage] = useState<PageState>(outstate);

    const [prepare, setPrepare] = useState<boolean>(true);

    const handleOutputPageChange = async (curPage: number) => {
        try {
            const {slot, histories} = getSlotAndHistories(ctx);
            const {page} = useHistoryPageState.getState();
            if (!histories || histories.length < page.cur) return;
            let maxPage = 0;
            if (page.cur > 0) {
                const history = histories[page.cur - 1];
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
    };

    const renderCurrentPage = async () => {
        try {
            const {slot, histories} = getSlotAndHistories(ctx);
            const iframe = ctx.current.iframe.current;
            if (!iframe || !slot) return;
            const {page} = useHistoryPageState.getState();
            // page 为 0 时实际是渲染开场白
            const history: StoryHistory = page.cur === 0 ?
                getOpeningHistory(slot) : histories[page.cur - 1];

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
            console.debug("[OutputPager] contentRenderer finished");
            renderData(renderContext, "content", renderContext.data);
        } catch (err) {
            handleError(err);
        }
    };


    useEffect(() => {
        registerCallback(ctx, "handleOutputPageChange", handleOutputPageChange);
        if (prepare) {
            (async () => {
                console.debug('[OutputPager] start render page');
                setPrepare(false);
                await renderCurrentPage();
            })();
        }
    }, [prepare]);

    return (<ButtonGroup className={"  bg-white rounded-md"}>
        <Button onClick={() => handleOutputPageChange(page.cur - 1)}
                disabled={page.cur <= 0} variant="outline">
            <ChevronLeftIcon/>
        </Button>
        <Input className={"text-center text-black bg-white min-w-8"}
               disabled
               value={`${page.cur + 1}/${page.max}`}>
        </Input>
        <Button onClick={() => handleOutputPageChange(page.cur + 1)}
                disabled={page.cur + 1 >= page.max} variant="outline">
            <ChevronRightIcon/>
        </Button>
    </ButtonGroup>);
}