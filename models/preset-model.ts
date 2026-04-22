// models/preset-model.ts
export interface PresetModel {
    id: string,
    name: string,
    version: string;
    tags: string[],
    entries?: any,
    content: any,
    requires?: PresetRefModel[],
}

export interface PresetRefModel {
    presetId: string,
    version: string,
}