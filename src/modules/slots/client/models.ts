'use client';
import {RefObject} from "react";
import {create} from "zustand";
import {put} from "@/client";
import {joinAsString} from "@/utils";
import {SlotModel} from "@/modules/slots/models";
import {historyUtils, SlotHistory} from "@/modules/models";
import {slotUtils} from "@/modules/slots/client/conversation-models";

const instance: {
    slot: SlotModel | null,
    iframe: RefObject<HTMLIFrameElement | null> | null,
} = {slot: null, iframe: null};


export interface SlotState {
    slot: SlotModel,
    setSlot: (slot: SlotModel) => void,
    histories: SlotHistory[] | null,
    setIframe: (iframe: RefObject<HTMLIFrameElement | null>) => void,
    iframe: HTMLIFrameElement | null,
    getHistory: (index?: number) => SlotHistory,
    setHistory: (index?: number) => Promise<void>,
    postMessage: (type: string, data: any) => void,
    postMessageVariables: (history: SlotHistory) => void,
    postMessageContent: (history: SlotHistory, handler: (str: string, role: string, type: string) => Promise<string>) => Promise<void>,
}

export const useSlotState =
    create<SlotState>((set, get) =>
        ({
            get slot() {
                const res = instance.slot;
                if (!res)
                    console.debug("[slot](error): failed to get slot.")
                return res!;
            },
            setSlot: (slot) => {
                console.info(`[slot](loaded): ${slot.id}`);
                instance.slot = slot;
            },
            get histories() {
                const res = get().slot?.histories
                if (!res)
                    console.debug("[slot](error): failed to get histories.")
                return res!;
            },
            setIframe: (iframe) => instance.iframe = iframe,
            get iframe() {
                const res = instance.iframe?.current
                if (!res)
                    console.debug("[slot](error): failed to get iframe.")
                return res!;
            },
            getHistory: (index) => {
                const slot = get().slot;
                const histories = slot.histories;
                // 渲染开场白
                if (index === 0 || !histories.length)
                    return slotUtils.getOpening(slot);
                index ??= histories.length;
                index = Math.min(Math.max(1, index), histories.length);
                return histories[index - 1];
            },
            setHistory: async index => {
                if (index === 0) return;
                const {slot, getHistory} = get();
                const history = getHistory(index);
                await put('/stories/{id}/entries/{entryType}/{entryId}', history,
                    {params: {id: slot?.id, entryType: 'history', entryId: history.id}},
                );
            },
            postMessage: (type: string, data: any) => {
                const window = get().iframe?.contentWindow;
                if (!window) {
                    console.error("iframe is not accessible this time.")
                    return;
                }
                const g = window as { __messageData?: Record<string, any> };
                g.__messageData ??= new Map<string, any>();
                g.__messageData[type] = data;
                window.postMessage({type, data}, "*");
            },
            postMessageVariables: (history) => {
                get().postMessage("variables", historyUtils.getVariables(history));
            },
            postMessageContent: async (history, handler) => {
                const outputs = historyUtils.getOutputs(history) ?? [];
                const res = {
                    inputs: await Promise.all(history.inputs
                        .filter(u => u.content)
                        .map(u => handler(u.content, "user", "input"))),
                    output: await handler(joinAsString(outputs, "\r\n",
                            u => u.content).trim(),
                        "assistant", "output"),
                    thought: joinAsString(outputs, "\r\n", u => u.thought).trim(),
                };
                get().postMessage("content", res);
            }
        }));