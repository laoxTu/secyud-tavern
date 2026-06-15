# Macros 引擎 — 使用指南

## 定义宏

在预设编辑器的 Macro 标签中添加键值对：

| Key | Value |
|---|---|
| `charName` | Alice |
| `worldName` | Cat's Paw Tavern |
| `charAge` | 19 |
| `greeting` | 欢迎光临，客官里面请~ |

## 使用宏

在**任何文本**中使用 Eta 模板语法引用宏 —— 提示词、世界书内容、正则替换文本等都可以：

```text
你是 <%= it.charName %>，今年 <%= it.charAge %> 岁，是 <%= it.worldName %> 的老板娘。

客人推门进来，你说："<%= it.greeting %>"
```

运行时渲染为：

```text
你是 Alice，今年 19 岁，是 Cat's Paw Tavern 的老板娘。

客人推门进来，你说："欢迎光临，客官里面请~"
```

## Eta 语法

Macros 使用 [Eta](https://eta.js.org/) 引擎，支持完整模板语法：

```text
<% /* 这是注释，不会出现在输出中 */ %>

<% /* 条件 */ %>
<%= it.charAge >= 18 ? "成年" : "未成年" %>

<% /* 原始输出（不转义 HTML） */ %>
<%~ it.rawHtml %>
```

参考：[Eta 模板语法文档](https://eta.js.org/docs/4.x.x/syntax/template-syntax)

## 宏的替换时机

| 阶段 | 替换内容 | 效果 |
|---|---|---|
| `onProcessInput` | LLM 消息体中的模板 | 发送给 AI 的消息中宏已被替换 |
| `onRenderStream` | 流式输出中的模板 | AI 逐字输出时实时替换 |
| `onRenderContent` | 全部历史 + 当前输出 | 翻页查看时所有显示内容中宏被替换 |

## 宏的优先级

多个预设可能定义同名的宏。收集时后遍历的预设会覆盖先遍历的值。如需可控的覆盖行为，建议通过预设的 `requires` 依赖顺序管理。

## 最佳实践

- **Key 命名**：使用 camelCase，语义清晰（`charName` 而非 `n`）
- **粒度**：经常变化的文本用宏（角色名、地点名），固定的文本写在世界书
- **组合使用**：宏 + 世界书 + 正则可以协同工作。世界书内容本身也可以含宏占位符
