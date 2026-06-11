# App 模块 — 使用指南

## 目录结构

```
src/app/
├── page.tsx                         # 根页面（自动跳转到 /business）
├── layout.tsx                       # 根布局（i18n、Tooltip、Toast）
├── globals.css                      # Tailwind CSS + 主题变量
├── app.css                          # 全局样式重置
├── favicon.svg                      # 应用图标
├── api/
│   ├── template.ts                  # API 路由工厂函数
│   ├── stories/                     # 故事相关 API
│   ├── presets/                     # 预设相关 API
│   └── llmapis/                     # LLM API 相关 API
└── business/
    ├── layout.tsx                   # 业务区布局（PluginLayout 包裹）
    ├── page.tsx                     # 仪表板（Tab 导航）
    └── stories/[id]/page.tsx        # 故事交互页
```

## 添加新的 API 路由

### 1. 使用模板工厂创建标准 CRUD

```ts
// src/app/api/new-entity/route.ts
import { interceptor } from "@/handler/server/interceptor";
import {
    generateGetModelListApi,
    generateCreateModelApi,
} from "@/app/api/template";
import { newEntityRepository } from "@/new-entity/server/repository";

export const GET = interceptor.createRoute(
    generateGetModelListApi(newEntityRepository)
);

export const POST = interceptor.createRoute(
    generateCreateModelApi(newEntityRepository, async (params) => {
        // 可选的自定义验证
        if (!params.name) {
            throw new BusinessError("name required", "error.name_required");
        }
    })
);
```

### 2. 带路径参数的 CRUD

```ts
// src/app/api/new-entity/[id]/route.ts
import { interceptor } from "@/handler/server/interceptor";
import {
    generateGetModelApi,
    generateUpdateModelApi,
    generateDeleteModelApi,
} from "@/app/api/template";

export const GET = interceptor.createRoute(
    generateGetModelApi(newEntityRepository)
);

export const PUT = interceptor.createRoute(
    generateUpdateModelApi(newEntityRepository)
);

export const DELETE = interceptor.createRoute(
    generateDeleteModelApi(newEntityRepository)
);
```

### 3. 自定义路由处理器

不使用模板工厂的路由直接编写自定义逻辑：

```ts
export const GET = interceptor.createRoute(
    async (request, records) => {
        const { searchParams, body } = records;
        // 自定义业务逻辑
        const result = await customBusinessLogic(searchParams);
        return NextResponse.json(result);
    }
);
```

## 参数访问

在路由处理器中，通过 `records` 对象访问解析后的参数：

```ts
export const POST = interceptor.createRoute(
    async (request, records) => {
        const params = records.searchParams;  // URL 查询参数（已 JSON.parse）
        const body = records.body;            // POST/PUT/PATCH 请求体（已 JSON.parse）
        const context = records.context;      // 路由上下文 { params }
        const id = context.params.id;         // 动态路径参数
    }
);
```

## 添加新页面

```tsx
// src/app/business/new-page/page.tsx
'use client';

export default function NewPage() {
    return <div>New Page Content</div>;
}
```

页面会自动映射到 `/business/new-page`。

## 错误处理

所有 API 路由应抛出 `BusinessError` 而非直接返回错误响应：

```ts
import { BusinessError } from "@/handler/models";

// ✅ 正确
if (!entity) {
    throw new BusinessError("entity not found", "default.entity_not_found");
}

// ❌ 错误 — 不要直接返回错误响应
if (!entity) {
    return NextResponse.json({message: "Not found"}, {status: 404});
}
```

## 客户端 API 调用

使用 `@/client` 中的类型安全 API 客户端：

```ts
import { get, post, put, del } from "@/client";

// GET 请求
const { data, totalCount } = await get("/stories", {
    params: { page: 0, pageSize: 20, search: "keyword" }
});

// POST 请求
const newStory = await post("/stories", { name: "My Story" });

// PUT 请求
await put("/stories/{id}", { name: "Updated" }, { params: { id: "xxx" } });

// DELETE 请求
await del("/stories/{id}", { params: { id: "xxx" } });
```

## 故事页面使用

故事交互页面 (`/business/stories/[id]`) 的关键流程：

1. 页面加载 → `loadingCurrentSlot()` → GET `/api/stories/{id}/slot`
2. 初始化 → `conversationManager.use(provider => provider.onInitialize(ctx))`
3. 用户输入 → `createHistory(input, summary)` → POST entries
4. 生成回复 → `generateReply()` → POST `/api/llmapis/{id}/chat` → SSE 流
5. 渲染 → `manager.use(provider => provider.onRenderStream(ctx))`
