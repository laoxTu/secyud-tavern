import {BaseModel, EntryModel} from "@/business/models";
import {RequireModel} from "@/presets/models";
import {tryGetLastItem} from "@/utils";

export interface VariableChangeModel {
    op: string;
    path: string;
    value: any;
}

export interface StoryModel extends BaseModel {
    requires: RequireModel[],
    llmapi: RequireModel | null,
    histories?: StoryHistory[]
}

export interface StoryHistoryMessage {
    content: string;
    activeLorebooks?: string[];
    variables: VariableChangeModel[];
}

export interface StoryInputMessage extends StoryHistoryMessage {
    id: number;
}

export interface StoryOutputMessage extends StoryHistoryMessage {
    id: number;
}

export interface StoryHistory extends EntryModel{
    outputId: number;
    summary: boolean;
    variables: Record<string, any>;
    inputs: StoryInputMessage[];
    outputs: StoryOutputMessage[];
}

export function getCurrentOutput(history: StoryHistory) {
    if (history.outputs.length === 0) return undefined;
    const outputId = Math.min(history.outputs.length - 1, history.outputId);
    return history.outputs[outputId];
}

export function applyPatch(variables: any, changes: VariableChangeModel[]) {

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
            if (obj as VariableChangeModel) {
                results.push(obj as VariableChangeModel);
            } else if (Array.isArray(obj)) {
                for (const item of obj) {
                    if (item as VariableChangeModel) {
                        results.push(item as VariableChangeModel);
                    }
                }
            }
        } catch (e) {
            console.warn(`JSON 解析失败: ${element.trim().substring(0, 100)}...`);
            console.warn(e);
        }
        return ''; // 删除匹配的内容
    });

    history.variables = results;
    history.content = text;
}


export const moduleName = 'story';
export const moduleArrayName = 'stories';