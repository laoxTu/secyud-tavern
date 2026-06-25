# Plugins System Design

## Overview

The plugin system allows external JavaScript modules to register new functionality on the server side (dynamic `import` at startup) and client side (fetching scripts via API, then `new Function` execution). Based on the `Registry<T>` dependency injection pattern.

## Directory Structure

```
src/plugins/
  models.ts      # PluginManifest interface
  manager.ts     # PluginManager class
plugins/         # External plugin directory
  project-info/  # Example plugin
```

## PluginManifest (`models.ts`)

```typescript
interface PluginManifest extends Registerable {
    version: string;         // Semantic version number
    serverScript?: string;   // Server script filename (relative to plugin directory)
    clientScript?: string;   // Client script filename (relative to plugin directory)
    path: string;            // Plugin directory path
    directory?: string;      // Filesystem absolute path (assigned at load time)
}
```

Plugin directory convention:
```
plugins/my-plugin/
  manifest.json           # PluginManifest (without directory and path, assigned by system)
  server.js               # Server script (optional)
  client.js               # Client script (optional)
  localization/           # i18n messages (optional)
    zh/*.json
    en/*.json
```

## PluginManager (`manager.ts`)

Extends `Registry<PluginManifest>`, exported as singleton `pluginManager`.

### initialize()

Discovers and loads all plugin manifests:
- **Node.js runtime**: Scans `manifest.json` in all subdirectories under `plugins/` via Node-specific manifest loader
- **Runtime**: Generally uses Node.js path loading

### loadServerPlugins()

Dynamically loads server scripts:
1. Iterates over all plugins with `serverScript`
2. Uses `import(path)` for dynamic loading (ES modules)
3. Calls the default export (expected to be a function receiving pluginApi)

### loadClientPlugins(pluginApi?)

Dynamically loads client scripts:
1. Iterates over all plugins with `clientScript`
2. Fetches compiled JS from `/api/plugins/{pluginId}`
3. Constructs a PluginApi object containing host APIs
4. Executes the script and calls the default export

## Server Startup Flow (`src/server-registerer.ts`)

`registerServerPlugins()` executes on the first API request (once only):
1. Load `.env` environment variables
2. Register `errorInterceptor` and `paramInterceptor`
3. Register `registerDeepseekServer()` and `registerOpenAIServer()`
4. Register preset engine storage: `registerLorebooksServer()`, `registerRegexesServer()`, `registerStylesServer()`, `registerScriptsServer()`, `registerMacrosServer()`
5. `registerHasher()` initializes encryption
6. `pluginManager.loadServerPlugins()` loads external plugins

## Client Startup Flow (`src/client-registerer.ts`)

`useClientPlugins()` React Hook executes on first render (once only):
1. `registerComponents()` — registers UI components into pluginApi
2. Register domain clients: `registerBusinessClient()`, `registerStoryClient()`, `registerPresetClient()`, `registerLlmapiClient()`, `registerSlotClient()`
3. Register engine clients: `registerDeepseekClient()`, `registerOpenAIClient()`, `registerLorebooksClient()`, `registerRegexesClient()`, `registerStylesClient()`, `registerScriptsClient()`, `registerMacrosClient()`
4. Build PluginApi (includes browser-specific modules like monaco-editor)
5. `pluginManager.loadClientPlugins(pluginApi)` loads external plugins
6. Returns `initialized` boolean

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/plugins` | Returns `pluginManager.getPlugins()` — all registered PluginManifests |
| `GET /api/plugins/{pluginId}` | Reads the plugin's clientScript file content, returns `application/javascript` |

Client script API disables caching (`Cache-Control: no-cache, no-store, must-revalidate`) for development convenience.
