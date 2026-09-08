import { ComfyUIModel } from '@/comfyui';
// 导入器的下载功能，从对应网站下载模型
import { getRegistry, Registerable } from '@/plugins';

/**
 * 导入模型的下载方式
 * 下载进度自行控制
 */
export interface ModelImporter extends Registerable {
  download: (model: ComfyUIModel, path: string) => Promise<void>;
}

const registry = getRegistry<ModelImporter>('comfyui-model-importer');

export const importers = {
  registry,
};
