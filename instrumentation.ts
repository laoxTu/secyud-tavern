// instrumentation.ts
import { dbProvider } from '@/database/server/provider';

export async function register() {
  await dbProvider.migrate();
}
