# Regexes 引擎 — 设计文档

## 概述

Regexes 是**文本查找替换引擎**。它在消息发送给 AI（输入）或展示给用户（输出）前后，对文本执行正则表达式替换。

## 设计理念

### 双向处理

正则替换分为两个方向：

| target | 作用时机 | 典型用途 |
|---|---|---|
| `input` | 发送给 AI 之前 | 过滤敏感词、格式化用户输入 |
| `output` | AI 回复展示之前 | 清除格式标记、移除广告、统一排版 |
| `both` | 输入和输出都生效 | 统一术语替换 |

### 与 Macro 的分工

| | Regex | Macro |
|---|---|---|
| 语法 | JavaScript 正则表达式 | `<%= key %>` Eta 模板 |
| 目的 | **变换**现有文本 | **替换**占位符为配置值 |
| 执行顺序 | Regex 在前（先变换文本） | Macro 在后（再替换占位符） |

## 数据模型

```ts
interface PresetRegexModel extends EntryModel {
    pattern: string;       // JavaScript 正则表达式
    replacement: string;   // 替换文本
    target: "input" | "output" | "both";  // 作用目标
}
```

## 执行流程

```
1. onInitialize
   遍历所有预设的 regexes 条目
   → 按 target 分类：
       target = "input" | "both" → inputRegexes[]
       target = "output" | "both" → outputRegexes[]

2. onProcessInput (LlmapiInputProcesser, requires: [lorebook])
   → 对历史消息的 input 和 output 内容逐一执行 inputRegexes 替换
   → 替换后的内容用于后续的 LLM 消息构建

3. onRenderStream (SlotStreamRenderer)
   → 对流式输出内容执行 outputRegexes 替换
   → 替换后的内容通过 postMessage 发给 iframe 渲染

4. onRenderContent (SlotContentRenderer)
   → 对全部历史消息和当前输出执行 outputRegexes 替换
   → 替换后的内容通过 postMessage 发给 iframe 渲染
```

## applyRegexes

核心替换逻辑非常简单：

```ts
function applyRegexes(regexes: PresetRegexModel[], text?: string) {
    if (!text || text == '') return '';
    for (const regex of regexes) {
        text = text.replace(regex.pattern, regex.replacement);
    }
    return text;
}
```

注意：使用 `String.replace()`，第一个参数是**字符串模式**（非 RegExp 对象），这意味着每次替换只替换第一个匹配项。
