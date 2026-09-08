import { and, eq, like, or, SQL } from 'drizzle-orm';

import { DataRequest, utils } from '@/database';
import { databases } from '@/database/server';
import { repositories } from '@/database/server/factory';
import { checker } from '@/interceptors';
import {
  Preset,
  PresetEntry,
  PresetRequestOptions,
  PresetRequestParam,
} from '@/presets';

import { presetEntrySchema, presetSchema } from './schema';
import { storage } from './storage';

const { db } = databases;

const entry = repositories.entry<PresetEntry, typeof presetEntrySchema>(
  presetEntrySchema,
  storage.manager,
  (t) => ({
    data: t.data,
    name: t.name,
    disabled: t.disabled,
  }),
);

async function fillPreset(preset: Preset, options?: PresetRequestOptions) {
  if (options?.entities) {
    await storage.manager.load(preset);
  }
  if (options?.types) {
    const types = await entry.types(preset.id);
    utils.setProperty(preset, 'types', types);
  }
}

async function get(id: string, options?: PresetRequestOptions) {
  const presetOrNull = await databases.get<Preset, typeof presetSchema>(
    presetSchema,
    id,
  );
  const preset = checker.notNullEntity(id, presetOrNull, 'preset.id');
  await fillPreset(preset, options);
  return preset;
}

async function create(preset: Preset) {
  checker.notNullOrWhitespace('name', preset.name);

  const exist = await databases.exists(presetSchema, (t) =>
    eq(t.id, preset.id),
  );
  checker.duplicate(exist, 'preset.id', 'id', preset.id);

  await db.insert(presetSchema).values(preset);

  if (preset.entries) {
    await storage.manager.save(preset);
  }

  return preset.id;
}

async function update(id: string, preset: Partial<Preset>) {
  checker.notWhitespace('name', preset.name);
  if (preset.id && preset.id !== id) {
    const exist = await databases.exists(presetSchema, (t) =>
      eq(t.id, preset.id!),
    );
    checker.duplicate(exist, 'preset.id', 'id', preset.id);
  }
  await db.update(presetSchema).set(preset).where(eq(presetSchema.id, id));

  return preset.id ?? id;
}

async function _delete(id: string) {
  await databases.delete(presetSchema, id);
}

async function exist(condition: (table: typeof presetSchema) => SQL) {
  return await databases.exists(presetSchema, condition);
}

/**
 * list只挑选name value值
 * @param request
 */
async function list(request: DataRequest<PresetRequestParam>) {
  return await databases.query<Preset, typeof presetSchema>(
    presetSchema,
    request,
    (t) => {
      const condition: SQL[] = [];
      if (request.search) {
        const { fuzzy, tags } = request.search;
        if (fuzzy) {
          condition.push(like(t.name, `%${fuzzy}%`));
          condition.push(like(t.id, `%${fuzzy}%`));
        }
        if (tags?.length) {
          condition.push(or(...tags.map((u) => like(t.tags, `%${u}%`))) as SQL);
        }
      }

      return condition.length ? and(...condition) : undefined;
    },
    (t) => t.name,
    (t) => ({
      id: t.id,
      name: t.name,
      cover: t.cover,
      version: t.version,
    }),
  );
}

async function listWithRequires(codes: string[]) {
  const presetList: Preset[] = [];
  const visited: Set<string> = new Set<string>();
  const queue = [...codes];
  let head = 0; // 头指针

  while (head < queue.length) {
    const code = queue[head++];
    if (!code || visited.has(code)) continue;
    visited.add(code);
    const preset = (await db
      .select()
      .from(presetSchema)
      .where(eq(presetSchema.id, code))
      .get()) as Preset | undefined;
    if (!preset) continue;
    await fillPreset(preset, { entities: true });
    presetList.push(preset);

    for (const require of preset.requires) {
      if (!visited.has(require.value)) queue.push(require.value);
    }
  }

  return presetList.reverse();
}

export const repository = {
  get,
  create,
  update,
  delete: _delete,
  list,
  exist,
  entry,
  listWithRequires,
};
