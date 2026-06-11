# Secyud Tavern — 架构设计

## 概述

Secyud Tavern 是一个 AI 驱动的角色扮演与互动叙事平台。它将角色设定、世界书、正则规则、主题样式和交互脚本打包为单一预设文件，通过可插拔引擎系统和变量驱动的状态管理，提供完整的 AI 对话体验。

## 系统全景

```
┌─────────────────────────────────────────────────────────────┐
│                    浏览器 (React 19)                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Business │  │ Presets  │  │   Stories   │  │  LlmApis  │ │
│  │  仪表板   │  │  编辑器   │  │  故事管理    │  │  API 配置  │ │
│  └──────────┘  └──────────┘  └────────────┘  └───────────┘ │
│        │              │              │               │       │
│        └──────────────┴──────────────┴───────────────┘       │
│                           │                                  │
│                    Template 泛型组件                          │
│              (列表/编辑/条目 CRUD 页面模板)                    │
│                           │                                  │
│                    ConversationManager                        │
│              (引擎生命周期编排 — 拓扑排序)                     │
│                           │                                  │
│               ┌───────────┼───────────┐                      │
│          Lorebook →  Regex  →  Script                       │
│            (匹配)     (替换)    (JS注入)   Styles (CSS注入)   │
│                           │                                  │
│                     iframe 沙箱渲染                           │
└─────────────────────────────────────────────────────────────┘
                           │ REST API + SSE
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Interceptor 拦截器管道                        │   │
│  │  ParamInterceptor → ErrorInterceptor → RouteHandler  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          API 模板工厂 (template.ts)                    │   │
│  │  generateGetModelListApi / generateCreateModelApi ... │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│               ┌───────────┼───────────┐                      │
│          Repository  →  Storage  →  Database                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite (Drizzle ORM)                      │
│                                                             │
│   stories / presets / llmapis / storyEntries / presetEntries │
│                    (Master-Entry 主从表结构)                   │
└─────────────────────────────────────────────────────────────┘
```

## 一、预设系统

### 设计理念

Secyud Tavern 的预设与传统 AI 对话平台有本质区别。SillyTavern 等平台中，角色卡、世界书、主题样式、脚本逻辑是相互独立的模块，用户需要分别导入和管理。Secyud Tavern 将预设设计为**自包含的功能包** — 一个预设文件同时包含上述所有内容。

**核心理念：**

- **打包即分发**：一个 JSON 文件包含所有相关内容，降低分发和安装成本
- **多核并联**：用户可以同时激活多个预设，引擎不做冲突处理，由预设作者通过命名约定自行规避
- **约定优于配置**：通过 ID 命名规范（`作者.预设名`）和 CSS 作用域隔离来避免冲突
- **引擎搭台**：预设系统提供加载、检索、注入的基础能力，不干预预设内部的逻辑

### 管理与使用分离

预设的生命周期分为两条独立线路：

| 线路 | 触发方式 | 数据流向 | 持久化 | 目的 |
|---|---|---|---|---|
| **管理线** | 预设编辑器操作 | 前端 → API → SQLite | 是 | 预设的增删改查 |
| **使用线** | 加载存档 / 点击重载 | API → 前端内存 | 否 | 构建运行时引擎 |

**管理线**保证数据一致性，编辑预设不影响当前运行中的会话。

**使用线**在以下时机触发：
1. 用户加载一个存档
2. 用户在设置界面点击"重载预设"

触发后，前端读取当前的预设列表 → 向服务器批量获取预设完整数据 → 在内存中构建运行时引擎 → 合并世界书、注入样式、执行脚本。整个过程在浏览器内存中完成，断网后仍可继续会话。

### 数据模型

```ts
interface PresetModel {
    id: string;                    // UUID
    code: string;                  // 唯一标识符（如 "alice.cat-girl"）
    version: string;               // 语义版本号
    name: string;                  // 显示名称
    tags: string[];                // 分类标签
    requires: RequireModel[];      // 依赖的其他预设 [{code, version}]
    content: { author?, description? };
    entries: {
        lorebooks: PresetLorebookModel[];   // 世界书条目
        regexes: PresetRegexModel[];        // 正则替换规则
        scripts: PresetScriptModel[];       // JavaScript 脚本
        styles: PresetStyleModel[];         // CSS 样式块
    };
}
```

