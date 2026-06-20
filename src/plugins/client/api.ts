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
export const pluginApi: Record<string, any> = {React};

if (typeof window !== 'undefined') {
    (window as any).__PLUGIN_API__ = pluginApi;
}

/**
 * 注册模块导出到插件 API（控制反转）
 * @param path  模块的导入路径，如 '@/business/client/navigation' 或 'react/jsx-runtime'
 * @param mod   可选：模块对象（import * as mod），自动提取导出 key；
 *              也可传 string[] 手动指定 key 列表
 */
export function def(path: string, mod: any) {
    pluginApi[path] = mod;
}
