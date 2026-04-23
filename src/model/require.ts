// src/model/require.ts
export interface RequireModel {
    requireId: string,
    version: string,
}

export interface BaseModel {
    id: string,
    name: string,
    requires: RequireModel[],
    entries?: any,
    content: any,
}

export function mapRequire(other: any): RequireModel {
    return {
        requireId: other.requireId,
        version: other.version
    }
}