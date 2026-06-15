# Lorebooks 引擎 — 使用指南

## 添加世界书条目

在预设编辑器的 Lorebook 标签中创建条目。每个条目包含：

| 字段 | 说明 |
|---|---|
| **code** | 唯一标识符（会自动拼上 preset.code 前缀，避免跨预设冲突） |
| **name** | 显示名称 |
| **matchType** | 匹配类型：always / normal / event |
| **content** | 世界书正文（触发后注入到提示词的内容） |
| **priority** | 优先级（决定同层内的插入顺序，越高越靠前） |
| **layer** | 层级（< 100 = 消息前插入，≥ 100 = 消息后插入） |
| **role** | 角色过滤（保留字段） |

## 三种匹配类型

### always — 始终激活

始终生效，不需要关键字匹配。

| 参数 | 说明 |
|---|---|
| `lastMessage` | 勾选后只在最新消息中后置注入，否则每轮对话前置注入 |

适用场景：固定的角色设定、世界观背景陈述。

### normal — 关键字匹配

消息内容中包含关键字时触发。

**关键字编辑**：使用多选芯片输入，每行一组关键字：
- 同组关键字 **OR** 关系（满足任意一个即匹配该组）
- 不同组之间 **AND** 关系

| 参数 | 说明 |
|---|---|
| `keywords` | `string[][]` — 二维关键字数组 |
| `fitCount` | 需要满足的组数（≤ keywords.length） |

**示例**：配置 `keywords = [["sword", "blade"], ["shop", "store"]]`, `fitCount = 2`
- `"I want to buy a sword at the shop"` → ✅ 匹配 (sword + shop)
- `"I have a blade"` → ❌ 不匹配 (只有 blade，没有 shop/store)

### event — 关键字 + 日期

在 normal 匹配基础上增加日期范围限制。

| 额外参数 | 说明 |
|---|---|
| `minDate` | 最早日期 `{ year, month, day }` |
| `maxDate` | 最晚日期 `{ year, month, day }` |

匹配条件：关键字匹配 **且** 变量表中存在 `relatedDates` 在日期范围内。

适用场景：时间触发的剧情事件。

## 注入方式

通过 `layer` 控制世界书内容在消息中的位置：

```
layer < 100 → 前置注入（在消息内容之前）
    例如：layer=0, priority=10 → "[世界书A内容][世界书B内容] 用户消息正文"

layer ≥ 100 → 后置注入（在消息内容之后）
    例如：layer=100, priority=5 → "用户消息正文 [世界书C内容]"
```

排序：先按 layer，同层按 priority。数值越大越靠前。

## 禁用条目

将条目的 `disabled` 设为 true 可临时关闭而不删除。适合调试和 A/B 测试。
