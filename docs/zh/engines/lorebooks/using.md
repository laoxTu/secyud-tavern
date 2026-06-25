# Lorebooks 引擎使用指南

## 添加世界书条目

在预设编辑器的 Lorebook 标签中创建条目：

| 字段 | 说明 |
|---|---|
| code | 唯一标识符 |
| name | 显示名称 |
| matchType | 匹配类型：always / normal / event |
| content | 世界书正文（触发后注入到提示词） |
| priority | 同层内排序优先级（越大越靠前） |
| layer | 层级（<100 消息前注入，≥100 消息后注入） |
| role | 系统提示/用户/助手 |

## 三种匹配类型

### always — 始终激活

始终生效。配置项：
- `lastMessage`：勾选后只在最新消息后置注入，否则每轮前置注入

适用场景：固定角色设定、世界观背景。

### normal — 关键字匹配

消息内容包含关键字时触发。

**关键字编辑**：
- 同组关键字 **OR** 关系（满足任意一个即匹配该组）
- 不同组 **AND** 关系
- `fitCount`：至少需要满足的组数

**示例**：`keywords = [["sword","blade"],["shop","store"]]`, `fitCount = 2`
- `"buy a sword at the shop"` → ✅ (sword + shop)
- `"I have a blade"` → ❌ (只有 blade，缺 shop/store)

### event — 关键字 + 日期

在 normal 基础上增加日期范围 `{year, month, day}`。检查变量表中 `relatedDates` 是否在范围内。

适用场景：时间触发的剧情事件。

## 注入方式

通过 `layer` 控制世界书在消息中的位置：

```
layer < 100 → 前置（消息之前）
layer ≥ 100 → 后置（消息之后）
```

同 layer 内按 `priority` 排序（越大越靠前）。

## 禁用条目

设置 `disabled = true` 可临时关闭条目而不删除，方便调试和 A/B 测试。
