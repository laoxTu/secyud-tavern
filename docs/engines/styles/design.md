# Styles 引擎 — 设计文档

## 概述

Styles 引擎将预设中定义的 CSS 代码注入到对话 iframe 的 `<head>` 中，自定义对话界面的外观。

## 设计理念

### 关注点分离

- **样式**：CSS 控制外观，由 Styles 引擎注入
- **脚本**：JS 控制行为和渲染逻辑，由 Scripts 引擎注入

预设作者可以只提供 CSS（主题预设），也可以同时提供 CSS + JS（完整 UI 预设）。

### 一次注入，全局生效

CSS 通过 `<style id="injected-styles">` 注入到 iframe head，在页面生命周期内持续生效，不需要每帧重新注入。

## 数据模型

```ts
interface PresetStyleModel extends EntryModel {
    content: string;     // CSS 文本
    priority: number;    // 排序优先级
}
```

## 执行流程

```
1. onInitialize
   收集所有预设的 styles 条目
   → 过滤 disabled
   → 按 priority 排序
   → 存储到 slot.content.styles

2. onRenderContent (SlotContentRenderer)
   检查 iframe head 中是否已有 <style id="injected-styles">
   → 没有则创建：将所有样式内容拼接，注入到 iframe head
   → 已有则跳过（避免重复注入）
```

## 注入时机

样式只在 `onRenderContent` 阶段注入，不在流式渲染时注入。这确保样式在首次页面渲染时就绪，且不会被重复注入。

## 优先级覆盖

多个预设的 CSS 按 `priority` 排序后拼接。priority 值大的样式拼接在后面，CSS 层叠规则决定了后面的样式可以覆盖前面的。

预设作者如需确保自己的样式不被覆盖，应设置较高的 priority。
