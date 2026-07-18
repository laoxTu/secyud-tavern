'use client';
import {
    StoryHistory,
    StoryInputMessage
} from "@/modules/stories/models";
import {applyPatch, extractVariableChanges, getCurrentOutput, SlotModel} from "@/modules/slots/models";
import {
    LlmapiHistory,
    LlmapiInputContext,
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotContentRenderer,
    SlotInitializer, SlotStreamRenderer
} from "@/modules/slots/client/conversation-models";
import {ClientRegistry} from "@/plugins/client";

export const conversationManager = {
    // 加载存档后需要做的事情，一般是初始化资源，将该排序的排序，该请求的请求。
    initializer: new ClientRegistry<SlotInitializer>("SlotInitializer"),
    // 输入处理，用于处理输入，这里输入各个注册的是有依赖顺序的，否则一些字段不存在。
    inputProcesser: new ClientRegistry<LlmapiInputProcesser>("LlmapiInputProcesser"),
    // 处理输出，有些东西需要保存，这里进行保存的准备。
    outputProcesser: new ClientRegistry<LlmapiOutputProcesser>("LlmapiOutputProcesser"),
    // 渲染画面，这里是非流式的渲染画面，可以重载一些东西。
    contentRenderer: new ClientRegistry<SlotContentRenderer>("SlotContentRenderer"),
    // 流式渲染，这里快速替换内容，不宜处理复杂逻辑。
    streamRenderer: new ClientRegistry<SlotStreamRenderer>("SlotStreamRenderer"),
};


export function generateCurrentVariables(history: StoryHistory, includeOutput: boolean = true) {
    const variables = structuredClone(history.variables);
    for (const input of history.inputs) {
        if (input.variables) {
            applyPatch(variables, input.variables);
        }
    }
    if (includeOutput && history.outputs.length > 0) {
        const changes = getCurrentOutput(history)?.variables;
        if (changes) {
            applyPatch(variables, changes);
        }
    }
    return variables;
}

export function generateInputBuildContext(inputContext: LlmapiInputContext) {
    const histories = inputContext.slot.story.histories!
    let start = histories.slice(0, histories.length - 1)
        .findLastIndex(u => u.summary);
    if (start === -1) {
        const openingHistory = getOpeningHistory(inputContext.slot);
        inputContext.histories.push(map(openingHistory));
    }

    for (let i = Math.max(start, 0); i < histories.length; i++) {
        inputContext.histories.push(map(histories[i]));
    }

    function map(storyHistory: StoryHistory): LlmapiHistory {
        return {
            ...storyHistory,
            inputs: storyHistory.inputs
                .map(u => ({...u})),
            outputs: storyHistory.outputs
                .map(u => ({...u})),
            properties: {}
        }
    }
}

export function getOpeningHistory(slot: SlotModel) {
    const key = 'openingHistory';
    let openingHistory = slot.content[key] as StoryHistory;
    if (!openingHistory) {
        const openingMessage: StoryInputMessage = {
            id: 0,
            content: "",
            variables: [],
            properties: {},
        };
        const openingRemarks = slot.story.content?.openingRemarks ?? "";
        openingHistory = {
            id: 0,
            code: openingRemarks.substring(0, 10),
            name: "0",
            disabled: false,
            inputs: [openingMessage],
            summary: true,
            outputId: -1,
            outputs: [],
            variables: {}
        };
        extractVariableChanges(openingMessage, openingRemarks);
        slot.content[key] = openingHistory;
    }
    return openingHistory;
}
