import { InDto } from '@/database';
import { route } from '@/interceptors/server';
import { sseUtils } from '@/signal';
import { response } from '@/utils/server';

import { Model } from '..';

import { engines } from './engine';

import { models } from '.';

export default {
  models: {
    GET: route(async (_, records) => {
      const request = records.searchParams;
      const data = await models.repository.list(request);
      return response.json(data);
    }),
    POST: route(async (request) => {
      const model: Model = await request.json();
      const id = await models.repository.create(model);
      return response.json({ id });
    }),
    '[id]': {
      engine: {
        generate: {
          POST: route(async (request, records) => {
            const { id } = await records.params;
            const input = await request.json();
            const model = await models.repository.get(id);

            const result = await engines.generate(model, input, request.signal);

            return model.stream
              ? response.create(await sseUtils.pack(result as any), {
                  headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                  },
                })
              : response.json(result);
          }),
        },
      },
      clone: {
        POST: route(async (request, records) => {
          const model: Partial<Model> = await request.json();
          const { id: sourceId } = await records.params;
          const source = await models.repository.get(sourceId);
          const target = { ...source, ...model, id: '' };
          const id = await models.repository.create(target);
          return response.json({ id });
        }),
      },
      GET: route(async (_, record) => {
        const { id } = await record.params;
        const model = await models.repository.get(id);
        return response.json(model);
      }),
      PUT: route(async (request, record) => {
        const { id } = await record.params;
        const model: InDto<Model> = await request.json();
        await models.repository.update(id, model);
        return response.json(null);
      }),
      DELETE: route(async (_, record) => {
        const { id } = await record.params;
        await models.repository.delete(id);
        return response.json(null);
      }),
    },
  },
};
