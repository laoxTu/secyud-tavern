// src/plugins/index.ts
import {Registerable} from "@/src/models/registerable";

export interface PluginManifest extends Registerable {
    version: string;
    // 后端脚本名称
    serverScript?: string;
    // 前端脚本名称
    clientScript?: string;
    // 目录, 加载后赋值, 默认空字符串
    directory?: string;
}

export {default as pluginManager} from './manager';