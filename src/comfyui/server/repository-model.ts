import { and, eq, inArray, like, SQL } from 'drizzle-orm';
import { v4 } from 'uuid';

import { ComfyUIModel, ComfyUIModelRequestParam } from '@/comfyui';
import { DataRequest } from '@/database';
import { databases } from '@/database/server';
import { checker } from '@/interceptors';

import { comfyuiModelSchema } from './schema';

const { db } = databases;

async function get(id: string) {
  const model = await databases.get<ComfyUIModel, typeof comfyuiModelSchema>(
    comfyuiModelSchema,
    id,
  );
  return checker.notNullEntity(id, model, 'model.id');
}

async function create(model: ComfyUIModel) {
  checker.notNullOrWhitespace('name', model.name);
  checker.notNullOrWhitespace('code', model.code);
  if (!model.id) model.id = v4();
  await db.insert(comfyuiModelSchema).values(model);

  return model.id;
}

async function update(id: string, model: Partial<ComfyUIModel>) {
  checker.notWhitespace('code', model.code);
  checker.notWhitespace('name', model.name);
  model.id = undefined;
  await db
    .update(comfyuiModelSchema)
    .set(model)
    .where(eq(comfyuiModelSchema.id, id));
}

async function _delete(id: string) {
  await databases.delete(comfyuiModelSchema, id);
}

async function exist(condition: (table: typeof comfyuiModelSchema) => SQL) {
  return await databases.exists(comfyuiModelSchema, condition);
}

/**
 * list只挑选name value值
 * @param request
 */
async function list(request: DataRequest<ComfyUIModelRequestParam>) {
  return await databases.query<ComfyUIModel, typeof comfyuiModelSchema>(
    comfyuiModelSchema,
    request,
    (t) => {
      const condition: SQL[] = [];
      if (request.search) {
        const { fuzzy, types } = request.search;
        if (fuzzy) {
          condition.push(like(t.name, `%${fuzzy}%`));
        }
        if (types?.length) {
          condition.push(inArray(t.type, types));
        }
      }

      return condition.length ? and(...condition) : undefined;
    },
    (t) => t.name,
    (t) => ({
      id: t.id,
      path: t.path,
    }),
  );
}

export const modelRepository = {
  get,
  create,
  update,
  delete: _delete,
  list,
  exist,
};
