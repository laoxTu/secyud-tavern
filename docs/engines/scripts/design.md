# Scripts 引擎设计

## 概述

Scripts 引擎将预设中定义的 JavaScript 代码注入到对话 iframe 的 `<body>` 中，并通过 `postMessage` 传递变量和渲染数据。**渲染由预设脚本自行负责**，引擎只负责注入和通信。

## 设计理念

### 自由度优先

不强制 UI 渲染方式。预设脚本监听 `message` 事件，接收 `renderContent`、`streamContent`、`variables` 数据，自己决定如何构建 DOM。

### postMessage 通信

```
主应用 (StoryPageContent)
  → iframe.contentWindow.postMessage({ type, data }, "*")

iframe 内脚本
  → window.addEventListener("message", (event) => { ... })
```

## 数据模型 (`models.ts`)

```typescript
interface PresetScriptModel extends EntryModel {
    content: string;      // JavaScript 代码文本
    priority: number;     // 排序优先级（数值小的先注入）
}
```

## 执行流程

### 1. onInitialize (SlotInitializer)

收集所有预设的 scripts 条目 → 过滤 disabled → 按 priority 排序 → 存储到 `slot.content["scripts"]`。

### 2. onRenderContent (SlotContentRenderer, requires: ["regex"])

- 检查 iframe body 中是否已有 `<script id="injected-scripts">`
- 没有则创建：将所有脚本内容用换行符拼接，注入 `<script>` 元素
- `postMessage({ type: "variables", data })` 同步变量
- 随后主应用发送 `renderContent` 消息

### 3. onRenderStream (SlotStreamRenderer)

- `postMessage({ type: "variables", data })` 同步变量
- 随后主应用发送 `streamContent` 消息

### 消息类型

| type | 触发时机 | data |
|---|---|---|
| `renderContent` | 翻页、初始加载 | `{ inputs: string[], output: string }` |
| `streamContent` | AI 逐字输出 | `{ output: string }` |
| `variables` | 每次渲染 | 当前变量表 `Record<string, any>` |

## 依赖声明

`requires: ["regex"]` — 确保正则替换在脚本执行前完成，脚本接收到的内容是最终处理后的文本。

## 存储

服务端通过 `presetStorage.register(createSimpleStorageProvider("script", "scripts", presetRepository))` 注册。
