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
    entries?: Record<string, any>,
    content: Record<string, any>,
}

export interface EntryModel {
    id: number,
    disabled: boolean,
    // 编码，同预设下唯一
    code: string;
    // 名称
    name: string;
}

export interface ImageFile{
    id: string,
    type: string,
}