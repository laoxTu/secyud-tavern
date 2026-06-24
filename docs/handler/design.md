# Handler 层设计

## 概述

`src/handler/` 实现了 API 路由的**拦截器中间件系统**和客户端的统一错误处理。灵感来自 Koa/Express 中间件模式，但运行在 Next.js App Router 上下文中。

## 为什么不使用 Next.js Middleware

Next.js `middleware.ts` 运行在 Edge Runtime，无法访问 Node.js 文件系统、SQLite 数据库和 Drizzle ORM。项目的拦截器系统运行在 Node.js 运行时，可以懒加载插件、访问数据库和执行拓扑排序。

## 核心类

### BusinessError (`models.ts`)

```typescript
class BusinessError extends Error {
    code: string;                          // i18n 翻译键
    data: Record<string, any>;             // 附加数据

    constructor(name: string, code: string);
    withValue(key: string, value: any): this;  // 链式添加
}
```

**关键约定**：API 路由处理器中**禁止**直接返回 `NextResponse.json({...}, {status: xxx})`，必须抛出 `BusinessError`。ErrorInterceptor 统一捕获并格式化。

### Interceptor 类 (`server/interceptor.ts`)

`Interceptor` 继承 `ServerRegistry<InterceptorModels>`，单例导出为 `interceptor`。

**`createRoute(route: NextRouter): NextHandler`**：
1. 调用 `registerServerPlugins()`（一次性初始化 .env、拦截器、引擎、外部插件）
2. 按依赖拓扑排序所有注册的拦截器
3. 调用 `compose()` 构建中间件链

**`compose(interceptors, route)`** — 递归中间件组合：
```
interceptor[0].handle(request, records, () =>
    interceptor[1].handle(request, records, () =>
        ...
            route(request, records)
    )
)
```

`records` 是可变共享上下文对象，在整条链中传递。包含 `records.context`（Next.js 路由上下文，含 params）。

```typescript
// 拦截器接口
interface InterceptorModels extends Registerable {
    handle: (
        request: NextRequest,
        records: Record<string, any>,
        next: () => Promise<NextResponse>
    ) => Promise<NextResponse>;
}
```

### ErrorInterceptor (`server/error-interceptor.ts`)

- `id: "error-interceptor"`, `requires: []`（无依赖，最先执行）
- try/catch 包裹 `next()`：
  - `BusinessError` → `NextResponse.json({message, code, data}, {status: 500})`
  - `Error` → `NextResponse.json({message, data: {}}, {status: 500})`
  - 其他 → 重新抛出

### ParamInterceptor (`server/param-interceptor.ts`)

- `id: "param-interceptor"`, `requires: ["error-interceptor"]`
- 解析 `request.nextUrl.searchParams`
- 对每个值尝试 `JSON.parse`（失败则保留原始字符串）
- 结果存入 `records.searchParams`

## 客户端错误处理

### `client/models.ts`

`ApiError extends BusinessError` — 客户端错误类。

### `client/error.ts`

`useErrorHandler()` React Hook：
- `handleError(err)` — `ApiError` 通过 next-intl 翻译 `code` 并用 `data` 插值，显示 toast。非 `ApiError` 显示默认错误 toast。
- `handleSuccess(message)` — 显示成功 toast。
