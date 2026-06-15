# Styles 引擎 — 使用指南

## 编写预设样式

在预设编辑器的 Style 标签中直接输入 CSS 代码。样式会被注入到对话 iframe 的 `<head>` 中。

### 基础示例

```css
/* 对话界面暗色主题 */
body {
    background: #1a1a2e;
    color: #e0e0e0;
    font-family: "Microsoft YaHei", sans-serif;
    margin: 0;
    padding: 20px;
}

#chat-container {
    max-width: 800px;
    margin: 0 auto;
}

.msg {
    padding: 12px 16px;
    margin: 8px 0;
    border-radius: 8px;
}

.msg.user {
    background: #16213e;
    text-align: right;
}

.msg.assistant {
    background: #0f3460;
    text-align: left;
}

#status-bar {
    position: fixed;
    top: 0;
    right: 0;
    padding: 8px 12px;
    font-size: 12px;
    background: rgba(0,0,0,0.5);
    color: #888;
}
```

### 使用预设 ID 做作用域

避免多个预设的样式冲突：

```css
/* 使用预设的 code 作为类名前缀 */
.alice-catgirl .msg {
    background: pink;
}

.alice-catgirl .msg.assistant {
    font-style: italic;
}
```

## priority（优先级）

CSS 按 priority 排序后拼接，值大的靠后（覆盖值小的）。如果需要确保你的样式不被其他预设覆盖，设置一个较大的 priority 值。

## 注意事项

- CSS 注入到 iframe 的 `<head>` 中，与主应用完全隔离
- 首次渲染时注入，后续翻页和流式输出不会重复注入
- 多个预设的 CSS 会被拼接在一起，同一选择器的样式按 priority 顺序覆盖
- 不要使用 `!important`，会破坏覆盖规则
- 搭配 Scripts 引擎可实现动态样式切换（如日间/夜间模式）
