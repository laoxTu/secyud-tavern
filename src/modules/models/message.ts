import {Operation, validate} from "@/utils/json-patch";
import {SlotCalling} from "@/modules/models/calling";

export interface SlotMessageBase {
    // 消息内容
    content: string;
    // 变量操作
    variables: Operation[];
    // 消息属性（缓存等）
    properties: Record<string, any>;
}

export interface SlotMessageInput extends SlotMessageBase {
}

export interface SlotMessageOutput extends SlotMessageBase {
    // 思考内容
    thought: string,
    // 工具调用
    callings?: SlotCalling[],
}

// 解析 AI 输出中的 <variable_changes> 块为变量变更并移除标签，非法 JSON 只跳过该块。
export function setContent<T extends SlotMessageBase>(message: T, text?: string | null) {
    if (!text || text.trim() == '') {
        message.variables = [];
        message.content = '';
        return message;
    }

    const regex = /<variable_changes>([\s\S]*?)<\/variable_changes>/g;
    const results: Operation[] = [];
    text = text.trim().replace(regex, (_, element) => {
            try {
                console.debug("[variables](extract element): ", element);
                const obj = JSON.parse(element.trim());
                const items = Array.isArray(obj) ? obj : [obj];
                for (const item of items) {
                    if (validate(item)) {
                        results.push(item);
                    }
                }
            } catch (e) {
                console.warn("[variables](extract error): ", e);
            }
            return ''; // 删除匹配的内容
        }
    );

    message.variables = results.map(u => u);
    message.content = text;
    return message;
}