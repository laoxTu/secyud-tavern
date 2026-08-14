'use client';
import {
    StoryHistory,
    StoryInputMessage
} from "@/modules/stories/models";
import {
    applyPatch,
    extractVariableChanges,
    getCurrentOutputs,
    SlotModel
} from "@/modules/slots/models";
import {
    LlmapiHistory,
    LlmapiInputContext,
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    setContent,
    SlotContentRenderer,
    SlotInitializer, SlotStreamRenderer
} from "@/modules/slots/client/conversation-models";
import {ClientRegistry} from "@/plugins/client";
import {mergeObjects} from "@/utils";

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


// 以存档 variables 为底，叠加输入与（可选）当前输出的变更，算出当前变量状态。
export function generateCurrentVariables(history: StoryHistory, includeOutput: boolean = true) {
    const variables = structuredClone(history.variables);
    for (const input of history.inputs) {
        applyPatch(variables, input.variables);
    }
    if (includeOutput && history.outputs.length > 0) {
        const outputs = getCurrentOutputs(history);
        if (outputs)
            for (const output of outputs) {
                applyPatch(variables, output.variables);
            }
    }
    return variables;
}

export function generateInputBuildContext(inputContext: LlmapiInputContext) {
    const histories = inputContext.slot.story.histories!
    // 从最后一个 summary 历史开始发送（更早的历史已总结过）；无 summary 时补开场白作为起点
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
                .map(u => u.map(v => ({...v}))),
            properties: {}
        }
    }
}

// 生成虚拟开场历史：把各预设 opening 解析为输入消息，作为变量的初始来源（懒生成并缓存）。
export function getOpeningHistory(slot: SlotModel) {
    const key = 'openingHistory';
    let openingHistory = slot.content[key] as StoryHistory;
    if (!openingHistory) {

        let variables = {};
        for (const preset of slot.presets) {
            variables = mergeObjects(variables, preset.content.variables);
        }
        openingHistory = {
            id: 0,
            code: "opening history",
            name: "0",
            disabled: false,
            inputs: [],
            summary: true,
            outputId: -1,
            outputs: [],
            variables
        };
        for (const preset of slot.presets) {
            if (!preset.content.opening) continue;
            const openingMessage: StoryInputMessage = {
                id: 0,
                content: "",
                variables: [],
                properties: {},
            };
            extractVariableChanges(openingMessage, preset.content.opening);
            openingHistory.inputs.push(openingMessage);
        }
        // 懒生成写入，setContent 会检测同键重复初始化
        setContent(slot, key, openingHistory);
    }
    return openingHistory;
}
