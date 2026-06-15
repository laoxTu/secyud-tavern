# Regexes 引擎 — 使用指南

## 添加正则规则

在预设编辑器的 Regex 标签中创建规则：

| 字段 | 说明 |
|---|---|
| **pattern** | 查找模式（JavaScript 正则表达式字符串） |
| **replacement** | 替换文本 |
| **target** | 作用目标：`input` / `output` / `both` |

## 目标说明

| target | 替换时机 |
|---|---|
| `input` | 用户输入 → 发给 AI 之前 |
| `output` | AI 回复 → 展示给用户之前 |
| `both` | 输入和输出都生效 |

## 使用示例

### 清除 AI 格式标记

很多 AI 会在回复中输出 markdown 标记。用正则清除：

| pattern | replacement | target |
|---|---|---|
| `**` | *(空)* | output |
| `__` | *(空)* | output |
| `\n{3,}` | `\n\n` | output |

### 统一术语

| pattern | replacement | target |
|---|---|---|
| `color` | `colour` | both |
| `dialog` | `dialogue` | both |

### 清除角色名格式

SillyTavern 风格的 `{{char}}:` 前缀：

| pattern | replacement | target |
|---|---|---|
| `\{\{char\}\}: ?` | *(空)* | output |

### 调试用：查看原始输出

在 target 选 `output`，pattern 留空，replacement 留空，暂时不替换任何内容。方便对比替换前后的效果。

## 注意事项

- `pattern` 使用 `String.replace()` 执行，**一次只替换第一个匹配**
- 如需全局替换，在正则中加 `g` 标志：`/pattern/g`
- 输入方向的替换在消息构建前执行，替换后的文本会参与世界书匹配和宏替换
- 输出方向的替换在流式渲染和整页渲染时都执行

## 禁用条目

将 `disabled` 设为 true 可临时关闭某条规则而不删除。
