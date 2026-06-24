# Business 层使用指南

## 数据库迁移

```bash
pnpm db-migrate
# 生成 Drizzle 迁移文件 + 执行（drizzle-kit generate + migrate）
```

## 创建新的业务实体

### 1. 定义数据模型

```typescript
// src/myentity/models.ts
import { BaseModel } from "@/business/models";

export interface MyModel extends BaseModel {
    code: string;
    version: string;
}
```

### 2. 定义数据库表

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

### 3. 创建 Repository

```typescript
// src/myentity/server/repository.ts
import { createRepository } from "@/business/server/repository";
import { myTable, myEntries } from "./db-entities";

export const myRepository = createRepository<MyModel, typeof myTable.$inferSelect>(
    myTable,
    myEntries,
    async (model) => { /* loadModel: 从 entries 加载到 model.entries */ },
    async (model) => { /* saveModel: 保存 model.entries 到 entries 表 */ },
    (type, entry) => `${entry.name} ${entry.code}`,  // bindSearch
);
```

### 4. 创建 Storage（如有子实体引擎）

```typescript
// src/myentity/server/storage.ts
import { ModelStorage } from "@/business/server/storage";
export const myStorage = new ModelStorage<MyModel>("my-module");
```

## Repository 使用

```typescript
// 分页查询
const { data, totalCount } = await repository.getList({ page: 0, pageSize: 20 });

// 模糊搜索
const result = await repository.getList(
    { page: 0, pageSize: 10, search: "keyword" },
    (fields, { like }) => like(fields.name, "%keyword%")
);

// 获取单条（含详情）
const model = await repository.get(id, true);

// 创建
const created = await repository.create({ name: "New Item", code: "item-1" });

// 部分更新
await repository.update(id, { name: "Updated Name" });

// 子实体操作
const entries = await repository.entry.getList(masterId, "lorebooks", { page: 0, pageSize: 20 });
await repository.entry.create(masterId, "lorebooks", { code: "lb1", name: "Entry 1" });
await repository.entry.setDisabled(masterId, "lorebooks", entryId, true);
```

## 条件查询

```typescript
import { eq, like, and } from "drizzle-orm";

// 精确匹配
const byCode = (t) => eq(t.code, "my-code");

// 模糊搜索
const byName = (t) => like(t.name, "%keyword%");

// 组合
const combined = (t) => and(eq(t.status, "active"), like(t.name, "%test%"));
```

## 客户端状态

```typescript
// 创建 Zustand store
import { createUseItemState } from "@/business/client/models";
const useSelected = createUseItemState<MyModel>("my-selection");

// 使用
function Component() {
    const { model, setModel } = useSelected();
    // ...
}
```

## 注册导航标签

```typescript
// 在 register*Client() 中
import { businessNavigationManager } from "@/business/client/navigation";

businessNavigationManager.register({
    id: "my-module",
    label: () => <MyLabel />,
    component: MyTabComponent,
});
```
