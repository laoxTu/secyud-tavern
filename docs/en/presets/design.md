# Presets Module Design

## Overview

`src/presets/` is the preset system. A Preset is the smallest functional unit, packaging character settings, lorebooks, regexes, styles, scripts, macros, and more into a single entity. Dependencies are declared via `requires` and resolved through BFS recursion.

## Design Philosophy

### Package as Distribution

A Preset contains all related content (lorebooks, regexes, styles, scripts, macros). Users only need to import a single JSON file (or a composite PNG+JSON file containing a cover image).

### Separation of Management and Usage Lines

| Line | Trigger | Data Flow | Persisted |
|---|---|---|---|
| **Management** | Preset editor actions | Frontend → API → SQLite | Yes |
| **Usage** | Load save / reload | API → Frontend memory | No |

Editing does not affect a running session; reload takes effect immediately.

### Multi-Core Parallelism

Users can activate multiple presets simultaneously. The system does not handle conflicts; preset authors avoid them through `code` naming conventions, CSS scoping, and `priority` ordering.

## Data Model (`models.ts`)

```typescript
interface PresetModel extends BaseModel {
    code: string;                    // unique identifier (e.g., "alice.cat-girl")
    version: string;                 // semantic version number
    tags: string[];                  // classification tags
    requires: RequireModel[];        // dependent presets
    entries?: {
        lorebooks?: PresetLorebookModel[];
        regexes?: PresetRegexModel[];
        styles?: PresetStyleModel[];
        scripts?: PresetScriptModel[];
        macros?: PresetMacroModel[];
    };
}

interface RequireModel {
    code: string;     // code of the dependency preset
    version: string;  // required version
}
```

## Dependency Resolution on Slot Load

The `GET /api/stories/{id}/slot` endpoint implements BFS dependency resolution:

```
1. Read story.requires[] from the story
2. For each require:
   a. Query preset by code (via conditionMatchId)
   b. Add to result set
   c. Read that preset's requires[]
   d. Recursively resolve (visited Set prevents circular dependencies)
3. Return all resolved presets (with full entry details)
```

## Storage System

`presetStorage = new ModelStorage<PresetModel>("preset")` is the storage registry for preset engines. Each engine (lorebooks, regexes, styles, scripts, macros) registers its own storage provider via `presetStorage.register(createSimpleStorageProvider(...))`.

## Database Structure

```
presets (master table)
├── id, name, content (inherited from masterTable)
├── code (text, unique, not null)
├── version (text, not null)
├── tags (text, JSON array)
└── requires (text, JSON RequireModel[] array)

presetEntries (entry table)
├── inherited from entryTable
├── entryType = "lorebook" | "regex" | "style" | "script" | "macro"
└── FK → presets.id (ON DELETE CASCADE)
```

## Export / Import

### Export

`apiExportModel` uses a custom `exportHandler`:
- Has a cover image (coverId) → streams image bytes first, then appends JSON bytes → produces a .png file
- No cover image → pure JSON download → .json file

### Import

`apiImportModel` uses a custom `importHandler`:
- `splitPNGAndDataUniversal` separates image and JSON
- Has image → stores in imageRepository, records coverId in the model
- JSON data upserted into the presets table

## presetTabManager

The client-side `presetTabManager` is a `TabManager` instance that manages sub-tabs within the preset editor. Each engine registers its own tabs in `register*Client()`.
