# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Secyud Tavern is an AI-driven interactive fiction / role-playing platform. It's a single-user Next.js application where users create **Stories**, configure AI characters via **Presets** (with lorebooks, macros, regexes, scripts, styles), set up **LLM APIs** (OpenAI, DeepSeek), and chat with AI in a **Slot** (a runtime session combining a story + presets + LLM API).

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6, JSX: react-jsx |
| UI | React 19, Tailwind CSS v4, shadcn/ui (radix-nova style) |
| State | Zustand 5 (with `persist` middleware) |
| Database | SQLite via `@libsql/client` + Drizzle ORM 0.45 |
| i18n | next-intl 4.13 (zh/en) |
| Testing | Vitest 4, Testing Library, jsdom |
| Package Manager | pnpm |
| LLM SDK | openai (OpenAI-compatible API) |

## Directory Structure

```
src/
  app/                    # Next.js App Router
    api/                  # API routes (stories, presets, llmapis, images, plugins)
      template.ts         # Generic CRUD handler factories — eliminates boilerplate
    business/             # Main app page & layout
  business/               # Core business logic
    models.ts             # BaseModel, EntryModel, PagedResult, PageOptions
    client/               # Client state (Zustand stores), navigation, plugin layout
    server/               # DB entities, repository factory, storage, image repo
  components/             # shadcn/ui + custom components
    custom/tab/           # TabManager — registry-based tab UI
  engines/                # Pluggable processing engines
    openai/               # OpenAI LLM engine (server + client)
    deepseek/             # DeepSeek LLM engine (server + client)
    lorebooks/            # World info / lorebook matching
    macros/               # Eta template macros
    regexes/              # Regex text transformation
    scripts/              # JS injection into rendered output
    styles/               # CSS injection into rendered output
  handler/                # Interceptor middleware system
    models.ts             # BusinessError class
    server/
      interceptor.ts      # Interceptor chain (composes middleware)
      error-interceptor.ts # Catches BusinessError → JSON error response
      param-interceptor.ts # Parses URL search params
    client/
      error.ts            # useErrorHandler() hook with toast notifications
  plugins/                # Plugin system (registry, manager, models)
  llmapis/                # LLM API config domain (server + client)
  presets/                # Preset domain (server + client)
  stories/                # Story domain (server + client)
  slots/                  # Slot domain — runtime session (client + models)
  localization/           # next-intl config, locale detection, message merging
  utils/                  # register.ts (Registry), hasher.ts (encryption), png.ts, index.ts
  lib/utils.ts            # cn() — clsx + tailwind-merge helper
database/
  migrations/             # Drizzle migration SQL files
  secyud-tavern.db        # SQLite database file
  images/                 # Uploaded image files
plugins/                  # External plugin packages
localization/             # i18n JSON files (zh/, en/)
public/                   # Static assets, OpenAPI spec
scripts/                  # Build scripts (stub gen, plugin build)
tests/                    # Vitest test files
resources/                # Preset resource JSON files
```

## Commands

```bash
pnpm dev          # Start dev server on port 12804
pnpm build        # Production build
pnpm test         # Run Vitest tests
pnpm db-migrate   # Generate & run Drizzle migrations
pnpm gen-stubs    # Generate type stubs
pnpm gen-api      # Generate OpenAPI types
pnpm build-plugin # Build external plugins
```

## Core Architecture Patterns

### 1. Registry with Topological Sort (`src/utils/register.ts`)

The `Registry<T extends Registerable>` class is the foundational pattern. Items have an `id` and optional `requires: string[]` dependency list. `getSorted()` returns items in dependency-resolved order using Kahn's algorithm (topological sort). Circular dependencies are detected and throw errors.

This is used everywhere: interceptors, plugins, engines, storage providers, tab managers, conversation pipeline stages.

On the server side, `ServerRegistry` extends `Registry` with a `moduleName` for identification. On the client side, `ClientRegistry` does the same.

### 2. Interceptor Middleware (`src/handler/server/interceptor.ts`)

API routes are wrapped by `interceptor.createRoute(handler)`. This composes a middleware chain:

1. `ErrorInterceptor` — catches `BusinessError` and converts to JSON `{message, code, data}` (status 500)
2. `ParamInterceptor` — parses URL search params into `records.searchParams`
3. The actual route handler

All API route files use this pattern:
```ts
export const GET = interceptor.createRoute(apiGetModelList(config));
```

### 3. API Template Factories (`src/app/api/template.ts`)

CRUD boilerplate is eliminated by factory functions. Each domain (stories, presets, llmapis) defines a `TemplateConfig` and the factories generate the handlers:

- `apiGetModelList`, `apiGetModel`, `apiCreateModel`, `apiUpdateModel`, `apiDeleteModel`
- `apiExportModel`, `apiImportModel`
- `apiGetEntryList`, `apiCreateEntry`, `apiUpdateEntry`, `apiDeleteEntry`, `apiDisableEntry`

### 4. Master/Detail Data Model (`src/business/server/entities.ts`)

Every entity has two SQLite tables:
- **Master table** (`masterTable()`): `id` (UUID PK), `name`, `content` (JSON blob), `createdAt`, `updatedAt`, plus domain-specific columns
- **Entry table** (`entryTable()`): composite PK `(masterId, entryType, entryId)`, `search`, `disabled`, `content` (JSON blob)

The `createRepository()` factory generates all CRUD operations for any master/detail pair. `content` columns are serialized to JSON strings, parsed back by the repository.

### 5. Storage Providers (`src/business/server/storage.ts`)

