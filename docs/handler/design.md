# Handler 模块 — 设计文档

## 概述

`src/handler/` 实现了**服务端请求拦截器管道**和**客户端错误处理**。它是 API 路由与业务逻辑之间的中间件层，负责：
- 统一的错误捕获和标准化 JSON 响应
- 请求参数反序列化（Query String + Body）
- 可扩展的拦截器链

## 设计理念

### 为什么不用 Next.js Middleware

Next.js 的 `middleware.ts` 运行在 Edge Runtime，无法访问 Node.js 文件系统和数据库。项目需要：
- 懒加载插件注册
- 访问 Drizzle ORM 数据库连接
- 拓扑排序的拦截器链

因此选择了**应用层拦截器管道**而非框架中间件。

### 责任链模式

`Interceptor.compose()` 实现经典递归中间件组合：

```ts
compose(interceptors, route) {
    // 对每个请求，按顺序创建 next() → next() → ... → route() 链
    // 每个拦截器可以在 next() 前后执行逻辑
}
```

类似 Koa/Express 中间件：每个拦截器接收 `(request, records, next)`，决定是否调用 `next()` 来传递控制权。

### 共享 records 对象

管道中传递一个可变的 `records: Record<string, any>`：

```
ParamInterceptor:
    records.searchParams = { page: 0, pageSize: 20, ... }
    records.body = { name: "story name", ... }

→ ErrorInterceptor (包裹 next())
    → 路由处理器: 从 records 读取参数

    ErrorInterceptor 捕获异常:
        BusinessError → { message, code, data } + HTTP 500
        Error         → { message, data: {} } + HTTP 500
```

## 架构图

```
请求到达
    │
    ▼
Interceptor.createRoute(routeHandler)
    │
    ├── 懒加载 registerServerPlugins()
    │       ├── errorInterceptor
    │       ├── paramInterceptor
    │       ├── 引擎注册 (deepseek, lorebooks, regexes, ...)
    │       └── pluginManager.loadServerPlugins()
    │
    └── compose([...interceptors, routeHandler])
            │
            ├── ParamInterceptor
            │   ├── deserializeSearchParams(nextUrl.searchParams)
            │   │     └── 对每个值尝试 JSON.parse，失败则用原始字符串
            │   ├── POST/PUT/PATCH → request.json() → records.body
            │   └── await next(request, records)
            │
            ├── ErrorInterceptor
            │   └── try { await next() }
            │       catch (BusinessError) → NextResponse.json({message,code,data}, status:500)
            │       catch (Error)         → NextResponse.json({message,data:{}}, status:500)
            │
            └── 路由处理器 (从 records 读取参数，执行业务逻辑)
                    │
                    └── 响应 (NextResponse)
```

## 核心类

### 1. BusinessError

```ts
class BusinessError extends Error {
    data: Record<string, any>;
    code?: string;  // i18n 翻译键

    withValue(key: string, value: any): BusinessError;  // 链式调用
}
```

**设计意图**：code 用作 i18n 翻译键，客户端通过 `t(code, data)` 渲染本地化错误消息。

### 2. Interceptor

```ts
class Interceptor extends ServerRegistry<InterceptorModels> {
    createRoute(route: NextRouter): NextHandler;
    compose(interceptors: InterceptorModels[], route: NextRouter): NextRouter;
}
```

- `createRoute`：包装路由处理器，每次请求时懒加载插件
- `compose`：递归构建拦截器链

### 3. ErrorInterceptor

- 宣告 `id: "error-interceptor"`，无依赖
- 用 try/catch 包裹 `next()`
- `BusinessError` → HTTP 500 + JSON body
- `Error` → HTTP 500 + JSON body（不含 code）
- 其他错误重新抛出（让框架处理）

### 4. ParamInterceptor

- 宣告 `id: "param-interceptor"`，`requires: ["error-interceptor"]`
- 反序列化 `nextUrl.searchParams`
- 解析请求体（POST/PUT/PATCH 的 JSON body）
- 解析失败时优雅降级（body 设为 null）

## 客户端错误处理

### ApiError

```ts
class ApiError extends BusinessError {
    constructor(message, code, data) {
        // 将 data 合并到 this.data
    }
}
```

`ApiError` 的构造函数将服务端返回的 `data` 对象展开到自身，使客户端可以直接访问错误详情。

### useErrorHandler Hook

```tsx
function useErrorHandler() {
    return {
        handleError: (err: unknown) => {
            if (err instanceof ApiError) {
                const msg = t.has(err.code) ? t(err.code, err.data) : err.message;
                toast.error(msg);
            } else {
                throw err;  // 非 ApiError 重新抛出
            }
        }
    };
}
```

**设计意图**：统一错误展示。API 返回的错误自动通过 toast 通知用户；未知错误重新抛出，让上层或 ErrorBoundary 处理。
