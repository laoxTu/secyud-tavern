import { utils } from '@/database';
import { ConvertContent } from '@/models/client';
import { Processer } from '@/models/client/processer';
import { Preset, PresetItem } from '@/presets';
import { Regex, regexes } from '@/presets/regexes';
import { Realm } from '@/stories';
import { Renderer } from '@/stories/client/renderer';

export interface RegexCache {
  regexes: PresetItem<Regex>[];
}

async function apply(
  { converts }: { converts: ConvertContent[] },
  cache: RegexCache,
) {
  /**
   * 只有工具调用不会被转化，这里渲染其实不会有工具调用，也许可以去掉
   **/
  const generate: ConvertContent = async (text, { role }) => {
    if (role === 'tool') return text;
    if (!text || text == '') return '';
    for (const { pattern, replacement } of cache.regexes) {
      text = text.replace(pattern, replacement);
    }
    return text;
  };
  converts.push(generate);
}

async function init({ realm }: { realm: Realm }) {
  const cache: RegexCache = {
    regexes: [],
  };
  await utils.forEachItemsList<PresetItem<Regex>, Preset>(
    realm.presets,
    regexes.plural,
    async (entry) => {
      const { disabled, target } = entry;
      if (disabled) return;
      if (target == 'both' || target == 'input') {
        cache.regexes.push(entry);
      }
    },
  );
  return cache;
}

export const processer: Processer = {
  id: regexes.name,
  init,
  prompt: apply,
};

export const renderer: Renderer = {
  id: regexes.name,
  init,
  output: apply,
  stream: apply,
};
