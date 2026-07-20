'use client';
import {Registerable} from "@/utils/register";
import {ComfyUIModelModel} from "@/modules/comfyui/models";

/**
 * 导入模型的下载方式
 */
export interface ComfyUIModelImporter extends Registerable {
    download: (model: ComfyUIModelModel, path: string) => Promise<void>;
}