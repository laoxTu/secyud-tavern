// 分页请求

export interface DataRequest<TSearch = never> {
  skip?: number; // 跳过，默认0
  size?: number; // 每页条数，默认20
  search?: TSearch; // 可选搜索项
}

// 分页结果
export interface DataResponse<T> {
  items: T[];
  length: number;
}

export interface Properties {
  properties?: Record<string, any>;
}

// Entity
export interface Entity {
  id: string;
}

export type InDto<TEntity extends Entity> = Omit<TEntity, 'id'>;

export interface DisableDto {
  disabled: boolean;
}

export interface VersionDto {
  version: string;
}

export interface Entries extends Entity {
  entries?: Record<string, any[]>;
}

/**
 * 数据库存取
 */
export interface Entry {
  masterId: string;
  entryType: string;
  entryId: number;
  name: string;
}

/**
 * 操作符
 */
export type EntryOperator<T extends Entry> = Omit<
  T,
  'masterId' | 'entryType' | 'entryId'
>;

/**
 * 导入导出用
 */
export interface EntryItem {
  /**
   * 这个信息用于独立处理
   * 在某些时候需要唯一键时
   * 导出导入不用
   */
  id?: string;
  name: string;
}

export interface EntryRequestParam {
  filter?: string;
  entryType?: string;
}

/**
 * 用于下拉框
 */
export interface NameValue {
  name: string;
  value: string;
}

function getItems<TEntry extends EntryItem>(
  model: Entries,
  key: string,
): TEntry[] | undefined {
  return model.entries?.[key];
}

async function forEachItems<TEntry extends EntryItem, T extends Entries>(
  model: T,
  plural: string,
  action: (item: TEntry, model: T) => Promise<void>,
): Promise<void> {
  const entries = getItems<TEntry>(model, plural);
  if (!entries?.length) return;
  for (const entry of entries) {
    await action(entry, model);
  }
}

async function forEachItemsList<TEntry extends EntryItem, T extends Entries>(
  models: T[],
  plural: string,
  action: (item: TEntry, model: T) => Promise<void>,
): Promise<void> {
  for (const model of models) {
    await forEachItems(model, plural, action);
  }
}

/**
 * 获取item的属性
 */
function get<T = any>(
  properties?: Record<string, any>,
  key?: string,
  init?: () => T,
): T | undefined {
  if (!properties || !key) return undefined;
  properties[key] ??= init?.();
  return properties[key];
}

/**
 * 设置属性
 */
function set<T = any>(
  properties?: Record<string, any>,
  key?: string,
  value?: T,
) {
  if (!properties || !key) return;
  properties[key] = value;
}

function getProperty<T = any>(item?: Properties, key?: string): T | undefined;
// 重载签名2：有 init，返回 T（一定存在）
function getProperty<T = any>(item: Properties, key: string, init: () => T): T;
/**
 * 获取item的属性
 */
function getProperty<T = any>(
  item?: Properties,
  key?: string,
  init?: () => T,
): T | undefined {
  if (!item || !key) return undefined;
  item.properties ??= {};
  return get(item.properties, key, init);
}

/**
 * 设置item的属性
 */
function setProperty<T = any>(item?: Properties, key?: string, value?: T) {
  if (!item || !key) return;
  item.properties ??= {};
  set(item.properties, key, value);
}

function mapData<TIn, TOut>(
  data: DataResponse<TIn>,
  convert: (i: TIn) => TOut,
): DataResponse<TOut> {
  return {
    items: data.items?.map(convert),
    length: data.length,
  };
}

export const utils = {
  setProperty,
  getProperty,
  mapData,
  getItems,
  forEachItems,
  forEachItemsList,
  get,
  set,
};
