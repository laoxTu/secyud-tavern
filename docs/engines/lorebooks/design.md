# Lorebooks 引擎 — 设计文档

## 概述

Lorebooks 是**条件性背景知识注入引擎**。它根据当前消息内容（关键字、事件日期）匹配世界书条目，将匹配到的知识注入到 LLM 上下文提示词中。

## 设计理念

### 匹配与注入分离

世界书条目的"何时触发"和"注入后如何显示"是两个独立的概念：
- **匹配（Matcher）**：决定条目是否激活 — 由匹配器策略完成
- **注入（InputBuilder）**：决定激活的条目如何拼入提示词 — 由 Llmapi InputBuilder 完成

### 插件化匹配策略

三种匹配器均以插件形式注册到 `lorebookMatcherRegistry`，新增匹配策略无需修改引擎代码：

```
MatcherRegistry
├── always  → 始终激活（可选"仅最后一条消息"）
├── normal  → 关键字 AND/OR 逻辑匹配
└── event   → 关键字 + 日期范围匹配
```

### 三层分类

世界书在初始化时被分为三组：

| 组 | 存放内容 | 用途 |
|---|---|---|
| `lorebooks` | 常规条目 | 按消息内容匹配，匹配后插入上下文 |
| `lorebooksStart` | `matchType=always` 且 `lastMessage=false` | 每轮对话都前置注入 |
| `lorebooksEnd` | `matchType=always` 且 `lastMessage=true` | 只在最后一条消息后置注入 |

## 数据模型

```ts
interface PresetLorebookModel extends EntryModel {
    matchType: string;        // 匹配器标识（"always" | "normal" | "event"）
    matchExpression: any;     // 匹配器特定的表达式
    content: string;          // 世界书正文
    priority: number;         // 排序优先级
    layer: number;            // 层级（< 100 前置注入，≥ 100 后置注入）
    role: string;             // 角色过滤
}
```

排序公式：`layer * 10000 + priority`

## 执行流程

```
1. onInitialize
   遍历所有预设的 lorebooks 条目
   → 按 matchType 分组
   → 非 disabled 条目：
       matchType = "always"  → startLorebooks / endLorebooks
       其他                  → lorebooks (Record<id, PresetLorebookModel>)

2. onProcessInput (LlmapiInputProcesser)
   遍历对话历史
   → 对每个未处理的消息调用 tryFillActiveLorebooks()
     → 遍历所有 lorebooks
     → 查找对应的 Matcher
     → matcher.match(ctx, expression) → boolean
     → 匹配成功 → 加入 activeLorebooks[]
   → 将激活的世界书按 order 排序存入 history.properties.lorebooks

3. onProcessOutput (LlmapiOutputProcesser)
   对 AI 最新输出消息调用 tryFillActiveLorebooks()
   → 为下轮对话预匹配世界书

4. InputBuilder (在 llmapis 的 input-builder-default.ts)
   构建 LLM 消息时：
   → 遍历历史，取出每条消息的 activeLorebooks
   → layer < 100 的世界书内容前置拼接
   → layer ≥ 100 的世界书内容后置拼接
```

## 缓存机制

已匹配过的消息不会重复匹配（通过 `message.properties.lorebooks` 检查）。这保证了：
- 同一条消息在多次构建提示词时不会重复匹配
- 翻页切换时匹配结果保持稳定

## Matcher 接口

```ts
interface Matcher extends Registerable {
    editor: React.ComponentType<MatcherProps>;        // 编辑器 UI
    getEditorValue: (data: FormData) => any;           // 提取表单数据
    match: (ctx: MatcherMatchContext, expression: any) => boolean;  // 匹配逻辑
}

interface MatcherMatchContext {
    history: StoryHistory;
    message: StoryHistoryMessage;
    variables: any;              // 当前变量表
}
```
