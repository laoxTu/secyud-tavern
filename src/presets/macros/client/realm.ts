import { Eta } from 'eta/core';

import { utils } from '@/database';
import { ConvertContent, Processer } from '@/models/client';
import { Preset, PresetItem } from '@/presets';
import { Macro, macros as main } from '@/presets/macros';
import { Realm, RealmHistory } from '@/stories';
import { Renderer } from '@/stories/client';
import { realms } from '@/stories/client/realms';
import { arrUtils } from '@/utils';

import { macros } from '.';

const eta = new Eta({
  autoTrim: false,
  rmWhitespace: false,
});

export interface MacroCacheItem {
  key: string;
  singles: Record<string, PresetItem<Macro>>;
  multiples: PresetItem<Macro>[];
  select?: string;
  hidden: boolean;
}

export interface MacroCache {
  macros: Record<string, MacroCacheItem>;
}

async function apply(
  {
    converts,
    properties,
    history,
  }: {
    converts: ConvertContent[];
    history: RealmHistory;
    properties?: Record<string, any>;
  },
  cache: MacroCache,
) {
  const variables: Record<string, any> = {};
  for (const macro of Object.values(cache.macros)) {
    const entries = macro.multiples.filter((v) => !v.disabled);
    if (macro.select) entries.unshift(macro.singles[macro.select]);
    variables[macro.key] = arrUtils.join(entries, '', (u) => u.value);
  }
  const obj = {
    ...variables,
    ...(properties?.args ?? {}),
    variables: realms.variables(history, false),
  };
  const generate = async (str: string) => {
    return await eta.renderStringAsync(str, obj);
  };
  converts.push(generate);
}

async function cache(realm: Realm) {
  const cache: MacroCache = {
    macros: {},
  };
  const { selections, checkItems } = macros.property(realm);
  await utils.forEachItemsList<PresetItem<Macro>, Preset>(
    realm.presets,
    macros.plural,
    async (entry, model) => {
      entry.id = model.id;
      const { key, hidden, multiple, name } = entry;
      const item = (cache.macros[key] ??= {
        key: key,
        multiples: [],
        singles: {},
        hidden: true,
      });
      if (!hidden) item.hidden = false;
      if (multiple) {
        item.multiples.push(entry);
        const checked = checkItems[name];
        if (checked !== undefined) entry.disabled = !checked;
      } else {
        item.singles[name] = entry;
        if (
          (!entry.disabled && !item.select) ||
          // 防止缓存中的值没有对应的item，校验后添加
          selections[item.key] === name
        )
          item.select = name;
      }
    },
  );
  return cache;
}

export const processer: Processer = {
  id: main.name,
  async init({ realm }) {
    return cache(realm);
  },
  prompt: apply,
};

export const renderer: Renderer = {
  id: main.name,
  async init({ realm }) {
    return cache(realm);
  },
  output: apply,
  stream: apply,
};
