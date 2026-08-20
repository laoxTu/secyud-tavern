import {Registerable} from "@/utils/register";
import {BusinessError} from "@/handler/models";
import {SlotModel} from "@/modules/slots/models";
import {messageUtils, SlotHistory} from "@/modules/models";
import {mergeObjects} from "@/utils";


type ContentHandler = (str: string, role: string, type: string) => Promise<string>;

async function handleContent(
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

export interface SlotContextBase {
    content: Record<string, any>,
    slot: SlotModel,
}

export interface SlotInitializeContext extends SlotContextBase {
    id?: string;
}

export interface LlmapiHistory extends SlotHistory {
    content: Record<string, any>;
}

export interface LlmapiInputContext extends SlotContextBase {
    history: SlotHistory,
    // 这个和slot里面的有细微的差别
    // 截断summary或补充开场白
    histories: LlmapiHistory[],
    // 持续当前输出，意味着要拼接当前output
    current: boolean,
    contentHandlers: ContentHandler[],
}

export interface LlmapiResultContext extends SlotContextBase {
    sessionId?: string;
    history: SlotHistory,
}

export interface RenderContext extends SlotContextBase {
    history: SlotHistory,
    contentHandlers: ContentHandler[],
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

// 读取初始化好的缓存；未初始化说明漏了 initialize，直接报错而不是拿到 undefined 往下传。
function getContent<T>(slot: SlotModel, key: string): T {
    const value = slot.context[key];
    if (value === undefined) {
        throw new BusinessError(`slot content "${key}" is not initialized`,
            "slot.content_not_initialized")
            .withValue("key", key);
    }
    return value as T;
}

// 初始化缓存；同键禁止重复初始化，防止两个引擎/插件意外共用同一 key 互相覆盖。
function setContent(slot: SlotModel, key: string, value: any) {
    if (slot.context[key] !== undefined || value === undefined) {
        throw new BusinessError(`slot content "${key}" already initialized`,
            "slot.content_already_initialized")
            .withValue("key", key);
    }
    slot.context[key] = value;
}

// 生成虚拟开场历史：把各预设 opening 解析为输入消息，作为变量的初始来源（懒生成并缓存）。
function getOpening(slot: SlotModel) {
    const key = 'openingHistory';
    let openingHistory = slot.context[key] as SlotHistory;
    if (!openingHistory) {
        let variables = {};
        for (const preset of slot.presets) {
            variables = mergeObjects(variables, preset.content.variables);
        }
        openingHistory = {
            id: 0,
            code: "opening history",
            name: "0",
            disabled: false,
            inputs: [{
                content: "",
                variables: [],
                properties: {}
            }],
            summary: true,
            outputId: 0,
            outputs: [],
            variables
        };
        openingHistory.outputs.push(slot.presets
            .map(u => u.content.opening?.trim())
            .filter(u => u)
            .map(v => messageUtils.setContent(
                {
                    thought: "",
                    content: "",
                    variables: [],
                    properties: {}
                }, v)));
        // 懒生成写入，setContent 会检测同键重复初始化
        setContent(slot, key, openingHistory);
        console.log("[slot](opening): ", openingHistory);
    }
    return openingHistory;
}

export const slotUtils = {getContent, setContent, getOpening, handleContent};