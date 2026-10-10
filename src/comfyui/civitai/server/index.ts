import { execFileSync } from 'node:child_process';

import path from 'path';

import { ModelImporter } from '@/comfyui/server';
import { BusinessError, checker } from '@/interceptors';
import { fileUtils } from '@/utils/server';

import { civitais as main } from '..';

export const importer: ModelImporter = {
  id: main.name,
  async download(model, filename): Promise<void> {
    // 参数校验先于建目录：缺 download 时不应该留下空目录
    const urlStr = checker.notNullOrWhitespace(
      'download',
      model.download,
      'civitai',
    );
    await fileUtils.mkdir(path.dirname(filename));
    let url: URL | undefined;
    try {
      // 非法 URL 也走同一层包装，不要漏出裸 TypeError
      url = new URL(urlStr);
      const token = process.env.CIVITAI_TOKEN;
      const isOfficial =
        url.hostname === 'civitai.com' || url.hostname.endsWith('.civitai.com');
      if (token && isOfficial) url.searchParams.set('token', token);

      const command = `curl -L -o "${filename}" "${url}"`;
      console.info(`[command] ${command}`);
      execFileSync('curl', ['-L', '-o', filename, url.toString()]);
    } catch (err) {
      console.error(err);
      throw new BusinessError(
        'download failed',
        'message.civitai.download.failed',
        err,
      ).withValues({
        url: url?.hostname,
      });
    }
  },
};

export const civitais = {
  ...main,
  importer,
};
