import {Registerable} from "@/utils/register";
import {
    LlmapiInputContext,
} from "@/slots/client/conversation-models";
import {LlmapiMessage} from "@/slots/models";

export interface LlmapiInputBuilder extends Registerable {
    // 处理输入信息 更新输入历史
    onBuildInput(ctx: LlmapiInputContext): Promise<LlmapiMessage[]>;
}