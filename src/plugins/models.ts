import {Registerable} from "@/utils/register";

export interface PluginManifest extends Registerable {
    version: string;
    // 后端脚本名称
    serverScript?: string;
    // 前端脚本名称
    clientScript?: string;
    folder: string;
    disabled?: boolean;
}