// src/models/index.ts
export interface RequireModel {
    code: string,
    version: string,
}

export interface BaseModel {
    id: string,
    name: string,
    requires: RequireModel[],
    entries?: Record<string, any>,
    content: Record<string, any>,
}