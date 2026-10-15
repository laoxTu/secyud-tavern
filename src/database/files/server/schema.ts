import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const fileSchema = sqliteTable('file', {
  // id 作为主键（GUID），其他表通过这个字段关联
  id: text('id').primaryKey(),
  // sha256 唯一索引，用于内容查重
  hash: text('hash').notNull().unique(),
  // mime type 前缀. e.g.: image/png
  type: text('type').notNull(),
  // mime type 参数. e.g.: charset=UTF-8
  args: text('args'),
});
export type FileTable = typeof fileSchema;
