# Business 层设计

## 概述

`src/business/` 是数据持久化基础设施层，定义通用数据模型、Drizzle ORM 表工厂、泛型 CRUD Repository、可插拔存储系统和客户端状态管理。

## 数据模型 (`models.ts`)

```typescript
interface BaseModel {
    id: string;                              // UUID
    name: string;
    entries?: Record<string, EntryModel[]>;  // 子实体集合
    content: Record<string, any>;            // 任意扩展数据
}

interface EntryModel {
    id: number;       // 自动递增
    disabled: boolean;
    code: string;     // 可读标识符
    name: string;
}

interface PageOptions {
    page: number;
    pageSize: number;
    search?: string;
}

interface PagedResult<T> {
    data: T[];
    totalCount: number;
}

interface PageState {
    max: number;
    cur: number;
}
```

## 数据库层

### 双表模式 (`server/entities.ts`)

使用 Drizzle ORM + SQLite (`@libsql/client`)，数据库文件 `database/secyud-tavern.db`。

**`masterTable(tableName, extraColumns)`** — 创建主表：
- `id` (text PK), `name` (text not null), `content` (text)
- `createdAt`, `updatedAt` (text, ISO 字符串)
- 额外列由领域定义

**`entryTable(tableName, masterRef, options)`** — 创建子表：
- `masterId` (text FK), `entryType` (text), `entryId` (integer)
- 复合主键: `(masterId, entryType, entryId)`
- `search` (text), `disabled` (integer), `content` (text)

自定义 Drizzle 列类型：
- `jsonArray<T>(name)` — 自动 JSON 序列化/反序列化的数组列
- `jsonField<T>(name)` — 自动 JSON 序列化/反序列化的对象列

### Repository 工厂 (`server/repository.ts`)

`createRepository<TModel, TMaster>(masters, entries, loadModel, saveModel, bindSearch, mapToEntity?, mapToModel?)` 返回完整 `Repository<TModel>`：

**主记录操作**：
- `get(id, withDetails?, conditionFunc?)` — 获取单条，解析 content JSON，可选加载 entries
- `getList(options, conditionFunc?)` — COUNT + LIMIT/OFFSET 分页
- `create(model)` — 生成 UUID，插入主表，有 entries 则调用 saveModel
- `update(id, model)` — 部分更新，`mergeObjects` 合并 content
- `delete(id)` — 删除主表记录
- `exist(conditionFunc)` — 存在性检查

**子实体操作** (`repository.entry.*`)：
- `getList(masterId, type, options?)` — 分页查询
- `batchCreate(masterId, type, entries)` — 批量创建
- `create(masterId, type, entry)` — 创建单条（自动递增 entryId）
- `setDisabled(masterId, type, entryId, disabled)` — 切换状态
- `update(masterId, type, entryId, entry)` — 部分更新
- `delete(masterId, type, entryId)` — 删除

子实体 content 以 JSON 文本存储，`search` 字段用于 LIKE 模糊搜索。

### 存储系统 (`server/storage.ts`)

`ModelStorage<T>` 继承 `ServerRegistry<ModelStorageProvider<T>>`，是存储提供者的注册表：

- `loadModel(model)` — 遍历所有注册提供者（按依赖排序），从 entries 表加载数据到 `model.entries`
- `saveModel(model)` — 遍历所有提供者，保存 `model.entries` 到 entries 表
- `bindSearch(type, entry)` — 委托给匹配的提供者生成搜索字符串

### 简单存储提供者 (`server/storage-models.ts`)

`createSimpleStorageProvider<T>(id, arrayName, repository)` 工厂函数生成标准实现：

```typescript
interface ModelStorageProvider<T> extends Registerable {
    loadModel: (model: T) => Promise<void>;
    saveModel: (model: T) => Promise<void>;
    bindSearch: (entry: any) => string;
}
```

标准 `bindSearch` 返回 `` `${entry.name} ${entry.code}` ``。所有 preset 引擎（lorebooks, macros, regexes, scripts, styles）都使用此工厂。

### 图片仓库 (`server/image-repository.ts`)

- 文件存储在 `database/images/`，UUID 命名
- SHA-256 去重：重复图片返回已有 ID
- `create(buffer, type)` → `{id, sha256}`
- `get(id)` → `{buffer, id, sha256, type}`
- `delete(id)` → 删除文件和 DB 记录

## 客户端层

### 状态管理 (`client/models.ts`)

基于 Zustand 5 + `persist` 中间件：
- `createUseItemState<T>(name?)` — 单条选中状态 store（可选持久化）
- `createUsePagedItemsState(fetcher, name, pageSize, search)` — 分页列表 store（在 `components/custom/pager` 中定义）
- `ModelState<T>` — 聚合 moduleName、useItemState、usePagedItemsState
- `EntryState<T>` — 聚合 moduleName、entryType、usePagedItemsState

### 导航 (`client/navigation.ts`)

`businessNavigationManager = new TabManager("business")` — 顶层 UI 标签注册表。

### UI 模板 (`client/template/`)

预建通用组件：

| 组件 | 用途 |
|---|---|
| `ModelList<T>` | 左右面板：可搜索列表 + 可调整大小的详情面板 |
| `ModelCreate<T>` | 创建和导入对话框 |
| `ModelUpdate<T>` | 编辑表单 |
| `ModelContent<T>` | 标签页式详情面板（含导出/克隆/删除） |
| `EntryList<T>` | 子实体列表（搜索 + 分页 + 创建） |
| `EntryUpdate<T>` | 卡片式行内编辑（含启用/禁用/克隆/删除） |
| `PaginationWrapper<T>` | 分页控件（省略号逻辑） |

### 插件布局 (`client/plugin-layout.tsx`)

`<PluginLayout>` — 调用 `useClientPlugins()` 初始化客户端插件，完成前显示加载 iframe。
