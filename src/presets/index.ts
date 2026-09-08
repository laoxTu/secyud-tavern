import {
  DisableDto,
  Entity,
  Entries,
  Entry,
  EntryItem,
  NameValue,
  Properties,
} from '@/database';

export interface Preset extends Entity, Properties, Entries {
  // 名称，用于显示
  name: string;
  // 版本，用户自填
  version: string;
  // 封面，用于显示
  cover?: string;
  // 开场白
  opening?: string;
  // 变量
  variables?: string;
  // 描述
  description?: string;
  // 标签，用于分类
  tags: string[];
  // 依赖
  requires: NameValue[];
}

/**
 * 直接编辑格式，数据库存储
 */
export interface PresetEntry<T = any> extends Entry, DisableDto {
  data: T;
}

/**
 * 提供导出的格式，通过Storage转化
 */
export type PresetItem<T = any> = DisableDto & T & EntryItem;

export interface PresetRequestParam {
  fuzzy?: string | null;
  tags?: string[] | null;
}

export interface PresetRequestOptions {
  entities?: boolean;
  types?: boolean;
}

export interface PresetEntryClipboard {
  type: 'preset_entry';
  // master id
  id: string;
  entryId: number;
  entryType: string;
  entry: Partial<PresetEntry>;
}

export const presets = {
  toNameValue(model: Preset): NameValue {
    return {
      name: `${model.name}-${model.version}`,
      value: model.id,
    };
  },
  name: 'preset',
  plural: 'presets',
  tags: [
    'theme',
    'story',
    'preset',
    'agent',
    'app',
    'component',
    'setting',
    'tool',
  ],
};
