# Slots Module Design

## Overview

`src/slots/` is the conversation runtime layer. A Slot is the runtime composition of Story + Presets + LlmApi, managing the full conversation lifecycle. **Slot is not a persisted entity** — it has no database table of its own and is assembled on demand by `/api/stories/{id}/slot`.

## Design Philosophy

### Slot = Static Configuration + Runtime State

```typescript
SlotModel {
    story: StoryModel,          // narrative definition
    presets: PresetModel[],     // BFS-resolved preset collection
    llmapi: LlmapiModel,       // LLM API configuration
    content: {                  // runtime state (in browser memory)
        histories: StoryHistory[],
        variables: Record<string, any>,
        lorebooks, regexes, styles, scripts, macros, ...
    }
}
```

### No Server Side

`src/slots/` has no `server/` subdirectory. Slot data is generated on the server by aggregating existing endpoints, and runtime state lives entirely in browser memory.

### Data Model (`models.ts`)

```typescript
interface SlotModel extends BaseModel {
    story: StoryModel;
    presets: PresetModel[];
    llmapi: LlmapiModel;
}

interface LlmapiMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface LlmapiInputModel {
    messages: LlmapiMessage[];
}
```

## Conversation Pipeline (`client/conversation.ts`)

`conversationManager` is a collection object containing five `Registry` instances, implementing a five-stage conversation lifecycle:

| Stage | Registry | Trigger | Registered Engines |
|---|---|---|---|
| Initialize | `initializer` | On slot load | lorebooks, macros, regexes, scripts, styles |
| Input Processing | `inputProcesser` | Before sending message | lorebooks, llmapi, macros, regexes |
| Output Processing | `outputProcesser` | After AI response completes | lorebooks |
| Content Rendering | `contentRenderer` | On page flip / initial load | macros, regexes, scripts, styles |
| Stream Rendering | `streamRenderer` | During AI token-by-token output | macros, regexes, scripts |

### Pipeline Stage Interfaces (`client/conversation-models.ts`)

Each stage has its own interface, all extending `Registerable`:

```typescript
interface SlotInitializer {
    onInitialize?(ctx: SlotInitializeContext): Promise<void>;
}

interface LlmapiInputProcesser {
    onProcessInput?(ctx: LlmapiInputContext): Promise<void>;
}

interface LlmapiOutputProcesser {
    onProcessOutput?(ctx: LlmapiOutputContext): Promise<void>;
}

interface SlotContentRenderer {
    onRenderContent?(ctx: RenderContext): Promise<void>;
}

interface SlotStreamRenderer {
    onRenderStream?(ctx: RenderContext): Promise<void>;
}
```

### Pipeline Execution Order

Determined by the `requires` declarations for dependency ordering:
1. **lorebooks** — match lorebook entries (initializer, inputProcesser, outputProcesser)
2. **llmapi** — build LLM messages (inputProcesser, requires: ["lorebook"])
3. **macros** — Eta template rendering (initializer, contentRenderer, streamRenderer, inputProcesser; requires: ["llmapi"])
4. **regexes** — regex replacement (initializer, contentRenderer, streamRenderer, inputProcesser; requires: ["lorebook"])
5. **scripts** — JS injection (initializer, contentRenderer, streamRenderer; requires: ["regex"])
6. **styles** — CSS injection (initializer, contentRenderer)

## Core Functions

### generateCurrentVariables(history, includeOutput?)

Accumulates variableChanges from conversation history and returns the current variables table.

### generateInputBuildContext(inputContext)

Builds the full context before an LLM call:
1. Finds the most recently summary-marked history entry (as the truncation point)
2. If none, generates an opening history from `getOpeningHistory()`
3. Maps histories to `LlmapiHistory[]` (including `properties` dicts)

### getOpeningHistory(slot)

Lazily creates an opening `StoryHistory`: extracts text and variable changes from the story's openingRemarks and caches them in `slot.content`.

## iframe Rendering

Conversation content is rendered inside an `<iframe>`. Engines directly manipulate the iframe DOM via `document.head` / `document.body`:
- **Styles**: Inject `<style id="injected-styles">`
- **Scripts**: Inject `<script id="injected-scripts">`
- **Data communication**: `postMessage({type, data})` sends `renderContent`, `streamContent`, and `variables` messages

## Variable System

Each `StoryHistory` carries:
- `variables: Record<string, any>` — latest root-level variable state
- `variableChanges: VariableChangeModel[]` — message-level change records
- `inputs: StoryInputMessage[]` — input messages (with variableChanges)
- `outputs: StoryOutputMessage[]` — output messages (with variableChanges)

Variable changes are extracted from `<variable_changes>` XML tags in AI responses.

## Slot Features (`client/features/`)

| Feature | Description |
|---|---|
| `history-deleter` | Delete current history/output |
| `history-editor` | Monaco JSON editor for modifying history |
| `input-viewer` | Preview the actual messages sent to the LLM |
| `regenerator` | Regenerate AI response |
| `navigate-to-business` | Return to Business page |
