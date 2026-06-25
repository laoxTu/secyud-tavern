# Regexes Engine Design

## Overview

Regexes is a **text find-and-replace engine**. It performs regular expression replacements on text before messages are sent to the AI (input) or before they are displayed to the user (output).

## Design Philosophy

### Bidirectional Processing

| target | When applied | Typical use |
|---|---|---|
| `input` | Before sending to AI | Filter sensitive words, format user input |
| `output` | Before displaying AI response | Remove formatting markers, normalize layout |
| `both` | Both input and output | Standardize terminology |

### Division of Labor with Macro

| | Regex | Macro |
|---|---|---|
| Execution order | Executed first | Executed second |
| Syntax | JS regex strings | `<%= key %>` Eta templates |
| Purpose | Transform existing text | Substitute placeholders |

## Data Model (`models.ts`)

```typescript
interface PresetRegexModel extends EntryModel {
    pattern: string;       // JavaScript regular expression string
    replacement: string;   // Replacement text
    target: string;        // "input" | "output" | "both"
}
```

## Execution Flow

### 1. onInitialize (SlotInitializer)

Iterate all preset regex entries → filter disabled → classify by target:
- target = `"input"` | `"both"` → `regexesInput[]`
- target = `"output"` | `"both"` → `regexesOutput[]`

Store in `slot.content["regexesInput"]` and `slot.content["regexesOutput"]`.

### 2. onProcessInput (LlmapiInputProcesser, requires: ["lorebook"])

Call `applyRegexes(regexesInput, text)` on each historical message's inputs and output.

### 3. onRenderStream (SlotStreamRenderer)

Call `applyRegexes(regexesOutput, data.output)` on the streaming output.

### 4. onRenderContent (SlotContentRenderer)

Call `applyRegexes(regexesOutput, ...)` on inputs and output.

## applyRegexes Core Logic

```typescript
function applyRegexes(regexes: PresetRegexModel[], text?: string) {
    if (!text || text == '') return '';
    for (const regex of regexes) {
        text = text.replace(regex.pattern, regex.replacement);
    }
    return text;
}
```

Note: Uses `String.replace()`, where the first argument is a string pattern (not a RegExp object), so each replacement only replaces the first match. Add the `g` flag to the pattern for global replacement.

## Dependency Declaration

`requires: ["lorebook"]` — Regex replacement runs after worldbook matching, ensuring the replaced text can also participate in subsequent macro substitution.

## Storage

Registered server-side via `presetStorage.register(createSimpleStorageProvider("regex", "regexes", presetRepository))`.
