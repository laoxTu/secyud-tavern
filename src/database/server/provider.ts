import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate as drizzleMigrate } from 'drizzle-orm/libsql/migrator';

import { config } from '@/global';

const url = `file:${config.dataDir}/secyud-tavern.db`;
const migrationsFolder = 'scripts/migrations';

const client = createClient({ url });
const db = drizzle(client);

async function migrate() {
  await drizzleMigrate(db, { migrationsFolder });
  console.info('[database] database migrated successfully');
}

export const dbProvider = {
  client,
  db,
  migrate,
  url,
  migrationsFolder,
};
