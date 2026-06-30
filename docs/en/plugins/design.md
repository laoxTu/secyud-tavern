# Plugins System Design

## Overview

The plugin system is based on the `Registry<T>` dependency injection pattern. All plugins are scanned at **build time** by the `generate-plugin` script which produces three static files (manifest list, server registerer entry, client registerer entry). At runtime, static imports are used directly — no dynamic filesystem scanning.

## Directory Structure

```
src/plugins/
  models.ts              # PluginManifest interface
  manager.ts             # PluginManager (thin ServerRegistry<PluginManifest> wrapper)
  index.ts               # pluginManager singleton
  manifests.ts           # [Generated] Inlined manifest data array
  server/
    registerer.ts        # [Generated] Static imports of all server plugins + registration function
    plugin-route.ts      # PluginRouteManager — plugin API route registration & matching
  client/
    registerer.ts        # [Generated] Static imports of all client plugins + registration function
plugins/                  # External plugin directory
  my-plugin/              # Example plugin
```

## PluginManifest (`models.ts`)

```typescript
interface PluginManifest extends Registerable {
    version: string;         // Semantic version
    serverScript?: string;   // Server script filename (without extension, e.g. "server")
    clientScript?: string;   // Client script filename (without extension, e.g. "client")
    folder: string;          // Plugin directory name (assigned by generate-plugin)
}
```

`id` is inherited from `Registerable` and serves as both the unique identifier and the API path `[pluginId]`.

Plugin directory convention:
```
plugins/my-plugin/
  manifest.json           # Plugin manifest (without folder field, assigned by script)
  server.ts               # Server script (optional)
  client.tsx              # Client script (optional)
  localization/           # i18n messages (optional)
    zh/
      default.json
    en/
      default.json
```

## PluginManager (`manager.ts`)

A thin wrapper extending `ServerRegistry<PluginManifest>`, containing no loading logic:

```typescript
export class PluginManager extends ServerRegistry<PluginManifest> {
    constructor(name: string) {
        super(name);
    }
}
```

The singleton `pluginManager` is created in `index.ts` via `getInstance`, registering all manifests from `manifests.ts` at construction time:

```typescript
export const pluginManager =
    getInstance("pluginManager", u => {
        const instance = new PluginManager(u);
        instance.register(...manifests);
        return instance;
    });
```

## Build-Time Code Generation (`scripts/generate-plugin.ts`)

`generate-plugin` scans `plugins/*/manifest.json` and produces three files:

### 1. `src/plugins/manifests.ts`

Inlined manifest array with the `folder` field assigned:

```ts
export const manifests = [
    {"id":"my-plugin","version":"1.0.0","clientScript":"client","serverScript":"server","folder":"my-plugin"},
    ...
];
```

### 2. `src/plugins/server/registerer.ts`

Statically imports all server plugin scripts, exports `registerServerPlugin()` to execute them in order:

```ts
import registerer0 from '@plugins/my-plugin/server';
import registerer1 from '@plugins/another-plugin/server';

export async function registerServerPlugin() {
    await registerer0();
    await registerer1();
}
```

### 3. `src/plugins/client/registerer.ts`

Same pattern for client scripts:

```ts
import registerer0 from '@plugins/my-plugin/client';
import registerer1 from '@plugins/another-plugin/client';

export async function registerClientPlugin() {
    await registerer0();
    await registerer1();
}
```

### `@plugins/*` Path Alias

Configured in `tsconfig.json`:

```json
{ "paths": { "@plugins/*": ["./plugins/*"] } }
```

This allows the generated files' `@plugins/my-plugin/server` imports to be resolved by Next.js/webpack to `plugins/my-plugin/server.ts`, enabling proper resolution of `@/` aliases and other project-relative imports within plugins.

## Server Startup Flow (`src/server-registerer.ts`)

`registerServerPlugins()` executes on the first API request (once only):

1. Register `errorInterceptor` and `paramInterceptor`
2. Register OpenAI and DeepSeek LLM engines
3. Register preset engines: lorebooks, regexes, styles, scripts, macros
4. Enable `console.debug` in development
5. Call `registerServerPlugin()` — executes all plugin server entry points

## Client Startup Flow (`src/client-registerer.ts`)

`useClientPlugins()` React Hook executes on first render (once only):

1. `registerComponents()` — registers UI components into pluginApi
2. Register domain clients: business, story, preset, llmapi, slot
3. Register engine clients: deepseek, openai, lorebooks, regexes, styles, scripts, macros
4. Call `registerClientPlugin()` — executes all plugin client entry points
5. Returns `initialized` boolean

## PluginRouteManager (`server/plugin-route.ts`)

Plugins can register API routes via `pluginRouteManager.registerRouteTree(obj)`.

### Route Registration

```typescript
const route = {
    "my-app": {
        "import": {
            "preset": {
                async POST(request, records) { ... }
            }
        }
    }
};
pluginRouteManager.registerRouteTree(route);
// Registers ID: [POST]//my-app/import/preset
```

### Route Tree Matching

`getRouteTree()` builds a tree from registered routes. Each node may contain `__dynamic` (dynamic path segments like `{id}`) and `__handler` (the handler function). Matching tries exact match first, then falls back to dynamic segments.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/plugins` | GET | Returns all registered PluginManifest entries |
| `/api/plugins/{pluginId}` | GET | Returns the plugin's compiled clientScript (`application/javascript`) |
| `/plugins/api/[...path]` | GET/POST/PUT/DELETE | Generic plugin route entry point, matches routes registered in `pluginRouteManager` |

- Client script API disables caching (`Cache-Control: no-cache`) for dev convenience
- Unmatched plugin routes throw `BusinessError("plugin.route_not_found")`
