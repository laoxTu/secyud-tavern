import { eq } from 'drizzle-orm';

import { Entity, InDto } from '@/database';
import { databases } from '@/database/server';
import { settings } from '@/global/server';
import { BusinessError, checker } from '@/interceptors';
import { route } from '@/interceptors/server';
import { fileUtils, response, task } from '@/utils/server';

import { ComfyUIModelSetting } from '..';
import { ComfyUIModel } from '../model';

import { comfyuiModelSchema } from './schema';

import { comfyuis } from '.';

export const models = {
  GET: route(async (_, records) => {
    const request = records.searchParams;
    const data = await comfyuis.repository.model.list(request);
    return response.json(data);
  }),
  POST: route(async (request) => {
    const model: ComfyUIModel = await request.json();
    const id = await comfyuis.repository.model.create(model);
    return response.json({ id });
  }),
  import: {
    POST: route(async (request) => {
      const models: ComfyUIModel[] = await request.json();
      const res: Entity[] = [];
      for (const model of models) {
        const exist = await databases.db
          .select({ id: comfyuiModelSchema.id })
          .from(comfyuiModelSchema)
          .where(eq(comfyuiModelSchema.code, model.code))
          .get();
        if (exist?.id) {
          await comfyuis.repository.model.update(exist.id, model);
          res.push(exist);
        } else {
          const id = await comfyuis.repository.model.create(model);
          res.push({ id });
        }
      }

      return response.json(res);
    }),
  },
  '[id]': {
    download: {
      POST: route(async (_, records) => {
        const { id } = await records.params;
        const model = await comfyuis.repository.model.get(id);

        const setting = await settings.repository.get<ComfyUIModelSetting>(
          comfyuis.model.setting,
        );
        checker.notNullOrWhitespace(
          'model.download',
          model.download,
          'comfyui',
        );
        const directory = checker.notNullOrWhitespace(
          'setting.directory',
          setting?.data?.directory,
          'comfyui',
        );
        const path = checker.notNullOrWhitespace(
          'model.path',
          model.path,
          'comfyui',
        );

        const filename = `${directory}/${
          {
            vae: 'vae',
            diffusion_model: 'diffusion_models',
            lora: 'loras',
            text_encoder: 'text_encoders',
            checkpoint: 'checkpoints',
          }[model.type] ?? 'loras'
        }/${path}`;

        if (await fileUtils.exists(filename)) {
          throw new BusinessError('file is exists.', 'comfyui.file_exists');
        }

        await task.create(`comfyui_model_download ${path}`, async () => {
          await comfyuis.importers.download(model, filename);
        });

        return response.null();
      }),
    },
    GET: route(async (_, record) => {
      const { id } = await record.params;
      const model = await comfyuis.repository.model.get(id);
      return response.json(model);
    }),
    PUT: route(async (request, record) => {
      const { id: originId } = await record.params;
      const model: InDto<ComfyUIModel> = await request.json();
      const id = await comfyuis.repository.model.update(originId, model);
      return response.json({ id });
    }),
    DELETE: route(async (_, record) => {
      const { id } = await record.params;
      await comfyuis.repository.model.delete(id);
      return response.json(null);
    }),
  },
};
