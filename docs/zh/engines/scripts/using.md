# Scripts 引擎使用指南

## 编写预设脚本

在预设编辑器的 Script 标签中使用 Monaco 编辑器编写 JavaScript。

脚本被注入到 iframe `<body>` 的 `<script id="injected-scripts">` 标签中。

## 监听消息

```javascript
window.addEventListener("message", (event) => {
    const { type, data } = event.data;

    switch (type) {
        case "renderContent":
            // 完整渲染：data.inputs (历史消息数组) + data.output (当前输出)
            renderAll(data.inputs, data.output);
            break;

        case "streamContent":
            // 流式渲染：output 逐字增长
            updateStream(data.output);
            break;

        case "variables":
            // 变量更新
            updateHUD(data);
            break;
    }
});
```

## 完整示例：简单聊天界面

```javascript
// 初始化 DOM（幂等检查）
function ensureDOM() {
    if (document.getElementById("chat-root")) return;
    const root = document.createElement("div");
    root.id = "chat-root";
    root.innerHTML = `
        <div id="messages"></div>
        <div id="streaming"></div>
        <div id="status"></div>
    `;
    document.body.appendChild(root);
}
ensureDOM();

window.addEventListener("message", (event) => {
    const { type, data } = event.data;

    if (type === "renderContent") {
        const el = document.getElementById("messages");
        el.innerHTML = "";
        data.inputs.forEach(text => {
            const div = document.createElement("div");
            div.className = "msg user";
            div.textContent = text;
            el.appendChild(div);
        });
        if (data.output) {
            const div = document.createElement("div");
            div.className = "msg assistant";
            div.textContent = data.output;
            el.appendChild(div);
        }
        document.getElementById("streaming").textContent = "";
    }

    if (type === "streamContent") {
        document.getElementById("streaming").textContent = data.output;
    }

    if (type === "variables") {
        document.getElementById("status").textContent = JSON.stringify(data, null, 2);
    }
});
```

## 消息类型

| type | 触发时机 | data |
|---|---|---|
| `renderContent` | 翻页、初始加载 | `{ inputs: string[], output: string }` |
| `streamContent` | AI 逐字输出 | `{ output: string }` |
| `variables` | 每次渲染 | 当前变量表 `Record<string, any>` |

## priority 排序

多个预设脚本按 `priority` 排序后拼接。数值小的先注入到 `<script>` 中。

## 注意事项

- 脚本在 iframe 沙箱中运行，**无法访问主应用 DOM、API Key、数据库**
- **禁止 `document.body.innerHTML = ...`** — 会销毁注入的 `<script>` 标签自身。使用 `createElement` + `appendChild` 添加元素
- `renderContent` 触发频繁（翻页切换），做幂等检查（`getElementById` 检查元素是否存在）
- `streamContent` 每收到一个文本块就触发，注意性能
- 不要在脚本中执行耗时同步操作（会阻塞 iframe UI 线程）
