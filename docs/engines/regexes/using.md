# Regexes 引擎使用指南

## 添加正则规则

在预设编辑器的 Regex 标签中创建：

| 字段 | 说明 |
|---|---|
| pattern | 查找模式（JS 正则字符串，如 `/pattern/g`） |
| replacement | 替换文本 |
| target | `input` / `output` / `both` |

## 目标说明

| target | 替换时机 |
|---|---|
| `input` | 用户输入 → 发给 AI 之前 |
| `output` | AI 回复 → 展示给用户之前 |
| `both` | 输入和输出都生效 |

## 使用示例

### 清除 AI 格式标记

| pattern | replacement | target |
|---|---|---|
| `**` | (空) | output |
| `__` | (空) | output |
| `\n{3,}` | `\n\n` | output |

### 统一术语

| pattern | replacement | target |
|---|---|---|
| `color` | `colour` | both |

### 清除角色前缀

SillyTavern 风格的 `{{char}}:` 前缀：

| pattern | replacement | target |
|---|---|---|
| `\{\{char\}\}: ?` | (空) | output |

## 注意事项

- `pattern` 使用 `String.replace()`，**一次只替换第一个匹配**
- 需要全局替换时在正则中加 `g` 标志（如 `/pattern/g`）
- 输入方向替换在世界书匹配之前执行
- 输出方向替换在流式渲染和整页渲染时都执行
- 启用 `disabled` 可临时关闭某条规则
