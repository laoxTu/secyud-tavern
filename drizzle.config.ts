import type { Config } from 'drizzle-kit';

import { dbProvider } from '@/database/server/provider';

export default {
  schema: 'src/**/schema.ts',
  out: dbProvider.migrationsFolder,
  dialect: 'sqlite',
  dbCredentials: {
    url: dbProvider.url,
  },
} satisfies Config;
