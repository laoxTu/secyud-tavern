import {Registerable} from "@/utils/register";
import {LlmapiToolModel, SlotModel} from "@/modules/stories/models";
import React from "react";
import {LlmapiToolConfigModel} from "@/engines/tools/models";
import {SlotCallingResult} from "@/modules/models/calling";

export interface LlmapiToolProps {
    defaultValue?: any,
    entry: LlmapiToolConfigModel,
    formRef: React.RefObject<HTMLFormElement | null>,
}

export interface LlmapiTool {
    disabled?: boolean,
    model: LlmapiToolModel,
    invoke: (args: any) => Promise<SlotCallingResult>,
}

export interface LlmapiToolProvider extends Registerable {
    component: React.ComponentType<LlmapiToolProps>,
    getValue: (data: FormData) => any,
    create: (config: LlmapiToolConfigModel, slot: SlotModel) => Promise<LlmapiTool[]>,
}

