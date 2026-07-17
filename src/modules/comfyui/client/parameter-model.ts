import {Registerable} from "@/utils/register";
import React, {RefObject} from "react";
import {ComfyUIParameterModel, ComfyUIWorkflowInput} from "@/modules/comfyui/models";

export interface ComfyUIParameterProps {
    entry: ComfyUIParameterModel;
    /**
     * editor状态下是字符串, input模式下是json, 如果json parse失败, 则会提示
     */
    workflow: ComfyUIWorkflowInput | string;
    formRef: RefObject<HTMLFormElement | null>;
}


export interface ComfyUIParameter extends Registerable {
    /**
     * 从EditorComponentForm里获取设置参数 config
     */
    getEditorValue: (data: FormData, entry: ComfyUIParameterModel) => any;
    /**
     * 编辑页面组件，预定义编辑器参数
     */
    editorComponent: React.ComponentType<ComfyUIParameterProps>;
    /**
     * 从InputComponentForm和config对input进行更改
     * input是comfyui的workflow内容。
     */
    setInputData: (data: FormData, entry: ComfyUIParameterModel, input: ComfyUIWorkflowInput) => void;
    /**
     * input组件，comfyui在生图框中可以在此输入，
     * 以此改变模型，提示词等，llm生成提示词也可
     * 放在这里
     */
    inputComponent: React.ComponentType<ComfyUIParameterProps>;
}