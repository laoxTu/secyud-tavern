# Styles 引擎使用指南

## 编写预设样式

在预设编辑器的 Style 标签中使用 Monaco 编辑器直接编写 CSS。样式会被注入到对话 iframe 的 `<head>` 中。

## 基础示例

```css
/* 对话界面暗色主题 */
body {
    background: #1a1a2e;
    color: #e0e0e0;
    font-family: "Microsoft YaHei", sans-serif;
    margin: 0;
    padding: 20px;
}

#chat-root {
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

#status {
    position: fixed;
    top: 0;
    right: 0;
    padding: 8px 12px;
    background: rgba(0,0,0,0.5);
    color: #888;
    font-size: 12px;
}
```

## priority 排序

CSS 按 `priority` 排序后拼接，值大的靠后（可覆盖值小的）。需要确保样式不被其他预设覆盖时，设置较大的 priority。

## 作用域隔离

避免多预设样式冲突 — 使用预设 code 作为类名前缀：

```css
.my-preset-code .msg {
    background: pink;
}

.my-preset-code .msg.assistant {
    font-style: italic;
}
```

## 注意事项

- CSS 注入到 iframe `<head>`，与主应用完全隔离
- 首次渲染时注入，后续翻页不会重复注入
- 多个预设的 CSS 被拼接在一起注入，按 priority 顺序
- 搭配 Scripts 引擎可实现动态样式切换（日间/夜间模式）
- 不要依赖 `!important`，会破坏多预设的层叠覆盖逻辑
