# Plugins 模块 — 设计文档

## 概述

插件系统支持**客户端插件**和**服务端插件**。客户端插件可以用原生 `@/` 路径和 JSX 编写，自动打包为独立 JS 文件，运行时动态加载。

## 架构

```
插件源码 (plugins/{name}/client.tsx)
    │  import { businessNavigationManager } from '@/business/client/navigation'
    │  import React from 'react'
    │
    ▼  npm run build-plugin {name}
        ├── gen-stubs: tsx 导入 client-registerer → 触发所有 def() → 生成 stub + alias
        └── esbuild: bundle → alias 映射单例模块到 stub → 输出 client.js
    │
    ▼  GET /api/plugins/{id}
        → 读取 client.js → Content-Type: application/javascript
    │
    ▼  import(/api/plugins/{id})
        → pluginModule.default(pluginApi)
        → 插件注册到宿主注册表
```

## 控制反转 (IoC)

每个模块通过 `def()` 自行注册导出，无需在 `client-registerer.ts` 集中维护：

```ts
// src/plugins/client/api.ts
export const pluginApi: any = { React };
export const stubPoints: string[] = [];

export function def(path: string, module: any) {
    // 将 module 的导出按 path 段嵌套到 pluginApi
    // e.g. def('@/business/client/navigation', { businessNavigationManager })
    //   → pluginApi.business.client.navigation.businessNavigationManager
    const splits = path.substring(2).split('/').filter(x => x !== '');
    let obj = pluginApi;
    for (const split of splits) {
        if (!obj[split]) obj[split] = {};
        obj = obj[split];
    }
    for (const key of Object.keys(module)) {
        obj[key] = module[key];
    }
    stubPoints.push(path);
}
```

## 构建流程

### gen-stubs（自动生成 stub + alias）

1. `tsx` 导入 `client-registerer` → 触发所有模块级 import → `def()` 填充 `pluginApi` 和 `stubPoints`
2. 遍历 `stubPoints`，为每个 `@/` 路径生成 stub 文件
3. 输出 `build-alias.json`（esbuild alias 配置）

生成的 stub 文件：
```js
// plugins/_shared/stubs/business-client-navigation.js
const api = window.__PLUGIN_API__;
export const { businessNavigationManager } = api["business"]["client"]["navigation"];
```

### esbuild 打包

- `bundle: true`，`jsx: 'automatic'`
- 单例模块（注册表）→ alias → stub → `window.__PLUGIN_API__`
- React → alias → `react-shim.js` → `window.__PLUGIN_REACT__`
- `react/jsx-runtime` → alias → 自动补 key 的运行时
- UI 组件 → alias → stub（通过 `registerComponents()` 注册）
- 其他模块（纯函数）→ 正常打包

## 插件加载

客户端插件通过 `PluginManager.loadClientPlugins(pluginApi)` 加载：

```ts
// manager.ts
protected async loadClientPlugin(manifest, script, pluginApi) {
    const pluginUrl = `/api/plugins/${manifest.id}`;
    const pluginModule = await import(/* webpackIgnore: true */ pluginUrl);
    if (typeof pluginModule.default === 'function') {
        await pluginModule.default(pluginApi ?? {});
    }
}
```

## API 端点

| 端点 | 说明 |
|---|---|
| `GET /api/plugins` | 返回所有已发现的 PluginManifest[] |
| `GET /api/plugins/{pluginId}` | 返回插件的 client.js（application/javascript） |

## 插件清单

```json
{
    "id": "my-plugin",
    "version": "1.0.0",
    "clientScript": "client.js",
    "serverScript": "server.ts"
}
```

## 注册表继承体系

```
Registry<T>                     (src/utils/register.ts)
├── ServerRegistry<T>           (src/plugins/server/)
└── ClientRegistry<T>           (src/plugins/client/)
    ├── TabManager              → businessNavigationManager
    ├── MatcherRegistry         → lorebookMatcherRegistry
    ├── LlmapiConfigRegistry
    ├── LlmapiInputBuilderManager
    ├── LlmEngineRegistry
    └── ConversationManager     → { initializer, inputProcesser, ... }
```
