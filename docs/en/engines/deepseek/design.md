# Deepseek Engine Design

## Overview

The Deepseek engine is an **LLM API engine** that calls the official Deepseek API (`https://api.deepseek.com`). It implements the `LlmapiEngine` interface and is used in LLM API configuration (not presets).

## Design

### Engine Structure

- **Server-side**: `DeepseekEngine implements LlmapiEngine`, `id = "deepseek"`
- **Client-side**: Config UI registered with `llmapiConfigRegistry`
- **Stream processing**: Reuses the OpenAI engine's `generateOpenAIReadableStreamReply()` shared function

### Registration

```typescript
// Server-side (server/index.ts) — registers with the LLM engine registry
llmapiEngineRegistry.register(new DeepseekEngine());

// Client-side (client/index.ts) — registers the config UI
llmapiConfigRegistry.register(deepseekConfig);
```

## Data Model (`models.ts`)

```typescript
interface DeepseekConfigModel {
    parameters: {
        model: "deepseek-v4-flash" | "deepseek-v4-pro";
        extra_body: {
            thinking: { type: "enabled" | "disabled" };
        };
        reasoning_effort: "high" | "max";
        stream: boolean;
        temperature: number;        // [0, 2]
        top_p: number;              // [0, 1]
        max_tokens: number;
        logprobs: boolean;
        top_logprobs: number;       // [0, 20]
    };
}
```

## Server-Side Execution (`server/engine.ts`)

```
DeepseekEngine.run(context)
  → new OpenAI({ baseURL: "https://api.deepseek.com", apiKey })
  → Assemble parameters: { model, messages: [{role, content}], ...config.parameters }
  → Conditionally remove falsy fields (top_logprobs, max_tokens)
  → generateOpenAIReadableStreamReply(context, parameter, openai)
      → streaming: iterate completion stream, JSON-encode each chunk with newline
      → non-streaming: 300ms heartbeat, send all at once on completion
  → Listen to context.signal to abort the request
```

## Client-Side Config UI (`client/config.tsx`)

- API Key input
- Model selector (v4-flash / v4-pro)
- Thinking toggle → controls reasoning_effort visibility
  - Thinking enabled → show reasoning_effort, hide temperature/top_p
  - Thinking disabled → show temperature/top_p, hide reasoning_effort
- Stream toggle
- Max Tokens
- Logprobs / Top Logprobs (currently disabled)
