import promise from 'fs/promises';
import path from 'path';

import { strUtils } from '@/utils/str';

/**
 * 生成.env文件
 * @param root
 */
export async function generateEnvFile(root: string) {
  try {
    const envFilePath = path.join(root, '.env');
    // 使用 'wx' 标志，文件存在则不覆盖
    await promise.writeFile(
      envFilePath,
      `SECRET_SALT=${strUtils.random(40)}\n` +
        `SECRET_KEYS=${strUtils.random(39)}`,
      { flag: 'wx' },
    );
    console.info('[env]: generated successfully.');
  } catch (err: any) {
    if (err.code !== 'EEXIST') {
      console.error('[env]: generated failed!', err.message);
    }
  }
}
