# Handler Layer Usage Guide

## Throwing Errors in API Routes

```typescript
import { BusinessError } from "@/handler/models";

// Basic usage
throw new BusinessError("entity not found", "default.entity_not_found");

// With attached data (the client can display via i18n interpolation)
throw new BusinessError("name required", "validation.required")
    .withValue("field", "name")
    .withValue("minLength", 3);
```

## Correct vs. Incorrect Error Handling

```typescript
// ❌ Forbidden — bypasses ErrorInterceptor, inconsistent error format
export const GET = interceptor.createRoute(async (req, records) => {
    if (!entity)
        return NextResponse.json({ message: "Not found" }, { status: 404 });
});

// ✅ Correct — uniformly formatted by ErrorInterceptor
export const GET = interceptor.createRoute(async (req, records) => {
    if (!entity)
        throw new BusinessError("entity not found", "default.entity_not_found");
});
```

## Accessing Parameters in Handlers

```typescript
export const GET = interceptor.createRoute(async (req, records) => {
    // URL query parameters (JSON.parse attempted)
    const { page, pageSize, search } = records.searchParams;

    // Path parameters (provided automatically by Next.js)
    const { id } = records.context.params;

    // Request body is read directly in the handler
    const body = await req.json();
});
```

## Client-Side Error Handling

```tsx
'use client';
import { useErrorHandler } from "@/handler/client/error";

function MyComponent() {
    const { handleError, handleSuccess } = useErrorHandler();

    async function save() {
        try {
            await fetch('/api/stories', { method: 'POST', body: data });
            handleSuccess("Saved successfully");
        } catch (err) {
            handleError(err);
            // If err is ApiError(code="default.name_required"),
            // the code is automatically translated via next-intl and shown as a toast
        }
    }

    return <Button onClick={save}>Save</Button>;
}
```

## Registering Custom Interceptors

```typescript
import { interceptor } from "@/handler/server/interceptor";

interceptor.register({
    id: "my-logger",
    requires: ["error-interceptor"],  // Runs after error handling
    handle: async (request, records, next) => {
        console.log(`[${request.method}] ${request.url}`);
        const response = await next();
        console.log(`  → ${response.status}`);
        return response;
    },
});
```

Interceptors are executed in topological order based on `requires` dependencies using Kahn's algorithm. Circular dependencies throw an explicit error.
