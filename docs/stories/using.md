# Stories 模块 — 使用指南

## 管理故事

### 创建故事

1. 进入 Business 仪表板的 "Stories" 标签
2. 点击"创建"
3. 填写：
   - **Name**：故事名称
   - **LLM API**：选择关联的 LLM 配置（可选）
   - **Requires**：选择需要的预设
   - **Opening Remarks**：开场白（AI 的系统提示词）

### 进入故事交互

点击故事列表中的跳转按钮（↘）进入交互页面 `/business/stories/{id}`。

## StoryModel 字段

```ts
interface StoryModel {
    id: string;                     // UUID
    name: string;                   // 故事名称
    requires: RequireModel[];       // [{code: "alice.cat-girl", version: "1.0.0"}]
    llmapi: RequireModel | null;    // {code: "my-deepseek", version: "1.0.0"}
    content: {
        openingRemarks?: string;    // 开场白 / 系统提示词
    };
    entries: {
        history?: StoryHistory[];   // 对话历史
    };
}
```

## 对话历史操作

### StoryHistory 结构

```ts
interface StoryHistory {
    id: string;
    outputId: number;                      // 当前选中的输出（多分支）
    summary?: string;                      // 摘要
    variables: Record<string, any>;       // 当前变量快照
    inputs: StoryInputMessage[];          // 输入列表
    outputs: StoryOutputMessage[];        // 输出列表
}
```

### 获取当前输出

```ts
import { getCurrentOutput } from "@/stories/models";

const output = getCurrentOutput(history);
// 根据 outputId 返回当前有效的输出
```

### 变量操作

```ts
import { applyPatch, extractVariableChanges } from "@/stories/models";

// 应用变量变更
let vars = { time: { hour: 12 } };
vars = applyPatch(vars, [
    { op: "replace", path: "time/hour", value: 14 },
    { op: "add", path: "location", value: "tavern" },
]);

// 从 AI 回复中提取变量变更
const aiResponse = `
Here is the updated state:
<variable_changes>
{
  "time.hour": 15,
  "alice.mood": "happy"
}
</variable_changes>
`;
const { content, variableChanges } = extractVariableChanges(history, aiResponse);
// content: "Here is the updated state:\n"
// variableChanges: [{op: "replace", path: "time.hour", value: 15}, ...]
```

### 变量路径规范

变量使用点号分隔的路径，支持深层嵌套：
- `time.hour` → `{ time: { hour: value } }`
- `alice.cat-girl.mood` → `{ alice: { "cat-girl": { mood: value } } }`

## API 端点

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/stories` | GET | 分页列表（支持模糊搜索 name） |
| `/api/stories` | POST | 创建故事 |
| `/api/stories/{id}` | GET | 获取详情（支持 `withDetails`） |
| `/api/stories/{id}` | PUT | 更新 |
| `/api/stories/{id}` | DELETE | 删除 |
| `/api/stories/{id}/export` | GET | 导出为 JSON |
| `/api/stories/{id}/slot` | GET | **获取完整 Slot**（故事 + 预设 + LLM + 历史） |
| `/api/stories/{id}/entries/history` | GET, POST | 历史列表/创建 |
| `/api/stories/{id}/entries/history/{entryId}` | PUT, DELETE | 历史更新/删除 |

## 程序化操作

```ts
import { get, post, put, del } from "@/client";

// 获取故事列表
const { data, totalCount } = await get("/stories", {
    params: { page: 0, pageSize: 20, search: "tavern" }
});

// 创建故事
const story = await post("/stories", {
    name: "Tavern Adventure",
    requires: [
        { code: "alice.cat-girl", version: "1.0.0" },
        { code: "world.fantasy", version: "2.0.0" },
    ],
    llmapi: { code: "my-deepseek", version: "1.0.0" },
    content: {
        openingRemarks: "You are in a magical tavern..."
    }
});

// 更新开场白
await put("/stories/{id}", {
    content: { openingRemarks: "Updated opening..." }
}, { params: { id: story.id } });

// 获取 Slot（运行时数据）
const slot = await get("/stories/{id}/slot", {
    params: { id: story.id }
});

// 导出故事
const response = await get(`/stories/{id}/export`, {
    params: { id: story.id }
});
```

## 隐藏消息

设置消息为不可见（不发送给 AI，但变量生效）：

```ts
const hiddenMessage: StoryInputMessage = {
    id: uuid(),
    content: "/set time.hour 22",
    variables: [{ op: "replace", path: "time.hour", value: 22 }],
    // invisible 标记在创建时设置
};
```

## 克隆和导入

```ts
// 克隆故事
await post("/stories", {
    name: "Copy of Tavern Adventure",
    // 不传 requires 等，从原始故事复制
});
```
