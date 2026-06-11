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

### 1. 创建插件目录

```
plugins/my-plugin/
├── manifest.json
├── server.ts
└── client.js      # 需要编译为 JS
```

### 2. 编写 manifest.json

```json
{
    "id": "my-plugin",
    "version": "1.0.0",
    "serverScript": "server.ts",
    "clientScript": "client.js"
}
```

### 3. 编写服务端脚本

```ts
// plugins/my-plugin/server.ts
export default function register() {
    // 注册到已有的注册表
    // 例如注册一个新的 ConversationProvider
    console.log("My plugin server loaded");
}
```

### 4. 编写客户端脚本

```js
// plugins/my-plugin/client.js
// 编译后的 JS 文件
export default function register() {
    // 注册到客户端注册表
    console.log("My plugin client loaded");
}
```

### 5. 放置并启动

将插件目录放入 `plugins/` 文件夹，启动应用后自动发现并加载。

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
