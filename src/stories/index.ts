import {
  Entity,
  Entries,
  Entry,
  EntryItem,
  NameValue,
  Properties,
} from '@/database';

// 故事
export interface Story extends Entity, Properties, Entries {
  // 名称，用于显示
  name: string;
  // 使用的模型， 为空则使用默认
  model?: NameValue | null;
  // 预设组装，一般只有一项，但可以组合
  presets: NameValue[];
}

export interface StoryEntry<T = any> extends Entry {
  data: T;
}

/**
 * 提供导出的格式，通过Storage转化
 */
export type StoryItem<T = any> = T & EntryItem & { entryId: number };

export interface StoryEntryClipboard {
  type: 'story_entry';
  // master id
  id: string;
  entryId: number;
  entryType: string;
  entry: Partial<StoryEntry>;
}

export interface StoryRequestParam {
  fuzzy?: string | null;
}

export interface StoryRequestOptions {
  entities?: boolean;
  types?: boolean;
}

export * from './realms';

export const stories = {
  name: 'story',
  plural: 'stories',
};
