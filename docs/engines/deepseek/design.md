# Deepseek 引擎设计

## 概述

Deepseek 引擎是 **LLM API 引擎**，调用 Deepseek 官方 API（`https://api.deepseek.com`）。实现 `LlmapiEngine` 接口，在 LLM API 配置（而非预设）中使用。

## 设计

### 引擎结构

- **服务端**：`DeepseekEngine implements LlmapiEngine`，`id = "deepseek"`
- **客户端**：配置 UI 注册到 `llmapiConfigRegistry`
- **流式处理**：复用 OpenAI 引擎的 `generateOpenAIReadableStreamReply()` 共享函数

### 注册

```typescript
// 服务端 (server/index.ts) — 注册到 LLM 引擎注册表
llmapiEngineRegistry.register(new DeepseekEngine());

// 客户端 (client/index.ts) — 注册配置 UI
llmapiConfigRegistry.register(deepseekConfig);
```

## 数据模型 (`models.ts`)

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

## 服务端执行 (`server/engine.ts`)

```
DeepseekEngine.run(context)
  → new OpenAI({ baseURL: "https://api.deepseek.com", apiKey })
  → 组装参数：{ model, messages: [{role, content}], ...config.parameters }
  → 条件清除 falsy 值字段（top_logprobs, max_tokens）
  → generateOpenAIReadableStreamReply(context, parameter, openai)
      → streaming: 遍历 completion stream，每个 chunk JSON 编码换行
      → non-streaming: 300ms 心跳，完成后一次性发送
  → 监听 context.signal 中止请求
```

## 客户端配置 UI (`client/config.tsx`)

- API Key 输入
- Model 选择器（v4-flash / v4-pro）
- Thinking 开关 → 控制 reasoning_effort 显示
  - Thinking 开启 → 显示 reasoning_effort，隐藏 temperature/top_p
  - Thinking 关闭 → 显示 temperature/top_p，隐藏 reasoning_effort
- Stream 开关
- Max Tokens
- Logprobs / Top Logprobs（当前禁用状态）
