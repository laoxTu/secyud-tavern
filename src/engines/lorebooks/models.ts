import {EntryModel} from "@/business/models";

export interface LorebookMessageItem {
    message: string,
    lorebooks?: string[]
}

export interface LorebookMessage {
    inputs: LorebookMessageItem[],
    output?: LorebookMessageItem,
}

export interface PresetLorebookModel extends EntryModel {
    // 匹配类型
    matchType: string,
    // 匹配表达式
    matchExpression: any,
    // 世界书内容
    content: string,
    // 优先级, 表示插入顺序
    priority: number,
    // 层级，表示插入位置
    layer: number,
    role: string,
}

export function getLorebookOrder(item: PresetLorebookModel) {
    return item.layer * 10000 + item.priority;
}

export function compareLorebook(lft: PresetLorebookModel, rht: PresetLorebookModel) {
    return getLorebookOrder(lft) - getLorebookOrder(rht);
}


export const engineName = "lorebook";
export const engineArrayName = "lorebooks";