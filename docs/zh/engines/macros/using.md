# Macros 引擎使用指南

## 定义宏

在预设编辑器的 Macro 标签中添加键值对：

| Key | Value |
|---|---|
| `charName` | Alice |
| `worldName` | Cat's Paw Tavern |
| `charAge` | 19 |

## 使用宏

在**任何文本**中使用 Eta 模板语法 — 提示词、世界书内容、正则替换文本等：

```text
你是 <%= it.charName %>，今年 <%= it.charAge %> 岁，是 <%= it.worldName %> 的老板娘。
```

运行时渲染为：

```text
你是 Alice，今年 19 岁，是 Cat's Paw Tavern 的老板娘。
```

## Eta 语法

支持完整 [Eta 模板语法](https://eta.js.org/docs/4.x.x/syntax/template-syntax)：

```text
<% /* 注释，不输出 */ %>

<% /* 条件 */ %>
<%= it.charAge >= 18 ? "成年" : "未成年" %>

<% /* 原始输出（不转义 HTML） */ %>
<%~ it.rawHtml %>
```

## 替换时机

| 阶段 | 替换内容 | 效果 |
|---|---|---|
| `onProcessInput` | LLM 消息体中的模板 | AI 收到的消息中宏已替换 |
| `onRenderStream` | 流式输出中的模板 | AI 逐字输出时实时替换 |
| `onRenderContent` | 全部历史 + 当前输出 | 翻页查看时所有显示内容中宏已替换 |

## 宏的优先级

多个预设可能定义同名宏。后遍历的预设值覆盖先遍历的值。通过 `requires` 依赖顺序可控覆盖行为。

## 最佳实践

- **命名**：camelCase，语义清晰（`charName` 而非 `n`）
- **粒度**：频繁变化用宏（角色名），固定内容用世界书
- **组合**：世界书内容本身也可以包含宏占位符
