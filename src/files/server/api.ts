import { DataRequest } from '@/database';
import { files } from '@/files/server';
import { route } from '@/interceptors/server';
import { response } from '@/utils/server';

export default {
  files: {
    POST: route(async (request) => {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type;
      const param = files.deserializeMimeType(mimeType);
      const id = await files.repository.create({ ...param, buffer });
      return response.json({ id });
    }),
    GET: route(async (_, records) => {
      const options = records.searchParams as DataRequest;
      const models = await files.repository.list(options);
      return response.json(models);
    }),
    '[id]': {
      resource: {
        GET: route(async (_, records) => {
          const { id } = await records.params;
          const file = await files.repository.get(id);
          return response.resource(file.id, file.type, file.buffer);
        }),
      },
      GET: route(async (_, records) => {
        const { id } = await records.params;
        const file = await files.repository.get(id);
        return response.json(file);
      }),
      DELETE: route(async (_, records) => {
        const { id } = await records.params;
        const models = await files.repository.delete(id);
        return response.json(models);
      }),
    },
  },
};
