import {Registerable} from "@/utils/register";
import {getCurrentOutputs, LlmapiInputModel, SlotModel} from "@/modules/slots/models";
import {StoryHistory} from "@/modules/stories/models";
import {joinAsString} from "@/utils";

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
    // 持续当前输出，意味着要拼接当前output
    current: boolean,
}

export interface LlmapiOutputContext extends SlotContextBase {
    sessionId?: string;
    history: StoryHistory,
}

export interface RenderData {
    inputs: string[],
    output: string,
    reasoningContent: string,
}

export interface RenderContext extends SlotContextBase {
    document: Document;
    window: Window;
    history: StoryHistory,
    variables: any,
    data: RenderData
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

export function generateRenderData(history: StoryHistory) {
    const outputs = getCurrentOutputs(history) ?? [];
    const res: RenderData = {
        inputs: history.inputs.map(u => u.content).filter(u => u),
        output: joinAsString(outputs, "\r\n", u => u.content).trim(),
        reasoningContent: joinAsString(outputs, "\r\n", u => u.reasoningContent).trim(),
    };

    return res;
}

export function renderData(ctx: RenderContext, type: string, data: any) {
    console.debug("renderData", data);
    const g = ctx.window as { __messageData?: Record<string, any> };
    g.__messageData ??= new Map<string, any>();
    g.__messageData[type] = data;
    ctx.window.postMessage({type, data}, "*");
}
