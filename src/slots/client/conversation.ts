'use client';
import {applyPatch, extractVariableChanges, getCurrentOutput, StoryHistory, StoryInputMessage} from "@/stories/models";
import {SlotModel} from "@/slots/models";
import {
    LlmapiHistory,
    LlmapiInputContext,
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotContentRenderer,
    SlotInitializer, SlotStreamRenderer
} from "@/slots/client/conversation-models";
import {ClientRegistry} from "@/plugins/client";

export const conversationManager = {
    initializer: new ClientRegistry<SlotInitializer>("SlotInitializer"),
    inputProcesser: new ClientRegistry<LlmapiInputProcesser>("LlmapiInputProcesser"),
    outputProcesser: new ClientRegistry<LlmapiOutputProcesser>("LlmapiOutputProcesser"),
    contentRenderer: new ClientRegistry<SlotContentRenderer>("SlotContentRenderer"),
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
    const start = histories.findLastIndex(u => u.summary);
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
            code: openingRemarks.length > 10 ?
                openingRemarks.substring(0, 10) : openingRemarks,
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
