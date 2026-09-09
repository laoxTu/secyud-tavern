import { Eta } from 'eta/core';

import { utils } from '@/database';
import { ConvertContent, Processer } from '@/models/client';
import { Preset, PresetItem } from '@/presets';
import { Macro, macros as main } from '@/presets/macros';
import { regexes as regexMain } from '@/presets/regexes';
import { Realm, RealmHistory } from '@/stories';
import { Renderer } from '@/stories/client';
import { realms } from '@/stories/client/realms';
import { arrUtils, jsonUtils } from '@/utils';

import { macros } from '.';

const eta = new Eta({
  autoTrim: false,
  rmWhitespace: false,
});

export interface MacroItem extends PresetItem<Macro> {
  content: any;
}

export interface MacroCacheItem {
  key: string;
  singles: Record<string, MacroItem>;
  multiples: MacroItem[];
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
    /**
     * 规则，如果有json，则合并所有json，
     * 并将字符串拼接到json中的toString()中。
     * 如果全是字符串，才拼接所有字符串直接作为值。
     */
    let json: any = null;
    const texts: string[] = [];
    for (const item of entries) {
      if (item.json) {
        json = jsonUtils.merge(json, item.content);
      } else {
        texts.push(item.content);
      }
    }
    const text = arrUtils.join(texts, '');
    /**
     * 使用toString()方法，让对象
     * 可以直接作为内插字符串
     */
    variables[macro.key] = json
      ? {
          ...json,
          toString() {
            return text;
          },
        }
      : text;
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
      const { key, hidden, multiple, name, json, value } = entry;
      /**
       * json 值可以直接作为json访问
       * 使用content，因为value可能
       * 被其他地方访问，例如宏选择器
       */
      const item: MacroItem = {
        ...entry,
        content: json ? jsonUtils.parse(value) : value,
      };
      const cacheItem = (cache.macros[key] ??= {
        key: key,
        multiples: [],
        singles: {},
        hidden: true,
      });
      if (!hidden) cacheItem.hidden = false;
      if (multiple) {
        cacheItem.multiples.push(item);
        const checked = checkItems[name];
        if (checked !== undefined) entry.disabled = !checked;
      } else {
        cacheItem.singles[name] = item;
        if (
          (!entry.disabled && !cacheItem.select) ||
          // 防止缓存中的值没有对应的item，校验后添加
          selections[cacheItem.key] === name
        )
          cacheItem.select = name;
      }
    },
  );
  return cache;
}

export const processer: Processer = {
  id: main.name,
  requires: [regexMain.name],
  async init({ realm }) {
    return cache(realm);
  },
  prompt: apply,
};

export const renderer: Renderer = {
  id: main.name,
  requires: [regexMain.name],
  async init({ realm }) {
    return cache(realm);
  },
  output: apply,
  stream: apply,
};
