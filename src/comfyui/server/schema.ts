import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

import { foreignKey, json } from '@/database/server/factory';

export const comfyuiModelSchema = sqliteTable(
  'comfyui_model',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    cover: text('cover'),
    path: text('path'),
    url: text('url'),
    html: text('html'),
    model: text('model'),
    download: text('download'),
    importer: text('importer'),
    properties: json('properties').default({}),
  },
  (t) => [
    index(`comfyui_model_code_idx`).on(t.name),
    index(`comfyui_model_name_idx`).on(t.name),
    index(`comfyui_model_type_idx`).on(t.type),
  ],
);

export const comfyuiWorkflowSchema = sqliteTable(
  'comfyui_workflow',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    content: text('content'),
    properties: json('properties').default({}),
  },
  (t) => [
    index(`comfyui_workflow_name_idx`).on(t.name),
    index(`comfyui_workflow_description_idx`).on(t.description),
  ],
);

export const comfyuiParamSchema = sqliteTable(
  'comfyui_param',
  {
    masterId: foreignKey('master_id', () => comfyuiWorkflowSchema.id).notNull(),
    sequence: integer('sequence').notNull(),
    type: text('content').notNull(),
    name: text('name').notNull(),
    config: json('config'),
  },
  (table) => [primaryKey({ columns: [table.masterId, table.sequence] })],
);
