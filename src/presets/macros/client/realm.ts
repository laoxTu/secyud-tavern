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
  multiples: Record<string, MacroItem[]>;
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
  for (const { select, multiples, singles, key } of Object.values(
    cache.macros,
  )) {
    const entries = multiples.filter((v) => !v.disabled);
    if (select) entries.unshift(singles[select]);
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
    variables[key] = json
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
    // 外部传入的参数，子Agent参数
    ...(properties?.args ?? {}),
    variables: realms.variables(history, false),
  };
  /**
   * 世界书也会经过转化
   */
  const generate = async (str: string) => {
    return await eta.renderStringAsync(str, obj);
  };
  converts.push(generate);
}

async function init({ realm }: { realm: Realm }) {
  const cache: MacroCache = {
    macros: {},
    multiples: {},
  };
  const { selections, checkItems } = macros.property(realm);
  await utils.forEachItemsList<PresetItem<Macro>, Preset>(
    realm.presets,
    macros.plural,
    async (entry, model) => {
      entry.id = model.id;
      const { key, hidden, multiple, code, json, value, disabled } = entry;
      /**
       * json 值可以直接作为json访问
       * 使用content，因为value可能
       * 被其他地方访问，例如宏选择器
       */
      /**
       * 复选的规则很复杂，
       * 1，相同的code，不同的key共享一个禁用
       * 2，不同的code，相同的key是正常情况
       * 3，相同的code，相同的key，会追加且共享
       * 这是为多preset设计的，可以继承，共享
       * 同样，tools会共用池子，也可以享受相同code
       * 设置不同的key，以添加不同的宏
       * 这里暂时没有好的界面去控制，先这样
       */
      const item: MacroItem = {
        ...entry,
        id: model.id,
        content: json ? jsonUtils.parse(value) : value,
        get disabled() {
          return multiple
            ? (checkItems[code] ?? disabled)
            : selections[key] === code;
        },
        set disabled(b: boolean) {
          if (multiple) {
            checkItems[code] = b;
          }
        },
      };
      /**
       * 单选规则相对简单，就是key中会选择一个code
       * 并且后面的会覆盖前面的
       */
      const cacheItem = utils.get<MacroCacheItem>(cache.macros, key, () => ({
        key,
        multiples: [],
        singles: {},
        hidden: true,
        get select() {
          return selections[key] ?? '';
        },
        set select(value: string) {
          selections[key] = value;
        },
      }));
      if (!hidden) cacheItem.hidden = false;
      if (multiple) {
        cacheItem.multiples.push(item);
        const list = utils.get<MacroItem[]>(
          cache.multiples,
          item.code,
          () => [],
        );
        list.push(item);
      } else {
        cacheItem.singles[code] = item;
        if (!item.disabled || !cacheItem.select) cacheItem.select = code;
      }
    },
  );
  return cache;
}

export const processer: Processer = {
  id: main.name,
  requires: [regexMain.name],
  init,
  prompt: apply,
};

export const renderer: Renderer = {
  id: main.name,
  requires: [regexMain.name],
  init,
  output: apply,
  stream: apply,
};
