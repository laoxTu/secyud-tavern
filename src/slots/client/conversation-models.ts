import {Registerable} from "@/utils/register";
import {LlmapiInputModel, SlotModel} from "@/slots/models";
import {StoryHistory} from "@/stories/models";

export interface SlotContextBase {
    slot: SlotModel;
    content: Record<string, any>;
}

export interface SlotInitializeContext extends SlotContextBase {
    id?: string;
}

export interface LlmapiInputContext extends LlmapiInputModel, SlotContextBase {
    history: StoryHistory,
}

export interface LlmapiOutputContext extends SlotContextBase {
    sessionId?: string;
    history: StoryHistory,
}

export interface RenderContext extends SlotContextBase {
    document: Document;
    history: StoryHistory,
    variables: any,
}

export interface RenderStreamContext extends SlotContextBase {
    document: Document;
    history: StoryHistory,
    stream: string,
    variables: any,
}

export interface ConversationProvider extends Registerable {
    // 请求完插槽数据后执行
    onInitialize(ctx: SlotInitializeContext): Promise<void>;

    // 处理输入信息 更新输入历史
    onProcessInput(ctx: LlmapiInputContext): Promise<void>;

    // 处理输出信息 更新输出历史
    onProcessOutput(ctx: LlmapiOutputContext): Promise<void>;

    // 页面渲染
    onRenderPage(ctx: RenderContext): Promise<void>;

    // 流式渲染，在请求输出时
    onRenderStream(ctx: RenderStreamContext): Promise<void>;
}
