import {RequireModel} from "@/modules/presets/models";

export interface RemoteSettingState {
    llmapi: RequireModel | null;
}

export interface SettingModel {
    id: string,
    data: string | null,
}

export const moduleName = 'setting';
export const modulePlural = 'settings';