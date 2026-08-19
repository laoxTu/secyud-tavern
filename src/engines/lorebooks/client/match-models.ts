import React from "react";
import {SlotHistory} from "@/modules/models";
import {SlotMessageBase} from "@/modules/models/message";
import {PresetLorebookModel} from "@/engines/lorebooks/models";
import {Registerable} from "@/utils/register";

export interface MatcherProps {
    defaultValue: any,
    entry: PresetLorebookModel
}

export interface MatcherMatchContext {
    history: SlotHistory;
    message: SlotMessageBase;
    expression?: any;
    variables: any;
}

export interface Matcher extends Registerable {
    component: React.ComponentType<MatcherProps>;
    getValue: (data: FormData) => any,
    match: (ctx: MatcherMatchContext, expression: any) => boolean,
}

