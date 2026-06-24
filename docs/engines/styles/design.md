# Styles 引擎设计

## 概述

Styles 引擎将预设中定义的 CSS 代码注入到对话 iframe 的 `<head>` 中，自定义对话界面的外观。

## 设计理念

### 关注点分离

- **Styles**：CSS 控制外观，注入到 `<head>`
- **Scripts**：JS 控制行为和渲染逻辑，注入到 `<body>`

预设作者可只提供 CSS（主题预设），也可同时提供 CSS + JS（完整 UI 预设）。

### 一次注入，全局生效

CSS 通过 `<style id="injected-styles">` 注入到 iframe head，在页面生命周期内持续生效，不重复注入。

## 数据模型 (`models.ts`)

```typescript
interface PresetStyleModel extends EntryModel {
    content: string;      // CSS 文本
    priority: number;     // 排序优先级（值大的靠后，可覆盖前面的）
}
```

## 执行流程

### 1. onInitialize (SlotInitializer)

收集所有预设的 styles 条目 → 过滤 disabled → 按 priority 排序 → 存储到 `slot.content["styles"]`。

### 2. onRenderContent (SlotContentRenderer)

- 检查 iframe head 中是否已有 `<style id="injected-styles">`
- 没有则创建：将所有样式内容拼接为一个 `<style>` 元素注入到 `document.head`
- 已有则跳过（避免重复注入）

## 与其他引擎的协作

- Styles 不参与流式渲染（只在 onRenderContent 注入一次）
- `requires: []`（无依赖），但注入时机在 Scripts 之前（先有样式再有脚本）
- 多个预设的 CSS 拼接在一起，按 priority 排序，值大的靠后 → CSS 层叠规则使后面的覆盖前面的

## 存储

服务端通过 `presetStorage.register(createSimpleStorageProvider("style", "styles", presetRepository))` 注册。
