# Lorebooks 引擎设计

## 概述

Lorebooks 是**条件性背景知识注入引擎**。根据当前消息内容匹配世界书条目，将匹配的知识注入到 LLM 上下文。是最复杂的引擎，包含可插拔的匹配策略子系统。

## 设计理念

### 匹配与注入分离

- **匹配（Matcher）**：决定条目何时激活 — 由 `lorebookMatcherRegistry` 中的匹配器处理
- **注入（InputBuilder）**：决定激活的条目如何拼入提示词 — 由 llmapi 的 `defaultBuildInput` 处理

### 三层分类

世界书初始化时分为三组：

| 组 | 条件 | 用途 |
|---|---|---|
| `lorebooksStart` | matchType=always, lastMessage=false | 每轮对话前置注入 |
| `lorebooksEnd` | matchType=always, lastMessage=true | 仅最后一条消息后置注入 |
| `lorebooks` | 其他匹配类型 | 按消息内容动态匹配 |

### 插件化匹配策略

`lorebookMatcherRegistry` 注册三种匹配器：

```
MatcherRegistry
├── always  → 始终激活
├── normal  → 关键字 AND/OR 逻辑匹配
└── event   → 关键字 + 日期范围匹配
```

## 数据模型 (`models.ts`)

```typescript
interface PresetLorebookModel extends EntryModel {
    matchType: string;        // "always" | "normal" | "event"
    matchExpression: any;     // 匹配器特定表达式
    content: string;          // 世界书正文
    priority: number;         // 同层内排序（数值越大越靠前）
    layer: number;            // <100 前置注入，≥100 后置注入
    role: string;             // system/user/assistant
}
```

排序公式：`layer * 10000 + priority`

## 执行流程

### 1. onInitialize (SlotInitializer)

遍历所有预设的 lorebook 条目 → 过滤 disabled → 按 matchType 分类：
- always + lastMessage=false → `lorebooksStart[]`
- always + lastMessage=true → `lorebooksEnd[]`
- normal/event → `lorebooks` Record

### 2. onProcessInput (LlmapiInputProcesser)

遍历对话历史 → 对每条消息的 inputs 和 output 调用 `tryFillActiveLorebooks()`：
1. 遍历所有 lorebook 条目
2. 根据 matchType 查找匹配器
3. `matcher.match(ctx, expression)` → boolean
4. 匹配成功 → 加入 `history.properties["lorebooks"]`
5. 按 `compareLorebook` 排序
6. 前置注入 `lorebooksStart`、后置注入 `lorebooksEnd`

### 3. onProcessOutput (LlmapiOutputProcesser)

对 AI 最新输出调用 `tryFillActiveLorebooks()`，为下轮对话预匹配。

### 4. InputBuilder (defaultBuildInput)

构建 LLM 消息时：
- 遍历 history，取出每个消息的 activeLorebooks
- layer < 100 → 前置拼接
- layer ≥ 100 → 后置拼接
- 同 role 连续消息合并、重复 lorebook 去重

## 匹配器接口 (`client/match-models.ts`)

```typescript
interface Matcher extends Registerable {
    editor: React.ComponentType<MatcherProps>;
    getEditorValue: (data: FormData) => any;
    match: (ctx: MatcherMatchContext, expression: any) => boolean;
}
```

### always 匹配器

始终返回 true。配置项：`lastMessage` 布尔值。

### normal 匹配器

关键字匹配：`keywords: string[][]`（同组 OR，不同组 AND）+ `fitCount`（需满足的最小关键字组数）。

### event 匹配器

在 normal 基础上增加日期范围：`minDate`、`maxDate`。检查上下文变量中的 `relatedDates` 是否在范围内。

## 存储

服务端通过 `presetStorage.register(createSimpleStorageProvider("lorebook", "lorebooks", presetRepository))` 注册。
