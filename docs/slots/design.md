# Slots 模块 — 设计文档

## 概述

`src/slots/` 是 Secyud Tavern 的**会话运行时层**。Slot 是 Story + Presets + LlmApi 的运行时组合体，管理完整的对话生命周期：初始化、输入处理、输出处理、页面渲染和流式渲染。

## 设计理念

### Slot = 静态配置 + 运行时状态

```
SlotModel {
    story: StoryModel,          // 叙事定义（开场白、预设清单）
    presets: PresetModel[],     // 解析后的预设集合
    llmapi: LlmapiModel,       // LLM API 配置
    // + 运行时状态：
    content: {
        history[],              // 对话历史
        variables,              // 当前变量表
        lorebooks, regexes, ... // 引擎数据
    }
}
```

Slot 不是持久化实体 — 它没有自己的数据库表和 Repository。Slot 由 `/api/stories/{id}/slot` 端点按需组装，运行时状态完全在浏览器内存中维护。

### 会话生命周期

所有引擎的 `ConversationProvider` 通过统一的 5 阶段生命周期在 Slot 上下文中协同工作：

```
1. onInitialize  → 加载 slot 数据，解析预设，初始化引擎数据结构
2. onProcessInput → 用户输入 → 世界书匹配 → 正则替换 → 构建 LLM 消息
3. onProcessOutput → AI 输出 → 变量提取 → 历史更新
4. onRenderPage  → 完整重新渲染（页面加载、翻页时）
5. onRenderStream → 增量流式渲染（AI 逐字输出时）
```

### 无服务端

`src/slots/` 目录**没有** `server/` 子目录。Slot 的数据通过聚合 Stories/Presets/LlmApi 的现有 API 端点生成，不需要独立持久化。

## 架构图

```
┌──────────────────────────────────────────────────────┐
│                  Slot 加载流程                         │
│                                                      │
│  GET /api/stories/{id}/slot                          │
│      │                                               │
│      ├── storyRepository.get(id, withDetails)        │
│      ├── BFS 解析 requires → preset[]                │
│      ├── llmapiRepository.get(story.llmapi.code)     │
│      │                                               │
│      └── { id, name, content, story, llmapi, presets }│
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│               Conversation 生命周期                    │
│                                                      │
│  故事页面加载 Slot                                     │
│      │                                               │
│      ├── onInitialize(ctx)                           │
│      │   ├── lorebookProvider: 解析世界书，分组        │
│      │   ├── regexProvider: 按目标分组正则             │
│      │   ├── styleProvider: 收集并排序样式             │
│      │   └── scriptProvider: 收集并排序脚本            │
│      │                                               │
│      ├── getOpeningHistory(slot)                     │
│      │   └── 创建初始 StoryHistory                    │
│      │                                               │
│      └── renderCurrentPage()                         │
│          └── onRenderPage(ctx) → iframe 渲染          │
│                                                      │
│  用户发送消息 → createHistory(input, summary)           │
│      │                                               │
│      ├── onProcessInput(ctx)                         │
│      │   ├── lorebookProvider: tryFillActiveLorebooks │
│      │   ├── regexProvider: 应用输入正则替换           │
│      │   └── llmapiProvider: 构建 LLM 消息            │
│      │                                               │
│      ├── POST /api/llmapis/{id}/chat                 │
│      │   └── SSE 流 → readStream()                   │
│      │                                               │
│      ├── onRenderStream(ctx)                         │
│      │   ├── regexProvider: 应用输出正则替换           │
│      │   └── 实时更新 iframe DOM                      │
│      │                                               │
│      └── onProcessOutput(ctx)                        │
│          ├── extractVariableChanges()                │
│          └── 保存历史                                 │
└──────────────────────────────────────────────────────┘
```

## 核心模型

### SlotModel

```ts
interface SlotModel extends BaseModel {
    story: StoryModel;
    presets: PresetModel[];
    llmapi: LlmapiModel;
}
```

### LlmapiMessage（LLM 输入/输出消息格式）

```ts
interface LlmapiMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface LlmapiInputModel {
    messages: LlmapiMessage[];
}
```

## ConversationProvider 接口

```ts
interface ConversationProvider extends Registerable {
    onInitialize?(ctx: SlotInitializeContext): Promise<void>;
    onProcessInput?(ctx: LlmapiInputContext): Promise<void>;
    onProcessOutput?(ctx: LlmapiOutputContext): Promise<void>;
    onRenderPage?(ctx: RenderContext): Promise<void>;
    onRenderStream?(ctx: RenderStreamContext): Promise<void>;
}
```

所有方法都是可选的 — 引擎只实现自己关心的阶段。

### 各阶段上下文

| 上下文类型 | 携带的数据 |
|---|---|
| `SlotInitializeContext` | slot, content, id |
| `LlmapiInputContext` | slot, content, history, messages |
| `LlmapiOutputContext` | slot, content, history, sessionId |
| `RenderContext` | slot, content, document, window, history, variables |
| `RenderStreamContext` | 同 RenderContext + stream |

### 各引擎的实现

| 引擎 | onInit | onProcessInput | onProcessOutput | onRenderPage | onRenderStream |
|---|---|---|---|---|---|
| Lorebook | ✅ 解析分组 | ✅ 匹配激活 | - | - | - |
| Regex | ✅ 分组 | ✅ 输入替换 | - | ✅ 替换输出 | ✅ 流替换 |
| Script | ✅ 收集 | - | - | ✅ 注入 JS | ✅ 发送变量 |
| Style | ✅ 收集 | - | - | ✅ 注入 CSS | - |
| Llmapi | - | ✅ 构建消息 | - | - | - |

## 变量系统

### 变量存储

每个 `StoryHistory` 携带 `variables: Record<string, any>`（根节点的最新状态）和 `variableChanges: VariableChangeModel[]`（消息级别的变更记录）。

### 变量变更模型

```ts
interface VariableChangeModel {
    op: "add" | "replace" | "remove";
    path: string;   // 点号分隔的路径（如 "time.hour"）
    value?: any;
}
```

### generateCurrentVariables

```ts
function generateCurrentVariables(history: StoryHistory[], includeOutput?: boolean) {
    // 从空对象开始，依次应用每条消息的 variableChanges
    // 返回当前最新的变量表
}
```

### 删除消息时的变量重建

删除某条消息时，从空变量表开始，重放该消息之前所有消息的 `variableChanges`，然后将结果写入根节点 `variables`。

## getOpeningHistory

```ts
function getOpeningHistory(slot: SlotModel): StoryHistory {
    // 1. 检查 slot.content 中是否已有开场历史
    // 2. 如果没有，创建新的 StoryHistory：
    //    - 单条空输入消息
    //    - 调用 extractVariableChanges 解析 <variable_changes> 标签
    //    - 尝试填充 activeLorebooks
    //    - 缓存到 slot.content
    // 3. 返回开场历史
}
```
