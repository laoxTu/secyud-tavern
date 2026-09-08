import { utils } from '@/database';
import { Processer } from '@/models/client/processer';
import { Preset, PresetItem } from '@/presets';
import { Regex, regexes } from '@/presets/regexes';
import { RealmRenderContext, Renderer } from '@/stories/client/renderer';

function applyRegexes(regexes: PresetItem<Regex>[], text?: string) {
  if (!text || text == '') return '';
  for (const { pattern, replacement } of regexes) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

export interface RegexCache {
  prompts: PresetItem<Regex>[];
}

export const processer: Processer = {
  id: regexes.name,
  async init({ realm }) {
    const cache: RegexCache = {
      prompts: [],
    };
    await utils.forEachItemsList<PresetItem<Regex>, Preset>(
      realm.presets,
      regexes.plural,
      async (entry) => {
        const { disabled, target } = entry;
        if (disabled) return;
        if (target == 'both' || target == 'input') {
          cache.prompts.push(entry);
        }
      },
    );
    return cache;
  },
  async prompt({ converts }, cache: RegexCache) {
    const generate = async (str: string, role: string) => {
      return role !== 'tool' ? applyRegexes(cache.prompts, str) : str;
    };
    converts.push(generate);
  },
};

export interface RegexRealmCache {
  renders: PresetItem<Regex>[];
}

async function render(
  { converts }: RealmRenderContext,
  cache: RegexRealmCache,
) {
  const generate = async (str: string, role: string) => {
    return role !== 'tool' ? applyRegexes(cache.renders, str) : str;
  };
  converts.push(generate);
}

export const renderer: Renderer = {
  id: regexes.name,
  async init({ realm }) {
    const cache: RegexRealmCache = {
      renders: [],
    };
    await utils.forEachItemsList<PresetItem<Regex>, Preset>(
      realm.presets,
      regexes.plural,
      async (entry) => {
        const { disabled, target } = entry;
        if (disabled) return;
        if (target == 'both' || target == 'output') {
          cache.renders.push(entry);
        }
      },
    );
    return cache;
  },
  output: render,
  stream: render,
};
