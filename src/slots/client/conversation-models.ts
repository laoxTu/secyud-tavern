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

export interface LlmapiHistory extends StoryHistory {
    properties: Record<string, any>;
}

export interface LlmapiInputContext extends LlmapiInputModel, SlotContextBase {
    history: StoryHistory,
    // 这个和slot里面的有细微的差别
    // 截断summary或补充开场白
    histories: LlmapiHistory[],
}

export interface LlmapiOutputContext extends SlotContextBase {
    sessionId?: string;
    history: StoryHistory,
}

export interface RenderContext extends SlotContextBase {
    document: Document;
    window: Window;
    history: StoryHistory,
    variables: any,
    inputs: string[]
    output: string
}

export interface SlotInitializer extends Registerable {
    // 请求完插槽数据后执行
    onInitialize(ctx: SlotInitializeContext): Promise<void>;
}

export interface LlmapiInputProcesser extends Registerable {
    // 处理输入信息 更新输入历史
    onProcessInput(ctx: LlmapiInputContext): Promise<void>;
}

export interface LlmapiOutputProcesser extends Registerable {
    // 处理输出信息 更新输出属性
    onProcessOutput(ctx: LlmapiOutputContext): Promise<void>;
}

export interface SlotContentRenderer extends Registerable {
    // 渲染
    onRenderContent(ctx: RenderContext): Promise<void>;
}

export interface SlotStreamRenderer extends Registerable {
    // 渲染
    onRenderStream(ctx: RenderContext): Promise<void>;
}
