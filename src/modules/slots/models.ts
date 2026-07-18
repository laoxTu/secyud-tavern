import {BaseModel} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";
import {StoryHistory, StoryModel} from "@/modules/stories/models";
import {LlmapiModel} from "@/modules/llmapis/models";
import {tryGetLastItem} from "@/utils";


export interface SlotModel extends BaseModel {
    story: StoryModel,
    presets: PresetModel[],
    llmapi: LlmapiModel
}

export interface LlmapiMessage {
    role: string; //"system" | "user" | "assistant"
    content: string,
}

export interface LlmapiInputModel {
    messages: LlmapiMessage[];
}


export interface VariableChangeModel {
    op: string;
    path: string;
    value: any;
}

export function isVariableChangeModel(obj: any) {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.op === 'string' &&
        typeof obj.path === 'string'
    );
}

export interface StoryHistoryMessage {
    content: string;
    variables: VariableChangeModel[];
    properties: Record<string, any>;
}

export function getCurrentOutput(history: StoryHistory) {
    if (history.outputs.length === 0) return undefined;
    const outputId = Math.min(history.outputs.length - 1, history.outputId);
    return history.outputs[outputId];
}

export function applyPatch(variables: any, changes: VariableChangeModel[]) {

    console.debug("applyPatch", changes);
    for (const change of changes) {
        const keys = change.path.split('/').filter(k => k !== '');
        if (keys.length === 0) {
            continue;
        }
        let current = variables;
        switch (change.op) {
            case "add":
            case "update":
                for (const key of keys.slice(0, keys.length - 1)) {
                    if (current[key] === undefined || typeof current[key] !== 'object') {
                        current[key] = {};
                    }
                    current = current[key];
                }
                current[tryGetLastItem(keys)!] = change.value;
                break;
            case "remove":
                for (const key of keys.slice(0, keys.length - 1)) {
                    current = current[key];
                    if (current === undefined || typeof current !== 'object') break;
                }
                if (current || typeof current === 'object') {
                    delete current[tryGetLastItem(keys)!];
                }
                break;
            default:
                break;
        }
    }
}

export function extractVariableChanges(history: StoryHistoryMessage, text?: string) {
    if (!text || text.trim() == '') {
        history.variables = [];
        history.content = '';
        return;
    }

    const regex = /<variable_changes>([\s\S]*?)<\/variable_changes>/g;
    const results: VariableChangeModel[] = [];
    text = text.trim().replace(regex, (match, element) => {
            try {
                const obj = JSON.parse(element.trim());
                if (Array.isArray(obj)) {
                    for (const item of obj) {
                        if (isVariableChangeModel(item)) {
                            results.push(item);
                        }
                    }
                } else if (isVariableChangeModel(obj)) {
                    results.push(obj);
                }
            } catch
                (e) {
                console.warn(`JSON 解析失败: ${element.trim().substring(0, 100)}...`);
                console.warn(e);
            }
            return ''; // 删除匹配的内容
        }
    )
    ;

    history.variables = results;
    history.content = text;
}



export const moduleName = 'slot';
export const moduleArrayName = 'slots';