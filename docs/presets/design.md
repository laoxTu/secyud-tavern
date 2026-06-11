# Presets 模块 — 设计文档

## 概述

`src/presets/` 是 Secyud Tavern 的**预设系统**。预设是 Tavern 的最小功能单元 — 它将角色设定、世界书、UI 样式、脚本逻辑等内容包装为单一的可分发文件。

## 设计理念

### 打包即分发

与传统 AI 对话平台（如 SillyTavern）不同，Secyud Tavern 的预设不是分离的"角色卡 + 世界书 + 主题 + 脚本"文件集合，而是**一个 JSON 文件包含所有相关内容**。

```
SillyTavern:
  alice.png (角色卡)
  fantasy-world.json (世界书)
  dark-theme.css (主题)
  combat-system.js (脚本)
  → 用户需要分别导入和管理 4 个文件

Secyud Tavern:
  alice-adventure.json (预设)
  ├── 角色设定
  ├── 世界书条目
  ├── 正则替换规则
  ├── UI 主题样式
  └── 交互脚本
  → 用户只需导入 1 个文件
```

### 多核并联

用户可以同时激活多个预设。引擎不做冲突处理，由预设作者通过约定自行规避：

- **ID 命名**：使用 `作者.预设名` 格式避免冲突
- **CSS 作用域**：使用预设 ID 作为类名前缀
- **优先级排序**：世界书和样式按 priority 排序，后加载的覆盖先加载的

### 管理线与使用线分离

预设的生命周期分为两条独立的线路：

| 线路 | 触发方式 | 数据流向 | 持久化 |
|---|---|---|---|
| **管理线** | 预设编辑器操作 | 前端 → 服务器 → SQLite | 是 |
| **使用线** | 加载存档 / 点击重载 | 服务器 → 前端内存 | 否 |

**设计意图**：编辑不影响运行，重载即时生效。

## 架构图

```
┌──────────────────────────────────────┐
│           管理线 (持久化)               │
│                                      │
│  预设编辑器 → PUT /api/presets/{id}    │
│            → presetRepository.update  │
│            → SQLite (presets 表)      │
│                                      │
│  不影响当前运行中的会话                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│           使用线 (运行时)               │
│                                      │
│  加载存档 / 重载预设                     │
│      │                               │
│      ├── GET /api/stories/{id}/slot   │
│      │   └── 解析 requires[]          │
│      │   └── BFS 遍历依赖             │
│      │   └── 加载所有预设              │
│      │                               │
│      └── 构建运行时引擎                 │
│          ├── 合并世界书 → 注册到 Matcher │
│          ├── 合并正则 → 注入处理器       │
│          ├── 注入 CSS → iframe head   │
│          └── 执行 JS → iframe body    │
│                                      │
│  全部在浏览器内存中，断网后仍可运行         │
└──────────────────────────────────────┘
```

## 数据模型

### PresetModel

```ts
interface PresetModel extends BaseModel {
    code: string;               // 唯一标识符
    version: string;            // 语义版本号（用于依赖检查）
    tags: string[];             // 分类标签
    requires: RequireModel[];   // 依赖的其他预设
    entries: {
        lorebooks?: PresetLorebookModel[];
        regexes?: PresetRegexModel[];
        scripts?: PresetScriptModel[];
        styles?: PresetStyleModel[];
    };
}
```

### RequireModel（依赖声明）

```ts
interface RequireModel {
    code: string;
    version: string;
}
```

用于声明预设之间和故事与预设之间的依赖关系。

## Slot 加载时的预设解析

`GET /api/stories/{id}/slot` 端点实现 BFS 依赖解析：

```
1. 从故事读取 requires[]
2. 对每个 require:
    a. 按 code 查询 preset
    b. 检查 version 匹配
    c. 将该 preset 加入结果集
    d. 读取该 preset 的 requires[]
    e. 递归解析（visited 集合防止循环）
3. 返回所有解析到的预设
```

## 数据库结构

```
presets (主表)
├── id, name, content (继承)
├── code (text, unique, not null)
├── version (text, not null)
├── tags (JSON text[] — 序列化存储)
└── requires (JSON RequireModel[] — 序列化存储)

presetEntries (子表)
├── 继承 entryTable
├── entryType = "lorebooks" | "regexes" | "scripts" | "styles"
└── FK → presets.id (ON DELETE CASCADE)
```

**存储说明**：
- `tags` 和 `requires` 序列化为 JSON 存储在主表字段
- 世界书、正则、样式、脚本拆分为独立条目存储在子表中
- 每条子记录有独立的 `disabled` 开关

## 导出/导入

导出文件为单个 JSON：
- 包含主表字段 + entries 中的所有数据
- 分发时只需一个文件
- 导入时清空 `id`（服务端重新生成）
