import {EntryModel} from "@/business/models";

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

export interface LorebookInputBuilderModel {
    prefix: string,
    suffix: string,
}

export function getLorebookOrder(item: PresetLorebookModel) {
    return item.layer * 10000 + item.priority;
}

export function compareLorebook(lft: PresetLorebookModel, rht: PresetLorebookModel) {
    return getLorebookOrder(lft) - getLorebookOrder(rht);
}

export function getStartLorebooks(content: Record<string, any>): PresetLorebookModel[] {
    return content[startLorebooksName];
}

export function getEndLorebooks(content: Record<string, any>): PresetLorebookModel[] {
    return content[endLorebooksName];
}

export function getLorebooks(content: Record<string, any>): Record<string, PresetLorebookModel> {
    return content[engineArrayName];
}

export function setStartLorebooks(content: Record<string, any>, models: PresetLorebookModel[]) {
    content[startLorebooksName] = models;
}

export function setEndLorebooks(content: Record<string, any>, models: PresetLorebookModel[]) {
    content[endLorebooksName] = models;
}

export function setLorebooks(content: Record<string, any>, records: Record<string, PresetLorebookModel>) {
    content[engineArrayName] = records;
}


export const engineName = "lorebook";
export const engineArrayName = "lorebooks";

const startLorebooksName = engineArrayName + "Start";
const endLorebooksName = engineArrayName + "End";
