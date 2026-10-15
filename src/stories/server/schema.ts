import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

import { NameValue } from '@/database';
import { boolean, json, schemas, withForeign } from '@/database/server/factory';

import { RealmSpace } from '..';

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
    masterId: withForeign('master_id', () => storySchema.id).notNull(),
    sequence: integer('sequence').default(0).notNull(),
    summary: boolean('summary').default(false).notNull(),
    content: text('content').default('').notNull(),
    variables: json<Record<string, any>>('variables').default({}).notNull(),
    index: integer('index').default(0).notNull(),
    spaces: json<RealmSpace[]>('spaces').default([]).notNull(),
  },
  (table) => [primaryKey({ columns: [table.masterId, table.sequence] })],
);
