# Scripts Engine Usage Guide

## Writing Preset Scripts

Write JavaScript in the Script tab of the preset editor using the Monaco editor.

The script is injected into the iframe `<body>` inside a `<script id="injected-scripts">` tag.

## Listening for Messages

```javascript
window.addEventListener("message", (event) => {
    const { type, data } = event.data;

    switch (type) {
        case "renderContent":
            // Full render: data.inputs (history message array) + data.output (current output)
            renderAll(data.inputs, data.output);
            break;

        case "streamContent":
            // Stream render: output grows character by character
            updateStream(data.output);
            break;

        case "variables":
            // Variable update
            updateHUD(data);
            break;
    }
});
```

## Complete Example: Simple Chat Interface

```javascript
// Initialize DOM (idempotent check)
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

## Message Types

| type | Trigger | data |
|---|---|---|
| `renderContent` | Page navigation, initial load | `{ inputs: string[], output: string }` |
| `streamContent` | AI streaming output | `{ output: string }` |
| `variables` | Every render | Current variable table `Record<string, any>` |

## Priority Sorting

Multiple preset scripts are concatenated after sorting by `priority`. Lower values are injected earlier into the `<script>` tag.

## Notes

- Scripts run inside the iframe sandbox and **cannot access the main application DOM, API Key, or database**
- **Do not do `document.body.innerHTML = ...`** — this destroys the injected `<script>` tag itself. Use `createElement` + `appendChild` to add elements
- `renderContent` fires frequently (page navigation), so perform idempotent checks (`getElementById` to check if elements already exist)
- `streamContent` fires on every received text chunk — be mindful of performance
- Do not perform long synchronous operations in scripts (will block the iframe UI thread)
