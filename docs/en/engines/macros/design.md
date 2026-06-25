# Macros Engine Design

## Overview

Macros is a **template variable substitution engine** that uses the [Eta](https://eta.js.org/) template engine to replace `<%= it.key %>` placeholders with actual values during prompt construction and content rendering.

## Design Philosophy

### Separate Definition from Usage

- **Definition**: Preset authors define key-value pairs in the Macro tab
- **Usage**: Reference using Eta syntax in any text (prompts, worldbook content, regex replacements, etc.)
- **Substitution timing**: Executed uniformly across the inputProcesser, streamRenderer, and contentRenderer stages

### Why Eta

Eta is a lightweight JavaScript template engine (faster than EJS). While currently only simple placeholder substitution is used, Eta's full syntax (conditionals, loops, filters) leaves room for future expansion.

## Data Model (`models.ts`)

```typescript
interface PresetMacroModel extends EntryModel {
    key: string;     // Template variable name (referenced via <%= it.key %>)
    value: string;   // Substitution value
}
```

## Execution Flow

### 1. onInitialize (SlotInitializer)

Iterate all preset macro entries → filter disabled → collect as `{key: value, ...}` object → store in `slot.content["macros"]`.

### 2. onProcessInput (LlmapiInputProcesser, requires: ["llmapi"])

Executes after LLM API messages are built:
→ Call `eta.renderString(content, macroObject)` on the content of each message in `ctx.messages`
→ `<%= it.key %>` is replaced with the actual value
→ Also passes in the result of `generateCurrentVariables()`, supporting variable references

### 3. onRenderStream (SlotStreamRenderer)

During streaming: `ctx.data.output = eta.renderString(ctx.data.output, macroObject + variables)`

### 4. onRenderContent (SlotContentRenderer)

During page rendering: call `eta.renderString` on each of `ctx.data.inputs` and `ctx.data.output`

## Comparison with Regex

| | Macro | Regex |
|---|---|---|
| Purpose | Placeholder substitution (config-driven) | Text transformation (pattern matching) |
| Syntax | `<%= it.key %>` Eta template | JavaScript regular expressions |
| Typical Use | `My name is <%= it.charName %>` | Remove formatting markers from AI output |
| Configuration | Key-value pairs | pattern + replacement |

## Storage

Registered server-side via `presetStorage.register(createSimpleStorageProvider("macro", "macros", presetRepository))`.
