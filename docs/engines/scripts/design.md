# Scripts 引擎 — 设计文档

## 概述

Scripts 引擎将预设中定义的 JavaScript 代码注入到对话 iframe 中，并通过 `postMessage` 传递变量和渲染数据，由脚本自行决定如何渲染 UI。

**渲染由预设脚本负责**，引擎只负责注入脚本和传递数据。

## 设计理念

### 自由度优先

Secyud Tavern 不强制 UI 渲染方式。预设作者编写 JavaScript 监听 `message` 事件，接收渲染数据（`renderContent`、`streamContent`、`variables`），自己决定如何构建 DOM。

这种方式增加了上手难度，但给予预设作者最大自由度 —— 可以实现传统聊天界面、视觉小说风格、MVU 模式等任意形式。

### postMessage 通信

脚本与主应用通过 `window.postMessage` 通信：

```
主应用 (page.tsx)
  → iframe.contentWindow.postMessage({ type, data }, "*")
  
iframe 内脚本
  → window.addEventListener("message", (event) => { ... })
```

## 数据模型

```ts
interface PresetScriptModel extends EntryModel {
    content: string;      // JavaScript 代码文本
    priority: number;     // 排序优先级
}
```

## 执行流程

```
1. onInitialize
   收集所有预设的 scripts 条目
   → 过滤 disabled
   → 按 priority 排序
   → 存储到 slot.content.scripts

2. onRenderContent (SlotContentRenderer, requires: [regex])
   检查 iframe 中是否已有 <script id="injected-scripts">
   → 没有则创建：将所有脚本内容拼接，注入到 iframe body
   → postMessage({ type: "variables", data }) 同步变量
   → page.tsx 随后 postMessage({ type: "renderContent", data: { inputs, output } })

3. onRenderStream (SlotStreamRenderer)
   → postMessage({ type: "variables", data }) 同步变量
   → page.tsx 随后 postMessage({ type: "streamContent", data: { output } })
```

## 消息类型

| type | 触发时机 | data 内容 |
|---|---|---|
| `variables` | 每次渲染 | 当前变量表 `Record<string, any>` |
| `renderContent` | 页面渲染 | `{ inputs: string[], output: string }` |
| `streamContent` | 流式输出 | `{ output: string }` |

脚本可自由选择监听哪些消息类型。

## 依赖声明

Script 声明 `requires: [regex]`，确保正则替换在执行脚本逻辑前完成，脚本接收到的内容是最终处理后的文本。
