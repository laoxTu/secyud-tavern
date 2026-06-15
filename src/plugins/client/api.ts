import React from "react";

/**
 * 插件 API + 控制反转容器
 *
 * 每个模块在自己的文件中调用 def() 注册导出，
 * 无需在 client-registerer.ts 集中维护。
 *
 * 构建脚本 (scripts/generate-stubs.ts) 导入 client-registerer
 * 触发所有 def() 调用，再读取 stubPoints 自动生成 stub。
 */
export const pluginApi: any = { React };

/** def() 调用过的路径（仅端点，不含中间段），构建脚本读此生成 stub */
export const stubPoints: string[] = [];

/**
 * 注册模块导出到插件 API（控制反转）
 * @param path 模块的 @/ 导入路径，如 '@/business/client/navigation'
 * @param module 该模块导出的键值对
 */
export function def(path: string, module: any) {
    const splits = path.substring(2).split('/').filter(x => x !== '');
    let obj = pluginApi;
    for (const split of splits) {
        if (!obj[split]) {
            obj[split] = {};
        }
        obj = obj[split];
    }
    for (const key of Object.keys(module)) {
        obj[key] = module[key];
    }
    stubPoints.push(path);
}
