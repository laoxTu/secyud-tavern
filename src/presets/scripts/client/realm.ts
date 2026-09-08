import { utils } from '@/database';
import { Preset, PresetItem } from '@/presets';
import { Script, scripts } from '@/presets/scripts';
import { realms } from '@/stories/client/realms';
import { Renderer } from '@/stories/client/renderer';
import { jsonUtils } from '@/utils';

const prefix = 'sct';

export interface ScriptCache {
  importMap: string;
  entries: Script[];
}

export const renderer: Renderer = {
  id: scripts.name,
  init: async ({ realm }) => {
    const cache: ScriptCache = {
      entries: [],
      importMap: '{}',
    };
    const map: any = {};
    await utils.forEachItemsList<PresetItem<Script>, Preset>(
      realm.presets,
      scripts.plural,
      async (entry) => {
        const { disabled, type, content, id, code } = entry;
        if (disabled) return;
        if (type === 'importmap') {
          try {
            jsonUtils.merge(map, JSON.parse(content));
          } catch (err) {
            console.error(`import map error for script ${id}.${code}.`, err);
          }
        } else {
          cache.entries.push(entry);
        }
      },
    );
    cache.entries.sort((a, b) => a.priority - b.priority);
    cache.importMap = JSON.stringify(map);
    return cache;
  },
  output: async ({}, cache: ScriptCache) => {
    const { contentWindow, contentDocument: document } = realms.iframe;
    const window = contentWindow as any;
    if (!window.__injectedScriptInitialized && document) {
      window.__injectedScriptInitialized = true;
      console.debug('[script]: start inject');
      if (cache.importMap !== '{}') {
        const script = document.createElement('script');
        script.id = `${prefix}-import-map`;
        script.type = 'importmap';
        script.innerHTML = cache.importMap;
        document.head.appendChild(script);
      }

      const set = new Set<string>();
      for (const { code, type, content } of cache.entries) {
        const id = `${prefix}-${code}`;
        if (set.has(id)) continue;
        const script = document.createElement('script');
        script.id = id;
        // link 类型意味着链接：await onload 保证按优先级顺序依次加载；
        // 内联脚本则同步执行
        if (type === 'link') {
          script.async = true;
          script.src = content.trim();
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        } else {
          script.async = false;
          script.type = type ?? '';
          script.textContent = content;
          document.body.appendChild(script);
        }
      }
    }
  },
};
