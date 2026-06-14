import {Registerable} from "@/utils/register";
import {
    LlmapiInputContext,
} from "@/slots/client/conversation-models";
import {LlmapiMessage} from "@/slots/models";
import React from "react";
import {LlmapiModel} from "@/llmapis/models";


export interface LlmapiBuilderProps {
    llmapi: LlmapiModel,
    defaultValue: any,
}

export interface LlmapiInputBuilder extends Registerable {
    // 处理输入信息 更新输入历史
    onBuildInput(ctx: LlmapiInputContext, config: any): Promise<LlmapiMessage[]>;
    component: React.ComponentType<LlmapiBuilderProps>,
    getValue: (data: FormData) => any,
}