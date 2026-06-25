# Styles Engine Design

## Overview

The Styles engine injects CSS code defined in presets into the conversation iframe's `<head>`, customizing the appearance of the conversation interface.

## Design Philosophy

### Separation of Concerns

- **Styles**: CSS controls appearance, injected into `<head>`
- **Scripts**: JS controls behavior and rendering logic, injected into `<body>`

Preset authors can provide only CSS (theme presets), or both CSS + JS (full UI presets).

### Inject Once, Apply Globally

CSS is injected via `<style id="injected-styles">` into the iframe head and persists throughout the page lifecycle, without repeated injection.

## Data Model (`models.ts`)

```typescript
interface PresetStyleModel extends EntryModel {
    content: string;      // CSS text
    priority: number;     // Sort priority (higher values come later, can override earlier ones)
}
```

## Execution Flow

### 1. onInitialize (SlotInitializer)

Collect all preset style entries → filter disabled → sort by priority → store in `slot.content["styles"]`.

### 2. onRenderContent (SlotContentRenderer)

- Check whether `<style id="injected-styles">` already exists in the iframe head
- If not, create it: join all style contents and inject as a single `<style>` element into `document.head`
- If already present, skip (avoid duplicate injection)

## Collaboration with Other Engines

- Styles do not participate in stream rendering (injected once in onRenderContent only)
- `requires: []` (no dependencies), but injected before Scripts (styles first, then scripts)
- CSS from multiple presets is concatenated together, sorted by priority — higher values come later → CSS cascade rules mean later ones override earlier ones

## Storage

Registered server-side via `presetStorage.register(createSimpleStorageProvider("style", "styles", presetRepository))`.
