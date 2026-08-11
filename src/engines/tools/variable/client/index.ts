import {LlmapiTool} from "@/engines/tools/client/models";
import {getCurrentOutput, getVariableValue, LlmapiToolModel, VariableChangeModel} from "@/modules/slots/models";
import {Editor} from "@/engines/tools/variable/client/editor";
import {getLastHistory} from "@/modules/slots/client/models";
import {generateCurrentVariables} from "@/modules/slots/client/conversation";


export const variableGetTool: LlmapiTool = {
    id: "variable", component: Editor,
    getValue: () => ({}),
    invoke: async ({path}: { path: string }, ctx) => {
        const history = getLastHistory(ctx.slot);
        const variables = generateCurrentVariables(history, true);
        const {current, realPath, exists} = getVariableValue(variables, path, false);
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
                name: "",
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
    id: "variable", component: Editor,
    getValue: () => ({}),
    invoke: async ({variableChanges}: { variableChanges: VariableChangeModel[] }, ctx) => {
        const history = getLastHistory(ctx.slot);
        const currentOutput = getCurrentOutput(history);
        if (currentOutput) {
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
                name: "",
                parameters: {
                    type: "object",
                    additionalProperties: false,
                    required: ["variableChanges"],
                    properties: {
                        variableChanges: {
                            type: "array",
                            items: {
                                $ref: "variable",
                            },
                            description: "the change of the target variable",
                        }
                    },
                    $def: {
                        variableChange: {
                            type: "object",
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