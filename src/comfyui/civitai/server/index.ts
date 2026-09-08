import { execSync } from 'node:child_process';

import path from 'path';

import { ModelImporter } from '@/comfyui/server';
import { fileUtils } from '@/utils/server';

import { civitais as main } from '..';

export const importer: ModelImporter = {
  id: main.name,
  async download(model, filename): Promise<void> {
    await fileUtils.mkdir(path.dirname(filename));
    const token = process.env.CIVITAI_TOKEN;
    const command = `curl -L -o "${filename}" "${model.download}${token ? `?token=${token}` : ''}"`;
    console.info(`[command] ${command}`);
    execSync(command);
  },
};

export const civitais = {
  ...main,
  importer,
};
