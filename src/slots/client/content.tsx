'use client';
import React, {useEffect, useState, useRef} from "react";
import {get} from "@/client";
import {useErrorHandler} from "@/handler/client/error";
import {
    conversationManager,
} from "@/slots/client/conversation";
import {SlotModel} from "@/slots/models";
import {
    SlotInitializeContext
} from "@/slots/client/conversation-models";
import {AccessibleComponent} from "@/components/custom/accessible";
import {ButtonGroup} from "@/components/ui/button-group";
import {SlotContext, SlotDataModel} from "@/slots/client/models";
import {HistoryPagerButtonGroup, useHistoryPageState} from "@/slots/client/history-pager";
import {OutputPagerButtonGroup} from "@/slots/client/output-pager";
import {HistoryChatbox} from "@/slots/client/history-chatbox";
import {slotFeatureManager} from "@/slots/client/feature";

interface LoadingState {
    // 加载中
    loading: boolean;
    // 加载成功
    success: boolean;
    // 已开始加载
    started: boolean;
}

export default function StoryPageContent({params}: { params: Promise<{ id: string }> }) {
    const {handleError} = useErrorHandler();
    const [loadingState, setLoadingState] = useState<LoadingState>({
        loading: false, success: false, started: false
    });
    const iframe = useRef<HTMLIFrameElement>(null);
    const ctx = useRef<SlotDataModel>({
        callbacks: {}, content: {}, iframe
    });
    const {setPage} = useHistoryPageState();

    const loadingCurrentSlot = async () => {
        try {
            setLoadingState(u => ({
                ...u, loading: true
            }));
            const {id} = await params;
            const slot = await get("/stories/{id}/slot", {params: {id}}) as SlotModel;
            const context: SlotInitializeContext = {
                slot, content: {}
            }
            await conversationManager.initializer.use(provider =>
                provider.onInitialize(context))
            ctx.current.slot = slot;
            const page = slot.story.histories?.length ?? 0;
            const state = {max: page, cur: page};
            setPage(state);
            setLoadingState(u => ({
                ...u, success: true
            }));
        } catch (err) {
            setLoadingState(u => ({
                ...u, success: false
            }));
            handleError(err);
        } finally {
            setLoadingState(u => ({
                ...u, loading: false
            }));
        }
    };

    useEffect(() => {
        console.debug(`[StoryPage] loadingState.started: ${loadingState.started}`);
        if (!loadingState.started) {
            (async () => {
                setLoadingState(u => ({...u, started: true}));
                await loadingCurrentSlot();
            })();
        }
    }, [loadingState.started]);

    if (loadingState.loading || !loadingState.started) return (
        <iframe className={"w-full h-full"} src="/loading.html"></iframe>
    );

    return (
        <SlotContext.Provider value={ctx}>
            {/* key不要删除。发布后，如果没有这个key，会导致引用有问题，原因不明，开发环境无此问题。 */}
            <iframe key={1} ref={iframe} width={'100%'} height={'100%'}/>
            <AccessibleComponent className={"fixed inset-0 top-auto border-b flex flex-col gap-2  p-2"}>
                <fieldset className={"m-auto flex justify-center flex-wrap gap-2"} disabled={!loadingState.success}>
                    <HistoryPagerButtonGroup/>
                    <OutputPagerButtonGroup/>
                    <ButtonGroup className={"bg-white rounded-md"}>
                        {slotFeatureManager.getSorted().map((u, i) => {
                            const Component = u.component
                            return (<Component key={i}/>);
                        })}
                    </ButtonGroup>
                </fieldset>
                <fieldset className={"w-full"} disabled={!loadingState.success}>
                    <HistoryChatbox/>
                </fieldset>
            </AccessibleComponent>
        </SlotContext.Provider>
    )
}