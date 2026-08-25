import React from "react";
import {historyUtils, SlotHistory} from "@/modules/models";
import {SlotMessageBase, SlotMessageOutput} from "@/modules/models/message";
import {PresetLorebookModel} from "@/engines/lorebooks/models";
import {Registerable} from "@/utils/register";
import {joinAsString} from "@/utils";
import {LorebookConversationCache} from "@/engines/lorebooks/client/models";

export interface MatcherProps {
    defaultValue: any,
    entry: PresetLorebookModel
}

export interface MatcherMatchContext {
    history: SlotHistory,
    message: SlotMessageBase,
    properties: Record<string, any>,
    output: boolean,
    cache: LorebookConversationCache,
}

export interface Matcher extends Registerable {
    component: React.ComponentType<MatcherProps>;
    getValue: (data: FormData) => any,
    match: (ctx: MatcherMatchContext, lorebook: PresetLorebookModel) => Promise<boolean>,
}

function getContent({properties, output, message}: MatcherMatchContext) {
    const variableName = "content";
    let content = properties[variableName] as string;
    if (!content && content !== "") {
        if (output) {
            const callings = (message as SlotMessageOutput)
                .callings?.filter(u => u.result?.hidden === false);
            content = `${message.content ?? ""}${joinAsString(
                callings, "",
                u => u.result?.content ?? "")}`;
        } else {
            content = message.content ?? "";
        }
        properties[variableName] = content;
    }
    return content;
}

function getVariables({properties, history, output}: MatcherMatchContext) {
    const variableName = "variables";
    let variables = properties[variableName];
    if (!variables) {
        variables = historyUtils.getVariables(history, output);
        properties[variableName] = variables;
    }
    return variables;
}

export const matchUtils = {
    getVariables, getContent,
}