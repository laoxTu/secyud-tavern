# App 模块 — 设计文档

## 概述

`src/app/` 是 Next.js App Router 的页面与 API 路由目录。它同时承载**前端 UI 页面**和**后端 RESTful API**，是 Secyud Tavern 应用的入口层。

## 设计理念

### 文件系统即路由

利用 Next.js App Router 的约定式路由，目录结构直接映射 URL 路径：

```
src/app/
├── page.tsx                    → GET /
├── layout.tsx                  → 根布局（包裹所有页面）
├── business/
│   ├── layout.tsx              → /business 布局
│   ├── page.tsx                → /business 仪表板
│   └── stories/[id]/page.tsx   → /business/stories/:id 交互页
└── api/
    ├── stories/                → /api/stories 系列
    ├── presets/                → /api/presets 系列
    └── llmapis/                → /api/llmapis 系列
```

### 薄路由 + 工厂模式

API 路由处理器本身不包含业务逻辑。它们通过 `src/app/api/template.ts` 中的工厂函数生成标准化 CRUD 处理程序，将真正的逻辑委托给 Repository 层和拦截器管道。

```ts
// 典型 API 路由结构
export const GET = interceptor.createRoute(
    generateGetModelListApi(storyRepository, conditionGenerator)
);
export const POST = interceptor.createRoute(
    generateCreateModelApi(storyRepository)
);
```

### 拦截器管道

每个 API 路由都通过 `interceptor.createRoute()` 包装，确保：
1. **参数解析**（`ParamInterceptor`）— 反序列化 searchParams 和请求体到共享 `records` 对象
2. **错误处理**（`ErrorInterceptor`）— 捕获 `BusinessError` 并序列化为标准 JSON 响应

## 架构图

```
浏览器请求
    │
    ▼
Next.js App Router (文件系统路由)
    │
    ├── 页面路由 (page.tsx / layout.tsx)
    │       │
    │       ├── PluginLayout (加载客户端插件)
    │       ├── NavigationMenu (Tab 导航)
    │       └── iframe 渲染 (故事交互页)
    │
    └── API 路由 (route.ts)
            │
            ├── interceptor.createRoute()
            │       │
            │       ├── ParamInterceptor → records.searchParams / records.body
            │       ├── ErrorInterceptor → 捕获 BusinessError
            │       └── 路由处理器 → Repository CRUD
            │
            └── 响应 (JSON / SSE 流 / 文件下载)
```

## 核心模块

### 1. API 模板工厂 (`api/template.ts`)

所有的 CRUD API 模式都抽象为可复用的工厂函数：

| 工厂函数 | 用途 |
|---|---|
| `generateGetModelListApi` | 分页列表（支持模糊搜索） |
| `generateGetModelApi` | 按 ID 获取实体（可选加载详情） |
| `generateCreateModelApi` | 创建实体（可选自定义验证） |
| `generateUpdateModelApi` | 更新实体（部分更新） |
| `generateDeleteModelApi` | 删除实体 |
| `generateExportModelApi` | 导出实体为 JSON 文件下载 |
| `generateGetEntryListApi` | 获取实体的子条目分页列表 |
| `generateCreateEntryApi` | 创建子条目 |
| `generateUpdateEntryApi` | 更新子条目 |
| `generateDeleteEntryApi` | 删除子条目 |
| `generateSetDisableEntryApi` | 切换子条目启用/禁用状态 |

所有工厂函数接受 `Repository<TModel>` 和一个可选的 `ConditionFunc` 用于自定义过滤。

### 2. 故事交互页面 (`business/stories/[id]/page.tsx`)

这是整个应用最复杂的页面组件，实现了完整的 AI 对话交互：

- **Slot 加载**：从服务器拉取完整的 Slot（故事 + 预设 + LLM API + 历史），调用 `conversationManager.use()` 初始化所有 ConversationProvider
- **iframe 渲染**：将对话内容渲染到沙箱 iframe 中，支持 CSS/JS 注入
- **流式聊天**：通过 SSE 流式获取 AI 回复，实时渲染到 iframe
- **变量管理**：解析 AI 回复中的 `<variable_changes>` 标签，提取变量补丁

### 3. 商业仪表板 (`business/page.tsx`)

基于 `businessNavigationManager` 的 Tab 式导航页面，各业务模块（Stories、Presets、LlmApis）通过注册 TabConfig 在此展示。

## Entity-API 对照表

| 实体 | API 路径 | 操作 |
|---|---|---|
| Stories | `/api/stories` | GET(列表), POST(创建) |
| Stories | `/api/stories/{id}` | GET, PUT, DELETE |
| Stories | `/api/stories/{id}/entries/{type}` | GET, POST |
| Stories | `/api/stories/{id}/entries/{type}/{entryId}` | PUT, DELETE, PUT(disabled) |
| Stories | `/api/stories/{id}/export` | GET(导出) |
| Stories | `/api/stories/{id}/slot` | GET(聚合 Slot) |
| Presets | `/api/presets` | GET, POST |
| Presets | `/api/presets/{id}` | GET, PUT, DELETE |
| Presets | `/api/presets/{id}/entries/{type}` | GET, POST |
| Presets | `/api/presets/{id}/entries/{type}/{entryId}` | PUT, DELETE, PUT(disabled) |
| Presets | `/api/presets/{id}/export` | GET(导出) |
| LlmApis | `/api/llmapis` | GET, POST |
| LlmApis | `/api/llmapis/{id}` | GET, PUT, DELETE |
| LlmApis | `/api/llmapis/{id}/entries/{type}` | GET, POST |
| LlmApis | `/api/llmapis/{id}/entries/{type}/{entryId}` | PUT, DELETE, PUT(disabled) |
| LlmApis | `/api/llmapis/{id}/export` | GET(导出) |
| LlmApis | `/api/llmapis/{id}/chat` | POST(AI 聊天, SSE 流) |

## 关键设计决策

1. **iframe 隔离渲染**：对话内容在 iframe 中渲染，隔离 CSS/JS 注入（引擎的 styles/scripts），防止污染主应用 UI
2. **SSE 流式响应**：AI 聊天响应采用 Server-Sent Events 流式传输，在 iframe 中实时逐字渲染
3. **API Key 加密**：LLM API Key 在 PUT 时通过 `Hasher` 加密存储，只在聊天请求时解密
