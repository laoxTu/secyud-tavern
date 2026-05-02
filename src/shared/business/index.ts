// src/models/index.ts


export interface BaseModel {
    id: string,
    name: string,
    entries?: Record<string, any>,
    content: Record<string, any>,
}