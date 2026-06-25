# LlmApis Module Usage Guide

## Managing LLM API Configurations

Create and edit configurations in the "LLM API" tab of the Business dashboard:
- **Code**: Unique identifier (e.g., `my-deepseek`)
- **Name**: Display name
- **Version**: Semantic version number
- **Provider**: Select provider (deepseek / openai)
- **API Key**: Provider API key (automatically encrypted for storage)

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/llmapis` | GET | Paginated list (supports name/code fuzzy search) |
| `/api/llmapis` | POST | Create configuration (code uniqueness check) |
| `/api/llmapis/{id}` | GET | Get details |
| `/api/llmapis/{id}` | PUT | Update (auto-encrypts API Key) |
| `/api/llmapis/{id}` | DELETE | Delete |
| `/api/llmapis/{id}/export` | GET | Export as JSON download |
| `/api/llmapis/import` | POST | Import JSON file (upsert) |
| `/api/llmapis/{id}/entries/{type}` | GET, POST | List / create sub-entries |
| `/api/llmapis/{id}/entries/{type}/{entryId}` | PUT, DELETE | Update / delete sub-entry |
| `/api/llmapis/{id}/entries/{type}/{entryId}/disabled` | PUT | Toggle disabled |
| `/api/llmapis/{id}/chat` | POST | AI chat (SSE streaming response) |

## Chat API

### Request

```typescript
POST /api/llmapis/{id}/chat
Content-Type: application/json

{
    "messages": [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": "Hello!" }
    ]
}
```

### Response

`text/event-stream` SSE stream:
- Streaming mode: pushes tokens one by one, rendered in real time
- Non-streaming mode: sends heartbeats every 300ms, pushes the full response at once upon completion
- Response headers: `Cache-Control: no-cache`, `Connection: keep-alive`

### Client-Side Consumption

```typescript
import { readStream } from "@/utils";

const response = await fetch(`/api/llmapis/${id}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
});

for await (const chunk of readStream(response.body)) {
    // chunk is a parsed JSON object
    updateIframe(chunk);
}
```

## Adding a New LLM Provider

### 1. Implement LlmapiEngine (Server Side)

```typescript
// src/engines/my-provider/server/engine.ts
import { LlmapiEngine, LlmapiRequestContext } from "@/llmapis/server/engine-models";

export class MyEngine implements LlmapiEngine {
    id = "my-provider";

    async run(context: LlmapiRequestContext): Promise<ReadableStream> {
        return new ReadableStream({
            async start(controller) {
                // Call provider API
                // controller.enqueue(chunk)
                controller.close();
            }
        });
    }
}
```

### 2. Register Server-Side Engine

```typescript
// src/engines/my-provider/server/index.ts
import { llmapiEngineRegistry } from "@/llmapis/server/engine";

export function registerMyProviderServer() {
    llmapiEngineRegistry.register(new MyEngine());
}
```

### 3. Implement Client-Side Config UI

```typescript
// src/engines/my-provider/client/config.tsx
export const myConfig: LlmapiConfig = {
    id: "my-provider",
    Content: MyConfigComponent,
    getValue: (data: FormData) => ({ /* parse form data */ }),
};
```

### 4. Register Client Side

```typescript
// src/engines/my-provider/client/index.ts
export function registerMyProviderClient() {
    llmapiConfigRegistry.register(myConfig);
}
```

### 5. Register in Boot Sequence

Add registration calls for the new engine in `src/server-registerer.ts` and `src/client-registerer.ts`.
