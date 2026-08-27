import {LlmapiTool, LlmapiToolProvider} from "@/engines/tools/client/models";
import {LlmapiToolModel, SlotModel} from "@/modules/stories/models";
import {Editor} from "./editor";
import {extract, Operation, validate} from "@/utils/json-patch";
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
        if (!c.disableSet) {
            res.push(new VariableSetTool(slot));
            res.push(new VariableDelTool(slot));
        }
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
        const {current, exists} = extract(variables, path, false);
        // 返回标准化路径、值和是否存在，供模型判断后续读写。
        return {
            content: exists ? JSON.stringify(current.item) : `result: not exists`
        };
    }
}

abstract class VariableEditToolBase implements LlmapiTool {
    abstract model: LlmapiToolModel;

    constructor(protected slot: SlotModel) {

    }

    async invoke(operation: Operation) {
        const history = this.slot.histories.at(-1);
        const currentOutput = historyUtils.getOutputs(history)?.at(-1);
        if (currentOutput) {
            // 变更记入本轮输出的 variables，输出保存后由 generateCurrentVariables 统一应用。
            const validation = validate(operation)
            if (validation) {
                return {
                    content: `error: ${validation}`,
                }
            }
            currentOutput.variables.push(operation);
        }
        return {
            content: "success",
        };
    }
}

export class VariableSetTool extends VariableEditToolBase {
    model: LlmapiToolModel = {
        name: "set_variable",
        description: "use JSON patch to set variable.",
        parameters: {
            type: "object",
            required: ["op", "path", "value"],
            properties: {
                path: {
                    type: "string",
                    description: "A JSON Pointer path. split by '/'",
                },
                op: {
                    description: "The operation to perform.",
                    type: "string",
                    enum: ["add", "replace"]
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
            },
        },
    }
}

export class VariableDelTool extends VariableEditToolBase {
    model: LlmapiToolModel = {
        name: "del_variable",
        description: "use JSON patch to del variable.",
        parameters: {
            type: "object",
            required: ["op", "path"],
            properties: {
                path: {
                    type: "string",
                    description: "A JSON Pointer path. split by '/'",
                },
                op: {
                    description: "The operation to perform.",
                    type: "string",
                    enum: ["remove"]
                }
            },
        },
    };
}

