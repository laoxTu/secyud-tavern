import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { json } from '@/database/server/factory';

export const settingSchema = sqliteTable('setting', {
  id: text('id').primaryKey(),
  data: json('data'),
});
