'use client';
import {RefObject} from "react";
import {get, put} from "@/client";
import {joinAsString} from "@/utils";
import {SlotModel} from "@/modules/stories/models";
import {historyUtils, SlotHistory} from "@/modules/models";
import {BusinessError} from "@/handler/models";
import {slotUtils} from "@/modules/stories/client/conversation-models";

const instance: {
    slot: SlotModel | null;
    iframe: RefObject<HTMLIFrameElement | null> | null;
} = {slot: null, iframe: null};

const slotInstance = {
    get() {
        const res = instance.slot;
        if (!res) throw new BusinessError(
            "[slot](error): failed to get slot.")
        return res!;
    },
    set(slot: SlotModel | null) {
        console.info(`[slot](loaded): ${slot?.id ?? "null"}`);
        instance.slot = slot;
    },
    histories() {
        const res = instance.slot?.histories
        if (!res) throw new BusinessError(
            "[slot](error): failed to get histories.")
        return res!;
    },
};
const iframeInstance = {
    set(iframe: RefObject<HTMLIFrameElement | null> | null) {
        return instance.iframe = iframe;
    },
    get() {
        const res = instance.iframe?.current
        if (!res) throw new BusinessError(
            "[slot](error): failed to get iframe.")
        return res!;
    },
};


async function getHistory(index?: number, slot?: SlotModel) {
    slot ??= slotInstance.get();
    const histories = slot.histories;
    // 渲染开场白
    if (index === 0 || !histories.length)
        return slotUtils.getOpening(slot);
    index ??= histories.length;
    index = Math.min(Math.max(1, index), histories.length);
    let history = histories[index - 1]!;
    if (!history) {
        history = await get("/stories/{id}/histories/{index}", {
            params: {
                id: slot.id,
                index: index - 1,
            }
        });
        histories[index - 1] = history;
    }
    return history;
}

async function setHistory(index?: number, slot?: SlotModel) {
    if (index === 0) return;
    slot ??= slotInstance.get();
    const history = await getHistory(index, slot);
    await put('/stories/{id}/entries/{entryType}/{entryId}', history,
        {params: {id: slot?.id, entryType: 'history', entryId: history.entryId}},
    );
}

function postMessage(type: string, data: any) {
    const window = instance.iframe?.current?.contentWindow;
    if (!window) {
        console.error("iframe is not accessible this time.")
        return;
    }
    const g = window as { __messageData?: Record<string, any> };
    g.__messageData ??= new Map<string, any>();
    g.__messageData[type] = data;
    window.postMessage({type, data}, "*");
}

export const slotContext =
    {
        slotData: {
            get slot() {
                return slotInstance.get();
            },
            set slot(data) {
                slotInstance.set(data);
            },
            get histories() {
                return slotInstance.histories();
            },
        },
        iframeData: {
            get iframe() {
                return iframeInstance.get();
            },
            get iframeRef() {
                return instance.iframe;
            },
            set iframeRef(data) {
                iframeInstance.set(data);
            },
            get window() {
                return instance.iframe?.current?.contentWindow as any;
            },
            get document() {
                return instance.iframe?.current?.contentDocument ?? null;
            },
        },
        setHistory,
        getHistory,
        postMessage,
        postMessageVariables: (history: SlotHistory) => {
            postMessage("variables", historyUtils.getVariables(history));
        },
        postMessageContent:
            async (history: SlotHistory, handler: (str: string, role: string, type: string) => Promise<string>) => {
                const outputs = historyUtils.getOutputs(history) ?? [];
                const res = {
                    inputs: await Promise.all(history.inputs
                        .filter(u => u.content)
                        .map(u => handler(u.content, "user", "input"))),
                    output: await handler(joinAsString(outputs, "\n",
                            u => u.content).trim(),
                        "assistant", "output"),
                    thought: joinAsString(outputs, "\n", u => u.thought).trim(),
                };
                postMessage("content", res);
            }
    }
;