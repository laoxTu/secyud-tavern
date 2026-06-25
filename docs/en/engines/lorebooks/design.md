# Lorebooks Engine Design

## Overview

Lorebooks is a **conditional background knowledge injection engine**. It matches worldbook entries based on the current message content and injects matched knowledge into the LLM context. It is the most complex engine, featuring a pluggable matching strategy subsystem.

## Design Philosophy

### Matching and Injection are Separate

- **Matching (Matcher)**: Determines when an entry activates — handled by matchers in `lorebookMatcherRegistry`
- **Injection (InputBuilder)**: Determines how activated entries are assembled into the prompt — handled by the llmapi's `defaultBuildInput`

### Three-Tier Classification

Worldbook entries are classified into three groups during initialization:

| Group | Condition | Purpose |
|---|---|---|
| `lorebooksStart` | matchType=always, lastMessage=false | Prepended at the start of every conversation turn |
| `lorebooksEnd` | matchType=always, lastMessage=true | Appended only after the last message |
| `lorebooks` | Other match types | Dynamically matched against message content |

### Pluggable Matching Strategies

`lorebookMatcherRegistry` registers three matchers:

```
MatcherRegistry
├── always  → Always activates
├── normal  → Keyword AND/OR logic matching
└── event   → Keyword + date range matching
```

## Data Model (`models.ts`)

```typescript
interface PresetLorebookModel extends EntryModel {
    matchType: string;        // "always" | "normal" | "event"
    matchExpression: any;     // Matcher-specific expression
    content: string;          // Worldbook body text
    priority: number;         // Sort within the same layer (higher = earlier)
    layer: number;            // <100 prepended, ≥100 appended
    role: string;             // system/user/assistant
}
```

Sort formula: `layer * 10000 + priority`

## Execution Flow

### 1. onInitialize (SlotInitializer)

Iterate all preset lorebook entries → filter disabled → classify by matchType:
- always + lastMessage=false → `lorebooksStart[]`
- always + lastMessage=true → `lorebooksEnd[]`
- normal/event → `lorebooks` Record

### 2. onProcessInput (LlmapiInputProcesser)

Iterate conversation history → call `tryFillActiveLorebooks()` for each message's inputs and output:
1. Iterate all lorebook entries
2. Look up matcher by matchType
3. `matcher.match(ctx, expression)` → boolean
4. Match succeeds → add to `history.properties["lorebooks"]`
5. Sort by `compareLorebook`
6. Prepend `lorebooksStart`, append `lorebooksEnd`

### 3. onProcessOutput (LlmapiOutputProcesser)

Call `tryFillActiveLorebooks()` on the latest AI output to pre-match for the next conversation turn.

### 4. InputBuilder (defaultBuildInput)

When building LLM messages:
- Iterate history, retrieve each message's activeLorebooks
- layer < 100 → prepend
- layer ≥ 100 → append
- Merge consecutive messages with the same role, deduplicate repeated lorebooks

## Matcher Interface (`client/match-models.ts`)

```typescript
interface Matcher extends Registerable {
    editor: React.ComponentType<MatcherProps>;
    getEditorValue: (data: FormData) => any;
    match: (ctx: MatcherMatchContext, expression: any) => boolean;
}
```

### always Matcher

Always returns true. Config item: `lastMessage` boolean.

### normal Matcher

Keyword matching: `keywords: string[][]` (same group = OR, different groups = AND) + `fitCount` (minimum number of keyword groups that must be satisfied).

### event Matcher

Extends normal with a date range: `minDate`, `maxDate`. Checks whether `relatedDates` in the context variables fall within the range.

## Storage

Registered server-side via `presetStorage.register(createSimpleStorageProvider("lorebook", "lorebooks", presetRepository))`.
