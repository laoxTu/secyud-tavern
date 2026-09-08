import path from 'path';

import { fileUtils } from '@/utils/server/file';

/**
 * 迁移数据库
 */
export async function migrate(root: string) {
  console.log('[migrate]: check data folder exist.');
  await fileUtils.mkdir(path.join(root, `data`));
  try {
    console.log('[migrate]: create migration files.');
    await fileUtils.execute('npx drizzle-kit generate', { cwd: root });
  } catch (err) {
    console.error(err);
  }
  console.log('[migrate]: migrate.');
  // 动态导入，防止data文件夹不存在时报错
  const { dbProvider } = await import('@/database/server/provider');
  await dbProvider.migrate();
}
