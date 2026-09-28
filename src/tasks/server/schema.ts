import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

import { foreignKey, json } from '@/database/server/factory';

export const taskSchema = sqliteTable(
  'task',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    args: json<Record<string, any>>('args').notNull(),
    progress: real('progress'),
    attempt: integer('attempt').notNull(),
    queue: integer('queue'),
    start: integer('start'),
    finish: integer('finish'),
    result: text('result'),
    status: text('status').notNull(),
    properties: json('properties').default({}),
  },
  (t) => [index(`task_name_idx`).on(t.name)],
);

export const taskHistorySchema = sqliteTable(
  'task_history',
  {
    masterId: foreignKey('master_id', () => taskSchema.id).notNull(),
    attempt: integer('attempt').notNull(),
    queue: integer('queue'),
    start: integer('start'),
    finish: integer('finish'),
    result: text('result'),
    status: text('status').notNull(),
  },
  (table) => [primaryKey({ columns: [table.masterId, table.attempt] })],
);
