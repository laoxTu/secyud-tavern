# Components 模块 — 设计文档

## 概述

`src/components/` 是应用的**UI 组件体系**，采用严格的三层架构：

```
src/components/
├── ui/           # 展示层 — 无状态的 UI 基元（25 个文件）
├── custom/       # 组合层 — 带行为的可复用组件（分页、搜索、Tab）
└── template/     # 业务逻辑层 — 与 API 交互的页面模板（5 个文件）
```

## 设计理念

### 严格分层

| 层级 | 目录 | 状态管理 | 外部依赖 | 职责 |
|---|---|---|---|---|
| 展示层 | `ui/` | 无状态 | 无业务依赖 | 原子级 UI 基元 |
| 组合层 | `custom/` | 本地状态 | UI 层基元 | 可复用的行为组件 |
| 业务层 | `template/` | 上下文 + 状态 | API、i18n、Toast | 完整页面模板 |

**设计意图**：每层只能向下依赖，上层可引用下层，下层不可引用上层。修改 UI 基元样式不会影响业务逻辑；切换后端 API 不会影响展示组件。

### 不是复制粘贴的 shadcn/ui

所有 UI 组件不是从 shadcn/ui 仓库复制粘贴的，而是项目自行编写。它们：
- 使用相同的技术栈（Radix UI 基元 + CVA + Tailwind CSS）
- 遵循项目一致的代码风格（`data-slot` 属性、函数声明、命名规范）
- 适配项目的特定需求（如 `input-group.tsx` 支持复杂的输入装饰组合）

### 模板泛型化

`template/` 中的组件都是泛型组件，通过 `TModel` 类型参数适配不同的业务实体：

```tsx
// 同一个组件用于 Stories、Presets、LlmApis
<ModelListContentTemplate<StoryModel>    modelType="story"  ... />
<ModelListContentTemplate<PresetModel>   modelType="preset" ... />
<ModelListContentTemplate<LlmapiModel>   modelType="llmapi" ... />
```

## 三层架构详解

### 1. 展示层（UI 层）

每个组件是一个独立的 `.tsx` 文件，导出：
- 主组件（函数声明）
- 子组件（与主组件在同一文件）
- CVA variants 对象（供外部组合）

**核心技术栈**：
- **Radix UI**：无样式的无障碍基元（Dialog、Select、Tabs、Tooltip、Accordion、Switch、Checkbox 等）
- **class-variance-authority (cva)**：管理变体（按钮的 variant/size、Item 的 variant/size、Field 的 orientation）
- **@base-ui/react**：仅用于 Combobox（多选芯片模式，Radix 不原生支持）
- **react-resizable-panels**：仅用于 Resizable 可调整面板

**一致性约定**：
- 所有组件在根元素上设置 `data-slot="component-name"` 属性，保证 CSS 选择器可预测
- 变体通过 CVA 定义，使用 `cn()` 合并类名
- 零业务逻辑 — 不导入任何业务模型或 API 客户端

### 2. 组合层（Custom 层）

| 组件 | 作用 | 依赖 |
|---|---|---|
| `custom/combobox` | 多选芯片搜索输入 | UI 层 Combobox 全套子组件 |
| `custom/pager/usePager` | 分页状态管理 Hook | `useErrorHandler` |
| `custom/pager/component` | 分页器 UI（智能省略号） | UI 层 Pagination 基元 |
| `custom/tab/TabManager` | 可注册的 Tab 管理器 | `ClientRegistry`（插件系统） |

### 3. 业务层（Template 层）

| 组件 | 作用 | 关键 Props |
|---|---|---|
| `ModelListContentTemplate<T>` | 拆分视图主/详细列表页 | `modelApi`, `contextType`, `tabManagerAccessor`, `createHandler`, `cloneHandler` |
| `EditFormTemplate<T>` | 模型编辑表单 | `contextType`, `updateHandler`, `updateContent` |
| `EntryListTemplate<T>` | 子条目 CRUD 管理 | `modelApi`, `entryType`, `updateContent` |
| `ModelNavigationTemplate` | 导航标签（翻译后的标题） | `modelType` |
| `EntryNavigationTemplate` | 导航图标标签 | `value` |

**Template 层的数据流**：

```
API 请求 → Repository → 响应数据
    │
    ├── usePager → data[], totalCount, loading
    │
    ├── ModelContext.Provider → 当前选中模型
    │
    └── useErrorHandler → Toast 错误提示
```

## 模板中的 Context 机制

`template/models.ts` 定义泛型 Context 工厂：

```ts
// 创建
const StoryContext = createModelContextType<StoryModel>();

// 使用（在组件树深处）
const { model, setModel, refreshModel } = useModelContext(StoryContext, "story", t);
```

**设计意图**：避免 Props drilling。列表页选中一个模型后，深层嵌套的编辑表单可以通过 Context 访问当前模型数据，无需通过中间组件传递。

## 国际化策略

所有用户可见文本通过 `next-intl` 的 `useTranslations()` 处理：

```tsx
// Template 中使用动态键
t(`default.${modelType}`)          // "故事" / "预设" / "LLM API"
t(`${modelType}.name`)            // 实体特定的字段名
t('page.previous'), t('page.next') // 通用 UI 文本
```

UI 层组件**不使用**国际化 — 它们接收外部传入的 label/prop，保持纯净。
