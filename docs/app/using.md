# App 层使用指南

## 开发

```bash
pnpm dev    # 启动在 http://localhost:12804，根路径自动重定向到 /business
pnpm build  # 生产构建
```

## 添加新的 API 路由

### Step 1: 定义 TemplateConfig

```typescript
// src/app/api/myentity/models.ts
import { TemplateConfig } from "@/app/api/template";
import { myRepository } from "@/myentity/server/repository";
import { BusinessError } from "@/handler/models";

export const apiConfig: TemplateConfig<MyModel> = {
    repository: myRepository,
    conditionSearch: (search) =>
        search ? (fields, { like }) => like(fields.name, `%${search}%`) : undefined,
    checkCreate: async (model) => {
        if (!model.name)
            throw new BusinessError("name required", "default.name_required");
    },
    filename: (model) => `myentity-${model.id}.json`,
};
```

### Step 2: 创建路由文件

```typescript
// src/app/api/myentity/route.ts
import { interceptor } from "@/handler/server/interceptor";
import { apiGetModelList, apiCreateModel } from "@/app/api/template";
import { apiConfig } from "./models";

export const GET = interceptor.createRoute(apiGetModelList(apiConfig));
export const POST = interceptor.createRoute(apiCreateModel(apiConfig));
```

### Step 3: 动态路由

```typescript
// src/app/api/myentity/[id]/route.ts
import { apiGetModel, apiUpdateModel, apiDeleteModel } from "@/app/api/template";

export const GET = interceptor.createRoute(apiGetModel(apiConfig));
export const PUT = interceptor.createRoute(apiUpdateModel(apiConfig));
export const DELETE = interceptor.createRoute(apiDeleteModel(apiConfig));
```

## 错误处理约定

```typescript
// ❌ 禁止 — 绕过错误处理链
return NextResponse.json({ message: "error" }, { status: 400 });

// ✅ 正确 — 抛出 BusinessError
throw new BusinessError('validation failed', "default.validation_failed")
    .withValue("field", "name");
```

## 参数访问

`ParamInterceptor` 解析 URL 搜索参数到 `records.searchParams`，每个值尝试 `JSON.parse`：

```
GET /api/stories?page=0&pageSize=20&search={"name":"test"}
→ records.searchParams = { page: 0, pageSize: 20, search: { name: "test" } }
```

路径参数在 `records.context.params` 中（Next.js 自动提供）。

## 客户端页面开发

```tsx
'use client';

export default function MyPage() {
    return <div>My Content</div>;
}
```

- 使用浏览器 API 的组件必须标记 `'use client'`
- Business 区域由 `<PluginLayout>` 自动初始化客户端插件
- 通过 `businessNavigationManager.register(tabConfig)` 注册导航标签
