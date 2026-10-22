import { utils } from '@/database';
import { route } from '@/interceptors/server';
import { tasks } from '@/tasks/server';
import { response } from '@/utils/server';

import { models } from './api-models';
import { workflows } from './api-workflows';
import { generator } from './generator';

export default {
  comfyuis: {
    models,
    workflows,
    generate: {
      POST: route(async (request) => {
        const prompt = await request.json();
        await tasks.manager.create(`generate ${utils.uuid()}`, {
          provider: generator.tasks.id,
          value: prompt,
        });
        return response.null();
      }),
    },
  },
};
