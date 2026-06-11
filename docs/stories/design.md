# Stories 模块 — 设计文档

## 概述

`src/stories/` 管理 Secyud Tavern 的**故事/存档系统**。Story 定义了叙事框架（开场白、需要的预设、LLM 配置）并维护完整的对话历史与变量状态。

## 设计理念

### 存档身兼两职

Secyud Tavern 的 Story 既是**会话快照**又是**预设播放列表**：

- **作为会话快照**：记录完整对话历史和变量演变轨迹
- **作为预设清单**：`requires` 字段记录了该会话激活了哪些预设，导出时携带完整的预设组合方案

导出一个 Story 就是分享一个完整体验：用了哪些预设、聊了什么、世界演变成了什么状态。

### 变量驱动的状态管理

传统 AI 对话的状态管理完全依赖上下文记忆（"Alice 现在的心情是高兴的"）。Secyud Tavern 采用结构化变量表：

```
每轮对话：
  AI 回复
  └── <variable_changes>
      { "alice.mood": "happy", "time.hour": 23 }
      </variable_changes>
  
  存储：
  ├── variables (根节点): 最新状态快照
  └── variableChanges (每条消息): 增量变更记录
```

**优势**：
- 加载存档直接读取 `variables`，无需重放历史
- 删除消息时通过重放 `variableChanges` 精确重建状态
- 变量可用于世界书匹配、条件判断

### 隐藏消息

`invisible: true` 的消息不会被发送给 AI，但变量变更正常生效。适用场景：
- GM 指令：`/set time 22`
- 后台世界演变：系统自动插入的环境变化
- 调试测试：手动修改变量但不污染对话

## 数据模型

### StoryModel

```ts
interface StoryModel extends BaseModel {
    requires: RequireModel[];       // 依赖的预设列表
    llmapi: RequireModel | null;    // 关联的 LLM API
    histories?: StoryHistory[];     // 对话历史
}
```

### StoryHistory（对话历史结构）

```ts
interface StoryHistory {
    id: string;
    outputId: number;                      // 当前选中的输出索引
    summary?: string;                      // 摘要
    variables: Record<string, any>;       // 根节点变量快照
    inputs: StoryInputMessage[];          // 输入消息数组
    outputs: StoryOutputMessage[];        // 输出消息数组
}
```

### 消息类型

```ts
// 基础消息
interface StoryHistoryMessage {
    content: string;
    activeLorebooks?: string[];              // 激活的世界书 ID 列表
    variables: VariableChangeModel[];        // 变量变更列表
}

// 输入消息
interface StoryInputMessage extends StoryHistoryMessage {
    id: string;
}

// 输出消息（AI 回复）
interface StoryOutputMessage extends StoryHistoryMessage {
    id: string;
}
```

### 每个 History 包含多条 input 和多条 output

```
StoryHistory {
    inputs: [
        { id: "i1", content: "Hello", variables: [] }
    ],
    outputs: [
        { id: "o1", content: "Hi there!", variables: [{op:"add",...}] },
        { id: "o2", content: "How are you?", variables: [] },  // 分支输出
    ]
}
```

`outputId` 指向当前激活的输出（支持多分支）。

### VariableChangeModel

```ts
interface VariableChangeModel {
    op: "add" | "replace" | "remove";
    path: string;    // 点号分隔（如 "alice.cat-girl.mood"）
    value?: any;
}
```

遵循 JSON Patch 风格的原子操作。

## 关键函数

### getCurrentOutput

```ts
function getCurrentOutput(history: StoryHistory): StoryOutputMessage | undefined {
    // 返回 outputId 对应的输出，边界安全
}
```

### applyPatch

```ts
function applyPatch(variables: Record<string, any>, changes: VariableChangeModel[]): Record<string, any> {
    // 依次应用变量变更补丁
    // "add" → 在路径上设置值
    // "replace" → 同上
    // "remove" → 删除路径上的值
    // 路径用点号分隔，支持深层嵌套
}
```

### extractVariableChanges

```ts
function extractVariableChanges(history: StoryHistory, text?: string): {
    content: string;                        // 去除标签后的文本
    variableChanges: VariableChangeModel[]; // 提取的变量变更
}
```

解析 AI 回复中的 `<variable_changes>...</variable_changes>` XML 标签，提取结构化变量补丁，并从文本中移除标签。

## 数据库结构

```
stories (主表)
├── id, name, content (继承)
├── requires (JSON RequireModel[])
└── llmapi (JSON RequireModel | null)

storyEntries (子表)
├── 继承 entryTable
├── entryType = "history" — 对话历史记录
└── FK → stories.id (ON DELETE CASCADE)
```

对话历史存储在 `storyEntries` 子表中，`entryType = "history"`。

## 删除消息时的变量重建

当用户删除某条消息：

```
1. 确定保留范围（目标消息之前的所有消息）
2. 从空变量表 {}
3. 依次应用保留范围内每条消息的 variableChanges
4. 结果写入根节点 variables
5. 截断 history 数组
6. 重新计算 turnCount
```

这保证了删除消息后，后续消息的变量上下文保持正确。

## 与 Slots 的关系

Story 是静态定义，Slot 是运行时实例：

```
Story (持久化)
├── requires: [{code: "alice.cat-girl", version: "1.0"}]
├── llmapi: {code: "my-deepseek", version: "1.0"}
└── content: { openingRemarks: "Welcome to the tavern..." }

        │ GET /api/stories/{id}/slot
        │ → 解析 requires → 加载 Presets → 加载 Llmapi
        ▼

Slot (运行时)
├── story: StoryModel
├── presets: PresetModel[]  (解析后)
├── llmapi: LlmapiModel     (解析后)
└── content: { history[], lorebooks[], ... }
```
