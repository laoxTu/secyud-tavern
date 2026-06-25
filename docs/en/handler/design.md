# Handler Layer Design

## Overview

`src/handler/` implements an **interceptor middleware system** for API routes and unified error handling on the client side. Inspired by the Koa/Express middleware pattern, but running within the Next.js App Router context.

## Why Not Next.js Middleware

Next.js `middleware.ts` runs on the Edge Runtime, which cannot access the Node.js filesystem, SQLite database, or Drizzle ORM. The project's interceptor system runs on the Node.js runtime, allowing lazy-loading of plugins, database access, and topological sorting.

## Core Classes

### BusinessError (`models.ts`)

```typescript
class BusinessError extends Error {
    code: string;                          // i18n translation key
    data: Record<string, any>;             // Additional data

    constructor(name: string, code: string);
    withValue(key: string, value: any): this;  // Chainable addition
}
```

**Key convention**: API route handlers **must not** directly return `NextResponse.json({...}, {status: xxx})`; they must throw `BusinessError`. The ErrorInterceptor uniformly catches and formats it.

### Interceptor Class (`server/interceptor.ts`)

`Interceptor` extends `ServerRegistry<InterceptorModels>` and is exported as the singleton `interceptor`.

**`createRoute(route: NextRouter): NextHandler`**:
1. Calls `registerServerPlugins()` (one-time initialization of .env, interceptors, engines, external plugins)
2. Topologically sorts all registered interceptors by dependency
3. Calls `compose()` to build the middleware chain

**`compose(interceptors, route)`** — recursive middleware composition:
```
interceptor[0].handle(request, records, () =>
    interceptor[1].handle(request, records, () =>
        ...
            route(request, records)
    )
)
```

`records` is a mutable shared context object passed through the entire chain. It contains `records.context` (Next.js route context, including params).

```typescript
// Interceptor interface
interface InterceptorModels extends Registerable {
    handle: (
        request: NextRequest,
        records: Record<string, any>,
        next: () => Promise<NextResponse>
    ) => Promise<NextResponse>;
}
```

### ErrorInterceptor (`server/error-interceptor.ts`)

- `id: "error-interceptor"`, `requires: []` (no dependencies, runs first)
- Wraps `next()` in try/catch:
  - `BusinessError` → `NextResponse.json({message, code, data}, {status: 500})`
  - `Error` → `NextResponse.json({message, data: {}}, {status: 500})`
  - Other → re-throws

### ParamInterceptor (`server/param-interceptor.ts`)

- `id: "param-interceptor"`, `requires: ["error-interceptor"]`
- Parses `request.nextUrl.searchParams`
- Attempts `JSON.parse` on each value (falls back to the raw string on failure)
- Stores the result in `records.searchParams`

## Client-Side Error Handling

### `client/models.ts`

`ApiError extends BusinessError` — client-side error class.

### `client/error.ts`

`useErrorHandler()` React Hook:
- `handleError(err)` — translates `code` via next-intl and interpolates with `data` for `ApiError`, shows a toast. Shows a default error toast for non-`ApiError`.
- `handleSuccess(message)` — shows a success toast.
