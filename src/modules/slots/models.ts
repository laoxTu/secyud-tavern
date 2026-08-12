import {BaseModel} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";
import {StoryHistory, StoryModel} from "@/modules/stories/models";
import {LlmapiModel} from "@/modules/llmapis/models";
import {tryGetLastItem} from "@/utils";
import {JsonSchema} from "@/utils/json-schema";

export interface SlotModel extends BaseModel {
    story: StoryModel,
    presets: PresetModel[],
    llmapi: LlmapiModel
}


// region llm api input

export interface LlmapiToolModel {
    name: string,
    description: string,
    parameters: JsonSchema
}

// endregion

// region variables
export interface VariableChangeModel {
    op: string;
    path: string;
    value?: any;
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

export function getCurrentOutputs(history: StoryHistory) {
    if (history.outputs.length === 0) return null;
    const outputId = Math.min(history.outputs.length - 1, history.outputId);
    return history.outputs[outputId];
}

export function getCurrentOutput(history: StoryHistory) {
    const outputs = getCurrentOutputs(history);
    return outputs ? tryGetLastItem(outputs) : null;
}

// 沿 '/' 路径定位变量节点，create=true 时补建缺失的中间对象，增删改通过返回的 parent 操作。
export function getVariableValue(variables: any, path: string, create: boolean = false) {
    const keys = path.split('/').filter(k => k);
    let current = variables;
    let parent = null;
    let realPath = '';
    let nextPath = '';
    let lastKey = '';

    for (const key of keys) {
        // 检查当前节点是否存在
        if (current === null || current === undefined || typeof current !== 'object') {
            if (!create || !parent) {
                return {
                    current,
                    parent,
                    realPath,
                    nextPath,
                    lastKey,
                    exists: false
                };
            }
            // 在父节点上创建新对象
            parent[lastKey] = {};
            current = parent[lastKey];
        }

        // 向下移动
        parent = current;
        lastKey = key;
        realPath = nextPath;
        nextPath = nextPath ? `${nextPath}/${key}` : key;
        current = current[key];
    }

    realPath = nextPath;

    return {
        current,      // 目标节点
        parent,       // 目标节点的父节点
        realPath,     // 完整路径
        nextPath,     // 下一个路径
        lastKey,      // 最后一个键名
        exists: realPath === keys.join('/') && current != undefined
    };
}

// 应用一批变量变更：add/update 补建后赋值，remove 按 exists 删除。
export function applyPatch(variables: any, changes?: VariableChangeModel[]) {
    if (!changes?.length) return;
    console.debug("applyPatch", changes);
    for (const change of changes) {
        switch (change.op) {
            case "add":
            case "update": {
                const {parent, lastKey} =
                    getVariableValue(variables, change.path, true);
                if (lastKey) {
                    parent[lastKey] = change.value;
                }
                break;
            }
            case "remove": {
                const {exists, parent, lastKey} =
                    getVariableValue(variables, change.path, false);
                if (exists) {
                    delete parent[lastKey];
                }
                break;
            }
            default:
                break;
        }
    }
}

// 解析 AI 输出中的 <variable_changes> 块为变量变更并移除标签，非法 JSON 只跳过该块。
export function extractVariableChanges(history: StoryHistoryMessage, text?: string) {
    if (!text || text.trim() == '') {
        history.variables = [];
        history.content = '';
        return;
    }

    const regex = /<variable_changes>([\s\S]*?)<\/variable_changes>/g;
    const results: VariableChangeModel[] = [];
    console.debug("extractVariableChanges element", text);
    text = text.trim().replace(regex, (_, element) => {
            try {
                console.debug("extractVariableChanges element", element);
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
    );

    history.variables = results.map(u => u);
    console.debug("extractVariableChanges result", history.variables);
    history.content = text;
}

// endregion

export const moduleName = 'slot';
export const moduleArrayName = 'slots';