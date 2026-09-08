import crypto from 'crypto';
import { and, eq, like, SQL } from 'drizzle-orm';
import { v4, validate } from 'uuid';

import { DataRequest } from '@/database';
import { databases } from '@/database/server';
import { checker } from '@/interceptors';
import { Model, ModelRequestParam } from '@/models';
import { cache, hasher } from '@/utils/server';

import { modelSchema } from './schema';

const { db } = databases;

const cacheKey = (id: string) => `model_${id}`;

async function get(id: string) {
  return await cache.get(
    cacheKey(id),
    async () => {
      const model = await databases.get<Model, typeof modelSchema>(
        modelSchema,
        id,
      );
      return checker.notNullEntity(id, model, 'model.id');
    },
    { minute: 5 },
  );
}

async function create(model: Model) {
  model.id = validate(model.id) ? model.id : v4();
  checker.notNullOrWhitespace('name', model.name);
  model.key = undefined;
  model.iv = undefined;
  await db.insert(modelSchema).values(model);

  return model.id;
}

async function update(id: string, model: Partial<Model>) {
  checker.notWhitespace('name', model.name);
  // 更新时需要加密key。
  if (model.key) {
    const iv = crypto.randomBytes(16);
    model.key = hasher.encrypt(model.key, iv);
    model.iv = iv;
  }
  // 删除缓存
  await cache.delete(cacheKey(id));
  // 更新
  if (model.id) model.id = undefined;
  await db.update(modelSchema).set(model).where(eq(modelSchema.id, id));

  return model.id;
}

async function _delete(id: string) {
  await cache.delete(cacheKey(id));
  await databases.delete(modelSchema, id);
}

/**
 * list只挑选name value值
 * @param request
 */
async function list(request: DataRequest<ModelRequestParam>) {
  return await databases.query<Model, typeof modelSchema>(
    modelSchema,
    request,
    (t) => {
      const condition: SQL[] = [];
      if (request.search?.fuzzy) {
        condition.push(like(t.name, `%${request.search.fuzzy}%`));
      }

      return condition.length ? and(...condition) : undefined;
    },
    (t) => t.name,
    (t) => ({
      id: t.id,
      name: t.name,
    }),
  );
}

export const repository = {
  get,
  create,
  update,
  delete: _delete,
  list,
};
