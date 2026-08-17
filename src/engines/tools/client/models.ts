import {Registerable} from "@/utils/register";
import {LlmapiToolModel, SlotModel} from "@/modules/slots/models";
import React from "react";
import {LlmapiToolConfigModel} from "@/engines/tools/models";
import {StoryOutputCallingResult} from "@/modules/stories/models";

export interface LlmapiToolProps {
    defaultValue?: any,
    entry: LlmapiToolConfigModel,
    formRef: React.RefObject<HTMLFormElement | null>,
}

export interface LlmapiTool {
    model: LlmapiToolModel,
    invoke: (args: any) => Promise<StoryOutputCallingResult>,
}

export interface LlmapiToolProvider extends Registerable {
    component: React.ComponentType<LlmapiToolProps>,
    getValue: (data: FormData) => any,
    create: (config: LlmapiToolConfigModel, slot: SlotModel) => Promise<LlmapiTool[]>,
}

