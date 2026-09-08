import { utils } from '@/database';
import { BusinessError } from '@/interceptors';
import { Processer } from '@/models/client';
import { Preset, PresetItem } from '@/presets';
import { realms } from '@/stories/client/realms';
import { tools as main, Tool } from '@/tools';
import { tools } from '@/tools/client';

import { ToolItem } from './providers';

export interface ToolCache {
  tools: Record<string, ToolItem>;
}

export const processer: Processer = {
  id: main.name,
  async init({ realm }) {
    const cache: ToolCache = {
      tools: {},
    };
    const { items } = tools.property(realm);
    await utils.forEachItemsList<PresetItem<Tool>, Preset>(
      realm.presets,
      tools.plural,
      async (entry) => {
        const { disabled, type } = entry;
        if (disabled || !type) return;
        // 工具未注册则报错中断，防止模型反复调用不存在的工具白耗 token。
        const provider = tools.providers.registry.record(type);
        if (!provider) {
          console.warn(`[tool]: provider missing(${type})`);
          return;
        }
        try {
          const tools = await provider.create(entry, realm);
          console.debug('[tool]: ', tools);
          for (const tool of tools) {
            const checked = items[tool.name];
            if (checked !== undefined) tool.disabled = !checked;
            cache.tools[tool.name] = tool;
          }
        } catch (error) {
          throw new BusinessError(
            'tool create failed',
            'tool.create_failed',
          ).withValue('entry', entry.name);
        }
      },
    );
    console.debug(`[lorebook](cache): `, cache);
    return cache;
  },
  async output({ history, realm }) {
    const outputs = realms.outputs(history);
    if (!outputs?.length) return;
    for (const output of outputs) {
      await tools.calling(realm, output.callings);
    }
  },
};
