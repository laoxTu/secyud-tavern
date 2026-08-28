export interface PageOptions {
    page?: number;      // 页码，默认0
    pageSize?: number;  // 每页条数，默认20
    search?: any;    // 可选搜索项
}

// 分页结果
export interface PagedResult<T> {
    data: T[];
    totalCount: number;
}

export interface PageState {
    max: number;
    cur: number;
}

export interface BaseModel {
    id: string,
    name: string,
    entries?: Record<string, any[]>,
    content: Record<string, any>,
}

export interface EntryModel {
    id?: string, // 只在slot中用
    entryId: number,
    disabled: boolean,
    // 编码，同预设下唯一
    code: string,
    // 名称
    name: string,
}

export interface ImageFile {
    id: string,
    type: string,
}

async function useEntries<TEntry extends EntryModel, TModel extends BaseModel>(
    model: TModel, name: string, modelId: (model: TModel) => string,
    action: (item: TEntry, model: TModel) => Promise<void>): Promise<void> {
    const entries = getEntries<TEntry>(model, name);
    if (!entries?.length) return;
    for (const entry of entries) {
        entry.id ??= `${modelId(model)}.${entry.entryId}`;
        await action(entry, model);
    }
}

async function useEntriesList<TEntry extends EntryModel, TModel extends BaseModel>(
    models: TModel[], name: string, modelId: (model: TModel) => string,
    action: (item: TEntry, model: TModel) => Promise<void>): Promise<void> {
    for (const model of models) {
        await useEntries(model, name, modelId, action);
    }
}

function getEntries<TEntry extends EntryModel>(
    model: BaseModel, key: string): TEntry[] | undefined {
    return model.entries?.[key];
}

function getContent<T>(model: BaseModel, key: string): T | undefined;
// 重载签名2：有 init，返回 T（一定存在）
function getContent<T>(model: BaseModel, key: string, init: () => T): T;

function getContent<T>(model: BaseModel, key: string, init?: () => T): T | undefined {
    let value: T | undefined = model.content[key];
    if (!value && init) {
        value = init();
        model.content[key] = value;
    }

    return value;
}

export const businessUtils = {useEntries, useEntriesList, getEntries, getContent};