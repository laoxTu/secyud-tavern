# Stories Module — Usage Guide

## Managing Stories

### Creating a Story

1. Go to the "Stories" tab in the Business dashboard
2. Click "Create"
3. Fill in:
   - **Name**: Story name
   - **LLM API**: Select the associated LLM configuration (optional)
   - **Requires**: Select required presets
   - **Opening Remarks**: Opening lines (AI system prompt)

### Entering Story Interaction

Click the jump button (↘) in the story list to enter the interaction page at `/business/stories/{id}`.

## StoryModel Fields

```ts
interface StoryModel {
    id: string;                     // UUID
    name: string;                   // Story name
    requires: RequireModel[];       // [{code: "alice.cat-girl", version: "1.0.0"}]
    llmapi: RequireModel | null;    // {code: "my-deepseek", version: "1.0.0"}
    content: {
        openingRemarks?: string;    // Opening lines / system prompt
    };
    entries: {
        history?: StoryHistory[];   // Conversation history
    };
}
```

## Conversation History Operations

### StoryHistory Structure

```ts
interface StoryHistory {
    id: string;
    outputId: number;                      // Currently selected output (multi-branch)
    summary?: string;                      // Summary
    variables: Record<string, any>;       // Current variable snapshot
    inputs: StoryInputMessage[];          // Input list
    outputs: StoryOutputMessage[];        // Output list
}
```

### Getting the Current Output

```ts
import { getCurrentOutput } from "@/stories/models";

const output = getCurrentOutput(history);
// Returns the currently active output based on outputId
```

### Variable Operations

```ts
import { applyPatch, extractVariableChanges } from "@/stories/models";

// Apply variable changes
let vars = { time: { hour: 12 } };
vars = applyPatch(vars, [
    { op: "replace", path: "time/hour", value: 14 },
    { op: "add", path: "location", value: "tavern" },
]);

// Extract variable changes from AI response
const aiResponse = `
Here is the updated state:
<variable_changes>
[{
  "op": "add",
  "path": "time/hour",
  "value": 23
}]
</variable_changes>
`;
const { content, variableChanges } = extractVariableChanges(history, aiResponse);
// content: "Here is the updated state:\n"
// variableChanges: [{op: "replace", path: "time.hour", value: 15}, ...]
```

### Variable Path Convention

Variables use dot-separated paths, supporting deep nesting:
- `time.hour` → `{ time: { hour: value } }`
- `alice.cat-girl.mood` → `{ alice: { "cat-girl": { mood: value } } }`

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/stories` | GET | Paginated list (supports fuzzy search on name) |
| `/api/stories` | POST | Create story |
| `/api/stories/{id}` | GET | Get details (supports `withDetails`) |
| `/api/stories/{id}` | PUT | Update |
| `/api/stories/{id}` | DELETE | Delete |
| `/api/stories/{id}/export` | GET | Export as JSON |
| `/api/stories/{id}/slot` | GET | **Get full Slot** (story + presets + LLM + history) |
| `/api/stories/{id}/entries/history` | GET, POST | History list/create |
| `/api/stories/{id}/entries/history/{entryId}` | PUT, DELETE | History update/delete |

## Programmatic Operations

```ts
import { get, post, put, del } from "@/client";

// Get story list
const { data, totalCount } = await get("/stories", {
    params: { page: 0, pageSize: 20, search: "tavern" }
});

// Create story
const story = await post("/stories", {
    name: "Tavern Adventure",
    requires: [
        { code: "alice.cat-girl", version: "1.0.0" },
        { code: "world.fantasy", version: "2.0.0" },
    ],
    llmapi: { code: "my-deepseek", version: "1.0.0" },
    content: {
        openingRemarks: "You are in a magical tavern..."
    }
});

// Update opening remarks
await put("/stories/{id}", {
    content: { openingRemarks: "Updated opening..." }
}, { params: { id: story.id } });

// Get Slot (runtime data)
const slot = await get("/stories/{id}/slot", {
    params: { id: story.id }
});

// Export story
const response = await get(`/stories/{id}/export`, {
    params: { id: story.id }
});
```

## Hidden Messages

Set a message as invisible (not sent to AI, but variables take effect):

```ts
const hiddenMessage: StoryInputMessage = {
    id: uuid(),
    content: "/set time.hour 22",
    variables: [{ op: "replace", path: "time.hour", value: 22 }],
    // invisible flag is set at creation time
};
```

## Cloning and Importing

```ts
// Clone story
await post("/stories", {
    name: "Copy of Tavern Adventure",
    // Do not pass requires etc., copy from original story
});
```
