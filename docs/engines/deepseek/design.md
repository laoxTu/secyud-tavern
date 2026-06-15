# Deepseek 引擎 — 设计文档

## 概述

Deepseek 是**模型 API 引擎**，负责调用 Deepseek 官方 API 进行 AI 对话。它是 `LlmapiEngine` 接口的一个实现，在**模型配置**（而非预设）中使用。

## 设计理念

### 三板斧插件模型

作为模型引擎，Deepseek 实现三个接口，注册到对应的三个注册表：

| 接口 | 注册表 | 运行时 | 职责 |
|---|---|---|---|
| `LlmapiEngine` | `llmapiEngineRegistry` | 服务端 | 调用 API，返回 SSE 流 |
| `LlmapiConfig` | `llmapiConfigRegistry` | 客户端 | 配置表单 UI |
| `LlmapiInputBuilder` | `llmapiInputBuilderManager` | 客户端 | 构建 LLM 消息格式 |

### 流式/非流式双模式

- **流式模式**（`stream: true`）：逐 token 推送，实时渲染
- **非流式模式**（`stream: false`）：每 300ms 发送心跳，完整响应一次性推送

两种模式都返回 `ReadableStream`，上层代码无需区分。

### Thinking 模式

启用 Thinking 后，Deepseek 会在回复前进行推理。配置中自动切换 UI：
- Thinking 开启 → 显示 `reasoning_effort` 选择（high / max），隐藏 temperature / top_p
- Thinking 关闭 → 显示 temperature / top_p，隐藏 reasoning_effort

## 数据模型

```ts
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
        logprobs: boolean;
        top_logprobs: number;       // [0, 20]
    };
}
```

## 服务端执行流程

```
POST /api/llmapis/{id}/chat
  → llmapiRepository.get(id)    → 获取配置
  → Hasher.decrypt(apiKey)      → 解密密钥
  → llmapiEngineRegistry["deepseek"].run(ctx)
      → new OpenAI({ baseURL: "https://api.deepseek.com", apiKey })
      → chat.completions.create({ model, messages, ...parameters })
      → ReadableStream

流式: for await (chunk of completion)
        → yield chunk.choices[0].delta.content

非流式: setInterval(heartbeat, 300ms)
        → await completion
        → yield completion.choices[0].message.content
```

## InputBuilder

Deepseek 的消息构建委托给 `defaultBuildInput`（来自 `llmapis/client/input-builder-default`），将 LorebookMessage 历史转为标准 `{ role, content }` 格式，并注入激活的世界书内容。

## 注册

```ts
// 服务端
llmapiEngineRegistry.register(new DeepseekEngine());

// 客户端
llmapiConfigRegistry.register(deepseekConfig);
llmapiInputBuilderManager.register(deepseekInputBuilder);
```
