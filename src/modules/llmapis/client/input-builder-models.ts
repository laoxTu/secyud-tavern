import {Registerable} from "@/utils/register";
import {
    LlmapiInputContext,
} from "@/modules/slots/client/conversation-models";
import {LlmapiMessage} from "@/modules/slots/models";
import React from "react";


export interface LlmapiInputBuilder extends Registerable {
    // 处理输入信息 更新输入历史
    onBuildInput(ctx: LlmapiInputContext, config: any): Promise<LlmapiMessage[]>;
    component: React.ComponentType,
    getValue: (data: FormData) => any,
}