# Business 模块 — 使用指南

## 创建新的业务实体

### 1. 定义数据模型

```ts
// src/my-entity/models.ts
import { BaseModel, EntryModel } from "@/business/models";

export interface MyModel extends BaseModel {
    code: string;
    version: string;
    // 其他自定义字段
}
```

### 2. 定义数据库表

```ts
// src/my-entity/server/db-entities.ts
import { masterTable, entryTable, jsonArray, jsonField } from "@/business/server/entities";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// 主表
export const myTable = masterTable("my_table", {
    code: text().notNull().unique(),
    version: text().notNull(),
});

// 子表
export const myEntries = entryTable(
    "my_entries",
    myTable,
    { onDelete: "cascade" }
);
```

### 3. 创建 Storage

```ts
// src/my-entity/server/storage.ts
import { ModelStorage } from "@/business/server/storage";

export const myStorage = new ModelStorage<MyModel>("my-model");
```

### 4. 创建 Repository

```ts
// src/my-entity/server/repository.ts
import { createRepository } from "@/business/server/repository";

export const myRepository = createRepository<MyModel, typeof myTable.$inferSelect>(
    myTable,
    myEntries,
    myStorage.loadModel.bind(myStorage),
    myStorage.saveModel.bind(myStorage),
    myStorage.bindSearch.bind(myStorage),
    // Model → Entity 映射
    (model) => ({ code: model.code, version: model.version }),
    // Entity → Model 映射
    (entity) => ({ code: entity.code, version: entity.version })
);
```

### 5. 创建 API 路由

参考 `docs/app/using.md` 中的"添加新的 API 路由"章节。

## Repository API

```ts
interface Repository<TModel> {
    // 主记录 CRUD
    get(id: string, withDetails?: boolean, conditionFunc?: ConditionFunc): Promise<TModel | undefined>;
    getList(options: PageOptions, conditionFunc?: ConditionFunc): Promise<PagedResult<TModel>>;
    create(model: Partial<TModel>): Promise<TModel>;
    update(id: string, model: Partial<TModel>): Promise<void>;  // 部分更新
    delete(id: string): Promise<void>;
    exist(conditionFunc: ConditionFunc): Promise<boolean>;

    // 子条目 CRUD
    entry: {
        getList(masterId: string, type: string, options?: PageOptions): Promise<PagedResult<EntryModel>>;
        create(masterId: string, type: string, entry: Partial<EntryModel>): Promise<EntryModel>;
        batchCreate(masterId: string, type: string, entryList: Partial<EntryModel>[]): Promise<void>;
        update(masterId: string, type: string, entryId: number, entry: Partial<EntryModel>): Promise<void>;
        delete(masterId: string, type: string, entryId: number): Promise<void>;
        setDisabled(masterId: string, type: string, entryId: number, disabled: boolean): Promise<void>;
    };
}
```

## 条件过滤

`ConditionFunc` 用于构建自定义查询条件：

```ts
import { eq, like, and } from "drizzle-orm";

// 精确匹配
const byCode = (t) => eq(t.code, "my-code");

// 模糊搜索
const searchByName = (t) => like(t.name, "%keyword%");

// 组合条件
const complexCondition = (t) => and(
    eq(t.status, "active"),
    like(t.name, "%keyword%")
);

// 使用
const result = await repository.getList(
    { page: 0, pageSize: 10 },
    searchByName
);
```

## 数据库迁移

```bash
# 生成迁移文件
npm run db-migrate
```

这将执行 Drizzle Kit 生成 SQL 迁移文件并运行。

## 客户端插件注册

```ts
// src/my-module/client/index.ts
import { businessNavigationManager } from "@/business/client/navigation";

export function registerMyModuleClient() {
    businessNavigationManager.register({
        id: "my-module",
        label: () => <MyLabel />,
        component: MyTabComponent,
    });
}
```

## 使用 PluginLayout

`PluginLayout` 确保客户端插件加载完成后再渲染子组件：

```tsx
// 在布局中使用
export default function Layout({ children }) {
    return <PluginLayout>{children}</PluginLayout>;
}
```

PluginLayout 内部调用 `useClientPlugins()`，在插件加载完成前显示加载动画。
