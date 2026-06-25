# Scripts Engine Design

## Overview

The Scripts engine injects JavaScript code defined in presets into the conversation iframe's `<body>`, and communicates variables and rendering data via `postMessage`. **Rendering is the responsibility of the preset script**; the engine only handles injection and communication.

## Design Philosophy

### Freedom First

No UI rendering method is enforced. Preset scripts listen for `message` events, receive `renderContent`, `streamContent`, and `variables` data, and decide for themselves how to build the DOM.

### postMessage Communication

```
Main application (StoryPageContent)
  → iframe.contentWindow.postMessage({ type, data }, "*")

Script inside iframe
  → window.addEventListener("message", (event) => { ... })
```

## Data Model (`models.ts`)

```typescript
interface PresetScriptModel extends EntryModel {
    content: string;      // JavaScript code text
    priority: number;     // Sort priority (lower values injected first)
}
```

## Execution Flow

### 1. onInitialize (SlotInitializer)

Collect all preset script entries → filter disabled → sort by priority → store in `slot.content["scripts"]`.

### 2. onRenderContent (SlotContentRenderer, requires: ["regex"])

- Check whether `<script id="injected-scripts">` already exists in the iframe body
- If not, create it: join all script contents with newlines and inject as a `<script>` element
- `postMessage({ type: "variables", data })` to sync variables
- Then the main application sends a `renderContent` message

### 3. onRenderStream (SlotStreamRenderer)

- `postMessage({ type: "variables", data })` to sync variables
- Then the main application sends a `streamContent` message

### Message Types

| type | Trigger | data |
|---|---|---|
| `renderContent` | Page navigation, initial load | `{ inputs: string[], output: string }` |
| `streamContent` | AI streaming output | `{ output: string }` |
| `variables` | Every render | Current variable table `Record<string, any>` |

## Dependency Declaration

`requires: ["regex"]` — Ensures regex replacement completes before script execution, so scripts receive the final processed text.

## Storage

Registered server-side via `presetStorage.register(createSimpleStorageProvider("script", "scripts", presetRepository))`.
