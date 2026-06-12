'use client';
import {SlotModel} from "../models";
import {createContext, RefObject, useContext} from "react";


export interface SlotContextModel {
    slot?: SlotModel,
    reply?: AbortController,
    curPage: number,
}

export const SlotContext = createContext<RefObject<SlotContextModel> |  undefined>(undefined)

export function useSlotContext(t: any) {
    const context = useContext(SlotContext);
    if (!context) {
        throw new Error(t("default.context_not_found", {target: t(`default.slot`)}));
    }
    return context;
}