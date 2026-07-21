import {
    LlmapiInputContext,
} from "@/modules/slots/client/conversation-models";
import {LlmapiMessage} from "@/modules/slots/models";
import {EditorRegisterable} from "@/business/client/models";


export interface LlmapiInputBuilder extends EditorRegisterable {
    getValue: (data: FormData) => any,
    // 处理输入信息 更新输入历史
    onBuildInput(ctx: LlmapiInputContext, config: any): Promise<LlmapiMessage[]>;
}