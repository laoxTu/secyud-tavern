# LlmApis 模块使用指南

## 管理 LLM API 配置

在 Business 仪表板的 "LLM API" 标签中创建和编辑配置：
- **Code**：唯一标识符（如 `my-deepseek`）
- **Name**：显示名称
- **Version**：语义版本号
- **Provider**：选择服务商（deepseek / openai）
- **API Key**：服务商 API 密钥（自动加密存储）

## API 端点

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/llmapis` | GET | 分页列表（支持 name/code 模糊搜索） |
| `/api/llmapis` | POST | 创建配置（code 唯一性检查） |
| `/api/llmapis/{id}` | GET | 获取详情 |
| `/api/llmapis/{id}` | PUT | 更新（自动加密 API Key） |
| `/api/llmapis/{id}` | DELETE | 删除 |
| `/api/llmapis/{id}/export` | GET | 导出为 JSON 下载 |
| `/api/llmapis/import` | POST | 导入 JSON 文件（upsert） |
| `/api/llmapis/{id}/entries/{type}` | GET, POST | 子条目列表/创建 |
| `/api/llmapis/{id}/entries/{type}/{entryId}` | PUT, DELETE | 子条目更新/删除 |
| `/api/llmapis/{id}/entries/{type}/{entryId}/disabled` | PUT | 切换禁用 |
| `/api/llmapis/{id}/chat` | POST | AI 聊天（SSE 流式响应） |

## 聊天 API

### 请求

```typescript
POST /api/llmapis/{id}/chat
Content-Type: application/json

{
    "messages": [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": "Hello!" }
    ]
}
```

### 响应

`text/event-stream` SSE 流：
- 流式模式：逐 token 推送，实时渲染
- 非流式模式：每 300ms 发送心跳，完成后一次性推送完整响应
- 响应头：`Cache-Control: no-cache`, `Connection: keep-alive`

### 客户端消费

```typescript
import { readStream } from "@/utils";

const response = await fetch(`/api/llmapis/${id}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
});

for await (const chunk of readStream(response.body)) {
    // chunk 是已解析的 JSON 对象
    updateIframe(chunk);
}
```

## 添加新的 LLM 服务商

### 1. 实现 LlmapiEngine（服务端）

```typescript
// src/engines/my-provider/server/engine.ts
import { LlmapiEngine, LlmapiRequestContext } from "@/llmapis/server/engine-models";

export class MyEngine implements LlmapiEngine {
    id = "my-provider";

    async run(context: LlmapiRequestContext): Promise<ReadableStream> {
        return new ReadableStream({
            async start(controller) {
                // 调用服务商 API
                // controller.enqueue(chunk)
                controller.close();
            }
        });
    }
}
```

### 2. 注册服务端引擎

```typescript
// src/engines/my-provider/server/index.ts
import { llmapiEngineRegistry } from "@/llmapis/server/engine";

export function registerMyProviderServer() {
    llmapiEngineRegistry.register(new MyEngine());
}
```

### 3. 实现客户端配置 UI

```typescript
// src/engines/my-provider/client/config.tsx
export const myConfig: LlmapiConfig = {
    id: "my-provider",
    Content: MyConfigComponent,
    getValue: (data: FormData) => ({ /* 解析表单数据 */ }),
};
```

### 4. 注册客户端

```typescript
// src/engines/my-provider/client/index.ts
export function registerMyProviderClient() {
    llmapiConfigRegistry.register(myConfig);
}
```

### 5. 在启动流程中注册

在 `src/server-registerer.ts` 和 `src/client-registerer.ts` 中添加对新引擎的注册调用。
