# LlmApis 模块 — 设计文档

## 概述

`src/llmapis/` 是 **LLM API 抽象管理层**。它为不同 AI 服务商提供统一的可插拔接口，使上层业务无需关心具体调用哪个 API。

## 设计理念

### 三板斧插件模式

每个 LLM 服务商（如 Deepseek）需要实现三个接口：

| 接口 | 位置 | 职责 |
|---|---|---|
| `LlmapiConfig` | 客户端 | 配置表单 UI（模型选择、参数设置） |
| `LlmapiInputBuilder` | 客户端 | 将对话历史转换为 LLM 消息格式 |
| `LlmapiEngine` | 服务端 | 调用 LLM API 并返回流式响应 |

### 提供商与引擎解耦

"Provider" 是字符串标识符（如 `"deepseek"`），"Engine" 是实现了 `LlmapiEngine` 的具体类。运行时通过 `provider` 字段在注册表中查找：

```
LlmapiModel.provider = "deepseek"
    │
    ├── 客户端：llmapiConfigRegistry["deepseek"]  → 配置表单
    ├── 客户端：llmapiInputBuilderManager["deepseek"] → 输入构建
    └── 服务端：llmapiEngineRegistry["deepseek"] → API 调用
```

### API Key 安全

- **存储**：API Key 在写入数据库前通过 `Hasher.encrypt()` 加密
- **传输**：仅在调用 LLM API 时解密（在服务器端）
- **隔离**：客户端脚本（iframe 中的 JS）无法访问加密密钥

### 预设无感知

预设作者不需要关心用户用哪个 API 服务商。Input Builder 负责将统一的 `LorebookMessage[]` 格式转换为各服务商要求的消息格式。

## 架构图

```
用户发送消息
    │
    ▼
llmapiConversationProvider.onProcessInput(ctx)
    │
    ├── 读取 ctx.slot.llmapi.provider
    ├── llmapiInputBuilderManager[provider].onBuildInput(ctx)
    │       │
    │       └── defaultBuildInput()
    │           ├── 遍历历史 LorebookMessage[]
    │           ├── 注入 Lorebook 条目（层 < 100 前置，≥ 100 后置）
    │           └── 构造 LlmapiMessage[] (role + content)
    │
    ├── ctx.messages = messages
    │
    ▼
POST /api/llmapis/{id}/chat
    │
    ├── llmapiRepository.get(id)  → LlmapiModel
    ├── Hasher.decrypt(model.key) → apiKey
    ├── llmapiEngineRegistry[model.provider].run(ctx)
    │       │
    │       └── DeepseekEngine
    │           ├── new OpenAI({ baseURL: 'https://api.deepseek.com' })
    │           ├── chat.completions.create({ model, messages, ... })
    │           └── ReadableStream
    │
    └── 流式响应 → 浏览器 (SSE, text/event-stream)
```

## 核心数据结构

### LlmapiModel

```ts
interface LlmapiModel extends BaseModel {
    code: string;        // 唯一标识符
    version: string;     // 语义版本号
    provider?: string;   // 服务商标识（"deepseek"）
    key?: string;        // 加密的 API Key
}
```

### 消息格式

```ts
interface LlmapiMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface LlmapiInputModel {
    messages: LlmapiMessage[];
}
```

### LlmapiRequestContext

```ts
interface LlmapiRequestContext extends LlmapiInputModel {
    type: string;      // 提供商
    config: any;       // 提供商特定的配置
    apiKey: string;    // 已解密的 API Key
}
```

## defaultBuildInput 详解

默认的输入构建器实现复杂的 Lorebook 注入逻辑：

```
对于每个 LorebookMessage：
    1. 收集其 activeLorebooks[] 的完整内容
    2. 按层数分组：
       - 层 < 100 → lorebookS（前置注入）
       - 层 ≥ 100 → lorebookE（后置注入）
    3. 按 lorebookOrder 排序各组
    4. 最终消息 = 前置 lorebooks + 原始内容 + 后置 lorebooks
```

第一条消息始终是 `system` 角色，包含 openingRemarks。

## 数据库表

```
llmapis (主表)
├── id, name, content (继承自 masterTable)
├── code (text, unique, not null)
├── provider (text, nullable)
├── key (text, nullable) — 加密存储
└── version (text, not null)

llmapiEntries (子表)
├── 继承自 entryTable
└── FK → llmapis.id (ON DELETE CASCADE)
```

## 与引擎系统集成

Llmapi 模块通过注册表与引擎系统交互：

1. **Deepseek 引擎**向 `llmapiConfigRegistry` 注册配置 UI
2. **Deepseek 引擎**向 `llmapiInputBuilderManager` 注册输入构建器
3. **Deepseek 引擎**向 `llmapiEngineRegistry` 注册 API 引擎
4. **llmapiConversationProvider** 向 `conversationManager` 注册会话处理器

新增 LLM 服务商只需实现这三个接口并注册即可。
