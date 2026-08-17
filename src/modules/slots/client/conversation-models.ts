import {Registerable} from "@/utils/register";
import {getCurrentOutputs, SlotModel} from "@/modules/slots/models";
import {StoryHistory, StoryOutputMessage} from "@/modules/stories/models";
import {joinAsString} from "@/utils";
import {BusinessError} from "@/handler/models";

export interface SlotContextBase {
    slot: SlotModel;
    content: Record<string, any>;
}


export interface SlotInitializeContext extends SlotContextBase {
    id?: string;
}

export interface LlmapiHistory extends StoryHistory {
    content: Record<string, any>;
}

type ContentHandler = (str: string, role: string, type: string) => Promise<string>;

export interface LlmapiInputContext extends SlotContextBase {
    history: StoryHistory,
    // 这个和slot里面的有细微的差别
    // 截断summary或补充开场白
    histories: LlmapiHistory[],
    // 持续当前输出，意味着要拼接当前output
    current: boolean,
    contentHandlers: ContentHandler[],
    config: any,
}

export async function handleContent(
    handlers: ContentHandler[],
    {str, role, type}: {
        str: string,
        role: string,
        type: string
    }) {
    let res = str;
    for (const contentHandler of handlers) {
        res = await contentHandler(res, role, type);
    }
    return res;
}

export interface LlmapiOutputContext extends SlotContextBase {
    // output is the origin output of llm chunk
    // for openai it may be { content: string, tool_calls: [], ...}
    output: any,
    message: StoryOutputMessage,
    stopped: boolean,
}

export interface LlmapiResultContext extends SlotContextBase {
    sessionId?: string;
    history: StoryHistory,
}

export interface RenderData {
    inputs: string[],
    output: string,
    thought: string,
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
    onProcessOutput(ctx: LlmapiResultContext): Promise<void>;
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
        thought: joinAsString(outputs, "\r\n", u => u.thought).trim(),
    };

    return res;
}

export function renderData(ctx: RenderContext, type: string, data: any) {
    const g = ctx.window as { __messageData?: Record<string, any> };
    g.__messageData ??= new Map<string, any>();
    g.__messageData[type] = data;
    ctx.window.postMessage({type, data}, "*");
}

// 读取初始化好的缓存；未初始化说明漏了 initialize，直接报错而不是拿到 undefined 往下传。
export function getContent<T>(slot: SlotModel, key: string): T {
    const value = slot.content[key];
    if (value === undefined) {
        throw new BusinessError(`slot content "${key}" is not initialized`,
            "slot.content_not_initialized")
            .withValue("key", key);
    }
    return value as T;
}

// 初始化缓存；同键禁止重复初始化，防止两个引擎/插件意外共用同一 key 互相覆盖。
export function setContent(slot: SlotModel, key: string, value: any) {
    if (slot.content[key] !== undefined || value === undefined) {
        throw new BusinessError(`slot content "${key}" already initialized`,
            "slot.content_already_initialized")
            .withValue("key", key);
    }
    slot.content[key] = value;
}
