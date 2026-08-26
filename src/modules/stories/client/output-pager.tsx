import React, {useEffect} from "react";
import {create} from "zustand";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {useErrorHandler} from "@/handler/client/error";
import {PageState} from "@/business/models";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {slotContext} from "@/modules/stories/client/context";
import {conversationManager} from "@/modules/stories/client/conversation";
import {useHistoryPageState} from "@/modules/stories/client/history-pager";

export interface StoryOutputPageState {
    page: PageState,
    // 准备渲染标志，设置为true则需要重渲染
    prepare: boolean,
    setPrepare: (prepare: boolean) => void,
    // 默认不更改页面，只重渲染
    setPage: (cur?: number) => Promise<void>,
    render: () => Promise<void>,
    init: () => Promise<void>,
}

export const useOutputPageState =
    create<StoryOutputPageState>((set) => ({
        page: {max: 0, cur: -1},
        prepare: false,
        setPrepare: prepare => set({prepare}),
        setPage: async (cur) => {
            const {
                slotData: {slot, histories},
                setHistory, getHistory
            } = slotContext;
            const {page} = useHistoryPageState.getState();
            if (!slot || !histories ||
                histories?.length < page.cur) return;
            let max = 0;
            if (page.cur > 0) {
                const history = await getHistory(page.cur);
                max = history.outputs.length;
                cur ??= history.outputId;
                if (cur >= max)
                    cur = max - 1;
                if (history.outputId != cur) {
                    history.outputId = cur;
                    await setHistory(page.cur);
                }
            } else {
                cur = -1;
            }
            console.debug(`[slot](output page): ${cur}/${max}`);
            set({page: {max, cur}, prepare: true});
        },
        init: async () => {
            const {page} = useHistoryPageState.getState();
            const {slotData: {slot}, getHistory} = slotContext;
            if (slot?.histories.length && page.cur > 0) {
                const current = await getHistory(page.cur, slot);
                set({page: {cur: current.outputId, max: current.outputs.length}})
            }
        },
        render: async () => {
            console.debug(`[slot](render page): start`);
            const {
                slotData: {slot},
                iframeData: {iframe},
                getHistory,
            } = slotContext;
            if (!iframe || !slot) return;
            const {page} = useHistoryPageState.getState();
            const history = await getHistory(page.cur);
            await conversationManager.contentRenderer
                .renderContent({history});
        },
    }));

export function OutputPagerButtonGroup() {
    const {handleError} = useErrorHandler();
    const {page, prepare, init, setPrepare, setPage, render} = useOutputPageState();

    const changePage = async (curPage: number) => {
        try {
            await setPage(curPage);
        } catch (error) {
            handleError(error);
        }
    };

    useEffect(() => {
        void (async () => {
            try {
                await init();
            } catch (error) {
                console.error("[slot](output error): ", error);
                handleError(error);
            }
        })();
    }, []);

    useEffect(() => {
        if (prepare) {
            (async () => {
                setPrepare(false);
                try {
                    await render();
                } catch (err) {
                    handleError(err);
                }
            })();
        }
    }, [prepare]);

    return (<ButtonGroup className={"  bg-white rounded-md"}>
        <Button onClick={() => changePage(page.cur - 1)}
                disabled={page.cur <= 0} variant="outline">
            <ChevronLeftIcon/>
        </Button>
        <Input className={"text-center text-black bg-white min-w-8"}
               disabled
               value={`${page.cur + 1}/${page.max}`}>
        </Input>
        <Button onClick={() => changePage(page.cur + 1)}
                disabled={page.cur + 1 >= page.max} variant="outline">
            <ChevronRightIcon/>
        </Button>
    </ButtonGroup>);
}