# Plugins 插件系统设计

## 概述

插件系统基于 `Registry<T>` 依赖注入模式。所有插件在**构建时**通过 `generate-plugin` 脚本扫描 `plugins/` 目录，生成三份静态文件（manifest 列表、服务端注册入口、客户端注册入口），运行时直接使用静态 import，无需动态文件系统扫描。

## 目录结构

```
src/plugins/
  models.ts              # PluginManifest 接口
  manager.ts             # PluginManager（ServerRegistry<PluginManifest> 薄封装）
  index.ts               # pluginManager 单例
  manifests.ts           # 【生成】内联的 manifest 数据数组
  server/
    registerer.ts        # 【生成】所有服务端插件的静态 import + 注册函数
    plugin-route.ts      # PluginRouteManager — 插件 API 路由注册与匹配
  client/
    registerer.ts        # 【生成】所有客户端插件的静态 import + 注册函数
plugins/                  # 外部插件目录
  my-plugin/              # 示例插件
```

## PluginManifest (`models.ts`)

```typescript
interface PluginManifest extends Registerable {
    version: string;         // 语义版本号
    serverScript?: string;   // 服务端脚本文件名（无扩展名，如 "server"）
    clientScript?: string;   // 客户端脚本文件名（无扩展名，如 "client"）
    folder: string;          // 插件目录名（由 generate-plugin 赋值）
}
```

`id` 继承自 `Registerable`，作为唯一标识和 API 路径 `[pluginId]`。

插件目录约定：
```
plugins/my-plugin/
  manifest.json           # 插件清单（不含 folder，由脚本赋值）
  server.ts               # 服务端脚本（可选）
  client.tsx              # 客户端脚本（可选）
  localization/           # i18n 消息（可选）
    zh/
      default.json
    en/
      default.json
```

## PluginManager (`manager.ts`)

继承 `ServerRegistry<PluginManifest>` 的薄封装，不再包含加载逻辑：

```typescript
export class PluginManager extends ServerRegistry<PluginManifest> {
    constructor(name: string) {
        super(name);
    }
}
```

单例 `pluginManager` 在 `index.ts` 中通过 `getInstance` 创建，构造时一次性注册 `manifests.ts` 中的所有 manifest：

```typescript
export const pluginManager =
    getInstance("pluginManager", u => {
        const instance = new PluginManager(u);
        instance.register(...manifests);
        return instance;
    });
```

## 构建时代码生成 (`scripts/generate-plugin.ts`)

`generate-plugin` 扫描 `plugins/*/manifest.json`，生成三份文件：

### 1. `src/plugins/manifests.ts`

内联的 manifest 数组，直接赋值 `folder` 字段：

```ts
export const manifests = [
    {"id":"my-plugin","version":"1.0.0","clientScript":"client","serverScript":"server","folder":"my-plugin"},
    ...
];
```

### 2. `src/plugins/server/registerer.ts`

静态 import 所有服务端插件脚本，导出 `registerServerPlugin()` 依次执行：

```ts
import registerer0 from '@plugins/my-plugin/server';
import registerer1 from '@plugins/another-plugin/server';

export async function registerServerPlugin() {
    await registerer0();
    await registerer1();
}
```

### 3. `src/plugins/client/registerer.ts`

同上，针对客户端脚本：

```ts
import registerer0 from '@plugins/my-plugin/client';
import registerer1 from '@plugins/another-plugin/client';

export async function registerClientPlugin() {
    await registerer0();
    await registerer1();
}
```

### `@plugins/*` 路径别名

`tsconfig.json` 中配置：

```json
{ "paths": { "@plugins/*": ["./plugins/*"] } }
```

这使得生成文件中的 `@plugins/my-plugin/server` 能被 Next.js/webpack 解析为 `plugins/my-plugin/server.ts`，从而正确处理 `@/` 等别名引用。

## 服务端启动流程 (`src/server-registerer.ts`)

`registerServerPlugins()` 在首次 API 请求时执行（仅一次）：

1. 注册 `errorInterceptor` 和 `paramInterceptor`
2. 注册 OpenAI 和 DeepSeek LLM 引擎
3. 注册 preset 引擎：lorebooks、regexes、styles、scripts、macros
4. 开发模式开启 `console.debug`
5. 调用 `registerServerPlugin()` — 执行所有插件服务端入口

## 客户端启动流程 (`src/client-registerer.ts`)

`useClientPlugins()` React Hook 在首次渲染时执行（仅一次）：

1. `registerComponents()` — 注册 UI 组件到 pluginApi
2. 注册领域客户端：business、story、preset、llmapi、slot
3. 注册引擎客户端：deepseek、openai、lorebooks、regexes、styles、scripts、macros
4. 调用 `registerClientPlugin()` — 执行所有插件客户端入口
5. 返回 `initialized` 布尔值

## PluginRouteManager (`server/plugin-route.ts`)

插件可通过 `pluginRouteManager.registerRouteTree(obj)` 注册 API 路由。

### 路由注册

```typescript
const route = {
    "my-app": {
        "import": {
            "preset": {
                async POST(request, records) { ... }
            }
        }
    }
};
pluginRouteManager.registerRouteTree(route);
// 注册 ID: [POST]//my-app/import/preset
```

### 路由树匹配

`getRouteTree()` 将注册的路由构建为树结构，每个节点可能包含 `__dynamic`（动态参数段如 `{id}`）、`__handler`（处理函数）。匹配时优先精确匹配，失败则尝试动态段。

## API 端点

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/plugins` | GET | 返回所有已注册 PluginManifest 列表 |
| `/api/plugins/{pluginId}` | GET | 返回插件 clientScript 编译产物（`application/javascript`） |
| `/plugins/api/[...path]` | GET/POST/PUT/DELETE | 通用插件路由入口，匹配 `pluginRouteManager` 中注册的路由 |

- 客户端脚本 API 禁用缓存（`Cache-Control: no-cache`）以便开发调试
- 插件路由未匹配时抛出 `BusinessError("plugin.route_not_found")`
