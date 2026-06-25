# Plugins Module — Usage Guide

## Creating a Client Plugin

### 1. Directory Structure

```
plugins/my-plugin/
├── manifest.json     # Plugin manifest
├── client.tsx        # Client entry point
└── server.ts         # Server entry point (optional)
```

### 2. manifest.json

```json
{
    "id": "my-plugin",
    "version": "1.0.0",
    "clientScript": "client.js"
}
```

- `id`: Unique identifier, also used as the API path `[pluginId]`
- `clientScript`: Points to the build artifact `client.js`

### 3. Writing the Plugin

```tsx
// plugins/my-plugin/client.tsx
import { businessNavigationManager } from '@/business/client/navigation';
import React from 'react';

function Content() {
    return (
        <div className="p-8">
            <h1 className="text-xl font-bold">My Plugin</h1>
            <p>Hello from plugin!</p>
        </div>
    );
}

export default function register() {
    businessNavigationManager.register({
        id: "my-plugin",
        label: () => <span>My Plugin</span>,
        component: Content,
    });
}
```

### 4. Build

```bash
npm run build-plugin my-plugin
```

### 5. Start

```bash
npm run dev
```

A "My Plugin" tab appears in the navigation bar; click it to display the plugin content.

## Available Imports

Plugins can import the following via native `@/` paths:

| Import Path | Exports | Type |
|---|---|---|
| `@/business/client/navigation` | `businessNavigationManager` | TabManager |
| `@/slots/client/conversation` | `conversationManager`, `generateCurrentVariables`, `getOpeningHistory`, `generateInputBuildContext` | Registries + utility functions |
| `@/components/ui/card` | `Card`, `CardHeader`, `CardTitle`, ... | UI components |
| `@/components/ui/button` | `Button`, `buttonVariants` | UI components |
| `@/components/ui/*` | All UI components | All available |
| `@/engines/lorebooks/client/match` | `lorebookMatcherRegistry`, `tryFillActiveLorebooks` | Matchers |
| `@/llmapis/client/input-builder` | `llmapiInputBuilderManager` | Input builder |
| `@/llmapis/client/config` | `llmapiConfigRegistry` | Configuration |

All modules registered via `def()` are importable. Run `npm run gen-stubs` to see which modules are currently registered.

## Singleton Rules

The following modules use host singletons (referenced via stubs, not bundled as copies):
- All registries (businessNavigationManager, conversationManager, etc.)
- React (via `window.__PLUGIN_REACT__`)

The following modules are bundled normally (stateless, safe to copy):
- UI components (`@/components/ui/*`)
- Utility functions (`cn` from `@/lib/utils`)

## Adding New Modules to the Plugin API

Add a `def()` line in the module file:

```ts
import { def } from '@/plugins/client/api';

export const myExport = ...;

def('@/path/to/module');
```

Then run `npm run gen-stubs` to regenerate stubs. Plugins can then `import { myExport } from '@/path/to/module'`.

## Debugging

- Build artifacts are at `plugins/{name}/client.js`
- Check the browser console for `[plugin manager]` prefixed logs
- Directly visit `http://localhost:3000/api/plugins/{pluginId}` to view the returned JS
- `window.__PLUGIN_API__` can be inspected in the browser console to see all available exports

## Server-Side Plugins

```ts
// plugins/my-plugin/server.ts
export default function register() {
    console.log("[my-plugin] Server loaded");
    // Register into server-side registries
}
```

Server plugins are loaded via `import()` dynamic loading (Node.js runtime) and can register engines, interceptors, and storage providers.
