'use client';
import {createContext, RefObject, useContext} from "react";
import {SlotModel} from "@/modules/slots/models";
import {StoryHistory} from "@/modules/stories/models";
import {put} from "@/client";
import {BusinessError} from "@/handler/models";

export interface SlotDataModel {
    slot?: SlotModel;
    iframe: RefObject<HTMLIFrameElement | null>;
    content: Record<string, any>;
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

export const SlotContext = createContext<RefObject<SlotDataModel> | undefined>(undefined)

export function useSlotContext() {
    const context = useContext(SlotContext);
    if (!context) {
        throw new Error("slot context cannot use this time.");
    }
    return context;
}