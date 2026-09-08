import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { NameValue } from '@/database';
import { boolean, json, schemas } from '@/database/server/factory';

export const presetSchema = sqliteTable(
  'preset',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    version: text('version').notNull().default('1.0.0'),
    cover: text('cover'),
    opening: text('opening'),
    variables: text('variables'),
    description: text('description'),
    tags: json<string[]>('tags').default([]),
    requires: json<NameValue[]>('requires').default([]),
    properties: json('properties').default({}),
  },
  (t) => [
    index(`preset_name_idx`).on(t.name),
    index(`preset_tags_idx`).on(t.tags),
  ],
);

export const presetEntrySchema = schemas.entry(
  'preset_entry',
  () => presetSchema.id,
  {
    disabled: boolean('disabled').default(false),
    data: json('data').notNull(),
  },
);
