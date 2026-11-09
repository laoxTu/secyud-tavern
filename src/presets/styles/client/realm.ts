import { utils } from '@/database';
import { Preset, PresetItem } from '@/presets';
import { Style, styles } from '@/presets/styles';
import { Renderer } from '@/stories/client/renderer';
import { realms } from '@/stories/realms/client';

const prefix = 'stl';

export interface StyleCache {
  entries: PresetItem<Style>[];
}

interface StyleWindow {
  __style_injected?: boolean;
}
export const renderer: Renderer = {
  id: styles.name,
  init: async ({ realm }) => {
    const cache: StyleCache = {
      entries: [],
    };
    const map = new Map<string, PresetItem<Style>>();
    await utils.forEachItemsList<PresetItem<Style>, Preset>(
      realm.presets,
      styles.plural,
      async (entry) => {
        const { disabled, code } = entry;
        if (disabled) return;
        map.set(code, entry);
      },
    );
    cache.entries = [...map.values()].sort((a, b) => a.priority - b.priority);
    return cache;
  },
  output: async ({}, cache: StyleCache) => {
    const { contentWindow, contentDocument: document } = realms.iframe;
    const window = contentWindow as StyleWindow;
    if (!window.__style_injected && document) {
      window.__style_injected = true;
      console.debug('[style]: start inject');
      for (const { code, type, content } of cache.entries) {
        const id = `${prefix}-${code}`;
        if (type === 'link') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = content?.trim() ?? '';
          link.id = id;
          document.head.appendChild(link);
        } else {
          const style = document.createElement('style');
          style.innerHTML = content ?? '';
          style.id = id;
          document.head.appendChild(style);
        }
      }
    }
  },
};
