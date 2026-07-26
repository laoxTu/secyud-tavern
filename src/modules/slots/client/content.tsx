'use client';
import React, {useEffect, useState, useRef} from "react";
import {get} from "@/client";
import {useErrorHandler} from "@/handler/client/error";
import {
    conversationManager,
} from "@/modules/slots/client/conversation";
import {SlotModel} from "@/modules/slots/models";
import {
    SlotInitializeContext
} from "@/modules/slots/client/conversation-models";
import {SlotContext, SlotDataModel} from "@/modules/slots/client/models";
import {HistoryPagerButtonGroup, useHistoryPageState} from "@/modules/slots/client/history-pager";
import {OutputPagerButtonGroup} from "@/modules/slots/client/output-pager";
import {HistoryChatbox} from "@/modules/slots/client/history-chatbox";
import {slotFeatureManager} from "@/modules/slots/client/feature";
import {Button} from "@/components/ui/button";
import {XIcon} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useTranslations} from "next-intl";

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
    const t = useTranslations();
    const [loadingState, setLoadingState] = useState<LoadingState>({
        loading: false, success: false, started: false
    });
    const iframe = useRef<HTMLIFrameElement>(null);
    const ctx = useRef<SlotDataModel>({
        callbacks: {}, content: {}, iframe
    });
    const {setPage} = useHistoryPageState();
    const [visible, setVisible] = useState(true);

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
            {
                visible ?
                    <div className={"fixed inset-0 top-auto border-b flex flex-col gap-2  p-2"}>
                        <fieldset className={"m-auto flex justify-center flex-wrap gap-2"}
                                  disabled={!loadingState.started || loadingState.loading}>
                            <HistoryPagerButtonGroup/>
                            <OutputPagerButtonGroup/>
                            {slotFeatureManager.getSorted().map((u, i) => {
                                const Component = u.component
                                return (<Component key={i}/>);
                            })}
                            <Tooltip>
                                <TooltipTrigger onClick={() => setVisible(false)}
                                                render={<Button variant="outline"/>}>
                                    <XIcon/>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('slot.close_chatbox')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </fieldset>
                        <fieldset className={"w-full"} disabled={!loadingState.success}>
                            <HistoryChatbox/>
                        </fieldset>
                    </div> :
                    <div
                        className={"fixed inset-0 top-auto h-28 p-2 opacity-0 hover:opacity-100"}>
                        <Button variant="outline" onClick={() => setVisible(true)}
                                className={'h-full w-full text-center'}>
                            {t('slot.open_chatbox')}
                        </Button>
                    </div>
            }
        </SlotContext.Provider>
    )
}