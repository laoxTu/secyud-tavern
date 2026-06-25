# Business Layer Usage Guide

## Database Migrations

```bash
pnpm db-migrate
# Generates Drizzle migration files + executes (drizzle-kit generate + migrate)
```

## Creating a New Business Entity

### 1. Define the Data Model

```typescript
// src/myentity/models.ts
import { BaseModel } from "@/business/models";

export interface MyModel extends BaseModel {
    code: string;
    version: string;
}
```

### 2. Define Database Tables

```typescript
// src/myentity/server/db-entities.ts
import { masterTable, entryTable } from "@/business/server/entities";
import { text } from "drizzle-orm/sqlite-core";

export const myTable = masterTable("my_table", {
    code: text().notNull().unique(),
    version: text().notNull(),
});

export const myEntries = entryTable("my_entries", myTable, { onDelete: "cascade" });
```

### 3. Create Repository

```typescript
// src/myentity/server/repository.ts
import { createRepository } from "@/business/server/repository";
import { myTable, myEntries } from "./db-entities";

export const myRepository = createRepository<MyModel, typeof myTable.$inferSelect>(
    myTable,
    myEntries,
    async (model) => { /* loadModel: load from entries into model.entries */ },
    async (model) => { /* saveModel: save model.entries to entries table */ },
    (type, entry) => `${entry.name} ${entry.code}`,  // bindSearch
);
```

### 4. Create Storage (if sub-entity engines exist)

```typescript
// src/myentity/server/storage.ts
import { ModelStorage } from "@/business/server/storage";
export const myStorage = new ModelStorage<MyModel>("my-module");
```

## Repository Usage

```typescript
// Paginated query
const { data, totalCount } = await repository.getList({ page: 0, pageSize: 20 });

// Fuzzy search
const result = await repository.getList(
    { page: 0, pageSize: 10, search: "keyword" },
    (fields, { like }) => like(fields.name, "%keyword%")
);

// Get single record (with details)
const model = await repository.get(id, true);

// Create
const created = await repository.create({ name: "New Item", code: "item-1" });

// Partial update
await repository.update(id, { name: "Updated Name" });

// Sub-entity operations
const entries = await repository.entry.getList(masterId, "lorebooks", { page: 0, pageSize: 20 });
await repository.entry.create(masterId, "lorebooks", { code: "lb1", name: "Entry 1" });
await repository.entry.setDisabled(masterId, "lorebooks", entryId, true);
```

## Conditional Queries

```typescript
import { eq, like, and } from "drizzle-orm";

// Exact match
const byCode = (t) => eq(t.code, "my-code");

// Fuzzy search
const byName = (t) => like(t.name, "%keyword%");

// Combined
const combined = (t) => and(eq(t.status, "active"), like(t.name, "%test%"));
```

## Client State

```typescript
// Create a Zustand store
import { createUseItemState } from "@/business/client/models";
const useSelected = createUseItemState<MyModel>("my-selection");

// Usage
function Component() {
    const { model, setModel } = useSelected();
    // ...
}
```

## Registering Navigation Tabs

```typescript
// Inside register*Client()
import { businessNavigationManager } from "@/business/client/navigation";

businessNavigationManager.register({
    id: "my-module",
    label: () => <MyLabel />,
    component: MyTabComponent,
});
```
