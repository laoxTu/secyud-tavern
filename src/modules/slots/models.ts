import {BaseModel} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";
import {StoryHistory, StoryModel, StoryOutputToolCall} from "@/modules/stories/models";
import {LlmapiModel} from "@/modules/llmapis/models";
import {tryGetLastItem} from "@/utils";

export interface SlotModel extends BaseModel {
    story: StoryModel,
    presets: PresetModel[],
    llmapi: LlmapiModel
}

// region llm api message

interface LlmapiMessageModelBase {
    content: string,
}

interface LlmapiUserMessageModel extends LlmapiMessageModelBase {
    role: "user",
}

interface LlmapiSystemMessageModel extends LlmapiMessageModelBase {
    role: "system",
}

interface LlmapiAIMessageModel extends LlmapiMessageModelBase {
    role: "assistant",
    toolCalls?: StoryOutputToolCall[],
}

interface LlmapiToolMessageModel extends LlmapiMessageModelBase {
    role: "tool";
    toolCallId: string,
}

export type LlmapiMessageModel =
    LlmapiUserMessageModel |
    LlmapiSystemMessageModel |
    LlmapiAIMessageModel |
    LlmapiToolMessageModel
    ;

export function isContentRole(role: string) {
    return role === "system" || role === "user" || role === "assistant";
}

// endregion

// region llm api input
interface JsonPropertyBase {
    description: string,
}

interface RefProperty {
    $ref: string,
}

interface StringProperty extends JsonPropertyBase {
    type: "string",
    pattern?: string,
    format?: "email" | "hostname" | "ipv4" | "ipv6" | "uuid",
    enum?: string[],
}

interface NumberProperty extends JsonPropertyBase {
    type: "number" | "integer",
    const?: number,
    default?: number,
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: number,
    exclusiveMaximum?: number,
    multipleOf?: number,
}

interface BooleanProperty extends JsonPropertyBase {
    type: "boolean",
}

interface ArrayProperty extends JsonPropertyBase {
    type: "array",
    items: JsonSchemaProperty,
}

interface JsonProperty {
    type: "object",
    properties: JsonSchemaProperties,
    required: string[],
    additionalProperties: boolean,
}

type JsonSchemaProperty =
    RefProperty
    | StringProperty
    | NumberProperty
    | BooleanProperty
    | ArrayProperty
    | JsonProperty;
type JsonSchemaProperties = Record<string, JsonSchemaProperty | { anyOf: JsonSchemaProperty[] }>;

interface JsonSchema extends JsonProperty {
    $def?: JsonSchemaProperties,
}

interface LlmapiToolFunction {
    type: "function",
    function: {
        name: string,
        description: string,
        parameters: JsonSchema
    }
}

export type LlmapiToolModel = LlmapiToolFunction;

export interface LlmapiInputModel {
    messages: LlmapiMessageModel[];
    tools?: LlmapiToolModel[];
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

    return {
        current,      // 目标节点
        parent,       // 目标节点的父节点
        realPath,     // 完整路径
        nextPath,     // 下一个路径
        lastKey,      // 最后一个键名
        exists: realPath === keys.join('/')
    };
}

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