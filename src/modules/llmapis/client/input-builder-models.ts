import {
    LlmapiInputContext,
} from "@/modules/slots/client/conversation-models";
import {LlmapiMessage} from "@/modules/slots/models";
import {Registerable} from "@/utils/register";


export interface LlmapiInputBuilder extends Registerable {
    getValue: (data: FormData) => any,
    component: React.ComponentType;
    // 处理输入信息 更新输入历史
    onBuildInput(ctx: LlmapiInputContext, config: any): Promise<LlmapiMessage[]>;
}