# Scripts 引擎 — 使用指南

## 编写预设脚本

在预设编辑器的 Script 标签中添加 JavaScript 代码。脚本会被注入到对话 iframe 中执行。

### 监听消息

```js
// 预设脚本示例
window.addEventListener("message", (event) => {
    const { type, data } = event.data;

    switch (type) {
        case "renderContent":
            // 完整渲染：收到 inputs（历史消息数组）和 output（当前输出）
            renderPage(data.inputs, data.output);
            break;

        case "streamContent":
            // 流式渲染：收到的 output 会逐字增长
            updateOutput(data.output);
            break;

        case "variables":
            // 变量更新
            updateStatusBar(data);
            break;
    }
});
```

### 完整示例：简单聊天界面

```js
window.addEventListener("message", (event) => {
    const { type, data } = event.data;

    if (type === "renderContent") {
        // 清空并重建整个页面
        document.body.innerHTML = `
            <div id="chat-container">
                <div id="messages"></div>
                <div id="status-bar"></div>
            </div>
        `;

        const messagesEl = document.getElementById("messages");
        data.inputs.forEach((input, i) => {
            messagesEl.innerHTML += `<div class="msg user">${input}</div>`;
        });
        if (data.output) {
            messagesEl.innerHTML += `<div class="msg assistant">${data.output}</div>`;
        }
    }

    if (type === "streamContent") {
        // 只更新输出部分
        const outputEl = document.getElementById("current-output");
        if (outputEl) {
            outputEl.innerHTML = data.output;
        }
    }

    if (type === "variables") {
        // 更新状态栏
        const statusEl = document.getElementById("status-bar");
        if (statusEl) {
            statusEl.innerHTML = JSON.stringify(data, null, 2);
        }
    }
});
```

## 消息类型参考

| type | 触发 | data |
|---|---|---|
| `renderContent` | 翻页、初始加载 | `{ inputs: string[], output: string }` |
| `streamContent` | AI 逐字输出时 | `{ output: string }` |
| `variables` | 每次渲染 | 当前变量表 |

## priority（优先级）

多个预设的脚本按 `priority` 排序后拼接。数值小的先注入。如果需要脚本在某个脚本之后运行，设置更高的 priority。

## 注意事项

- 脚本在 iframe 沙箱中运行，无法访问主应用的 DOM 或 API Key
- 不要在脚本中执行耗时操作，会阻塞 iframe 的 UI 线程
- `streamContent` 每收到一个文本块就触发一次，注意去抖/节流
- `renderContent` 会触发后注入新脚本可能覆盖旧 DOM，建议脚本做幂等处理
