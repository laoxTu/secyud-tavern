import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

import { NameValue } from '@/database';
import { boolean, foreignKey, json, schemas } from '@/database/server/factory';
import { RealmOutput, RealmPrompt } from '@/stories';

export const storySchema = sqliteTable(
  'story',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    model: json<NameValue | null>('model').default(null),
    presets: json<NameValue[]>('presets').default([]),
    properties: json('properties').default({}),
  },
  (t) => [index(`story_name_idx`).on(t.name)],
);

export const storyEntrySchema = schemas.entry(
  'story_entry',
  () => storySchema.id,
  {
    data: json('data').notNull(),
  },
);

export const realmHistorySchema = sqliteTable(
  'realm_history',
  {
    masterId: foreignKey('master_id', () => storySchema.id).notNull(),
    sequence: integer('sequence').notNull(),
    summary: boolean('summary').default(false).notNull(),
    variables: json<Record<string, any>>('variables').default({}).notNull(),
    prompts: json<RealmPrompt[]>('inputs').default([]).notNull(),
    output: integer('output').default(-1).notNull(),
    outputs: json<RealmOutput[][]>('outputs').default([]).notNull(),
  },
  (table) => [primaryKey({ columns: [table.masterId, table.sequence] })],
);
