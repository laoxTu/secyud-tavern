'use client';
import {ComfyUIModelModel} from "@/modules/comfyui/models";
import {EditorRegisterable} from "@/business/client/models";

/**
 * 导入方式，从各个类别导入模型
 * 目的是方便从多个来源导入模型
 * 目前已知的知名模型网站有 civitai，huggingface，modelscope，导入方式都不一样。
 */
export interface ComfyUIModelImporter extends EditorRegisterable {
    generate: (data: FormData) => Promise<ComfyUIModelModel[]>;
}