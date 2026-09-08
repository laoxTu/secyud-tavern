import { and, count, eq, like, sql, SQL } from 'drizzle-orm';
import { v4 } from 'uuid';

import { DataRequest, utils } from '@/database';
import { databases } from '@/database/server';
import { repositories } from '@/database/server/factory';
import { settings } from '@/global/server';
import { BusinessError, checker } from '@/interceptors';
import { ModelSetting } from '@/models';
import { models } from '@/models/server';
import { Preset } from '@/presets';
import { presets } from '@/presets/server';
import {
  Realm,
  RealmHistory,
  Story,
  StoryEntry,
  StoryRequestOptions,
  StoryRequestParam,
} from '@/stories';

import { realmHistorySchema, storyEntrySchema, storySchema } from './schema';
import { storage } from './storage';

const { db } = databases;

const entry = repositories.entry<StoryEntry, typeof storyEntrySchema>(
  storyEntrySchema,
  storage.manager,
  (t) => ({
    data: t.data,
    name: t.name,
  }),
);

async function fillStory(story: Story, options?: StoryRequestOptions) {
  if (options?.entities) {
    await storage.manager.load(story);
  }
  if (options?.types) {
    const types = await entry.types(story.id);
    utils.setProperty(story, 'types', types);
  }
}

async function get(id: string, options?: StoryRequestOptions) {
  const storyOrNull = await databases.get<Story, typeof storySchema>(
    storySchema,
    id,
  );
  const story = checker.notNullEntity(id, storyOrNull, 'story.id');
  await fillStory(story, options);
  return story;
}

async function create(story: Story) {
  checker.notNullOrWhitespace('name', story.name);
  if (!story.id) story.id = v4();
  await db.insert(storySchema).values(story);

  if (story.entries) {
    await storage.manager.save(story);
  }

  return story.id;
}

async function update(id: string, story: Partial<Story>) {
  checker.notWhitespace('name', story.name);
  story.id = undefined;
  await db.update(storySchema).set(story).where(eq(storySchema.id, id));
}

async function _delete(id: string) {
  await databases.delete(storySchema, id);
}

async function exist(condition: (table: typeof storySchema) => SQL) {
  return await databases.exists(storySchema, condition);
}

/**
 * list只挑选name value值
 * @param request
 */
async function list(request: DataRequest<StoryRequestParam>) {
  return await databases.query<Story, typeof storySchema>(
    storySchema,
    request,
    (t) => {
      const condition: SQL[] = [];
      if (request.search) {
        const { fuzzy } = request.search;
        if (fuzzy) {
          condition.push(like(t.name, `%${fuzzy}%`));
        }
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

const history = {
  /**
   * 获取历史
   * @param id 故事的ID
   * @param index 索引 注意! 历史获取不用sequence，用索引
   */
  get: async (id: string, index: number) => {
    const [history]: RealmHistory[] = await db
      .select()
      .from(realmHistorySchema)
      .where(eq(realmHistorySchema.masterId, id))
      .offset(index)
      .limit(1);
    return history;
  },
  /**
   * 创建历史
   */
  add: async (id: string, history: RealmHistory) => {
    history.masterId = id;
    const [{ sequence }] = await db
      .select({
        sequence: sql<number>`max(${realmHistorySchema.sequence})`,
      })
      .from(realmHistorySchema)
      .where(eq(realmHistorySchema.masterId, id));
    history.sequence = (sequence ?? -1) + 1;
    await db.insert(realmHistorySchema).values(history);
    return history.sequence;
  },
  /**
   * 更新历史
   * @param id
   * @param sequence 使用序号，因为更新时已经获取历史
   * @param history 更新的历史
   */
  set: async (id: string, sequence: number, history: Partial<RealmHistory>) => {
    // 历史禁止更新主键
    history.masterId = undefined!;
    history.sequence = undefined!;
    await db
      .update(realmHistorySchema)
      .set(history)
      .where(
        and(
          eq(realmHistorySchema.masterId, id),
          eq(realmHistorySchema.sequence, sequence),
        ),
      );
  },
  /**
   * 更新历史
   * @param id
   * @param sequence 使用序号，因为更新时已经获取历史
   */
  del: async (id: string, sequence: number) => {
    await db
      .delete(realmHistorySchema)
      .where(
        and(
          eq(realmHistorySchema.masterId, id),
          eq(realmHistorySchema.sequence, sequence),
        ),
      );
  },
};

async function getRealm(story: Story) {
  if (!story.model) {
    const modelSetting = await settings.repository.get<ModelSetting>(
      models.state.setting,
    );
    story.model = modelSetting?.data?.model;
  }

  if (!story.model) {
    throw new BusinessError(
      'no model or default configured',
      'error.story.model_not_configured',
    ).withValue('name', story.name);
  }
  const modelId = story.model.value;
  const model = await models.repository.get(modelId);
  checker.notNullEntity(modelId, model, 'model.id');

  const [{ count: historyCount }] = await db
    .select({ count: count() })
    .from(realmHistorySchema)
    .where(eq(realmHistorySchema.masterId, story.id));

  const histories = new Array<RealmHistory | null>(historyCount).fill(null);

  const requires: Preset[] = await presets.repository.listWithRequires(
    story.presets.map((u) => u.value),
  );

  const realm: Realm = {
    ...story,
    histories,
    model,
    presets: requires,
  };
  return realm;
}

export const repository = {
  get,
  create,
  update,
  delete: _delete,
  list,
  exist,
  entry,
  getRealm,
  history,
};
