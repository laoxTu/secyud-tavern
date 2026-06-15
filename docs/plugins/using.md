# Plugins 模块 — 使用指南

## 使用 Registry

### 创建注册表

```ts
import { Registry, Registerable } from "@/utils/register";
import { ClientRegistry } from "@/plugins/client";
import { ServerRegistry } from "@/plugins/server";

// 通用注册表
const registry = new Registry<MyItem>("my-registry");

// 客户端注册表
const clientRegistry = new ClientRegistry<MyItem>("my-client-registry");

// 服务端注册表
const serverRegistry = new ServerRegistry<MyItem>("my-server-registry");
```

### 注册与注销

```ts
// 注册
registry.register({
    id: "item-1",
    // ... 其他属性
});

// 批量注册
registry.register(item1, item2, item3);

// 注销
registry.unregister("item-1");

// 检查
registry.has("item-1");  // boolean
registry.getIds();       // string[]
```

### 依赖声明

```ts
registry.register({
    id: "step-2",
    requires: ["step-1"],  // step-2 在 step-1 之后执行
});

registry.register({
    id: "step-3",
    requires: ["step-1", "step-2"],  // 可声明多个依赖
});
```

### 遍历执行

```ts
// 按拓扑排序遍历（顺序执行）
await registry.use(async (item) => {
    console.log(`Processing ${item.id}`);
    await doSomething(item);
});

// 带提前终止条件
let count = 0;
await registry.use(
    async (item) => {
        count++;
        console.log(item.id);
    },
    () => count >= 5  // 处理 5 个后停止
);
```

### 获取排序结果

```ts
const sorted = registry.getSorted();
// 返回 T[]，已按依赖关系排序（结果被缓存）
```

## 创建外部插件

### 完整数据流

```
插件目录 (plugins/my-plugin/)
    │
    ├─ 服务端启动: getPluginManifests() 扫描文件系统
    │     → 读取 manifest.json → 注册到 pluginManager
    │
    ├─ 客户端初始化: GET /api/plugins/client
    │     → 获取所有插件清单
    │
    └─ 客户端加载: import(/api/plugin/{pluginId}/client)
          → API 从 plugins/ 目录读取 client.ts
          → 返回 JS 文本 (Content-Type: application/javascript)
          → 浏览器 import() 执行模块
          → 调用 export default 函数
```

### 1. 创建插件目录

```
plugins/my-plugin/
├── manifest.json
├── server.ts          # 服务端脚本（可选）
└── client.ts          # 客户端脚本（纯 JS 即可，无需打包）
```

### 2. 编写 manifest.json

```json
{
    "id": "my-plugin",
    "version": "1.0.0",
    "serverScript": "server.ts",
    "clientScript": "client.ts"
}
```

- `id`：唯一标识符，也是 API 路径中的 `[pluginId]`
- `clientScript`：客户端脚本文件名。简单插件直接写 `.js`，无需打包。有依赖的复杂插件需要自行打包为单文件

### 3. 编写客户端脚本

```js
// plugins/my-plugin/client.ts
// 导出 default 函数，加载时自动调用
export default function register() {
    console.log("[my-plugin] ✅ 客户端插件已加载！");

    // 在这里注册到任意客户端注册表
    // 例如注册一个业务导航标签：
    // businessNavigationManager.register({ id: "my-tab", ... });
}
```

**不需要打包**：如果插件没有外部依赖，直接写 `.js` 文件即可。API 以 `application/javascript` 返回，浏览器 `import()` 原生支持 ES module 语法。

**需要打包**：如果插件依赖 npm 包，需要用 esbuild/rollup 打包为单个 `.js` 文件，放在插件目录下。

### 4. 编写服务端脚本（可选）

```ts
// plugins/my-plugin/server.ts
export default function register() {
    console.log("[my-plugin] Server plugin loaded");
    // 注册到服务端注册表
}
```

### 5. 测试插件

项目已包含一个测试插件 `plugins/test-plugin/`：

```js
// plugins/test-plugin/client.ts
export default function register() {
    console.log("[test-plugin] ✅ 客户端插件已加载！");
    console.log("[test-plugin] 当前 URL:", window.location.href);
}
```

启动 `npm run dev`，打开浏览器控制台，应该能看到 `[test-plugin]` 的日志输出。

### 6. 调试

- 服务端日志：终端查看 `[plugin loader]` 和 `[plugin manager]` 前缀
- 客户端日志：浏览器控制台查看
- API 测试：直接访问 `http://localhost:3000/api/plugin/test-plugin/client` 查看返回的 JS

## 创建内部模块注册

内部模块（如引擎）不通过文件系统发现，而是静态注册：

```ts
// src/engines/my-engine/client/index.ts
import { myRegistry } from "@/some-module/registry";

export function registerMyEngineClient() {
    myRegistry.register({
        id: "my-engine",
        requires: ["some-dependency"],
        // ... 其他注册属性
    });
}
```

```ts
// src/client-registerer.ts
import { registerMyEngineClient } from "@/engines/my-engine/client";

async function loadClientPlugins() {
    // ...
    registerMyEngineClient();
    // ...
}
```

## 插件加载流程

```ts
// src/client-registerer.ts — 客户端加载顺序
async function loadClientPlugins() {
    // 1. 先注册内置模块
    registerPresetClient();
    registerStoryClient();
    registerLlmapiClient();
    registerDeepseekClient();
    registerLorebooksClient();
    registerRegexesClient();
    registerStylesClient();
    registerScriptsClient();

    // 2. 再加载外部插件
    await pluginManager.loadClientPlugins();
}
```

```ts
// src/server-registerer.ts — 服务端加载顺序
export async function registerServerPlugins() {
    // 1. 注册拦截器
    interceptor.register(errorInterceptor, paramInterceptor);

    // 2. 注册内置引擎
    registerDeepseekServer();
    registerLorebooksServer();
    registerRegexesServer();
    registerStylesServer();
    registerScriptsServer();
    registerHasher();

    // 3. 加载外部插件
    await pluginManager.loadServerPlugins();
}
```

## PluginManager API

```ts
import { pluginManager } from "@/plugins/manager";

// 手动注册（不走文件系统发现）
pluginManager.register({
    id: "manual-plugin",
    version: "1.0.0",
    serverScript: "server.ts",
    directory: "file:///path/to/plugin",
});

// 加载服务端插件（懒加载，全局只执行一次）
await pluginManager.loadServerPlugins();

// 加载客户端插件
await pluginManager.loadClientPlugins();
```
