import { ComfyUIModel } from '@/comfyui';
// 导入器的下载功能，从对应网站下载模型
import { getRegistry, Registerable } from '@/plugins';
import { signals } from '@/signal/server';
import { fileUtils } from '@/utils/server';

/**
 * 导入模型的下载方式
 * 下载进度自行控制
 */
export interface ModelImporter extends Registerable {
  download: (model: ComfyUIModel, path: string) => Promise<void>;
}

const registry = getRegistry<ModelImporter>('comfyui-model-importer');

async function download(model: ComfyUIModel, filename: string) {
  try {
    const importer = registry.record(model.importer);
    if (importer) {
      console.info(`[comfyui](download): ${model.path} (${importer.id})`);
      await importer.download(model, filename);
    } else {
      console.info(`[comfyui](download): ${model.path}`);
      await fileUtils.download(model.download!, filename);
    }
    signals.toast({
      type: 'success',
      message: `[comfyui] model download success: ${model.path}`,
    });
  } catch (error) {
    console.error(`[comfyui](download): `, error);
    signals.toast({
      type: 'error',
      message: `[comfyui] model download failed: ${(error as any)?.message}`,
    });
    throw error;
  }
}

export const importers = {
  registry,
  download,
};
