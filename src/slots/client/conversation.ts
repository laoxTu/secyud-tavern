'use client';
import {Registry} from "@/utils/register";
import {ConversationProvider} from "@/slots/client/conversation-models";
import {applyPatch, extractVariableChanges, getCurrentOutput, StoryHistory, StoryInputMessage} from "@/stories/models";
import {SlotModel} from "@/slots/models";
import {engineArrayName, PresetLorebookModel} from "@/engines/lorebooks/models";
import {tryFillActiveLorebooks} from "@/engines/lorebooks/client/match";

export class ConversationManager extends Registry<ConversationProvider> {
    constructor() {
        super("conversation");
    }
}

export const conversationManager = new ConversationManager();


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


export function getOpeningHistory(slot: SlotModel) {
    let openingHistory = slot.content['openingHistory'] as StoryHistory;
    if (!openingHistory) {
        const openingMessage: StoryInputMessage = {
            id: 0,
            content: "",
            variables: []
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
            outputId: 0,
            outputs: [],
            variables: {}
        };
        extractVariableChanges(openingMessage, openingRemarks);
        if (!openingMessage.activeLorebooks) {
            const variables = generateCurrentVariables(openingHistory, false);
            const lorebooks: Record<string, PresetLorebookModel> = slot.content[engineArrayName];
            tryFillActiveLorebooks(lorebooks, {variables, history: openingHistory, message: openingMessage});
        }
        slot.content['openingHistory'] = openingHistory;
    }
    return openingHistory;
}