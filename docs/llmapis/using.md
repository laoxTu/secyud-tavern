# LlmApis 模块 — 使用指南

## 管理 LLM API 配置

### 创建 API 配置

1. 进入 Business 仪表板的 "LLM API" 标签
2. 点击"创建"
3. 填写：
   - **Code**：唯一标识符（如 `my-deepseek`）
   - **Name**：显示名称
   - **Version**：语义版本号（如 `1.0.0`）
   - **Provider**：选择服务商（如 `deepseek`）
   - **API Key**：服务商提供的 API 密钥

### 编辑服务商配置

选择 Provider 后，对应的配置组件会自动加载。以 Deepseek 为例：
- **Model**：选择模型（`deepseek-v4-flash` 或 `deepseek-v4-pro`）
- **Temperature**：0-2，控制输出随机性
- **Top-P**：0-1，核采样参数
- **Thinking**：启用推理模式（控制 `reasoning_effort` 而非 temperature）
- **Stream**：是否流式输出
- **Logprobs**：是否返回对数概率

### API Key 安全

- API Key 在保存时自动加密
- 仅在服务器端发起 LLM API 调用时解密
- 导出的配置文件中 API Key 会被自动清除
- 预设脚本无法访问 API Key

## API 端点

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/llmapis` | GET | 分页列表（支持模糊搜索） |
| `/api/llmapis` | POST | 创建新配置 |
| `/api/llmapis/{id}` | GET | 获取配置详情 |
| `/api/llmapis/{id}` | PUT | 更新配置（自动加密 API Key） |
| `/api/llmapis/{id}` | DELETE | 删除配置 |
| `/api/llmapis/{id}/export` | GET | 导出为 JSON（不含 Key） |
| `/api/llmapis/{id}/entries/{type}` | GET, POST | 子条目列表/创建 |
| `/api/llmapis/{id}/entries/{type}/{entryId}` | PUT, DELETE | 子条目更新/删除 |
| `/api/llmapis/{id}/chat` | POST | **AI 聊天**（SSE 流式响应） |

## 聊天 API 调用

### 请求格式

```ts
POST /api/llmapis/{id}/chat
Content-Type: application/json

{
    "messages": [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": "Hello!" }
    ]
}
```

### 响应格式

响应为 SSE 流（`text/event-stream`）：
- 流式模式：逐块推送 AI 生成文本
- 非流式模式：每 300ms 心跳，完整响应一次性推送

### 在代码中调用

```ts
const response = await post(`/llmapis/{id}/chat`, {
    messages: [
        { role: "system", content: openingRemarks },
        { role: "user", content: "Hello" },
    ]
}, {
    params: { id: llmapiId },
});

// 读取流
for await (const chunk of readStream(response.body)) {
    // 逐块处理
    updateIframe(chunk);
}
```

## 使用 LlmapiCombobox

在其他模块中选择 LLM API：

```tsx
import { LlmapiCombobox } from "@/llmapis/client/combobox";

<LlmapiCombobox
    name="llmapi"
    defaultValue={model?.llmapi ? [JSON.stringify(model.llmapi)] : []}
/>
```

它自动搜索 API（`GET /llmapis?search=...`，300ms 去抖），并将选中值序列化为 JSON 字符串。

## 添加新的 LLM 服务商

### 1. 实现 LlmapiEngine（服务端）

```ts
// src/engines/my-provider/server/engine.ts
import { LlmapiEngine, LlmapiRequestContext } from "@/llmapis/server/engine-models";

export class MyProviderEngine implements LlmapiEngine {
    id = "my-provider";

    async run(context: LlmapiRequestContext): Promise<ReadableStream> {
        // 调用服务商 API，返回 ReadableStream
        return new ReadableStream({
            async start(controller) {
                const response = await fetch("https://api.my-provider.com/chat", {
                    headers: { Authorization: `Bearer ${context.apiKey}` },
                    body: JSON.stringify({ messages: context.messages, ...context.config }),
                });
                // 将响应流式传输
                const reader = response.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    controller.enqueue(value);
                }
                controller.close();
            }
        });
    }
}
```

### 2. 实现 LlmapiConfig（客户端）

```tsx
// src/engines/my-provider/client/config.tsx
import { LlmapiConfig } from "@/llmapis/client/config-models";

export const myProviderConfig: LlmapiConfig = {
    id: "my-provider",
    component: ({ model, defaultValue }) => (
        <div>
            <Field>
                <FieldLabel>Model</FieldLabel>
                <Input name="model" defaultValue={defaultValue?.model} />
            </Field>
        </div>
    ),
    getValue: (data: FormData) => ({
        model: data.get("model"),
    }),
};
```

### 3. 实现 LlmapiInputBuilder（客户端）

```ts
// src/engines/my-provider/client/input-builder.ts
import { LlmapiInputBuilder } from "@/llmapis/client/input-builder-models";

export const myProviderInputBuilder: LlmapiInputBuilder = {
    id: "my-provider",
    async onBuildInput(ctx) {
        // 自定义消息构建逻辑
        return ctx.content.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));
    },
};
```

### 4. 注册

```ts
// 服务端 index.ts
llmapiEngineRegistry.register(new MyProviderEngine());

// 客户端 index.ts
llmapiConfigRegistry.register(myProviderConfig);
llmapiInputBuilderManager.register(myProviderInputBuilder);
```
