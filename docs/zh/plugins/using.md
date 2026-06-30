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
    "clientScript": "client",
    "serverScript": "server"
}
```

- `id`：唯一标识符，也是导航 Tab 和 API 路径 `[pluginId]`
- `clientScript`：客户端入口文件名（**无扩展名**，指向 `client.tsx` 编译产物 `client.js`）
- `serverScript`：服务端入口文件名（**无扩展名**，指向 `server.ts`）
- `folder` 不需要填写，由 `generate-plugin` 自动赋值

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
# 1. 生成 manifest + 注册入口文件
npx tsx scripts/generate-plugin.ts

# 2. 构建客户端 JS（仅客户端插件需要）
npm run build-plugin my-plugin
```

`generate-plugin.ts` 执行以下操作：
- 扫描 `plugins/*/manifest.json`
- 生成 `src/plugins/manifests.ts` — manifest 数据
- 生成 `src/plugins/server/registerer.ts` — 服务端插件静态 import
- 生成 `src/plugins/client/registerer.ts` — 客户端插件静态 import

### 5. 启动

```bash
npm run dev
```

重新构建后会出现 "我的插件" Tab，点击显示插件内容。

## 创建服务端插件

### server.ts

```typescript
// plugins/my-plugin/server.ts
import { pluginRouteManager } from "@/plugins/server/plugin-route";

const route = {
    "my-resource": {
        async GET(request, records) {
            return NextResponse.json({ data: "hello" });
        }
    }
};

export default async function init() {
    pluginRouteManager.registerRouteTree(route);
}
```

服务端插件通过 `@plugins/{folder}/server` 静态 import（`generate-plugin` 生成），所有 `@/` 引用由 Next.js/webpack 在构建时解析，无运行时路径问题。

### 注册 API 路由

使用 `pluginRouteManager.registerRouteTree(obj)` 将嵌套对象注册为路由：

```typescript
const route = {
    "users": {
        "{id}": {                    // 动态参数 {id}
            async GET(request, records) {
                const { id } = records.pluginRouteParams;  // 从 records 获取动态参数
                return NextResponse.json({ id });
            }
        }
    }
};
pluginRouteManager.registerRouteTree(route);
// 匹配 GET /plugins/api/users/123 → records.pluginRouteParams = { id: "123" }
```

- HTTP 方法键：`GET`、`POST`、`PUT`、`DELETE`
- 动态路径段：`{paramName}` 形式，匹配任意值，提取到 `records.pluginRouteParams`
- 路由调用统一通过 `/plugins/api/[...path]` 入口

## 可用的导入

插件可以使用 `@/` 路径导入宿主模块（通过 `@plugins/*` 别名，由 webpack 解析）：

| 导入路径 | 导出 | 类型 |
|---|---|---|
| `@/business/client/navigation` | `businessNavigationManager` | TabManager |
| `@/slots/client/conversation` | `conversationManager` 等 | 注册表 + 工具函数 |
| `@/components/ui/button` | `Button`, `buttonVariants` | UI 组件 |
| `@/components/ui/dialog` | `Dialog`, `DialogTrigger`, ... | UI 组件 |
| `@/components/ui/*` | 所有 UI 组件 | 全部可用 |
| `@/handler/client/error` | `useErrorHandler` | 错误处理 Hook |
| `@/client` | `handleResponse`, `get`, `post`, `put`, `del` | HTTP 请求工具 |
| `@/plugins/server/plugin-route` | `pluginRouteManager` | 路由注册 |

运行 `npm run gen-stubs` 可查看当前已注册哪些模块。

## 国际化 (i18n)

插件可以在 `localization/` 目录放置翻译文件，会被自动合并到全局 i18n：

```
plugins/my-plugin/
  localization/
    zh/
      default.json    # { "default": { "my-plugin": "我的插件" }, "myPlugin": { ... } }
    en/
      default.json
```

与 `src/localization/` 的合并规则相同：`default` 命名空间用于 Tab 标题等通用文案，插件专用命名空间（如 `myPlugin`）用于具体内容。

`useTranslations()` 使用时 key 路径对应 JSON 结构，如 `t('myPlugin.description')` 对应 `messages.myPlugin.description`。

## 调试

- 构建产物在 `plugins/{name}/client.js`
- `generate-plugin` 日志输出扫描到的插件列表
- 浏览器控制台查看 `[plugin manager]` 前缀日志
- 直接访问 `http://localhost:3000/api/plugins/{pluginId}` 查看编译后的 JS
- 访问 `http://localhost:3000/api/plugins` 查看所有已注册 manifest
- `window.__PLUGIN_API__` 可在浏览器控制台查看所有可用导出
