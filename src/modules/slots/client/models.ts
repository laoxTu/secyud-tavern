'use client';
import {createContext, RefObject, useContext} from "react";
import {SlotModel} from "@/modules/slots/models";
import {StoryHistory} from "@/modules/stories/models";
import {put} from "@/client";
import {BusinessError} from "@/handler/models";
import {tryGetLastItem} from "@/utils";
import {getOpeningHistory} from "@/modules/slots/client/conversation";

export interface SlotDataModel {
    slot?: SlotModel;
    iframe: RefObject<HTMLIFrameElement | null>;
    callbacks: Record<string, (params?: any) => Promise<void>>,
}

export async function invokeCallback(ctx: RefObject<SlotDataModel>, name: string, params?: any) {
    const callback = ctx.current.callbacks[name];
    if (callback) {
        await callback(params);
    } else {
        console.error(`Cannot invoke callback, the callback ${name} is not registered this time.`);
    }
}

export async function updateStoryHistory(storyId: string, history: StoryHistory) {
    await put('/stories/{id}/entries/{entryType}/{entryId}', history,
        {params: {id: storyId, entryType: 'history', entryId: history.id}},
    );
}

export function registerCallback(ctx: RefObject<SlotDataModel>, name: string, callback: (params: any) => Promise<void>) {
    ctx.current.callbacks[name] = callback;
}

export function getSlotAndHistories(ctx: RefObject<SlotDataModel>) {
    const slot = ctx.current.slot;
    const histories = slot?.story.histories;
    if (!histories) {
        throw new BusinessError("Slot is not load this time.");
    }

    return {slot, histories};
}

export function getCurrentHistory(slot: SlotModel, index: number | null = null) {
    const histories = slot.story.histories ?? [];
    // page 为 0 时实际是渲染开场白
    if (index !== null && histories.length >= index && index >= 0)
        return index ? histories[index - 1] : getOpeningHistory(slot);
    return tryGetLastItem(histories) ?? getOpeningHistory(slot);
}

export const SlotContext = createContext<RefObject<SlotDataModel> | undefined>(undefined)

export function useSlotContext() {
    const context = useContext(SlotContext);
    if (!context) {
        throw new Error("slot context cannot use this time.");
    }
    return context;
}