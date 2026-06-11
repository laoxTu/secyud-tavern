# Business 模块 — 设计文档

## 概述

`src/business/` 是整个应用的**数据持久化基础设施层**。它定义了：
- 通用数据模型（`BaseModel`、`EntryModel`）
- Drizzle ORM 数据库表工厂（`masterTable`、`entryTable`）
- 泛型 CRUD Repository（`createRepository`）
- 模型存储提供者注册表（`ModelStorage`）
- 客户端导航管理器

## 设计理念

### Master-Entry 数据模型

所有业务实体（Stories、Presets、LlmApis、引擎配置）遵循统一的 **Master-Detail** 两级数据结构：

```
Master 表（主记录）
├── id: string (UUID)
├── name: string
├── content: JSON text (自由格式数据)
├── createdAt / updatedAt
└── entries: Record<string, Entry[]>

Entry 表（子记录）
├── masterId: string (FK → Master)
├── entryType: string (类型区分)
├── entryId: integer (主键的一部分)
├── disabled: boolean
└── content: JSON text
```

**设计意图**：
- **Master 表**存储可查询的结构化字段（name, code, version）
- **Entry 表**存储自由格式的 JSON 数据（世界书条目、正则规则、样式块、脚本块、对话历史）
- `entryType` 作为表内分区键，区分不同类型的子记录（如 lorebooks、regexes、styles、scripts）

### 为什么用 JSON 列而不是规范化表

- 不同引擎/模块的 Entry 数据格式差异很大（世界书 vs 正则 vs 样式）
- JSON 列的灵活性允许每个 Entry 类型定义自己的数据结构
- 通过 `ModelStorage` 抽象存储细节，上层模块不需要关心数据库列结构

## 架构图

```
┌─────────────────────────────────────────────┐
│          Business Models                     │
│  BaseModel, EntryModel, PageOptions         │
├─────────────────────────────────────────────┤
│        Database (database.ts)               │
│  DatabaseManager → @libsql/client + drizzle │
│  dbUrl: "file:database/secyud-tavern.db"   │
├─────────────────────────────────────────────┤
│       Entity Factory (entities.ts)          │
│  masterTable() → Drizzle 主表定义            │
│  entryTable()  → Drizzle 子表定义            │
│  jsonArray(), jsonField() → JSON 列类型      │
├─────────────────────────────────────────────┤
│     Repository Factory (repository.ts)      │
│  createRepository<T, TEntity>() → CRUD API  │
│  Repository<T> { get, create, update, ... } │
├─────────────────────────────────────────────┤
│    Storage Registry (storage.ts)            │
│  ModelStorage<T> extends ServerRegistry     │
│  createSimpleStorageProvider()              │
├─────────────────────────────────────────────┤
│      Client Navigation                      │
│  businessNavigationManager: TabManager      │
│  PluginLayout: React Component              │
└─────────────────────────────────────────────┘
```

## 核心抽象

### 1. Repository 模式

`createRepository` 是一个泛型工厂函数，接收数据库表定义和映射回调，返回一个完整的类型安全 CRUD 接口：

```ts
const repository = createRepository<TModel, TEntity>({
    masters,          // Drizzle 主表
    entries,          // Drizzle 子表
    loadModel,        // 加载 model.entries
    saveModel,        // 持久化 model.entries
    bindSearch,       // 构建搜索字符串
    mapToEntity,      // Model → DB Entity
    mapToModel,       // DB Entity → Model
});
```

**为什么用工厂模式**：
- 每种实体（Story、Preset、Llmapi）的表结构相同（差异仅在额外列）
- 标准 CRUD 操作完全一致
- 工厂函数消除重复代码，每个模块只需提供映射函数

### 2. Storage Provider 策略模式

`ModelStorage<T>` 是一个注册表，持有多个 `ModelStorageProvider`。每个 Provider 负责一种 EntryType 的加载/保存：

```ts
// deepseek 引擎注册自己的存储提供者
presetStorage.register(createSimpleStorageProvider(
    "deepseek",           // entryType
    "deepseeks",          // model.entries[key]
    presetRepository      // 使用的仓库
));
```

**关键设计**：各引擎的存储逻辑通过注册机制解耦。上层业务模块不需要知道有哪些引擎；引擎自己注册存储能力。

### 3. 分页

所有列表查询使用统一的分页模型：

```ts
interface PageOptions {
    page: number;       // 从 0 开始
    pageSize: number;   // 默认 20
    search?: string;    // 可选模糊搜索
}

interface PagedResult<T> {
    data: T[];
    totalCount: number;
}
```

## 数据库连接

- **数据库**：SQLite（通过 `@libsql/client`）
- **文件位置**：`database/secyud-tavern.db`
- **迁移文件夹**：`database/migrations/`
- **ORM**：Drizzle ORM（类型安全 SQL 查询）
- **单例**：`databaseManager` 全局唯一实例

### 自定义列类型

```ts
// JSON 数组列 — 自动序列化/反序列化
jsonArray<T>(columnName): T[] column

// JSON 对象列 — 可空
jsonField<T>(columnName): T | null column
```

这些自定义类型让上层代码可以用 TypeScript 原生类型工作，无需手动 JSON.parse/stringify。

## 与引擎系统的关系

引擎模块（lorebooks、regexes、scripts、styles、deepseek）完全依赖 Business 层的数据基础设施：

- 引擎的 server 端使用 `createSimpleStorageProvider` 注册存储
- 引擎的 client 端使用 `TabManager`（extends `ClientRegistry`）注册 UI 标签
- `businessNavigationManager` 是引擎模块的主入口注册点
