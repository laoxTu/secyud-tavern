import { eq } from 'drizzle-orm';

import { databases } from '@/database/server';
import { dbProvider } from '@/database/server/provider';

import { SettingModel, StateSettingModel } from '..';

import { settingSchema } from './schema';

const { db } = dbProvider;

export const settingRepository = {
  set: async (model: SettingModel) => {
    const entity = await databases.get<SettingModel>(settingSchema, model.id);
    if (entity) {
      await db
        .update(settingSchema)
        .set({ data: model.data })
        .where(eq(settingSchema.id, model.id));
    } else {
      await db.insert(settingSchema).values(model);
    }
  },
  get: async <T = any>(id: string): Promise<SettingModel<T> | undefined> => {
    return await databases.get<SettingModel<T>>(settingSchema, id);
  },
  getState: async <T = any>(
    id: string,
  ): Promise<StateSettingModel<T> | undefined> => {
    return await databases.get<StateSettingModel<T>>(settingSchema, id);
  },
};
