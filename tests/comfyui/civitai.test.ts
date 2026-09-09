import { beforeEach, describe, it } from 'vitest';

import { ComfyUIModel } from '@/comfyui';
import { _extract } from '@/comfyui/civitai/client';

describe('civitai', () => {
  beforeEach(() => {});

  it('应当获取模型', async () => {
    const models: ComfyUIModel[] = [];
    const json = await import('./model-version.json');
    console.info('data: ', json);
    _extract(json, json.model ?? {}, models, '');
    console.info('models: ', models);
  });
});
