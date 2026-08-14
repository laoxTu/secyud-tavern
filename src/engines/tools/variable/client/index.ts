import {LlmapiTool, LlmapiToolProvider} from "@/engines/tools/client/models";
import {
    getCurrentOutput,
    getVariableValue,
    LlmapiToolModel,
    SlotModel,
    VariableChangeModel
} from "@/modules/slots/models";
import {Editor} from "./editor";
import {getLastHistory} from "@/modules/slots/client/models";
import {generateCurrentVariables} from "@/modules/slots/client/conversation";
import {UrlFetchConfigModel} from "@/engines/tools/url-fetch/models";
import {LlmapiToolConfigModel} from "@/engines/tools/models";

export const variableToolProvider: LlmapiToolProvider = {
    id: "variable",
    component: Editor,
    getValue: (data: FormData): UrlFetchConfigModel => {
        return {
            maxResults: parseInt(data.get('max_result_count') as string),
            timeout: parseInt(data.get('timeout') as string),
            maxLength: parseInt(data.get('max_length') as string),
        };
    },
    async create(config: LlmapiToolConfigModel, slot) {
        return [new VariableGetTool(slot), new VariableSetTool(slot)];
    },
};

export class VariableGetTool implements LlmapiTool {
    constructor(private slot: SlotModel) {
        this.model = {
            name: "get_variable",
            description: "get the value of the variable object by path",
            parameters: {
                type: "object",
                additionalProperties: false,
                required: ["path"],
                properties: {
                    path: {
                        type: "string",
                        description: "path, use '/' separate",
                    }
                },
            }
        };
    }

    async invoke({path}: { path: string }) {
        const history = getLastHistory(this.slot);
        // 读取当前变量（含本轮未落盘的变更，让模型看到刚改完的状态）。
        const variables = generateCurrentVariables(history, true);
        const {current, realPath, exists} = getVariableValue(variables, path, false);
        // 返回标准化路径、值和是否存在，供模型判断后续读写。
        return exists ? JSON.stringify(current) : `not exists, closest path: ${realPath}`;
    }

    model: LlmapiToolModel;
}

export class VariableSetTool implements LlmapiTool {
    constructor(private slot: SlotModel) {
        this.model = {
            name: "set_variable",
            description: "use JSON patch change list to change variable",
            parameters: {
                type: "object",
                additionalProperties: false,
                required: ["changes"],
                properties: {
                    changes: {
                        type: "array",
                        description: "the change list",
                        items: {
                            $ref: "change",
                        },
                    }
                },
                $def: {
                    change: {
                        type: "object",
                        description: "a JSON patch option",
                        additionalProperties: false,
                        required: ["op", "path", "value"],
                        properties: {
                            op: {
                                type: "string",
                                description: "change type",
                                enum: ["add", "update", "remove"],
                            },
                            path: {
                                type: "string",
                                description: "use '/' separate. recursively create object if path not exist.",
                            },
                            value: {
                                anyOf: [
                                    {
                                        type: "string",
                                        description: "string value",
                                    },
                                    {
                                        type: "number",
                                        description: "number value",
                                    },
                                    {
                                        type: "boolean",
                                        description: "boolean value",
                                    },
                                    {
                                        type: "object",
                                        description: "any object struct value, set the whole object to target path.",
                                        additionalProperties: true,
                                        required: [],
                                    }
                                ]
                            }
                        },
                    },
                },
            },
        };
    }

    async invoke({changes}: { changes: VariableChangeModel[] }) {
        const history = getLastHistory(this.slot);
        const currentOutput = getCurrentOutput(history);
        if (currentOutput) {
            // 变更记入本轮输出的 variables，输出保存后由 generateCurrentVariables 统一应用。
            for (const change of changes) {
                currentOutput.variables.push(change);
            }
        }
        return "success";
    }

    model: LlmapiToolModel;
}

