import { eq } from 'drizzle-orm';

import { Entity, InDto } from '@/database';
import { databases } from '@/database/server';
import { route } from '@/interceptors/server';
import { tasks } from '@/tasks/server';
import { response } from '@/utils/server';

import { ComfyUIModel } from '../model';

import { getDownloadParams, importers, ModelDownloadArgs } from './importers';
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
        const { model } = await getDownloadParams(id);
        await tasks.manager.create<ModelDownloadArgs>(
          `download ${model.code}`,
          {
            provider: importers.tasks.id,
            id,
          },
        );
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
