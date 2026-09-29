import { route } from '@/interceptors/server';
import { response } from '@/utils/server';

import { tasks } from '.';

export default {
  tasks: {
    GET: route(async (_, records) => {
      const request = records.searchParams;
      const data = await tasks.repository.list(request);
      return response.json(data);
    }),
    '[id]': {
      DELETE: route(async (_, record) => {
        const { id } = await record.params;
        await tasks.manager.delete(id);
        return response.null();
      }),
      restart: {
        POST: route(async (_, record) => {
          const { id } = await record.params;
          await tasks.manager.restart(id);
          return response.null();
        }),
      },
      histories: {
        GET: route(async (_, record) => {
          const { id } = await record.params;
          const list = await tasks.repository.history.list(id);
          return response.json(list);
        }),
      },
    },
  },
};
