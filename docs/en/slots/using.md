# Slots Module — Usage Guide

## Loading a Slot

Slots are obtained through the aggregation API:

```ts
const slot = await get("/stories/{id}/slot", {
    params: { id: storyId }
});

// slot = {
//     id, name, content,
//     story: StoryModel,
//     presets: PresetModel[],
//     llmapi: LlmapiModel,
// }
```

## Using ConversationManager

### Getting the Singleton

```ts
import { conversationManager } from "@/slots/client/conversation";

// Iterate all ConversationProviders (in topological order)
await conversationManager.use(async (provider) => {
    await provider.onInitialize?.(ctx);
});
```

### Registering a New ConversationProvider

```ts
import { ConversationProvider } from "@/slots/client/conversation-models";

const myProvider: ConversationProvider = {
    id: "my-provider",
    requires: ["lorebook"],  // execute after lorebook

    async onInitialize(ctx) {
        // initialization logic
    },

    async onRenderPage(ctx) {
        // page rendering logic
        ctx.document.body.innerHTML += "<div>Custom Content</div>";
    },
};

conversationManager.register(myProvider);
```

## Lifecycle Contexts

### SlotContextBase (base for all contexts)

```ts
interface SlotContextBase {
    slot: SlotModel;
    content: Record<string, any>;
}
```

### RenderContext (rendering stage)

```ts
interface RenderContext extends SlotContextBase {
    document: Document;                    // iframe.contentDocument
    window: Window;                        // iframe.contentWindow
    history: StoryHistory[];              // conversation history
    variables: Record<string, any>;       // current variables table
}
```

### Manipulating iframe DOM in onRenderPage
This is an alternative approach — in practice, this is expected to be achieved through presets.
```ts
async function onRenderContent(ctx: RenderContext) {
    const doc = ctx.document;

    // Create elements
    const div = doc.createElement("div");
    div.className = "custom-container";
    div.innerHTML = renderHistory(ctx.history);

    // Append to body
    doc.body.appendChild(div);

    // Inject styles
    const style = doc.createElement("style");
    style.textContent = ".custom-container { color: red; }";
    doc.head.appendChild(style);
}
```

### Real-Time Rendering in onRenderStream

```ts
async function onRenderStream(ctx: RenderStreamContext) {
    // Get the AI output element
    const outputEl = ctx.document.getElementById("ai-output");
    if (outputEl) {
        // Apply regex replacement then update content
        outputEl.textContent = applyRegexes(ctx.stream, regexes);
    }
}
```

## Variable Operations

### Getting Current Variables

```ts
import { generateCurrentVariables } from "@/slots/client/conversation";

const variables = generateCurrentVariables(history, true);
// { "time": { "hour": 23 }, "location": "tavern", ... }
```

### Applying Variable Patches

```ts
import { applyPatch } from "@/stories/models";

let vars = {};
vars = applyPatch(vars, [
    { op: "add", path: "time/hour", value: 23 },
    { op: "replace", path: "location", value: "tavern" },
    { op: "remove", path: "temp_var" },
]);
```

### Extracting Variable Changes from AI Responses

Variable changes in AI responses are wrapped in tags:

```text
<variable_changes>
[{
  "op": "add",
  "path": "time/hour",
  "value": 23
}]
</variable_changes>
```

```ts
import { extractVariableChanges } from "@/stories/models";

// Returns: { content: "cleaned text", variableChanges: [...] }
const result = extractVariableChanges(history, aiResponse);
```

## LlmapiMessage Format

```ts
// Build LLM request messages
const messages: LlmapiMessage[] = [
    {
        role: "system",
        content: "You are Alice, a cat-girl tavern keeper..."
    },
    {
        role: "user",
        content: "Hello, what drinks do you have?"
    },
    {
        role: "assistant",
        content: "Welcome to the Cat's Paw Tavern! We have..."
    },
];

// Send
const response = await post(`/llmapis/{id}/chat`, {
    messages,
}, { params: { id: slot.llmapi.id } });
```

## Complete Conversation Flow Example

```ts
// 1. Load Slot
const slot = await get("/stories/{id}/slot", { params: { id: storyId } });

// 2. Initialize engines
const ctx = { slot, content: {} };
await conversationManager.use(provider => provider.onInitialize?.(ctx));

// 3. Get opening history
const openingHistory = getOpeningHistory(slot);

// 4. Render page
const renderCtx = { ...ctx, document: iframeDoc, window: iframeWin, history: [openingHistory], variables: {} };
await conversationManager.use(provider => provider.onRenderPage?.(renderCtx));

// 5. User sends a message
const input: StoryInputMessage = { id: uuid(), content: "Hello!", variables: [] };
const history = [{ ...openingHistory, inputs: [input] }];

// 6. Process input
const inputCtx = { ...ctx, history, messages: [] };
await conversationManager.use(provider => provider.onProcessInput?.(inputCtx));

// 7. Send to AI and stream render
const response = await post(`/llmapis/{id}/chat`, { messages: inputCtx.messages }, { params: { id: slot.llmapi.id } });
for await (const chunk of readStream(response.body)) {
    // Update iframe in real time
}
```
