// models/common-types.ts
export interface PageOptions<T = string> {
    page: number;      // 页码，默认1
    pageSize: number;  // 每页条数，默认20
    search?: T;    // 可选搜索项
}

// 分页结果
export interface PagedResult<T> {
    data: T[];
    totalCount: number;
}