import {BaseModel} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";
import {StoryHistory, StoryModel} from "@/modules/stories/models";
import {LlmapiModel} from "@/modules/llmapis/models";
import {tryGetLastItem} from "@/utils";
import {JsonSchema} from "@/utils/json-schema";
import {Operation, validate} from "@/utils/json-patch";

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

export interface StoryHistoryMessage {
    content: string;
    variables: Operation[];
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


// 解析 AI 输出中的 <variable_changes> 块为变量变更并移除标签，非法 JSON 只跳过该块。
export function extractVariableChanges(history: StoryHistoryMessage, text?: string) {
    if (!text || text.trim() == '') {
        history.variables = [];
        history.content = '';
        return;
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

    history.variables = results.map(u => u);
    history.content = text;
}

// endregion

export const moduleName = 'slot';
export const moduleArrayName = 'slots';