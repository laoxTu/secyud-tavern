import { ComfyUIModel, ComfyUIModelSetting } from '@/comfyui';
// 导入器的下载功能，从对应网站下载模型
import { settings } from '@/global/server';
import { BusinessError, checker } from '@/interceptors';
import { getRegistry, Registerable } from '@/plugins';
import { signals } from '@/signal/server';
import { TaskArgs, TaskProvider } from '@/tasks/server/manager';
import { fileUtils } from '@/utils/server';

import { comfyuis } from '.';

export interface ModelDownloadArgs extends TaskArgs {
  id: string;
}

/**
 * 导入模型的下载方式
 * 下载进度自行控制
 */
export interface ModelImporter extends Registerable {
  download: (model: ComfyUIModel, path: string) => Promise<void>;
}

const registry = getRegistry<ModelImporter>('comfyui-model-importer');

export async function getDownloadParams(id: string) {
  const model = await comfyuis.repository.model.get(id);

  const setting =
    (
      await settings.repository.get<{ state: ComfyUIModelSetting }>(
        comfyuis.model.setting,
      )
    )?.data?.state ?? comfyuis.setting.default;
  checker.notNullOrWhitespace('model.download', model.download, 'comfyui');
  const directory = checker.notNullOrWhitespace(
    'directory',
    setting.directory,
    'comfyui',
  );
  const path = checker.notNullOrWhitespace('model.path', model.path, 'comfyui');

  const filename = `${directory}/${
    {
      vae: 'vae',
      diffusion_model: 'diffusion_models',
      lora: 'loras',
      text_encoder: 'text_encoders',
      checkpoint: 'checkpoints',
    }[model.type] ?? 'loras'
  }/${path}`;

  return { model, filename };
}

const tasks: TaskProvider<ModelDownloadArgs> = {
  id: 'comfyui-model-download',
  async execute(args) {
    try {
      const { model, filename } = await getDownloadParams(args.id);
      if (await fileUtils.exists(filename)) {
        throw new BusinessError('file is exists.', 'comfyui.file_exists');
      }
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
        message: `message.comfyui.download.success`,
        data: {
          path: model.path,
        },
      });
    } catch (error) {
      console.error(`[comfyui](download): `, error);
      signals.toast({
        type: 'error',
        message: `error.comfyui.download_failed`,
        data: {
          message: (error as any)?.message ?? 'unknown error',
        },
      });
      throw error;
    }
  },
};

export const importers = {
  registry,
  tasks,
};
