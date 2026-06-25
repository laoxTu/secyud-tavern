# Stories Module — Design Documentation

## Overview

`src/stories/` manages Secyud Tavern's **story/save system**. A Story defines the narrative framework (opening remarks, required presets, LLM configuration) and maintains the complete conversation history and variable state.

## Design Philosophy

### Stories Serve Dual Roles

In Secyud Tavern, a Story is both a **session snapshot** and a **preset playlist**:

- **As a session snapshot**: Records the complete conversation history and variable evolution trajectory
- **As a preset manifest**: The `requires` field records which presets are activated for this session, carrying the full preset combination when exported

Exporting a Story means sharing a complete experience: which presets were used, what was discussed, and what state the world evolved into.

### Variable-Driven State Management

Traditional AI conversation state management relies entirely on context memory ("Alice is currently feeling happy"). Secyud Tavern uses a structured variable table:

```
Each conversation turn:
  AI response
  └── <variable_changes>
      [{
        "op": "add",
        "path": "time/hour",
        "value": 23
      }]
      </variable_changes>

  Storage:
  ├── variables (root node): Latest state snapshot
  └── variableChanges (per message): Incremental change records
```

**Advantages**:
- Loading a save directly reads `variables`, no need to replay history
- When deleting messages, replay `variableChanges` to precisely reconstruct state
- Variables can be used for lorebook matching and conditional logic

### Hidden Messages

Messages with `invisible: true` are not sent to the AI, but variable changes still take effect. Use cases:
- GM commands: `/set time 22`
- Background world evolution: system-automatically inserted environmental changes
- Debug/testing: manually modify variables without polluting the conversation

## Data Model

### StoryModel

```ts
interface StoryModel extends BaseModel {
    requires: RequireModel[];       // List of required presets
    llmapi: RequireModel | null;    // Associated LLM API
    histories?: StoryHistory[];     // Conversation history
}
```

### StoryHistory (Conversation History Structure)

```ts
interface StoryHistory {
    id: string;
    outputId: number;                      // Currently selected output index
    summary?: string;                      // Summary
    variables: Record<string, any>;       // Root node variable snapshot
    inputs: StoryInputMessage[];          // Input message array
    outputs: StoryOutputMessage[];        // Output message array
}
```

### Message Types

```ts
// Base message
interface StoryHistoryMessage {
    content: string;
    activeLorebooks?: string[];              // List of activated lorebook IDs
    variables: VariableChangeModel[];        // Variable change list
}

// Input message
interface StoryInputMessage extends StoryHistoryMessage {
    id: string;
}

// Output message (AI reply)
interface StoryOutputMessage extends StoryHistoryMessage {
    id: string;
}
```

### Each History Contains Multiple Inputs and Multiple Outputs

```
StoryHistory {
    inputs: [
        { id: "i1", content: "Hello", variables: [] }
    ],
    outputs: [
        { id: "o1", content: "Hi there!", variables: [{op:"add",...}] },
        { id: "o2", content: "How are you?", variables: [] },  // Branch output
    ]
}
```

`outputId` points to the currently active output (supports multiple branches).

### VariableChangeModel

```ts
interface VariableChangeModel {
    op: "add" | "replace" | "remove";
    path: string;    // Dot-separated (e.g., "alice.cat-girl.mood")
    value?: any;
}
```

Follows JSON Patch-style atomic operations.

## Key Functions

### getCurrentOutput

```ts
function getCurrentOutput(history: StoryHistory): StoryOutputMessage | undefined {
    // Returns the output corresponding to outputId, with boundary safety
}
```

### applyPatch

```ts
function applyPatch(variables: Record<string, any>, changes: VariableChangeModel[]): Record<string, any> {
    // Apply variable change patches in sequence
    // "add" → set value at path
    // "replace" → same as above
    // "remove" → delete value at path
    // Paths use dot separators, supporting deep nesting
}
```

### extractVariableChanges

```ts
function extractVariableChanges(history: StoryHistory, text?: string): {
    content: string;                        // Text with tags removed
    variableChanges: VariableChangeModel[]; // Extracted variable changes
}
```

Parses `<variable_changes>...</variable_changes>` XML tags in AI responses to extract structured variable patches and remove the tags from the text.

## Database Structure

```
stories (master table)
├── id, name, content (inherited)
├── requires (JSON RequireModel[])
└── llmapi (JSON RequireModel | null)

storyEntries (entry table)
├── inherits entryTable
├── entryType = "history" — conversation history records
└── FK → stories.id (ON DELETE CASCADE)
```

Conversation history is stored in the `storyEntries` entry table with `entryType = "history"`.

## Variable Reconstruction When Deleting Messages

When a user deletes a message:

```
1. Determine the retention range (all messages before the target message)
2. Start from an empty variable table {}
3. Apply variableChanges of each message within the retention range in sequence
4. Write the result to the root node variables
5. Truncate the history array
6. Recalculate turnCount
```

This ensures that after deleting a message, the variable context for subsequent messages remains correct.

## Relationship with Slots

Story is a static definition; Slot is a runtime instance:

```
Story (persistent)
├── requires: [{code: "alice.cat-girl", version: "1.0"}]
├── llmapi: {code: "my-deepseek", version: "1.0"}
└── content: { openingRemarks: "Welcome to the tavern..." }

        │ GET /api/stories/{id}/slot
        │ → resolve requires → load Presets → load Llmapi
        ▼

Slot (runtime)
├── story: StoryModel
├── presets: PresetModel[]  (resolved)
├── llmapi: LlmapiModel     (resolved)
└── content: { history[], lorebooks[], ... }
```
