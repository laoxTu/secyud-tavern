import {EntryModel} from "@/business/models";
import {setContent, SlotMessageInput, SlotMessageOutput} from "@/modules/models/message";
import {tryGetLastItem} from "@/utils";
import {patch} from "@/utils/json-patch";

export interface SlotHistory extends EntryModel {
    outputId: number;
    summary: boolean;
    variables: Record<string, any>;
    inputs: SlotMessageInput[];
    outputs: SlotMessageOutput[][];
}

function getOutputs(history: SlotHistory) {
    if (history.outputs.length === 0) return null;
    const outputId = Math.min(history.outputs.length - 1, history.outputId);
    return history.outputs[outputId];
}

function getOutput(history: SlotHistory) {
    const outputs = getOutputs(history);
    return outputs ? tryGetLastItem(outputs) : null;
}

/**
 * 以存档 variables 为底，叠加输入与当前输出（可选）的变更，算出当前变量状态。
 * @param history 解析历史
 * @param output 是否结合输出
 */
function getVariables(history: SlotHistory, output: boolean = true) {
    const variables = structuredClone(history.variables);
    for (const input of history.inputs) {
        patch(variables, input.variables);
    }
    if (output && history.outputs.length > 0) {
        const outputs = getOutputs(history);
        if (outputs)
            for (const output of outputs) {
                patch(variables, output.variables);
            }
    }
    return variables;
}

export const historyUtils = {
    getOutputs,
    getOutput,
    getVariables,
};

export const messageUtils = {setContent};