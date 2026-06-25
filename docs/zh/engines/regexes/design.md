# Regexes 引擎设计

## 概述

Regexes 是**文本查找替换引擎**。在消息发送给 AI（输入）或展示给用户（输出）前后，对文本执行正则表达式替换。

## 设计理念

### 双向处理

| target | 作用时机 | 典型用途 |
|---|---|---|
| `input` | 发送给 AI 前 | 过滤敏感词、格式化用户输入 |
| `output` | AI 回复展示前 | 清除格式标记、统一排版 |
| `both` | 输入输出都生效 | 统一术语替换 |

### 与 Macro 的分工

| | Regex | Macro |
|---|---|---|
| 执行顺序 | 先执行 | 后执行 |
| 语法 | JS 正则字符串 | `<%= key %>` Eta 模板 |
| 目的 | 变换现有文本 | 替换占位符 |

## 数据模型 (`models.ts`)

```typescript
interface PresetRegexModel extends EntryModel {
    pattern: string;       // JavaScript 正则表达式字符串
    replacement: string;   // 替换文本
    target: string;        // "input" | "output" | "both"
}
```

## 执行流程

### 1. onInitialize (SlotInitializer)

遍历所有预设的 regexes 条目 → 过滤 disabled → 按 target 分类：
- target = `"input"` | `"both"` → `regexesInput[]`
- target = `"output"` | `"both"` → `regexesOutput[]`

存储到 `slot.content["regexesInput"]` 和 `slot.content["regexesOutput"]`。

### 2. onProcessInput (LlmapiInputProcesser, requires: ["lorebook"])

对历史消息的 inputs 和 output 逐一执行 `applyRegexes(regexesInput, text)`。

### 3. onRenderStream (SlotStreamRenderer)

对流式输出执行 `applyRegexes(regexesOutput, data.output)`。

### 4. onRenderContent (SlotContentRenderer)

对 inputs 和 output 执行 `applyRegexes(regexesOutput, ...)`。

## applyRegexes 核心逻辑

```typescript
function applyRegexes(regexes: PresetRegexModel[], text?: string) {
    if (!text || text == '') return '';
    for (const regex of regexes) {
        text = text.replace(regex.pattern, regex.replacement);
    }
    return text;
}
```

注意：使用 `String.replace()`，第一个参数是字符串模式（非 RegExp 对象），每次替换只替换第一个匹配项。需要全局替换时在 pattern 中加 `g` 标志。

## 依赖声明

`requires: ["lorebook"]` — 正则替换在世界书匹配之后执行，确保替换后的文本也能参与后续的宏替换。

## 存储

服务端通过 `presetStorage.register(createSimpleStorageProvider("regex", "regexes", presetRepository))` 注册。
