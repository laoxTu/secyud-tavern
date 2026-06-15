# Macros 引擎 — 设计文档

## 概述

Macros 是**字符串级占位符替换引擎**，使用 [Eta](https://eta.js.org/) 模板引擎驱动。它在提示词拼装和内容渲染前，将 `<%= it.key %>` 模板语法替换为预设中定义的实际值。

**Macros 不渲染 UI**。它只替换字符串中的占位符，真正的 UI 渲染由预设脚本在 iframe 中通过 `postMessage` 完成。

## 设计理念

### 分离定义与使用

- **定义**：预设作者在预设编辑器的 Macro 标签中定义键值对
- **使用**：在提示词、世界书内容、正则替换等任何文本中使用 Eta 语法引用宏
- **替换时机**：在 inputProcesser / streamRenderer / contentRenderer 三个阶段统一执行替换

### 为什么是 Eta

Eta 是轻量级 JS 模板引擎，比 EJS 更快，语法兼容。宏系统的目标是简单的占位符替换（`<%= it.key %>`），不需要复杂的模板逻辑，但 Eta 的完整语法（条件、循环、过滤器）为未来扩展留下空间。

## 数据模型

```ts
interface PresetMacroModel extends EntryModel {
    key: string;     // 宏名（在模板中通过 <%= it.key %> 引用）
    value: string;   // 宏值（替换后的内容）
}
```

## 执行流程

```
1. onInitialize (SlotInitializer)
   遍历所有激活预设的 macros 条目
   → 收集非 disabled 的键值对
   → 存储到 slot.content.macros = { key: "value", ... }

2. onProcessInput (LlmapiInputProcesser, requires: [llmapi])
   在 Llmapi 构建完消息后执行
   → 对 ctx.messages 中每条消息的 content 调用 eta.renderString(content, macroObject)
   → 将 <%= it.key %> 替换为实际值

3. onRenderStream (SlotStreamRenderer)
   流式输出时执行
   → ctx.output = eta.renderString(ctx.output, macroObject)
   → 替换输出流中的模板占位符

4. onRenderContent (SlotContentRenderer)
   完整页面渲染时执行
   → 对 ctx.inputs 和 ctx.output 逐一调用 eta.renderString
   → 替换所有历史消息和当前输出中的模板占位符
```

## 与正则的区别

| | Macro | Regex |
|---|---|---|
| 目的 | 占位符替换（配置驱动） | 文本变换（模式匹配） |
| 语法 | `<%= it.key %>` Eta 模板 | JavaScript 正则表达式 |
| 典型用途 | `我叫<%= charName %>` | 清除 AI 回复中的格式标记 |
| 配置方式 | 键值对 | pattern + replacement |
