# Plugins 插件系统设计

## 概述

插件系统允许外部 JavaScript 模块在服务端（启动时动态 import）和客户端（通过 API 获取脚本后 new Function 执行）注册新功能。基于 `Registry<T>` 的依赖注入模式。

## 目录结构

```
src/plugins/
  models.ts      # PluginManifest 接口
  manager.ts     # PluginManager 类
plugins/         # 外部插件目录
  project-info/  # 示例插件
```

## PluginManifest (`models.ts`)

```typescript
interface PluginManifest extends Registerable {
    version: string;         // 语义版本号
    serverScript?: string;   // 服务端脚本文件名（相对于插件目录）
    clientScript?: string;   // 客户端脚本文件名（相对于插件目录）
    path: string;            // 插件目录路径
    directory?: string;      // 文件系统绝对路径（加载时赋值）
}
```

插件目录约定：
```
plugins/my-plugin/
  manifest.json           # PluginManifest（不含 directory 和 path，由系统赋值）
  server.js               # 服务端脚本（可选）
  client.js               # 客户端脚本（可选）
  localization/           # i18n 消息（可选）
    zh/*.json
    en/*.json
```

## PluginManager (`manager.ts`)

继承 `Registry<PluginManifest>`，单例导出为 `pluginManager`。

### initialize()

发现和加载所有插件的 manifest：
- **Node.js 运行时**：通过 Node 专用 manifest 加载器扫描 `plugins/` 下所有子目录的 manifest.json
- **运行时**：一般使用 Node.js 路径加载

### loadServerPlugins()

动态加载服务端脚本：
1. 遍历所有有 `serverScript` 的插件
2. 使用 `import(path)` 动态加载（ES 模块）
3. 调用默认导出（预期为接收 pluginApi 的函数）

### loadClientPlugins(pluginApi?)

动态加载客户端脚本：
1. 遍历所有有 `clientScript` 的插件
2. 从 `/api/plugins/{pluginId}` 获取编译好的 JS
3. 构造包含宿主 API 的 PluginApi 对象
4. 执行脚本并调用默认导出

## 服务端启动流程 (`src/server-registerer.ts`)

`registerServerPlugins()` 在首次 API 请求时执行（仅一次）：
1. 加载 `.env` 环境变量
2. 注册 `errorInterceptor` 和 `paramInterceptor`
3. 注册 `registerDeepseekServer()` 和 `registerOpenAIServer()`
4. 注册 preset 引擎存储：`registerLorebooksServer()`, `registerRegexesServer()`, `registerStylesServer()`, `registerScriptsServer()`, `registerMacrosServer()`
5. `registerHasher()` 初始化加密
6. `pluginManager.loadServerPlugins()` 加载外部插件

## 客户端启动流程 (`src/client-registerer.ts`)

`useClientPlugins()` React Hook 在首次渲染时执行（仅一次）：
1. `registerComponents()` — 注册 UI 组件到 pluginApi
2. 注册领域客户端：`registerBusinessClient()`, `registerStoryClient()`, `registerPresetClient()`, `registerLlmapiClient()`, `registerSlotClient()`
3. 注册引擎客户端：`registerDeepseekClient()`, `registerOpenAIClient()`, `registerLorebooksClient()`, `registerRegexesClient()`, `registerStylesClient()`, `registerScriptsClient()`, `registerMacrosClient()`
4. 构建 PluginApi（包含浏览器专用模块如 monaco-editor）
5. `pluginManager.loadClientPlugins(pluginApi)` 加载外部插件
6. 返回 `initialized` 布尔值

## API 端点

| 端点 | 说明 |
|---|---|
| `GET /api/plugins` | 返回 `pluginManager.getPlugins()` — 所有已注册 PluginManifest |
| `GET /api/plugins/{pluginId}` | 读取插件 clientScript 文件内容，返回 `application/javascript` |

客户端脚本 API 禁用缓存（`Cache-Control: no-cache, no-store, must-revalidate`）以便开发调试。
