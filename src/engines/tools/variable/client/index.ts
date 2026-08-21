import {LlmapiTool, LlmapiToolProvider} from "@/engines/tools/client/models";
import {LlmapiToolModel, SlotModel} from "@/modules/stories/models";
import {Editor} from "./editor";
import {extract, Operation} from "@/utils/json-patch";
import {VariableConfigModel} from "../models";
import {historyUtils} from "@/modules/models";

export const variableToolProvider: LlmapiToolProvider = {
    id: "variable",
    component: Editor,
    getValue: (data: FormData): VariableConfigModel => {
        return {
            disableSet: !!data.get('disable_set'),
            disableGet: !!data.get('disable_get'),
        };
    },
    async create(config, slot) {
        const c: VariableConfigModel = config.value;
        const res: LlmapiTool[] = [];
        if (!c.disableGet) res.push(new VariableGetTool(slot));
        if (!c.disableSet) res.push(new VariableSetTool(slot));
        return res;
    },
};

export class VariableGetTool implements LlmapiTool {
    model: LlmapiToolModel;

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
        const history = this.slot.histories.at(-1);
        // 读取当前变量（含本轮未落盘的变更，让模型看到刚改完的状态）。
        const variables = history ? historyUtils.getVariables(history, true) : {};
        const {previous, current, exists} = extract(variables, path, false);
        // 返回标准化路径、值和是否存在，供模型判断后续读写。
        return {
            hidden: false,
            content: exists ? JSON.stringify(current.item) : `not exists, closest path: ${previous.path}`
        };
    }
}

export class VariableSetTool implements LlmapiTool {
    model: LlmapiToolModel;

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
                            anyOf: [
                                {
                                    type: "object",
                                    description: "the operation for a change",
                                    additionalProperties: false,
                                    required: ["value", "op", "path"],
                                    properties: {
                                        path: {
                                            $ref: "$def/path"
                                        },
                                        op: {
                                            description: "The operation to perform. if replace, path should be exist, otherwise miss change.",
                                            type: "string",
                                            enum: ["add", "replace", "test"]
                                        },
                                        value: {
                                            anyOf: [
                                                {
                                                    type: "object",
                                                    additionalProperties: true,
                                                },
                                                {
                                                    type: "string",
                                                },
                                                {
                                                    type: "number",
                                                },
                                                {
                                                    type: "boolean",
                                                }
                                            ]
                                        }
                                    }
                                },
                                {
                                    type: "object",
                                    additionalProperties: false,
                                    required: ["op", "path"],
                                    properties: {
                                        path: {
                                            $ref: "$def/path"
                                        },
                                        op: {
                                            description: "The operation to perform.",
                                            type: "string",
                                            enum: ["remove"]
                                        }
                                    }
                                },
                                {
                                    type: "object",
                                    additionalProperties: false,
                                    required: ["from", "op", "path"],
                                    properties: {
                                        path: {
                                            $ref: "$def/path"
                                        },
                                        op: {
                                            description: "The operation to perform.",
                                            type: "string",
                                            enum: ["move", "copy"]
                                        },
                                        from: {
                                            $ref: "$def/path"
                                        }
                                    }
                                }
                            ]
                        },
                    }
                },
                $def: {
                    path: {
                        type: "string",
                        description: "A JSON Pointer path.",
                        pattern: "^#?(|(/([^/~]|~[01])*)*)$",
                    },
                },
            },
        };
    }

    async invoke({changes}: { changes: Operation[] }) {
        const history = this.slot.histories.at(-1);
        const currentOutput = historyUtils.getOutputs(history)?.at(-1);
        if (currentOutput) {
            // 变更记入本轮输出的 variables，输出保存后由 generateCurrentVariables 统一应用。
            for (const change of changes) {
                currentOutput.variables.push(change);
            }
        }
        return {
            content: "success",
            hidden: false,
        };
    }
}

