import {LlmapiTool} from "@/engines/tools/client/models";
import {getCurrentOutput, getVariableValue, LlmapiToolModel, VariableChangeModel} from "@/modules/slots/models";
import {Editor} from "@/engines/tools/variable/client/editor";
import {getLastHistory} from "@/modules/slots/client/models";
import {generateCurrentVariables} from "@/modules/slots/client/conversation";


export const variableGetTool: LlmapiTool = {
    id: "get_variable", component: Editor,
    getValue: () => ({}),
    invoke: async ({path}: { path: string }, ctx) => {
        const history = getLastHistory(ctx.slot);
        // 读取当前变量（含本轮未落盘的变更，让模型看到刚改完的状态）。
        const variables = generateCurrentVariables(history, true);
        const {current, realPath, exists} = getVariableValue(variables, path, false);
        // 返回标准化路径、值和是否存在，供模型判断后续读写。
        return {
            path: realPath,
            value: current,
            exists,
        };
    },
    model(): LlmapiToolModel {
        return {
            function: {
                description: "get the specific path value desc of current variable (the variable after this ai output)",
                name: "getVariable",
                parameters: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "the path of the target variable, use '/' separate",
                        }
                    },
                    additionalProperties: false,
                    required: ["path"],
                }
            },
            type: "function"
        };
    }
};

export const variableSetTool: LlmapiTool = {
    id: "set_variable", component: Editor,
    getValue: () => ({}),
    invoke: async ({variableChanges}: { variableChanges: VariableChangeModel[] }, ctx) => {
        const history = getLastHistory(ctx.slot);
        const currentOutput = getCurrentOutput(history);
        if (currentOutput) {
            // 变更记入本轮输出的 variables，输出保存后由 generateCurrentVariables 统一应用。
            for (const variableChange of variableChanges) {
                currentOutput.variables.push(variableChange);
            }
        }
        return {success: true,};
    },
    model(): LlmapiToolModel {
        return {
            function: {
                description: "set the variable changes",
                name: "setVariable",
                parameters: {
                    type: "object",
                    additionalProperties: false,
                    required: ["variableChanges"],
                    properties: {
                        variableChanges: {
                            type: "array",
                            items: {
                                $ref: "variableChange",
                            },
                            description: "the change list of the target variable",
                        }
                    },
                    // DeepSeek 官方用 $def（非标准 $defs），$ref 直接写键名，勿改。
                    $def: {
                        variableChange: {
                            type: "object",
                            description: "the change operation of variable",
                            properties: {
                                op: {
                                    type: "string",
                                    description: "the operation, if remove, value is not required",
                                    enum: ["add", "update", "remove"],
                                },
                                path: {
                                    type: "string",
                                    description: "the path of the target variable, use '/' separate",
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
                                            description: "any object struct value, set the whole object to value",
                                            additionalProperties: true,
                                            properties: {},
                                            required: [],
                                        }
                                    ]
                                }
                            },
                            additionalProperties: false,
                            required: ["op", "path", "value"],
                        }
                    }
                }
            },
            type: "function",
        };
    }
};