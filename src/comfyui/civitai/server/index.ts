import { execFileSync } from 'node:child_process';

import path from 'path';

import { ModelImporter } from '@/comfyui/server';
import { BusinessError, checker } from '@/interceptors';
import { fileUtils } from '@/utils/server';

import { civitais as main } from '..';

export const importer: ModelImporter = {
  id: main.name,
  async download(model, filename): Promise<void> {
    await fileUtils.mkdir(path.dirname(filename));
    const urlStr = checker.notNullOrWhitespace(
      'download',
      model.download,
      'civitai',
    );
    const url = new URL(urlStr);
    try {
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
        url: url.hostname,
      });
    }
  },
};

export const civitais = {
  ...main,
  importer,
};
