# Macros 引擎设计

## 概述

Macros 是**模板变量替换引擎**，使用 [Eta](https://eta.js.org/) 模板引擎在提示词和内容渲染阶段将 `<%= it.key %>` 占位符替换为实际值。

## 设计理念

### 分离定义与使用

- **定义**：预设作者在 Macro 标签中定义键值对
- **使用**：在任何文本（提示词、世界书内容、正则替换等）中使用 Eta 语法引用
- **替换时机**：在 inputProcesser、streamRenderer、contentRenderer 三阶段统一执行

### 为什么是 Eta

Eta 是轻量级 JS 模板引擎（比 EJS 更快）。虽然当前只用简单占位符替换，Eta 的完整语法（条件、循环、过滤器）为未来扩展留空间。

## 数据模型 (`models.ts`)

```typescript
interface PresetMacroModel extends EntryModel {
    key: string;     // 模板变量名（通过 <%= it.key %> 引用）
    value: string;   // 替换值
}
```

## 执行流程

### 1. onInitialize (SlotInitializer)

遍历所有预设的 macros 条目 → 过滤 disabled → 收集为 `{key: value, ...}` 对象 → 存储到 `slot.content["macros"]`。

### 2. onProcessInput (LlmapiInputProcesser, requires: ["llmapi"])

在 LLM API 消息构建完成后执行：
→ 对 `ctx.messages` 每条消息的 content 调用 `eta.renderString(content, macroObject)`
→ `<%= it.key %>` 被替换为实际值
→ 同时传入 `generateCurrentVariables()` 结果，支持变量引用

### 3. onRenderStream (SlotStreamRenderer)

流式输出时：`ctx.data.output = eta.renderString(ctx.data.output, macroObject + variables)`

### 4. onRenderContent (SlotContentRenderer)

整页渲染时：对 `ctx.data.inputs` 和 `ctx.data.output` 逐一调用 `eta.renderString`

## 与 Regex 的区别

| | Macro | Regex |
|---|---|---|
| 目的 | 占位符替换（配置驱动） | 文本变换（模式匹配） |
| 语法 | `<%= it.key %>` Eta 模板 | JavaScript 正则表达式 |
| 典型用途 | `我叫<%= it.charName %>` | 清除 AI 输出中的格式标记 |
| 配置 | 键值对 | pattern + replacement |

## 存储

服务端通过 `presetStorage.register(createSimpleStorageProvider("macro", "macros", presetRepository))` 注册。
