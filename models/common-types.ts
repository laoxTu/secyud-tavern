// models/common-types.ts
export interface PageOptions<T = string> {
    page?: number;      // 页码，默认0
    pageSize?: number;  // 每页条数，默认20
    search?: T;    // 可选搜索项
}

// 分页结果
export interface PagedResult<T> {
    data: T[];
    totalCount: number;
}

export interface RequireModel {
    requireId: string,
    version: string,
}

export function mapRequire(other: any): RequireModel {
    return {
        requireId: other.requireId,
        version: other.version
    }
}

export interface BaseModel {
    // 存档唯一标识符，UUID
    id: string,
    // 用户自定义的存档名称
    name: string,
    // 当前激活的预设ID列表
    requires: RequireModel[],
    // 对话消息记录
    entries?: any,
    content: any,
}
