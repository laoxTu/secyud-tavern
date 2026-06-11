# Handler 模块 — 使用指南

## 抛出业务错误

### 在 API 路由中使用

```ts
import { BusinessError } from "@/handler/models";

// 基本用法
throw new BusinessError("entity not found", "default.entity_not_found");

// 附带额外数据
throw new BusinessError("name is required", "validation.required")
    .withValue("field", "name")
    .withValue("minLength", 3);
```

### 错误码规范

- `default.entity_not_found` — 实体未找到
- `default.entity_already_exists` — 实体已存在
- `validation.required` — 必填字段
- 自定义错误码通过 i18n 键映射到本地化文本

### 不要直接返回错误响应

```ts
// ❌ 错误
export const GET = interceptor.createRoute(async (req, records) => {
    if (!entity) {
        return NextResponse.json(
            { message: "Not found" },
            { status: 404 }
        );
    }
});

// ✅ 正确
export const GET = interceptor.createRoute(async (req, records) => {
    if (!entity) {
        throw new BusinessError("entity not found", "default.entity_not_found");
    }
});
```

## 在路由中访问参数

### searchParams（查询参数）

```ts
export const GET = interceptor.createRoute(async (req, records) => {
    const { page, pageSize, search } = records.searchParams;
    // 参数已自动 JSON.parse 尝试
    // page: 0, pageSize: 20, search: "keyword"
});
```

### Body（请求体）

```ts
export const POST = interceptor.createRoute(async (req, records) => {
    const { name, content } = records.body;
    // JSON body 已自动解析
});
```

### 路径参数

```ts
export const PUT = interceptor.createRoute(async (req, records) => {
    const { id } = records.context.params;
    // 来自 URL 路径: /api/stories/{id}
});
```

## 路由包装

### 标准路由

```ts
// src/app/api/stories/route.ts
import { interceptor } from "@/handler/server/interceptor";

export const GET = interceptor.createRoute(handler);
export const POST = interceptor.createRoute(handler2);
```

### 带参数的动态路由

```ts
// src/app/api/stories/[id]/route.ts
export const GET = interceptor.createRoute(async (req, records) => {
    const id = records.context.params.id;
    // ...
});
```

## 客户端错误处理

### 使用 useErrorHandler

```tsx
'use client';
import { useErrorHandler } from "@/handler/client/error";

function MyComponent() {
    const { handleError } = useErrorHandler();

    async function loadData() {
        try {
            const data = await get("/stories", { params: { page: 0 } });
            // 处理数据
        } catch (err) {
            handleError(err);
            // ApiError → toast 展示错误信息
            // 其他 Error → 重新抛出
        }
    }

    return <Button onClick={loadData}>加载</Button>;
}
```

### ApiError 判断

```ts
import { ApiError } from "@/handler/client/models";

try {
    await someApiCall();
} catch (err) {
    if (err instanceof ApiError) {
        console.log(err.code);     // i18n 键
        console.log(err.data);     // 错误数据
        console.log(err.message);  // 错误消息
    }
}
```

## 添加自定义拦截器

### 实现 InterceptorModels 接口

```ts
import { InterceptorModels } from "@/handler/server/interceptor-models";

const myInterceptor: InterceptorModels = {
    id: "my-interceptor",
    requires: ["error-interceptor"],  // 在 error-interceptor 之后运行

    async handle(request, records, next) {
        // 前置逻辑
        console.log("before:", request.url);

        const response = await next(request, records);

        // 后置逻辑
        console.log("after:", response.status);

        return response;
    },
};
```

### 注册到拦截器管道

```ts
// 在 server-registerer.ts 中注册
interceptor.register(myInterceptor);
```

注意：拦截器按拓扑排序执行。`requires` 为空或在 `error-interceptor` 之后的拦截器会在管道中按正确顺序排列。