### 数据库存储

```
presets (主表)
├── id, name, content (继承 masterTable)
├── code (text, unique)
├── version (text)
├── tags (JSON text[])
└── requires (JSON RequireModel[])

presetEntries (子表)
├── entryType = "lorebooks" | "regexes" | "scripts" | "styles"
└── FK → presets.id (ON DELETE CASCADE)
```

## 二、引擎系统

### 五大引擎

| 引擎 | 功能 | 运行时角色 |
|---|---|---|
| **Lorebook** | 世界书 — 条件性背景知识注入 | 关键字/事件匹配 → 激活相关知识条目 |
| **Regex** | 文本转换 — 查找替换预处理/后处理 | 输入/输出正则替换（层数范围控制） |
| **Script** | 用户脚本 — JS 注入 | `<script>` 注入 iframe，变量通过 postMessage 传递 |
| **Style** | 主题 — CSS 注入 | `<style>` 注入 iframe head，按优先级排序 |
| **Deepseek** | AI 推理 — LLM API 适配器 | 服务端 API 调用 + 流式响应 |

### 注册表驱动的插件架构

引擎不通过硬编码集成，而是向中央注册表自我注册：

```
启动时:
  client-registerer.ts → 调用各引擎的 registerXxxClient()
  server-registerer.ts → 调用各引擎的 registerXxxServer()
```

**依赖链**（通过拓扑排序保证执行顺序）：

```
Lorebook (无依赖) → Regex (requires: ["lorebook"]) → Script (requires: ["regex"])
                                                       Style (独立运行)
```

### ConversationProvider 生命周期

非 LLM 引擎实现统一的生命周期钩子，由 `ConversationManager` 按拓扑排序调度：

```
1. onInitialize  → 解析预设、分组数据、初始化引擎状态
2. onProcessInput → 世界书匹配 → 正则替换 → 构建 LLM 消息
3. onProcessOutput → 变量提取 → 历史记录更新
4. onRenderPage  → 完整页面渲染（注入 CSS/JS，渲染历史）
5. onRenderStream → 流式增量渲染（AI 逐字输出时实时更新 iframe）
```

### 世界书匹配系统

三种匹配策略均以插件形式注册：

| 匹配器 | 触发条件 |
|---|---|
| **always** | 始终激活（可选"仅最后一条消息"） |
| **normal** | 关键字 AND/OR 逻辑匹配 |
| **event** | 关键字 + 日期范围匹配 |

新增匹配策略只需注册到 `lorebookMatcherRegistry`，无需修改引擎代码。

## 三、存档系统

### 变量驱动状态

Secyud Tavern 的存档记录完整的对话历史和变量演变轨迹。区别于依赖 AI 上下文记忆的传统方案，它采用结构化的变量表：

```
每轮对话:
  AI 回复
  └── <variable_changes>
      { "time.hour": 23, "alice.mood": "happy" }
      </variable_changes>
  
  存储:
  ├── variables (根节点): 最新状态快照 — 加载时直接读取
  └── variableChanges (每条消息): 增量变更 — 删除消息时重放重建
```

**变量操作**：
- **加载存档**：直接读取根节点 `variables` 作为当前运行时变量表
- **删除消息**：从空变量表重放该消息之前所有消息的 `variableChanges`，重建正确状态
- **隐藏消息**：`invisible: true` 的消息不发送给 AI，但变量变更正常生效（GM 指令、后台演变）

### 存档 = 会话快照 + 预设播放列表

存档的 `requires` 字段记录了激活的预设组合。导出一个存档时，不仅分享对话历史，还携带了完整的预设搭配方案。接收者导入存档 → 引擎解析 `requires` → 提示缺失的预设 → 支持一键获取。

### 数据结构

