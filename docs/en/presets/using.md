# Presets Module Usage Guide

## Creating a Preset

1. Navigate to the "Presets" tab in the Business dashboard
2. Click "Create"
3. Fill in Code (unique identifier, recommended format: `author.preset-name`), Name, Version, Tags, Requires (dependencies)

## Editing Preset Content

After creation, configure each engine's entries in the editor:

- **Lorebook** — Lorebook entries, set match types and keywords
- **Macro** — Key-value pair template variables
- **Regex** — Text regex replacement rules
- **Script** — JavaScript code (Monaco editor)
- **Style** — CSS styles (Monaco editor)

Each entry can be independently enabled/disabled (`disabled` toggle).

## Import / Export

- **Export**: Click export button → download .png if there is a cover image, or .json if not
- **Import**: Click import → choose file → auto-parse (supports .json and .png+json composite format)
- **Clone**: Click clone → enter new code/name → create a copy

## PresetModel Fields

```typescript
interface PresetModel {
    id: string;                     // UUID (auto-generated)
    name: string;                   // display name
    code: string;                   // unique identifier
    version: string;                // semantic version number
    tags: string[];                 // classification tags
    requires: RequireModel[];       // dependency presets [{code, version}]
    content: Record<string, any>;   // extended data (description, author, coverId, etc.)
    entries: {
        lorebooks?: PresetLorebookModel[];
        regexes?: PresetRegexModel[];
        styles?: PresetStyleModel[];
        scripts?: PresetScriptModel[];
        macros?: PresetMacroModel[];
    };
}
```

## Dependency Management

Declare dependencies in the preset's `requires` field:

```json
[
    { "code": "shared.fantasy-world", "version": "1.0.0" },
    { "code": "ui.dark-theme", "version": "2.1.0" }
]
```

All dependencies are automatically resolved via BFS when loading a save.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/presets` | GET | Paginated list (name/code fuzzy search, tags filter) |
| `/api/presets` | POST | Create (code uniqueness check) |
| `/api/presets/{id}` | GET | Details (supports withDetails) |
| `/api/presets/{id}` | PUT | Update |
| `/api/presets/{id}` | DELETE | Delete |
| `/api/presets/{id}/export` | GET | Export (.png or .json) |
| `/api/presets/import` | POST | Import (supports PNG+JSON) |
| `/api/presets/{id}/entries/{type}` | GET, POST | List / create entries |
| `/api/presets/{id}/entries/{type}/{entryId}` | PUT, DELETE | Update / delete entry |
| `/api/presets/{id}/entries/{type}/{entryId}/disabled` | PUT | Toggle disabled |

## Programmatic Operations

```typescript
// Get list
const { data, totalCount } = await fetch(
    `/api/presets?page=0&pageSize=20&search=${encodeURIComponent(JSON.stringify({name: "alice"}))}`
).then(r => r.json());

// Create
const preset = await fetch("/api/presets", {
    method: "POST",
    body: JSON.stringify({
        name: "Alice Catgirl", code: "alice.cat-girl",
        version: "1.0.0", tags: ["character"],
        requires: [], content: {}
    }),
}).then(r => r.json());

// Update
await fetch(`/api/presets/${preset.id}`, {
    method: "PUT",
    body: JSON.stringify({ version: "1.0.1", tags: ["character", "updated"] }),
});
```
