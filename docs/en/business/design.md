# Business Layer Design

## Overview

`src/business/` is the data persistence infrastructure layer, defining common data models, Drizzle ORM table factories, generic CRUD Repository, pluggable storage system, and client-side state management.

## Data Models (`models.ts`)

```typescript
interface BaseModel {
    id: string;                              // UUID
    name: string;
    entries?: Record<string, EntryModel[]>;  // Sub-entity collections
    content: Record<string, any>;            // Arbitrary extended data
}

interface EntryModel {
    id: number;       // Auto-increment
    disabled: boolean;
    code: string;     // Human-readable identifier
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

## Database Layer

### Dual-Table Pattern (`server/entities.ts`)

Uses Drizzle ORM + SQLite (`@libsql/client`), database file at `database/secyud-tavern.db`.

**`masterTable(tableName, extraColumns)`** — creates the master table:
- `id` (text PK), `name` (text not null), `content` (text)
- `createdAt`, `updatedAt` (text, ISO strings)
- Extra columns defined by each domain

**`entryTable(tableName, masterRef, options)`** — creates the entry table:
- `masterId` (text FK), `entryType` (text), `entryId` (integer)
- Composite primary key: `(masterId, entryType, entryId)`
- `search` (text), `disabled` (integer), `content` (text)

Custom Drizzle column types:
- `jsonArray<T>(name)` — array column with automatic JSON serialization/deserialization
- `jsonField<T>(name)` — object column with automatic JSON serialization/deserialization

### Repository Factory (`server/repository.ts`)

`createRepository<TModel, TMaster>(masters, entries, loadModel, saveModel, bindSearch, mapToEntity?, mapToModel?)` returns a complete `Repository<TModel>`:

**Master record operations**:
- `get(id, withDetails?, conditionFunc?)` — fetches a single record, parses content JSON, optionally loads entries
- `getList(options, conditionFunc?)` — COUNT + LIMIT/OFFSET pagination
- `create(model)` — generates UUID, inserts master row, calls saveModel if entries exist
- `update(id, model)` — partial update, `mergeObjects` for content merging
- `delete(id)` — deletes the master record
- `exist(conditionFunc)` — existence check

**Sub-entity operations** (`repository.entry.*`):
- `getList(masterId, type, options?)` — paginated query
- `batchCreate(masterId, type, entries)` — batch creation
- `create(masterId, type, entry)` — single create (auto-increment entryId)
- `setDisabled(masterId, type, entryId, disabled)` — toggle state
- `update(masterId, type, entryId, entry)` — partial update
- `delete(masterId, type, entryId)` — delete

Sub-entity content is stored as JSON text, and the `search` field is used for LIKE fuzzy search.

### Storage System (`server/storage.ts`)

`ModelStorage<T>` extends `ServerRegistry<ModelStorageProvider<T>>` and is a registry of storage providers:

- `loadModel(model)` — iterates over all registered providers (in dependency order), loads data from the entries table into `model.entries`
- `saveModel(model)` — iterates over all providers, saves `model.entries` to the entries table
- `bindSearch(type, entry)` — delegates to the matching provider to generate a search string

### Simple Storage Provider (`server/storage-models.ts`)

The `createSimpleStorageProvider<T>(id, arrayName, repository)` factory function generates standard implementations:

```typescript
interface ModelStorageProvider<T> extends Registerable {
    loadModel: (model: T) => Promise<void>;
    saveModel: (model: T) => Promise<void>;
    bindSearch: (entry: any) => string;
}
```

The standard `bindSearch` returns `` `${entry.name} ${entry.code}` ``. All preset engines (lorebooks, macros, regexes, scripts, styles) use this factory.

### Image Repository (`server/image-repository.ts`)

- Files stored in `database/images/`, named by UUID
- SHA-256 dedup: duplicate images return the existing ID
- `create(buffer, type)` → `{id, sha256}`
- `get(id)` → `{buffer, id, sha256, type}`
- `delete(id)` → deletes file and DB record

## Client Layer

### State Management (`client/models.ts`)

Based on Zustand 5 + `persist` middleware:
- `createUseItemState<T>(name?)` — single selected-item state store (optional persistence)
- `createUsePagedItemsState(fetcher, name, pageSize, search)` — paginated list store (defined in `components/custom/pager`)
- `ModelState<T>` — aggregates moduleName, useItemState, usePagedItemsState
- `EntryState<T>` — aggregates moduleName, entryType, usePagedItemsState

### Navigation (`client/navigation.ts`)

`businessNavigationManager = new TabManager("business")` — top-level UI tab registry.

### UI Templates (`client/template/`)

Pre-built generic components:

| Component | Purpose |
|---|---|
| `ModelList<T>` | Left-right panel: searchable list + resizable detail panel |
| `ModelCreate<T>` | Create and import dialog |
| `ModelUpdate<T>` | Edit form |
| `ModelContent<T>` | Tabbed detail panel (with export/clone/delete) |
| `EntryList<T>` | Sub-entity list (search + pagination + create) |
| `EntryUpdate<T>` | Card-style inline editing (with enable/disable/clone/delete) |
| `PaginationWrapper<T>` | Pagination control (ellipsis logic) |

### Plugin Layout (`client/plugin-layout.tsx`)

`<PluginLayout>` — calls `useClientPlugins()` to initialize client-side plugins. Displays a loading iframe until complete.
