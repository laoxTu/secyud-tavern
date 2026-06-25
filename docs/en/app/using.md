# App Layer Usage Guide

## Development

```bash
pnpm dev    # Starts at http://localhost:12804, root path auto-redirects to /business
pnpm build  # Production build
```

## Adding a New API Route

### Step 1: Define TemplateConfig

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

### Step 2: Create Route Files

```typescript
// src/app/api/myentity/route.ts
import { interceptor } from "@/handler/server/interceptor";
import { apiGetModelList, apiCreateModel } from "@/app/api/template";
import { apiConfig } from "./models";

export const GET = interceptor.createRoute(apiGetModelList(apiConfig));
export const POST = interceptor.createRoute(apiCreateModel(apiConfig));
```

### Step 3: Dynamic Routes

```typescript
// src/app/api/myentity/[id]/route.ts
import { apiGetModel, apiUpdateModel, apiDeleteModel } from "@/app/api/template";

export const GET = interceptor.createRoute(apiGetModel(apiConfig));
export const PUT = interceptor.createRoute(apiUpdateModel(apiConfig));
export const DELETE = interceptor.createRoute(apiDeleteModel(apiConfig));
```

## Error Handling Conventions

```typescript
// ❌ Forbidden — bypasses the error handling chain
return NextResponse.json({ message: "error" }, { status: 400 });

// ✅ Correct — throws BusinessError
throw new BusinessError('validation failed', "default.validation_failed")
    .withValue("field", "name");
```

## Parameter Access

`ParamInterceptor` parses URL search parameters into `records.searchParams`, attempting `JSON.parse` on each value:

```
GET /api/stories?page=0&pageSize=20&search={"name":"test"}
→ records.searchParams = { page: 0, pageSize: 20, search: { name: "test" } }
```

Path parameters are available in `records.context.params` (provided automatically by Next.js).

## Client Page Development

```tsx
'use client';

export default function MyPage() {
    return <div>My Content</div>;
}
```

- Components using browser APIs must be marked with `'use client'`
- The Business area is automatically initialized with client plugins by `<PluginLayout>`
- Register navigation tabs via `businessNavigationManager.register(tabConfig)`
