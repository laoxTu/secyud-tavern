# Engines 模块 — 设计文档

## 概述

`src/engines/` 是 Secyud Tavern 的**可插拔引擎系统**。每个引擎是一个独立的功能子系统，通过向中央注册表注册自己来接入应用框架。

## 五大引擎

| 引擎 | 目录 | 角色 |
|---|---|---|
| **deepseek** | `deepseek/` | AI/LLM 推理适配器 — 调用 Deepseek API 进行对话生成 |
| **lorebooks** | `lorebooks/` | 世界书 — 条件性背景知识注入 |
| **regexes** | `regexes/` | 文本转换 — 查找替换预处理/后处理 |
| **scripts** | `scripts/` | 用户脚本 — JS 注入到对话 iframe |
| **styles** | `styles/` | 主题 — CSS 注入到对话 iframe |

## 设计理念

### 注册机制 — 引擎即插件

引擎不通过硬编码集成，而是通过**注册表模式**自我注册。每个引擎模块在 `server/index.ts` 和 `client/index.ts` 中调用 `registry.register()`：

```
启动时:
  client-registerer.ts → 调用各引擎的 register*Client()
  server-registerer.ts → 调用各引擎的 register*Server()
```

### 多维度注册

一个引擎可以在多个注册表中注册，扮演多个角色：

| 注册表 | 位置 | Deepseek | Lorebooks | Regexes | Scripts | Styles |
|---|---|---|---|---|---|---|
| `llmapiEngineRegistry` | 服务端 | ✅ 引擎执行 | - | - | - | - |
| `llmapiConfigRegistry` | 客户端 | ✅ 配置 UI | - | - | - | - |
| `llmapiInputBuilderManager` | 客户端 | ✅ 输入构建 | - | - | - | - |
| `presetStorage` | 服务端 | - | ✅ 存储 | ✅ 存储 | ✅ 存储 | ✅ 存储 |
| `presetTabManager` | 客户端 | - | ✅ 编辑 UI | ✅ 编辑 UI | ✅ 编辑 UI | ✅ 编辑 UI |
| `conversationManager` | 客户端 | - | ✅ 会话 | ✅ 会话 | ✅ 会话 | ✅ 会话 |

### 依赖排序（拓扑排序）

引擎的 `ConversationProvider` 通过 `requires` 声明依赖关系，`Registry` 基类使用 **Kahn 算法**进行拓扑排序：

```
Lorebook (无依赖) → Regex (requires: lorebook) → Script (requires: regex)
```

这确保了执行顺序：先匹配世界书 → 再应用正则替换 → 最后执行脚本。

### 客户端/服务端分离

每个引擎严格分离为 `client/` 和 `server/`：

```
engines/{name}/
├── models.ts           # 共享模型
├── server/
│   ├── index.ts       # 注册到服务端注册表
│   └── storage.ts     # 数据持久化
└── client/
    ├── index.ts       # 注册到客户端注册表
    ├── preset-tab.tsx  # 预设编辑 UI
    └── conversation.ts # ConversationProvider
```

## ConversationProvider 生命周期

非 LLM 引擎（lorebooks、regexes、scripts、styles）实现 `ConversationProvider` 接口，参与 5 阶段生命周期：

```
1. onInitialize(ctx)     → 会话初始设置（解析预设、初始化数据结构）
2. onProcessInput(ctx)   → 处理用户输入（构建 LLM 消息，世界书匹配）
3. onProcessOutput(ctx)  → 处理 AI 输出（变量提取，世界书更新）
4. onRenderPage(ctx)     → 完整页面渲染（注入 CSS/JS，渲染历史）
5. onRenderStream(ctx)   → 流式渲染（实时更新 iframe DOM）
```

### Lorebook 流程详解

```
用户输入
    │
    ▼
onProcessInput
    │
    ├── 遍历历史消息
    ├── tryFillActiveLorebooks(lorebooks, context)
    │       │
    │       ├── 对每个世界书：
    │       │   └── MatcherRegistry.match(matchType)
    │       │       ├── always  → 始终返回 true
    │       │       ├── normal  → 关键字匹配
    │       │       └── event   → 关键字 + 日期范围
    │       │
    │       └── 返回 activeLorebooks[]
    │
    └── lorebookMessage { content, activeLorebooks[] }
            │
            ▼
    LlmapiInputBuilder.onBuildInput()
        │
        ├── 将 activeLorebooks 注入消息正文（层 < 100 前置，≥ 100 后置）
        └── 构建 LlmapiMessage[] 发送给 AI
```

## Deepseek 引擎架构

Deepseek 是唯一实现 `LlmapiEngine` 接口的引擎：

```ts
interface LlmapiEngine {
    run(context: LlmapiRequestContext): Promise<ReadableStream>;
}
```

执行流程：

```
/api/llmapis/{id}/chat POST
    │
    ├── llmapiRepository.get(id)
    ├── Hasher.instance.decrypt(apiKey)
    ├── llmapiEngineRegistry[provider].run(ctx)
    │       │
    │       └── DeepseekEngine
    │           ├── new OpenAI({ baseURL: 'https://api.deepseek.com' })
    │           └── chat.completions.create({
    │               model, messages, temperature, stream, ...
    │           })
    │
    └── ReadableStream (SSE) → Response
```

- **流式模式**：逐块 `yield choices[0].delta.content`
- **非流式模式**：每 300ms 发送心跳，直到完整响应就绪后一次性推送

## 世界书匹配器系统

`lorebooks/match/` 实现三种匹配策略，均为插件化架构：

```
match/
├── always/      → AlwaysMatch — 始终激活（可选 "仅最后一条消息"）
├── normal/      → NormalMatch — 关键字 AND/OR 逻辑匹配
└── event/       → EventMatch — 关键字 + 日期范围匹配
```

每个匹配器实现 `Matcher` 接口：

```ts
interface Matcher extends Registerable {
    editor: React.ComponentType;           // 编辑器 UI
    getEditorValue(data: FormData): any;   // 提取表单值
    match(ctx: MatcherMatchContext, expression: any): boolean;  // 运行时匹配
}
```

新增匹配器只需在 `lorebookMatcherRegistry` 中注册即可，无需修改其他引擎代码。

## 引擎依赖链

```
┌──────────────────────────────────────────────┐
│                   Deepseek                    │
│  (LLM API 适配 — 独立运行，不参与 Conversation)  │
└──────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Lorebooks │───→│ Regexes  │───→│ Scripts  │    │  Styles  │
│ (匹配)    │    │ (替换)    │    │ (JS注入)  │    │(CSS注入) │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                          (独立运行)
     │ requires: [lorebook]
     │
     └──→ Script requires: [regex]
```
