'use client';
import {Registerable} from "@/utils/register";
import {ComfyUIModelModel} from "@/modules/comfyui/models";
import React from "react";

/**
 * 导入方式，从各个类别导入模型
 * 目的是方便从多个来源导入模型
 * 目前已知的知名模型网站有 civitai，huggingface，modelscope，导入方式都不一样。
 */
export interface ComfyUIModelImporter extends Registerable {
    generate: (data: FormData) => Promise<ComfyUIModelModel[]>;
    component: React.ComponentType,
}