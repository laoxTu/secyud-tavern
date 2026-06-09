@AGENTS.md

# Secyud Tavern — Project Rules

## Framework: Next.js 16 (Breaking Changes)

This project uses Next.js 16 with breaking API changes. Always consult `node_modules/next/dist/docs/` before writing any Next.js-specific code. Key docs are in:
- `node_modules/next/dist/docs/01-app/` — App Router docs
- `node_modules/next/dist/docs/02-pages/` — Pages Router docs

## Architecture Overview

```
src/
├── app/          # Next.js App Router — page routes & API route handlers
│   ├── api/      # REST API endpoints (stories, presets, llmapis, plugins)
│   └── business/ # Main business UI page
├── server/       # Server-side business logic, database, engines, plugins
├── client/       # Client-side React components, templates, hooks
├── shared/       # Shared types, interfaces, utils (no side effects)
├── components/   # shadcn/ui components
└── lib/          # Shared library code
```

### Layer Dependency Rules
- **`src/shared/`** — NO imports from `server/`, `client/`, or `app/`. Only shared types/interfaces.
- **`src/server/`** — Can import from `shared/`. NO imports from `client/` or `app/`.
- **`src/client/`** — Can import from `shared/`. NO imports from `server/`.
- **`src/app/`** — Can import from `shared/`, `server/`, and `client/`.

## Database: Drizzle ORM + SQLite (libsql)

- Database file: `database/secyud-tavern.db`
- Migrations: `database/migrations/`
- Run migrations: `npm run db-migrate`

### Master-Entry Table Pattern

Every business entity uses a **two-table design**:

1. **Master table** — created via `masterTable(name, extraColumns)` in `src/server/business/entities.ts`
   - Columns: `id` (PK), `name`, `content` (JSON string), `createdAt`, `updatedAt`
   - Extra columns use `jsonField<T>` or `jsonArray<T>` custom types

2. **Entry table** — created via `entryTable(name, masterRef, options)` in `src/server/business/entities.ts`
   - Columns: `masterId` (FK), `entryType`, `entryId`, `search`, `disabled`, `content`
   - Composite PK: (masterId, entryType, entryId)

Example:
```ts
// db-entities.ts
export const stories = masterTable("story", {
    requires: jsonArray<RequireModel>("requires").default([]),
    llmapi: jsonField<RequireModel | null>("llmapi").default(null),
});
export const storyEntries = entryTable("story_entry", () => stories.id, {onDelete: "cascade"});
```

## Repository Pattern

Every business domain gets a repository via `createRepository()` in `src/server/business/repository.ts`.

```ts
export const storyRepository = createRepository<StoryModel, typeof stories.$inferSelect>(
    stories, storyEntries,
    loadModel,     // async (model) => void — loads entries into model.entries
    saveModel,     // async (model) => void — saves model.entries to entry table
    bindSearch,    // (type, entry) => string — extracts searchable text from entry
    mapToEntity,   // (model) => entity — model → entity extra columns
    mapToModel,    // (entity) => model — entity → model extra columns
);
```

## Storage & Extensible Entry Types

Each business domain can have multiple entry types via `Storage<T>` + `ModelStorageProvider<T>`:

```ts
// provider implements ModelStorageProvider<T>
export const styleStorageProvider: ModelStorageProvider<PresetModel> = {
    id: "style",        // entryType
    loadModel: async (model) => { /* load entries into model.entries.styles */ },
    saveModel: async (model) => { /* save model.entries.styles to entry table */ },
    bindSearch: (entry) => entry.name,
};
```

Registration happens in the domain's `registerXxx()` function:
```ts
export function registerPreset() {
    presetStorage.register(
        lorebookStorageProvider,   // id: "lorebook"
        regexStorageProvider,      // id: "regex"
        styleStorageProvider,      // id: "style"
        scriptStorageProvider,     // id: "script"
    );
}
```

## Registry Pattern (Plugin System)

