# Slots 模块设计

## 概述

`src/slots/` 是会话运行时层。Slot 是 Story + Presets + LlmApi 的运行时组合体，管理完整对话生命周期。**Slot 不是持久化实体** — 没有自己的数据库表，由 `/api/stories/{id}/slot` 按需组装。

## 设计理念

### Slot = 静态配置 + 运行时状态

```typescript
SlotModel {
    story: StoryModel,          // 叙事定义
    presets: PresetModel[],     // BFS 解析后的预设集合
    llmapi: LlmapiModel,       // LLM API 配置
    content: {                  // 运行时状态（浏览器内存中）
        histories: StoryHistory[],
        variables: Record<string, any>,
        lorebooks, regexes, styles, scripts, macros, ...
    }
}
```

### 无服务端

`src/slots/` 没有 `server/` 子目录。Slot 数据通过聚合现有端点在服务端生成，运行时状态完全在浏览器内存。

### 数据模型 (`models.ts`)

```typescript
interface SlotModel extends BaseModel {
    story: StoryModel;
    presets: PresetModel[];
    llmapi: LlmapiModel;
}

interface LlmapiMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface LlmapiInputModel {
    messages: LlmapiMessage[];
}
```

## 对话管道 (`client/conversation.ts`)

`conversationManager` 是包含五个 `Registry` 实例的集合对象，实现五阶段对话生命周期：

| 阶段 | Registry | 触发时机 | 注册的引擎 |
|---|---|---|---|
| 初始化 | `initializer` | Slot 加载完成 | lorebooks, macros, regexes, scripts, styles |
| 输入处理 | `inputProcesser` | 发送消息前 | lorebooks, llmapi, macros, regexes |
| 输出处理 | `outputProcesser` | AI 回复完成后 | lorebooks |
| 内容渲染 | `contentRenderer` | 翻页/初始加载 | macros, regexes, scripts, styles |
| 流式渲染 | `streamRenderer` | AI 逐字输出时 | macros, regexes, scripts |

### 管道阶段接口 (`client/conversation-models.ts`)

每个阶段有独立的接口，均继承 `Registerable`：

```typescript
interface SlotInitializer {
    onInitialize?(ctx: SlotInitializeContext): Promise<void>;
}

interface LlmapiInputProcesser {
    onProcessInput?(ctx: LlmapiInputContext): Promise<void>;
}

interface LlmapiOutputProcesser {
    onProcessOutput?(ctx: LlmapiOutputContext): Promise<void>;
}

interface SlotContentRenderer {
    onRenderContent?(ctx: RenderContext): Promise<void>;
}

interface SlotStreamRenderer {
    onRenderStream?(ctx: RenderContext): Promise<void>;
}
```

### 管道执行顺序

按 `requires` 声明决定依赖顺序：
1. **lorebooks** — 匹配世界书（initializer, inputProcesser, outputProcesser）
2. **llmapi** — 构建 LLM 消息（inputProcesser, requires: ["lorebook"]）
3. **macros** — Eta 模板渲染（initializer, contentRenderer, streamRenderer, inputProcesser; requires: ["llmapi"]）
4. **regexes** — 正则替换（initializer, contentRenderer, streamRenderer, inputProcesser; requires: ["lorebook"]）
5. **scripts** — JS 注入（initializer, contentRenderer, streamRenderer; requires: ["regex"]）
6. **styles** — CSS 注入（initializer, contentRenderer）

## 核心函数

### generateCurrentVariables(history, includeOutput?)

从对话历史中累积 variableChanges，返回当前变量表。

### generateInputBuildContext(inputContext)

构建 LLM 调用前的完整上下文：
1. 找到最近一次 summary 标记的历史（作为截断点）
2. 如没有，从 `getOpeningHistory()` 生成开场历史
3. 将历史映射为 `LlmapiHistory[]`（含 `properties` 字典）

### getOpeningHistory(slot)

懒惰创建开场 `StoryHistory`：从 story 的 openingRemarks 提取文本和变量变更，缓存到 `slot.content`。

## iframe 渲染

对话内容渲染在 `<iframe>` 中，引擎通过 `document.head`/`document.body` 直接操作 iframe DOM：
- **Styles**：注入 `<style id="injected-styles">`
- **Scripts**：注入 `<script id="injected-scripts">`
- **数据通信**：`postMessage({type, data})` 发送 `renderContent`、`streamContent`、`variables` 消息

## 变量系统

每个 `StoryHistory` 携带：
- `variables: Record<string, any>` — 根节点最新变量状态
- `variableChanges: VariableChangeModel[]` — 消息级变更记录
- `inputs: StoryInputMessage[]` — 输入消息（含 variableChanges）
- `outputs: StoryOutputMessage[]` — 输出消息（含 variableChanges）

变量变更从 AI 回复中的 `<variable_changes>` XML 标签提取。

## Slot 功能 (`client/features/`)

| 功能 | 说明 |
|---|---|
| `history-deleter` | 删除当前历史/输出 |
| `history-editor` | Monaco JSON 编辑器修改历史 |
| `input-viewer` | 预览发送给 LLM 的实际消息 |
| `regenerator` | 重新生成 AI 回复 |
| `navigate-to-business` | 返回 Business 页面 |
