# Plugins 模块 — 使用指南

## 创建客户端插件

### 1. 目录结构

```
plugins/my-plugin/
├── manifest.json     # 插件清单
├── client.tsx        # 客户端入口
└── server.ts         # 服务端入口（可选）
```

### 2. manifest.json

```json
{
    "id": "my-plugin",
    "version": "1.0.0",
    "clientScript": "client.js"
}
```

- `id`：唯一标识符，也是 API 路径 `[pluginId]`
- `clientScript`：指向构建产物 `client.js`

### 3. 编写插件

```tsx
// plugins/my-plugin/client.tsx
import { businessNavigationManager } from '@/business/client/navigation';
import React from 'react';

function Content() {
    return (
        <div className="p-8">
            <h1 className="text-xl font-bold">My Plugin</h1>
            <p>Hello from plugin!</p>
        </div>
    );
}

export default function register() {
    businessNavigationManager.register({
        id: "my-plugin",
        label: () => <span>我的插件</span>,
        component: Content,
    });
}
```

### 4. 构建

```bash
npm run build-plugin my-plugin
```

### 5. 启动

```bash
npm run dev
```

导航栏出现 "我的插件" Tab，点击显示插件内容。

## 可用的导入

插件可以使用原生 `@/` 路径导入以下内容：

| 导入路径 | 导出 | 类型 |
|---|---|---|
| `@/business/client/navigation` | `businessNavigationManager` | TabManager |
| `@/slots/client/conversation` | `conversationManager`, `generateCurrentVariables`, `getOpeningHistory`, `generateInputBuildContext` | 注册表 + 工具函数 |
| `@/components/ui/card` | `Card`, `CardHeader`, `CardTitle`, ... | UI 组件 |
| `@/components/ui/button` | `Button`, `buttonVariants` | UI 组件 |
| `@/components/ui/*` | 所有 UI 组件 | 全部可用 |
| `@/engines/lorebooks/client/match` | `lorebookMatcherRegistry`, `tryFillActiveLorebooks` | 匹配器 |
| `@/llmapis/client/input-builder` | `llmapiInputBuilderManager` | 输入构建 |
| `@/llmapis/client/config` | `llmapiConfigRegistry` | 配置 |

所有通过 `def()` 注册的模块都可导入。运行 `npm run gen-stubs` 可查看当前注册了哪些模块。

## 单例规则

以下模块使用宿主单例（通过 stub 引用，不打包副本）：
- 所有注册表（businessNavigationManager、conversationManager 等）
- React（通过 `window.__PLUGIN_REACT__`）

以下模块正常打包（无状态，可复制）：
- UI 组件（`@/components/ui/*`）
- 工具函数（`@/lib/utils` 的 `cn`）

## 添加新模块到插件 API

在模块文件中加一行 `def()`：

```ts
import { def } from '@/plugins/client/api';

export const myExport = ...;

def('@/path/to/module');
```

然后运行 `npm run gen-stubs` 重新生成 stub。插件即可 `import { myExport } from '@/path/to/module'`。

## 调试

- 构建产物在 `plugins/{name}/client.js`
- 浏览器控制台查看 `[plugin manager]` 前缀日志
- 直接访问 `http://localhost:3000/api/plugins/{pluginId}` 查看返回的 JS
- `window.__PLUGIN_API__` 可在浏览器控制台查看所有可用导出

## 服务端插件

```ts
// plugins/my-plugin/server.ts
export default function register() {
    console.log("[my-plugin] Server loaded");
    // 注册到服务端注册表
}
```

服务端插件通过 `import()` 动态加载（Node.js 运行时），可注册引擎、拦截器、存储提供者。
