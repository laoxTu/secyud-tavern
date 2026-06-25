# Lorebooks Engine Usage Guide

## Adding a Worldbook Entry

Create entries in the Lorebook tab of the preset editor:

| Field | Description |
|---|---|
| code | Unique identifier |
| name | Display name |
| matchType | Match type: always / normal / event |
| content | Worldbook body text (injected into the prompt when triggered) |
| priority | Sort priority within the same layer (higher = earlier) |
| layer | Layer (<100 prepended, ≥100 appended) |
| role | System prompt / user / assistant |

## Three Match Types

### always — Always Active

Always in effect. Config item:
- `lastMessage`: when checked, appended only after the latest message; otherwise prepended at every turn

Use cases: fixed character settings, world background.

### normal — Keyword Matching

Triggers when the message content contains keywords.

**Keyword editing**:
- Keywords in the same group use **OR** logic (satisfying any one matches the group)
- Different groups use **AND** logic
- `fitCount`: minimum number of groups that must be satisfied

**Example**: `keywords = [["sword","blade"],["shop","store"]]`, `fitCount = 2`
- `"buy a sword at the shop"` → matched (sword + shop)
- `"I have a blade"` → not matched (only blade, missing shop/store)

### event — Keyword + Date

Extends normal with a date range `{year, month, day}`. Checks whether `relatedDates` in the variable table falls within the range.

Use case: time-triggered story events.

## Injection Mode

Control where worldbook content appears in the message via `layer`:

```
layer < 100 → Prepended (before the message)
layer ≥ 100 → Appended (after the message)
```

Within the same layer, sorted by `priority` (higher = earlier).

## Disabling Entries

Set `disabled = true` to temporarily turn off an entry without deleting it, useful for debugging and A/B testing.
