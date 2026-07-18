import {Registerable} from "@/utils/register";
import React, {RefObject} from "react";
import {ComfyUIParameterModel, ComfyUIWorkflowInput, ComfyUIWorkflowModel} from "@/modules/comfyui/models";

export interface ComfyUIParameterProps {
    entry: ComfyUIParameterModel;
    formRef: RefObject<HTMLFormElement | null>;
}

export interface ComfyUIParameterParams {
    data: FormData,
    entry: ComfyUIParameterModel,
    model: ComfyUIWorkflowModel,
}


export interface ComfyUIParameter extends Registerable {
    /**
     * 从EditorComponentForm里获取设置参数 config
     */
    getEditorValue: (data: ComfyUIParameterParams) => any;
    /**
     * 编辑页面组件，预定义编辑器参数
     */
    editorComponent: React.ComponentType<ComfyUIParameterProps>;
    /**
     * 从InputComponentForm和config对input进行更改
     * input是comfyui的workflow内容。
     */
    setInputData: (data: ComfyUIParameterParams, input: ComfyUIWorkflowInput) => void;
    /**
     * input组件，comfyui在生图框中可以在此输入，
     * 以此改变模型，提示词等，llm生成提示词也可
     * 放在这里
     */
    inputComponent: React.ComponentType<ComfyUIParameterProps>;
}