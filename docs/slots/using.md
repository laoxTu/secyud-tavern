# Slots 模块 — 使用指南

## 加载 Slot

Slot 通过聚合 API 获取：

```ts
const slot = await get("/stories/{id}/slot", {
    params: { id: storyId }
});

// slot = {
//     id, name, content,
//     story: StoryModel,
//     presets: PresetModel[],
//     llmapi: LlmapiModel,
// }
```

## ConversationManager 使用

### 获取单例

```ts
import { conversationManager } from "@/slots/client/conversation";

// 遍历所有 ConversationProvider（按拓扑排序）
await conversationManager.use(async (provider) => {
    await provider.onInitialize?.(ctx);
});
```

### 注册新的 ConversationProvider

```ts
import { ConversationProvider } from "@/slots/client/conversation-models";

const myProvider: ConversationProvider = {
    id: "my-provider",
    requires: ["lorebook"],  // 在 lorebook 之后执行

    async onInitialize(ctx) {
        // 初始化逻辑
    },

    async onRenderPage(ctx) {
        // 页面渲染逻辑
        ctx.document.body.innerHTML += "<div>Custom Content</div>";
    },
};

conversationManager.register(myProvider);
```

## 生命周期上下文

### SlotContextBase（所有上下文的基础）

```ts
interface SlotContextBase {
    slot: SlotModel;
    content: Record<string, any>;
}
```

### RenderContext（渲染阶段）

```ts
interface RenderContext extends SlotContextBase {
    document: Document;                    // iframe.contentDocument
    window: Window;                        // iframe.contentWindow
    history: StoryHistory[];              // 对话历史
    variables: Record<string, any>;       // 当前变量表
}
```

### 在 onRenderPage 中操作 iframe DOM

```ts
async onRenderPage(ctx: RenderContext) {
    const doc = ctx.document;

    // 创建元素
    const div = doc.createElement("div");
    div.className = "custom-container";
    div.innerHTML = renderHistory(ctx.history);

    // 追加到 body
    doc.body.appendChild(div);

    // 注入样式
    const style = doc.createElement("style");
    style.textContent = ".custom-container { color: red; }";
    doc.head.appendChild(style);
}
```

### 在 onRenderStream 中实时渲染

```ts
async onRenderStream(ctx: RenderStreamContext) {
    // 获取 AI 输出元素
    const outputEl = ctx.document.getElementById("ai-output");
    if (outputEl) {
        // 应用正则替换后更新内容
        outputEl.textContent = applyRegexes(ctx.stream, regexes);
    }
}
```

## 变量操作

### 获取当前变量

```ts
import { generateCurrentVariables } from "@/slots/client/conversation";

const variables = generateCurrentVariables(history, true);
// { "time": { "hour": 23 }, "location": "tavern", ... }
```

### 应用变量补丁

```ts
import { applyPatch } from "@/stories/models";

let vars = {};
vars = applyPatch(vars, [
    { op: "add", path: "time.hour", value: 23 },
    { op: "replace", path: "location", value: "tavern" },
    { op: "remove", path: "temp_var" },
]);
```

### 提取 AI 回复中的变量变更

AI 回复中的变量变更通过标签包裹：

```text
<variable_changes>
{
  "time": { "hour": 23 },
  "location": "tavern",
  "alice.cat-girl.mood": "happy"
}
</variable_changes>
```

```ts
import { extractVariableChanges } from "@/stories/models";

// 返回: { content: "cleaned text", variableChanges: [...] }
const result = extractVariableChanges(history, aiResponse);
```

## LlmapiMessage 格式

```ts
// 构建 LLM 请求消息
const messages: LlmapiMessage[] = [
    {
        role: "system",
        content: "You are Alice, a cat-girl tavern keeper..."
    },
    {
        role: "user",
        content: "Hello, what drinks do you have?"
    },
    {
        role: "assistant",
        content: "Welcome to the Cat's Paw Tavern! We have..."
    },
];

// 发送
const response = await post(`/llmapis/{id}/chat`, {
    messages,
}, { params: { id: slot.llmapi.id } });
```

## 完整会话流程示例

```ts
// 1. 加载 Slot
const slot = await get("/stories/{id}/slot", { params: { id: storyId } });

// 2. 初始化引擎
const ctx = { slot, content: {} };
await conversationManager.use(provider => provider.onInitialize?.(ctx));

// 3. 获取开场历史
const openingHistory = getOpeningHistory(slot);

// 4. 渲染页面
const renderCtx = { ...ctx, document: iframeDoc, window: iframeWin, history: [openingHistory], variables: {} };
await conversationManager.use(provider => provider.onRenderPage?.(renderCtx));

// 5. 用户发消息
const input: StoryInputMessage = { id: uuid(), content: "Hello!", variables: [] };
const history = [{ ...openingHistory, inputs: [input] }];

// 6. 处理输入
const inputCtx = { ...ctx, history, messages: [] };
await conversationManager.use(provider => provider.onProcessInput?.(inputCtx));

// 7. 发送给 AI 并流式渲染
const response = await post(`/llmapis/{id}/chat`, { messages: inputCtx.messages }, { params: { id: slot.llmapi.id } });
for await (const chunk of readStream(response.body)) {
    // 实时更新 iframe
}
```
