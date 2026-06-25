# Handler 层使用指南

## 在 API 路由中抛出错误

```typescript
import { BusinessError } from "@/handler/models";

// 基本用法
throw new BusinessError("entity not found", "default.entity_not_found");

// 附带数据（客户端可通过 i18n 插值显示）
throw new BusinessError("name required", "validation.required")
    .withValue("field", "name")
    .withValue("minLength", 3);
```

## 正确 vs 错误的错误处理

```typescript
// ❌ 禁止 — 绕过 ErrorInterceptor，错误格式不一致
export const GET = interceptor.createRoute(async (req, records) => {
    if (!entity)
        return NextResponse.json({ message: "Not found" }, { status: 404 });
});

// ✅ 正确 — 由 ErrorInterceptor 统一格式化
export const GET = interceptor.createRoute(async (req, records) => {
    if (!entity)
        throw new BusinessError("entity not found", "default.entity_not_found");
});
```

## 在处理器中访问参数

```typescript
export const GET = interceptor.createRoute(async (req, records) => {
    // URL 查询参数（已 JSON.parse 尝试）
    const { page, pageSize, search } = records.searchParams;

    // 路径参数（Next.js 自动提供）
    const { id } = records.context.params;

    // 请求体直接在 handler 中读取
    const body = await req.json();
});
```

## 客户端错误处理

```tsx
'use client';
import { useErrorHandler } from "@/handler/client/error";

function MyComponent() {
    const { handleError, handleSuccess } = useErrorHandler();

    async function save() {
        try {
            await fetch('/api/stories', { method: 'POST', body: data });
            handleSuccess("保存成功");
        } catch (err) {
            handleError(err);
            // 若 err 是 ApiError(code="default.name_required")，
            // 会自动用 next-intl 翻译 code 并显示 toast
        }
    }

    return <Button onClick={save}>保存</Button>;
}
```

## 注册自定义拦截器

```typescript
import { interceptor } from "@/handler/server/interceptor";

interceptor.register({
    id: "my-logger",
    requires: ["error-interceptor"],  // 在错误处理后运行
    handle: async (request, records, next) => {
        console.log(`[${request.method}] ${request.url}`);
        const response = await next();
        console.log(`  → ${response.status}`);
        return response;
    },
});
```

拦截器按 `requires` 依赖关系用 Kahn 算法拓扑排序执行。循环依赖会抛出明确错误。
