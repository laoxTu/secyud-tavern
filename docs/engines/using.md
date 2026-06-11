# Engines 模块 — 使用指南

## 创建新引擎

### 1. 目录结构

```
src/engines/my-engine/
├── models.ts                        # 共享类型
├── server/
│   ├── index.ts                     # 注册服务端
│   └── storage.ts                   # 数据存储（如果是预设引擎）
└── client/
    ├── index.ts                     # 注册客户端
    ├── preset-tab.tsx               # 预设编辑 UI（如果是预设引擎）
    └── conversation.ts              # ConversationProvider
```

### 2. 定义模型

```ts
// models.ts
import { EntryModel } from "@/business/models";

export const engineName = "my-engine";
export const engineArrayName = "my-engines";

export interface PresetMyEngineModel extends EntryModel {
    myField: string;
    priority: number;
}
```

### 3. 创建预设引擎（带存储的引擎）

**服务端存储**：

```ts
// server/storage.ts
import { createSimpleStorageProvider } from "@/business/server/storage-models";
import { presetRepository } from "@/presets/server/repository";
import { engineName, engineArrayName } from "../models";

export const myEngineStorage = createSimpleStorageProvider<PresetModel>(
    engineName,
    engineArrayName,
    presetRepository
);
```

**服务端注册**：

```ts
// server/index.ts
import { presetStorage } from "@/presets/server/storage";
import { myEngineStorage } from "./storage";

export function registerMyEngineServer() {
    presetStorage.register(myEngineStorage);
}
```

**客户端预设编辑标签**：

```tsx
// client/preset-tab.tsx
import { EntryListTemplate } from "@/components/template/entry-list-template";
import { engineName, engineArrayName } from "../models";

export function MyEnginePresetTab() {
    return (
        <EntryListTemplate<PresetModel>
            modelType={engineName}
            modelApi="presets"
            contextType={PresetContext}
            entryType={engineArrayName}
            updateEntryContent={(entry) => (
                <>
                    <Input name="myField" defaultValue={entry?.myField} />
                    <Input name="priority" type="number" defaultValue={entry?.priority} />
                </>
            )}
        />
    );
}
```

**ConversationProvider**：

```ts
// client/conversation.ts
import { ConversationProvider, SlotInitializeContext, RenderPageContext } from "@/slots/client/conversation-models";
import { engineName } from "../models";

export const myEngineConversationProvider: ConversationProvider = {
    id: engineName,
    requires: ["lorebook"],  // 依赖声明

    async onInitialize(ctx: SlotInitializeContext) {
        // 从 slot 中提取本引擎数据
        const items = ctx.slot.presets
            .flatMap(p => p.entries?.[engineArrayName] ?? []);
        ctx.content[engineArrayName] = items;
    },

    async onProcessInput(ctx) {
        // 在发送给 AI 之前处理输入
    },

    async onProcessOutput(ctx) {
        // 处理 AI 输出
    },

    async onRenderPage(ctx: RenderPageContext) {
        // 渲染页面内容到 iframe
        ctx.document.body.innerHTML += `<div>My Engine Output</div>`;
    },

    async onRenderStream(ctx) {
        // 流式渲染
    },
};
```

**客户端注册**：

```ts
// client/index.ts
import { presetTabManager } from "@/presets/client/tabs";
import { conversationManager } from "@/slots/client/conversation";
import { engineName } from "../models";
import { MyEnginePresetTab } from "./preset-tab";
import { myEngineConversationProvider } from "./conversation";

export function registerMyEngineClient() {
    presetTabManager.register({
        id: engineName,
        label: () => <span>My Engine</span>,
        component: MyEnginePresetTab,
    });
    conversationManager.register(myEngineConversationProvider);
}
```

### 4. 注册到系统

在 `src/client-registerer.ts` 和 `src/server-registerer.ts` 中添加注册调用。

## Deepseek API 配置

### 可配置参数

```ts
interface DeepseekConfigModel {
    model: string;                    // "deepseek-v4-flash" | "deepseek-v4-pro"
    temperature: number;              // 0-2
    top_p: number;                    // 0-1
    stream: boolean;                  // 是否流式输出
    logprobs: boolean;
    reasoning_effort?: string;        // 推理深度（开启 thinking 时生效）
}
```

### 在 UI 中配置

在 LLM API 编辑页面，选择 provider 为 "deepseek" 后，配置表单自动加载 DeepseekConfig 组件，提供：
- 模型选择
- Temperature / Top-P 滑块
- Thinking（推理模式）开关
- Stream 开关
- Logprobs 开关

## 世界书匹配配置

### 匹配类型

| 类型 | 说明 | 配置 |
|---|---|---|
| always | 始终激活 | `lastMessage` — 是否仅在最后一条消息时生效 |
| normal | 关键字匹配 | `keywords: string[][]` — 二维数组（与或逻辑），`fitCount` — 需满足的组数 |
| event | 关键字 + 时间 | 同 normal + `minDate`/`maxDate` 日期范围 |

### 关键字编辑

在预设编辑器的世界书 Tab 中，使用多选芯片输入每组关键字：

- 同一组的关键字用 **OR** 连接（满足任意一个即匹配该组）
- 不同组之间用 **AND** 连接（需同时满足 fitCount 个组）

示例：`[["cat", "dog"], ["happy", "sad"]]` + `fitCount: 2`
→ 消息必须同时包含 (cat 或 dog) 和 (happy 或 sad)

## 正则替换配置

```ts
interface PresetRegexModel {
    pattern: string;       // 正则表达式模式
    replacement: string;   // 替换文本
    target: "input" | "output" | "both";  // 作用目标
    layerMin?: number;     // 最小层数（0 = 当前消息）
    layerMax?: number;     // 最大层数（null = 不限制）
}
```

层数计数从最新消息开始：
- `layerMin: 0, layerMax: 5` → 对最近 6 条消息生效
- `layerMin: 6, layerMax: null` → 对第 7 条及更早的消息生效

## 样式和脚本

### 样式（CSS）

```ts
interface PresetStyleModel {
    content: string;    // CSS 文本
    priority: number;   // 优先级（越高越先注入）
}
```

CSS 通过 `<style id="injected-styles">` 注入到 iframe 的 `<head>`。

### 脚本（JS）

```ts
interface PresetScriptModel {
    content: string;    // JavaScript 文本
    priority: number;   // 优先级
}
```

JS 通过 `<script id="injected-scripts">` 注入到 iframe 的 `<body>`。变量通过 `window.postMessage({ type: "variables", data })` 传递。
