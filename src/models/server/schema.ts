import {
  blob,
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

import { boolean, json } from '@/database/server/factory';

export const modelSchema = sqliteTable(
  'model',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    engine: text('engine'),
    builder: text('builder').notNull().default('default'),
    stream: boolean('stream').default(true),
    key: text('key'),
    iterations: integer('iterations').default(20),
    iv: blob('iv', { mode: 'buffer' }),
    properties: json('properties').default({}),
  },
  (t) => [index(`model_name_idx`).on(t.name)],
);