The generic `Registry<T extends Registerable>` provides a dependency-ordered plugin system with topological sort (Kahn's algorithm).

- `Registerable` has `id: string` and optional `requires?: string[]`
- `Registry.register(...items)` — registers plugins, auto-detects dependency order
- `Registry.use(async (item) => {})` — iterates in dependency order
- Used for: tab managers, storage providers, LLM engines, interceptors

## API Route Handlers

All API routes use **template-based generation** from `src/app/api/template.ts`:

```ts
// List endpoint
export const GET = interceptor.createRoute(generateGetModelListApi(repository, conditionGenerator))
// Detail endpoint
export const GET = interceptor.createRoute(generateGetModelApi(repository))
// Create
export const POST = interceptor.createRoute(generateCreateModelApi(repository))
// Update
export const PUT = interceptor.createRoute(generateUpdateModelApi(repository))
// Delete
export const DELETE = interceptor.createRoute(generateDeleteModelApi(repository))
// Entries
export const GET = interceptor.createRoute(generateGetEntryListApi(repository))
export const POST = interceptor.createRoute(generateCreateEntryApi(repository))
```

Each route file must include `@openapi` JSDoc tags for automatic OpenAPI generation.

## Client-Side Patterns

### API Client (`src/client/register.ts`)
- Use `get(url, options)`, `post(url, body, options)`, `put(url, body, options)`, `del(url, options)`
- URL params via `{paramName}` placeholders: `get("/stories/{id}", {params: {id: "123"}})`
- Types are generated from OpenAPI spec: `src/client/schema.d.ts`

### Tab-Based Navigation
- `TabManager` manages tabs in the UI: `new TabManager("name")`
- `TabConfig` has: `id`, `label` (React component), `component` (React component)
- Registration: `tabManager.register(tabConfig1, tabConfig2)`

### Tab Template
- `ModelListContentTemplate<T>` — generic list+detail panel with search, CRUD, clone, export, import
- Each business domain implements its own `Tab` component using this template

### Context Pattern
- `createModelContextType<T>()` — creates a React context
- `useModelContext(contextType, modelType, t)` — hook to access model state

## i18n: next-intl

- Translation keys use dot notation: `"default.name"`, `"story.enter"`
- In components: `const t = useTranslations()`
- Template placeholders: `t("default.empty_title", {target: t("default.story")})`

## Error Handling

- Server: `BusinessError(message, code)` in `src/shared/errors/` with `.withValue(key, value)` chaining
- Error interceptor (`src/server/errors/error-interceptor-models.ts`) catches and formats responses
- Client: `useErrorHandler()` hook catches errors and displays toasts

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Shared model | `XxxModel` interface | `StoryModel`, `PresetModel` |
| Shared model name | Exported `name` const | `export const name = 'story'` |
| API routes | Same structure for each domain | `/api/stories/`, `/api/stories/[id]/` |
| Entry routes | Nested under `[id]/entries/[entryType]/[entryId]/` | |
| Repository variable | `xxxRepository` | `storyRepository`, `presetRepository` |
| Storage variable | `xxxStorage` | `storyStorage`, `presetStorage` |
| Tab manager | `xxxTabManager` | `storyTabManager`, `presetTabManager` |
| Registration function | `registerXxx()` | `registerStory()`, `registerPreset()` |
| Database tables | Plural snake_case | `stories`, `story_entries` |
| Client files | `preset-preset-preset-preset-tab.tsx` for main list view | |

## Adding a New Business Domain

1. **Shared**: Create `src/shared/business/<domain>/register.ts` with model interface + name export
2. **Server**: Create `src/server/business/<domain>/` with:
   - `db-entities.ts` — master + entry tables
   - `register.ts` — repository, storage, registration function
3. **Client**: Create `src/client/business/<domain>/` with:
   - `models.ts` — React context
   - `preset-preset-preset-preset-tab.tsx` — main list using `ModelListContentTemplate`
   - `register.ts` — tab manager + registration
4. **API Routes**: Create route handlers under `src/app/api/<domain>/` using template generators
5. **Register**: Call `registerXxx()` in both client and server `registerBusiness()` functions

## LLM Engine Extension

Add new AI providers by implementing `LlmEngine`:

```ts
export class NewEngine implements LlmEngine {
    readonly id: string = name;  // from shared model
    async run(context: LlmRequestContext): Promise<ReadableStream> { ... }
}
```

- Shared model: `src/shared/business/llmapis/engines/<name>.ts`
- Implementation: `src/server/business/llmapis/engines/<name>.ts`
- Register in `registerLlmapi()` via `llmapiEngineRegistry.register(new NewEngine())`

## Miscellaneous

- Use `@/*` path alias for all imports (maps to `src/*`)
- Use `assert` from `node:assert` for runtime invariant checks
- `use client` directive required on all client files
- Debug logs use `console.debug()` (not `console.log()`)
- Always use `as const` on config objects that are registered in managers
