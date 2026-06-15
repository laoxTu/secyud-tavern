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
// 初始化 DOM 结构（仅首次执行）
function ensureDOM() {
    if (!document.getElementById("chat-container")) {
        const container = document.createElement("div");
        container.id = "chat-container";

        const messages = document.createElement("div");
        messages.id = "messages";
        container.appendChild(messages);

        const statusBar = document.createElement("div");
        statusBar.id = "status-bar";
        container.appendChild(statusBar);

        const currentOutput = document.createElement("div");
        currentOutput.id = "current-output";
        container.appendChild(currentOutput);

        document.body.appendChild(container);
    }
}
ensureDOM();

window.addEventListener("message", (event) => {
    const { type, data } = event.data;

    if (type === "renderContent") {
        // 获取已有元素，更新内容
        const messagesEl = document.getElementById("messages");
        messagesEl.innerHTML = "";
        data.inputs.forEach((input) => {
            const div = document.createElement("div");
            div.className = "msg user";
            div.textContent = input;
            messagesEl.appendChild(div);
        });
        if (data.output) {
            const div = document.createElement("div");
            div.className = "msg assistant";
            div.textContent = data.output;
            messagesEl.appendChild(div);
        }
    }

    if (type === "streamContent") {
        // 只更新输出部分
        const outputEl = document.getElementById("current-output");
        if (outputEl) {
            outputEl.textContent = data.output;
        }
    }

    if (type === "variables") {
        // 更新状态栏
        const statusEl = document.getElementById("status-bar");
        if (statusEl) {
            statusEl.textContent = JSON.stringify(data, null, 2);
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
- **禁止 `document.body.innerHTML = ...`**：这会销毁注入的 `<script>` 标签自身，导致脚本丢失。应该用 `createElement` + `appendChild` 添加元素，用 `getElementById` 获取已有元素更新内容
- `renderContent` 在翻页和初始加载时触发，应做幂等处理（检查元素是否存在再创建）
- `streamContent` 每收到一个文本块就触发一次，注意去抖/节流
- 不要在脚本中执行耗时操作，会阻塞 iframe 的 UI 线程