```ts
interface StoryHistory {
    id: string;
    outputId: number;                     // 当前选中的输出（多分支支持）
    summary?: string;
    variables: Record<string, any>;      // 根节点变量快照
    inputs: StoryInputMessage[];         // 输入消息数组
    outputs: StoryOutputMessage[];        // 输出消息数组
}

interface VariableChangeModel {
    op: "add" | "replace" | "remove";
    path: string;                         // 点号分隔（如 "alice.cat-girl.mood"）
    value?: any;
}
```

### 数据库存储

```
stories (主表)
├── id, name, content (继承 masterTable)
├── requires (JSON RequireModel[])
└── llmapi (JSON RequireModel | null)

storyEntries (子表)
├── entryType = "history"
└── FK → stories.id (ON DELETE CASCADE)
```

## 四、LLM API 抽象层

### 三板斧插件模式

每个 AI 服务商通过三个接口接入系统：

| 接口 | 运行时 | 职责 |
|---|---|---|
| `LlmapiConfig` | 客户端 | 配置表单 UI（模型选择、参数设置） |
| `LlmapiInputBuilder` | 客户端 | 将 LorebookMessage[] 转换为 LLM 消息格式 |
| `LlmapiEngine` | 服务端 | 调用 LLM API，返回 ReadableStream（SSE） |

运行时通过 `provider` 字段在注册表中查找：

```
LlmapiModel.provider = "deepseek"
  ├── llmapiConfigRegistry["deepseek"] → 配置 UI
  ├── llmapiInputBuilderManager["deepseek"] → 消息构建
  └── llmapiEngineRegistry["deepseek"] → API 调用
```

### API Key 安全

- **加密存储**：API Key 在写入数据库前通过 `Hasher.encrypt()` 加密（自定义字符偏移算法）
- **服务端解密**：仅在调用 LLM API 时解密
- **隔离**：预设脚本运行在 iframe 沙箱中，无法访问加密密钥和 API Key
- **导出剥离**：导出 LLM API 配置时自动清除 Key 字段

### 消息构建流程

```
用户输入
  → Lorebook 引擎：tryFillActiveLorebooks → 确定激活的世界书 ID 列表
  → InputBuilder.onBuildInput():
      遍历消息历史
      对每条消息注入激活的世界书内容：
        层 < 100  → 前置注入 (lorebookS)
        层 ≥ 100  → 后置注入 (lorebookE)
      构建 LlmapiMessage[]:
        [{ role: "system", content: openingRemarks },
         { role: "user",    content: 前置 lorebook + 原文 + 后置 lorebook },
         { role: "assistant", content: ... }, ...]
```

## 五、数据持久化

### Master-Entry 主从表结构

所有业务实体使用统一的两级数据模型：

```
Master 表 (主记录)
├── id: string (UUID)
├── name: string
├── content: JSON text              ← 自由格式数据
└── extraColumns...                 ← 模块特定的结构化字段

Entry 表 (子记录)
├── masterId (FK → Master)
├── entryType (类型区分符)
├── entryId (自增，作用域: masterId + entryType)
├── disabled: boolean               ← 软禁用
└── content: JSON text
```

**设计意图**：结构化字段（code, version, tags）用于查询过滤，自由格式字段（content）存 JSON 负载，避免为不同 Entry 类型建立大量关联表。

### Repository 工厂

`createRepository` 是一个泛型工厂，一次性生成完整的类型安全 CRUD 接口：

```ts
const repository = createRepository<TModel, TEntity>(
    masterTable, entryTable,
    loadModel, saveModel, bindSearch,
    mapToEntity, mapToModel
);

// 返回: Repository<TModel> { get, getList, create, update, delete, entry: {...} }
```

三个业务模块（Stories、Presets、LlmApis）均使用此工厂创建各自的 Repository。

### 数据库

- **类型**：SQLite (`@libsql/client`)
- **文件**：`database/secyud-tavern.db`
- **迁移**：`database/migrations/` (Drizzle Kit)
- **ORM**：Drizzle ORM（类型安全 SQL 查询）

## 六、请求处理管道

### 拦截器链

所有 API 路由通过 `interceptor.createRoute()` 包装，进入责任链管道：

