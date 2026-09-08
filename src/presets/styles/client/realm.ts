import { utils } from '@/database';
import { Preset, PresetItem } from '@/presets';
import { Style, styles } from '@/presets/styles';
import { realms } from '@/stories/client/realms';
import { Renderer } from '@/stories/client/renderer';

const prefix = 'stl';

export interface StyleCache {
  entries: PresetItem<Style>[];
}

export const renderer: Renderer = {
  id: styles.name,
  init: async ({ realm }) => {
    const cache: StyleCache = {
      entries: [],
    };
    await utils.forEachItemsList<PresetItem<Style>, Preset>(
      realm.presets,
      styles.plural,
      async (entry) => {
        if (entry.disabled) return;
        cache.entries.push(entry);
      },
    );
    cache.entries.sort((a, b) => a.priority - b.priority);
    return cache;
  },
  output: async ({}, cache: StyleCache) => {
    const { contentWindow, contentDocument: document } = realms.iframe;
    const window = contentWindow as any;
    if (!window.__injectedStyleInitialized && document) {
      window.__injectedStyleInitialized = true;
      console.debug('[style]: start inject');
      const set = new Set<string>();
      for (const { code, type, content } of cache.entries) {
        const id = `${prefix}-${code}`;
        if (set.has(id)) continue;
        if (type === 'link') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = content.trim();
          link.id = id;
          document.head.appendChild(link);
        } else {
          const style = document.createElement('style');
          style.innerHTML = content;
          style.id = id;
          document.head.appendChild(style);
        }
      }
    }
  },
};
