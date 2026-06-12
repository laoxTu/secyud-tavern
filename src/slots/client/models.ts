'use client';
import {SlotModel} from "../models";
import {createContext, RefObject, useContext} from "react";
import {StoryHistory} from "@/stories/models";


export interface SlotContextModel {
    slot?: SlotModel,
    reply?: AbortController,
    curPage: number,
    updateHistory?: (history: StoryHistory) => Promise<void>,
    changeCurPage?: (curPage: number) => Promise<void>,
}

export const SlotContext = createContext<RefObject<SlotContextModel> | undefined>(undefined)

export function useSlotContext() {
    const context = useContext(SlotContext);
    if (!context) {
        throw new Error("slot context cannot use this time.");
    }
    return context;
}