'use client';
import React from 'react';

import { ComfyUIModel } from '@/comfyui';
import { getRegistry, Registerable } from '@/plugins';

/**
 * 导入方式，从各个类别导入模型
 * 目的是方便从多个来源导入模型
 * 目前已知的知名模型网站有 civitai，huggingface，modelscope，导入方式都不一样。
 */
export interface ModelImporter extends Registerable {
  configComponent: React.ComponentType;
  configureObject: (data: FormData, items: ComfyUIModel[]) => Promise<void>;
}

const registry = getRegistry<ModelImporter>('comfyui-model-importer');

export const importers = {
  registry,
};
