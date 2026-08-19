'use client';
import React, {useEffect, useRef, useState} from "react";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {PinIcon, PinOffIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {get} from "@/client";
import {useErrorHandler} from "@/handler/client/error";
import {conversationManager,} from "@/modules/slots/client/conversation";
import {SlotModel} from "@/modules/slots/models";
import {useSlotState} from "@/modules/slots/client/models";
import {HistoryPagerButtonGroup, useHistoryPageState} from "@/modules/slots/client/history-pager";
import {OutputPagerButtonGroup} from "@/modules/slots/client/output-pager";
import {HistoryChatbox} from "@/modules/slots/client/history-chatbox";
import {slotFeatureManager} from "@/modules/slots/client/feature";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

interface LoadingState {
    // 加载中
    loading: boolean;
    // 加载成功
    success: boolean;
    // 已开始加载
    started: boolean;
}

interface SlotControlState {
    pinned: boolean;
    setPinned: (pinned: boolean) => void;
}

const useSlotControlState =
    create<SlotControlState>()(persist(
        (set) => {
            return {
                pinned: true,
                setPinned: pinned => set({pinned})
            };
        }, {
            name: "slot-control-state",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                pinned: state.pinned,
            }),
        }));

export default function StoryPageContent({params}: { params: Promise<{ id: string }> }) {
    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const [loadingState, setLoadingState] = useState<LoadingState>({
        loading: false, success: false, started: false
    });
    const iframe = useRef<HTMLIFrameElement>(null);

    const {setIframe, setSlot} = useSlotState();
    const {setPage} = useHistoryPageState();
    const {pinned, setPinned} = useSlotControlState();

    const loadingCurrentSlot = async () => {
        try {
            setLoadingState(u => ({
                ...u, loading: true
            }));
            const {id} = await params;
            const slot = await get("/stories/{id}/slot", {params: {id}}) as SlotModel;
            setSlot(slot);
            await conversationManager.initializer.initialize();
            await setPage(slot.histories?.length ?? 0);
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
        if (!loadingState.started) {
            (async () => {
                setLoadingState(u => ({...u, started: true}));
                await loadingCurrentSlot();
            })();
        }
    }, [loadingState.started]);

    useEffect(() => {
        setIframe(iframe);
    }, [iframe]);

    if (loadingState.loading || !loadingState.started) return (
        <iframe className={"w-full h-full"} src="/loading.html"></iframe>
    );

    return (<>
        {/* key不要删除。发布后，如果没有这个key，会导致引用有问题，原因不明，开发环境无此问题。 */}
        <iframe key={1} ref={iframe} width={'100%'} height={'100%'}/>

        <div className="fixed inset-0 top-auto min-h-20 sc-dc">
            <div className={`flex-col gap-2 p-2 ${pinned ? "flex" : "sc-dc-flex"}`}>
                <fieldset className={"m-auto flex justify-center flex-wrap gap-2"}
                          disabled={!loadingState.started || loadingState.loading}>
                    <HistoryPagerButtonGroup/>
                    <OutputPagerButtonGroup/>
                    {slotFeatureManager.getSorted().map((u, i) => {
                        const Component = u.component
                        return (<Component key={i}/>);
                    })}
                    <Tooltip>
                        <TooltipTrigger onClick={() => setPinned(!pinned)}
                                        render={<Button variant="outline"/>}>
                            {
                                pinned ? <PinOffIcon/> : <PinIcon/>
                            }
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{pinned ? t('slot.unpin_chatbox') : t('slot.pin_chatbox')}</p>
                        </TooltipContent>
                    </Tooltip>
                </fieldset>
                <fieldset className={"w-full"} disabled={!loadingState.success}>
                    <HistoryChatbox/>
                </fieldset>
            </div>
        </div>
    </>);
}