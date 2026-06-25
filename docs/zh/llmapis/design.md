# LlmApis 模块设计

## 概述

`src/llmapis/` 是 LLM API 抽象管理层，为不同 AI 服务商提供统一的可插拔接口。上层业务（Slot、对话管道）无需关心具体调用哪个 API。

## 设计理念

### 服务商与引擎解耦

"Provider" 是字符串标识符（如 `"deepseek"`, `"openai"`），"Engine" 是实现了 `LlmapiEngine` 的具体类。运行时通过 `provider` 字段在注册表中查找：

```
LlmapiModel.provider = "deepseek"
    ├── 客户端：llmapiConfigRegistry["deepseek"] → 配置表单 UI
    └── 服务端：llmapiEngineRegistry["deepseek"] → API 调用
```

### API Key 安全

- **存储**：API Key 在服务器端通过 `Hasher.instance.encrypt()` 加密后存入 SQLite
- **传输**：仅在 `/api/llmapis/[id]/chat` 端点解密，解密后立即使用
- **隔离**：客户端脚本（iframe 中的 JS）无法访问加密密钥或解密后的 Key

## 数据模型 (`models.ts`)

```typescript
interface LlmapiModel extends BaseModel {
    code: string;        // 唯一标识符
    version: string;     // 语义版本号
    provider?: string;   // 服务商标识（"deepseek" | "openai"）
    key?: string;        // 加密存储的 API Key
    builder?: string;    // 输入构建器标识
}
```

## 服务端引擎系统

### LlmapiEngine (`server/engine-models.ts`)

```typescript
interface LlmapiRequestContext extends LlmapiInputModel {
    type: string;       // 提供商标识
    config: any;        // 提供商特定配置
    signal: AbortSignal; // 取消信号
    apiKey: string;     // 已解密的 API Key
}

interface LlmapiEngine extends Registerable {
    run(context: LlmapiRequestContext): Promise<ReadableStream>;
}
```

### 引擎注册表 (`server/engine.ts`)

`llmapiEngineRegistry = new LlmEngineRegistry("llmapi-engine")` — 全局单例注册表。LLM 服务商引擎（Deepseek、OpenAI）通过 `register*Server()` 在此注册。

### 聊天端点 (`/api/llmapis/[id]/chat`)

```
POST body: { messages: LlmapiMessage[], ... }
  → llmapiRepository.get(id)
  → engine = llmapiEngineRegistry.getSorted().find(e => e.id === llmapi.provider)
  → apiKey = Hasher.instance.decrypt(llmapi.key)
  → engine.run({ messages, config, apiKey, signal })
  → ReadableStream → SSE 响应
```

## 客户端

### 配置注册表

`llmapiConfigRegistry` — 注册表，各引擎注册自己的配置 UI 组件。Deepseek 和 OpenAI 引擎在 `register*Client()` 中注册。

### 输入构建器

`llmapiInputBuilderManager` — 注册表，管理消息构建器。Lorebooks 引擎注册了 `"default"` builder（`defaultBuildInput`），负责将对话历史+激活的世界书内容转换为 `LlmapiMessage[]`。

### 会话处理器 (`client/conversation.ts`)

`llmapiConversationProvider` 注册到 `conversationManager.inputProcesser`（`requires: ["lorebook"]`），在输入处理阶段选择正确的 builder 并构建 LLM 消息。

## 消息格式

```typescript
interface LlmapiMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface LlmapiInputModel {
    messages: LlmapiMessage[];
}
```

## 数据库结构

```
llmapis (主表)
├── id, name, content (继承自 masterTable)
├── code (text, unique, not null)
├── provider (text, nullable)
├── builder (text, nullable)
├── key (text, nullable) — 加密存储
└── version (text, not null)

llmapiEntries (子表)
├── 继承自 entryTable
└── FK → llmapis.id (ON DELETE CASCADE)
```