`ModelStorage<T>` is a `ServerRegistry<ModelStorageProvider<T>>`. Engines register storage providers that handle loading/saving their specific entry types into/from a model's `entries` map.

`createSimpleStorageProvider<T>(id, arrayName, repository)` is the factory for the standard pattern: entries of type `arrayName` are batch-loaded/saved from/to the entry table.

### 6. Error Handling — MUST use BusinessError

**API route handlers MUST throw `BusinessError` instead of returning error responses directly.** The `errorInterceptor` catches `BusinessError` and formats it consistently. Direct `NextResponse.json(..., {status: xxx})` bypasses the error handling chain.

```ts
// ❌ Wrong
return NextResponse.json({message: "Not found"}, {status: 404});

// ✅ Correct
throw new BusinessError('entity not found', "default.entity_not_found")
    .withValue("id", id);
```

`BusinessError` is defined in `src/handler/models.ts` with `code` and `data` fields, plus a fluent `.withValue(key, value)` method.

### 7. Plugin System (`src/plugins/`)

External plugins live in `plugins/` directories. Each has a manifest (`PluginManifest`) with `serverScript` and/or `clientScript` fields. The `PluginManager` loads manifests and dynamically imports scripts.

- Server: `registerServerPlugins()` (called once per process) loads server plugins
- Client: `useClientPlugins()` React hook loads client plugins on first render

### 8. Conversation Pipeline (`src/slots/client/conversation.ts`)

The chat flow is a multi-stage pipeline with five registries:

| Stage | Registry | When |
|---|---|---|
| Initialize | `conversationManager.initializer` | Slot loads |
| Process Input | `conversationManager.inputProcesser` | Before sending to LLM |
| Stream Render | `conversationManager.streamRenderer` | During LLM streaming |
| Process Output | `conversationManager.outputProcesser` | After LLM response |
| Content Render | `conversationManager.contentRenderer` | Paging through history |

Engines register into relevant stages. For example, lorebooks register as initializer + input processer + output processer, while styles register as initializer + content renderer.

### 9. LLM Engine System (`src/llmapis/server/engine.ts`)

`llmapiEngineRegistry` is a `Registry<LlmapiEngine>`. Each LLM provider (OpenAI, DeepSeek) registers an engine with a `run(context) => Promise<ReadableStream>` method. The chat API route looks up the engine by `llmapi.provider` and calls `engine.run()`.

### 10. iFrame Rendering

Story output is rendered inside an `<iframe>`. Engines inject styles/scripts into the iframe document. Communication uses `postMessage` with a `{type, data}` protocol.

## Key Files Reference

| File | Purpose |
|---|---|
| `src/utils/register.ts` | Base `Registry<T>` class — dependency-ordered plugin registry |
| `src/handler/server/interceptor.ts` | Middleware chain for API routes |
| `src/handler/models.ts` | `BusinessError` class |
| `src/app/api/template.ts` | Generic CRUD handler factories |
| `src/business/server/entities.ts` | Drizzle table helpers (`masterTable`, `entryTable`) |
| `src/business/server/repository.ts` | `createRepository()` factory |
| `src/business/server/storage.ts` | `ModelStorage` — pluggable storage provider registry |
| `src/business/server/storage-models.ts` | `createSimpleStorageProvider()` factory |
| `src/plugins/manager.ts` | `PluginManager` class |
| `src/server-registerer.ts` | Server-side boot sequence |
| `src/client-registerer.ts` | Client-side boot sequence |
| `src/slots/client/conversation.ts` | Conversation pipeline (`conversationManager`) |
| `src/slots/models.ts` | `SlotModel` — the runtime session composite |
| `src/llmapis/server/engine.ts` | `llmapiEngineRegistry` — LLM provider registry |
| `src/utils/hasher.ts` | `Hasher` class — custom encryption for API keys |
| `src/localization/request.ts` | i18n message loading & merging |
| `src/lib/utils.ts` | `cn()` — class name merger |

## Adding a New Domain Entity

Follow the existing pattern (stories, presets, llmapis):

1. Create `src/<domain>/models.ts` — TypeScript interfaces extending `BaseModel`
2. Create `src/<domain>/server/db-entities.ts` — Drizzle table definitions
3. Create `src/<domain>/server/repository.ts` — `createRepository()` call
4. Create `src/<domain>/server/storage.ts` — `ModelStorage` instance (if the entity has sub-entries)
5. Create `src/app/api/<domain>/models.ts` — `TemplateConfig` for API factories
6. Create API route files using the template factories + `interceptor.createRoute()`
7. Create `src/<domain>/client/` — Zustand stores, React components, tab registration

## Adding a New Engine

1. Create `src/engines/<name>/models.ts` — engine-specific data models
2. Create `src/engines/<name>/server/` — storage provider, registration into domain storage
3. Create `src/engines/<name>/client/` — registration into `conversationManager` stages
4. Register server engine in `src/server-registerer.ts`
5. Register client engine in `src/client-registerer.ts`

## TypeScript Conventions

- Module: esnext, ModuleResolution: bundler
- Path alias: `@/*` → `./src/*`, `@tests/*` → `./tests/*`
- React components use `'use client'` directive when using hooks/browser APIs
- `noExplicitAny` is turned off in ESLint config
- JSON data in DB columns uses custom Drizzle types (`jsonField`, `jsonArray`) from `src/business/server/entities.ts`

## Environment Variables

Defined in `.env`:
- `SECRET_SALT` — salt for the Hasher encryption utility
- `SECRET_KEYS` — encryption keys for the Hasher (used to encrypt LLM API keys)

## No Authentication

This is a single-user local application. There is no login, session, or user management system.
