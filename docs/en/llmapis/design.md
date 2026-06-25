# LlmApis Module Design

## Overview

`src/llmapis/` is the LLM API abstraction layer that provides a unified, pluggable interface for different AI service providers. Upper-layer business logic (Slot, conversation pipeline) does not need to know which specific API is being called.

## Design Philosophy

### Provider-Engine Decoupling

"Provider" is a string identifier (e.g., `"deepseek"`, `"openai"`), and "Engine" is a concrete class implementing `LlmapiEngine`. At runtime, the engine is looked up in the registry by the `provider` field:

```
LlmapiModel.provider = "deepseek"
    ├── Client: llmapiConfigRegistry["deepseek"] → configuration form UI
    └── Server: llmapiEngineRegistry["deepseek"] → API call
```

### API Key Security

- **Storage**: API Keys are encrypted by `Hasher.instance.encrypt()` on the server side before being stored in SQLite
- **Transmission**: Decrypted only at the `/api/llmapis/[id]/chat` endpoint and used immediately after decryption
- **Isolation**: Client-side scripts (JS inside the iframe) cannot access the encryption key or the decrypted API Key

## Data Model (`models.ts`)

```typescript
interface LlmapiModel extends BaseModel {
    code: string;        // unique identifier
    version: string;     // semantic version number
    provider?: string;   // provider identifier ("deepseek" | "openai")
    key?: string;        // encrypted API Key
    builder?: string;    // input builder identifier
}
```

## Server-Side Engine System

### LlmapiEngine (`server/engine-models.ts`)

```typescript
interface LlmapiRequestContext extends LlmapiInputModel {
    type: string;       // provider identifier
    config: any;        // provider-specific configuration
    signal: AbortSignal; // cancellation signal
    apiKey: string;     // decrypted API Key
}

interface LlmapiEngine extends Registerable {
    run(context: LlmapiRequestContext): Promise<ReadableStream>;
}
```

### Engine Registry (`server/engine.ts`)

`llmapiEngineRegistry = new LlmEngineRegistry("llmapi-engine")` — a global singleton registry. LLM provider engines (Deepseek, OpenAI) register themselves here via `register*Server()`.

### Chat Endpoint (`/api/llmapis/[id]/chat`)

```
POST body: { messages: LlmapiMessage[], ... }
  → llmapiRepository.get(id)
  → engine = llmapiEngineRegistry.getSorted().find(e => e.id === llmapi.provider)
  → apiKey = Hasher.instance.decrypt(llmapi.key)
  → engine.run({ messages, config, apiKey, signal })
  → ReadableStream → SSE response
```

## Client

### Config Registry

`llmapiConfigRegistry` — a registry where each engine registers its own configuration UI component. Deepseek and OpenAI engines register in their `register*Client()` calls.

### Input Builder

`llmapiInputBuilderManager` — a registry that manages message builders. The Lorebooks engine registers the `"default"` builder (`defaultBuildInput`), which converts conversation history + activated lorebook content into `LlmapiMessage[]`.

### Conversation Handler (`client/conversation.ts`)

`llmapiConversationProvider` registers into `conversationManager.inputProcesser` (`requires: ["lorebook"]`), selecting the correct builder at the input processing stage and constructing LLM messages.

## Message Format

```typescript
interface LlmapiMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface LlmapiInputModel {
    messages: LlmapiMessage[];
}
```

## Database Structure

```
llmapis (master table)
├── id, name, content (inherited from masterTable)
├── code (text, unique, not null)
├── provider (text, nullable)
├── builder (text, nullable)
├── key (text, nullable) — encrypted storage
└── version (text, not null)

llmapiEntries (entry table)
├── inherited from entryTable
└── FK → llmapis.id (ON DELETE CASCADE)
```