```
Request
  → ParamInterceptor
      ├── 反序列化 URL searchParams（JSON.parse 尝试）
      ├── 解析 POST/PUT/PATCH body → records.body
      └── next()
  → ErrorInterceptor
      └── try { next() }
          catch (BusinessError) → { message, code, data } + HTTP 500
          catch (Error)         → { message } + HTTP 500
  → RouteHandler
      └── 从 records 读取参数，执行业务逻辑
```

### 错误约定

- **服务端**：抛 `BusinessError(code, data)` → 拦截器序列化为标准 JSON
- **客户端**：`ApiError` 继承 `BusinessError` → `useErrorHandler` 钩子 → i18n 翻译 → toast 展示
- **API 路由中禁止**直接返回 `NextResponse.json(..., {status: 400})` — 必须抛出 `BusinessError`

## 七、UI 组件体系

### 严格三层架构

```
template/        ← 业务逻辑层（与 API 交互，管理状态）
  ↓ 使用
custom/          ← 组合层（PaginationWrapper, Combobox, TabManager）
  ↓ 使用
ui/              ← 展示层（Button, Dialog, Field, Combobox ... 25+ 基元）
```

- **展示层**：无状态、无业务依赖、纯 CSS 驱动。基于 Radix UI + CVA + Tailwind
- **组合层**：本地状态管理，不与 API 交互
- **业务层**：泛型模板组件（`ModelListContentTemplate<T>`、`EditFormTemplate<T>`），通过 Context 传递当前模型

### 模板泛型化

同一套模板组件适配所有实体类型：

```
ModelListContentTemplate<StoryModel>    modelType="story"
ModelListContentTemplate<PresetModel>   modelType="preset"
ModelListContentTemplate<LlmapiModel>   modelType="llmapi"
```

### iframe 隔离渲染

对话内容在 iframe 中渲染，隔离引擎注入的 CSS/JS，防止：
- 样式污染主应用 UI
- 脚本操作敏感数据（API Key 不在 iframe 上下文中）
- 第三方预设的恶意代码影响应用核心

## 八、插件系统

### 双层扩展机制

```
外部插件 (动态发现)
  → plugins/*/manifest.json → import() 动态加载
                                 ↓
内建模块 (静态注册)              Registry<T>
  → registerXxxClient()  ──→  register(item)
```

外部插件和内建引擎使用同一套 Registry 基础设施，区别仅在于发现时机和注册方式。

### Registry — 拓扑排序注册表

```ts
class Registry<T extends Registerable> {
    register(...items: T[]): void;
    getSorted(): T[];    // Kahn 算法拓扑排序，带循环依赖检测
    use(action): Promise<void>;  // 按依赖顺序遍历执行
}
```

整个项目的 10+ 个注册表全部基于此单一实现。

### 插件结构

```
plugins/my-plugin/
├── manifest.json     # { id, version, serverScript?, clientScript? }
├── server.ts         # 服务端脚本（动态 import，在 Node.js 运行）
└── client.js         # 客户端脚本（需编译为 JS，在浏览器运行）
```

服务端插件可注册引擎、拦截器、存储提供者；客户端插件可注册页面标签、会话提供者、配置表单。

## 九、关键设计决策

| 决策 | 选择 | 原因 |
|---|---|---|
| 数据库 | SQLite | 单文件部署，零配置，适合桌面/单用户场景 |
| ORM | Drizzle | 类型安全，轻量，与 Next.js 兼容性好 |
| 渲染隔离 | iframe | 防止预设 CSS/JS 污染主应用 |
| 流式响应 | SSE (ReadableStream) | 逐字实时渲染，用户体验好 |
| 组件复用 | 泛型模板 | 三套实体共享同一套 CRUD UI |
| 插件发现 | 文件系统扫描 + 静态注册 | 内建模块零开销，外部插件灵活 |
| 依赖排序 | Kahn 算法 | O(V+E) 复杂度，循环依赖自动检测 |
| 错误处理 | BusinessError + 拦截器 | 统一格式，客户端自动 toast 展示 |
| 状态管理 | 变量表（JSON Patch） | 无需重放历史即可恢复状态 |
| API Key 安全 | 自定义加密 + 服务端解密 | 防御数据库文件泄露 |
