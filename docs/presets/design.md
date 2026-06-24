# Presets 模块设计

## 概述

`src/presets/` 是预设系统。Preset 是最小功能单元，将角色设定、世界书、正则、样式、脚本、宏等内容打包为一个实体，通过 `requires` 声明依赖，BFS 递归解析。

## 设计理念

### 打包即分发

一个 Preset 包含所有相关内容（lorebooks, regexes, styles, scripts, macros），用户只需导入一个 JSON 文件（或含封面图的 PNG+JSON 合成文件）。

### 管理线与使用线分离

| 线路 | 触发方式 | 数据流向 | 持久化 |
|---|---|---|---|
| **管理线** | 预设编辑器操作 | 前端 → API → SQLite | 是 |
| **使用线** | 加载存档/重载 | API → 前端内存 | 否 |

编辑不影响正在运行的会话，重载即时生效。

### 多核并联

用户可以同时激活多个预设。系统不处理冲突，由预设作者通过 `code` 命名约定、CSS 作用域和 `priority` 排序自行规避。

## 数据模型 (`models.ts`)

```typescript
interface PresetModel extends BaseModel {
    code: string;                    // 唯一标识符（如 "alice.cat-girl"）
    version: string;                 // 语义版本号
    tags: string[];                  // 分类标签
    requires: RequireModel[];        // 依赖的其他预设
    entries?: {
        lorebooks?: PresetLorebookModel[];
        regexes?: PresetRegexModel[];
        styles?: PresetStyleModel[];
        scripts?: PresetScriptModel[];
        macros?: PresetMacroModel[];
    };
}

interface RequireModel {
    code: string;     // 依赖预设的 code
    version: string;  // 依赖的版本
}
```

## Slot 加载时的依赖解析

`GET /api/stories/{id}/slot` 端点实现 BFS 依赖解析：

```
1. 从故事读取 story.requires[]
2. 对每个 require:
   a. 按 code 查询 preset（通过 conditionMatchId）
   b. 加入结果集
   c. 读取该 preset 的 requires[]
   d. 递归解析（visited Set 防止循环依赖）
3. 返回所有解析到的预设（含完整 entries 详情）
```

## 存储系统

`presetStorage = new ModelStorage<PresetModel>("preset")` 是 preset 引擎的存储注册表。各引擎（lorebooks, regexes, styles, scripts, macros）通过 `presetStorage.register(createSimpleStorageProvider(...))` 注册自己的存储提供者。

## 数据库结构

```
presets (主表)
├── id, name, content (继承自 masterTable)
├── code (text, unique, not null)
├── version (text, not null)
├── tags (text, JSON 数组)
└── requires (text, JSON RequireModel[] 数组)

presetEntries (子表)
├── 继承自 entryTable
├── entryType = "lorebook" | "regex" | "style" | "script" | "macro"
└── FK → presets.id (ON DELETE CASCADE)
```

## 导出/导入

### 导出

`apiExportModel` 使用自定义 `exportHandler`：
- 有封面图（coverId）→ 先流式输出图片字节，再拼接 JSON 字节 → 生成 .png 文件
- 无封面图 → 纯 JSON 下载 → .json 文件

### 导入

`apiImportModel` 使用自定义 `importHandler`：
- `splitPNGAndDataUniversal` 分离图片和 JSON
- 有图片 → 存入 imageRepository，model 中记录 coverId
- JSON 数据 upsert 到 presets 表

## presetTabManager

客户端 `presetTabManager` 是 `TabManager` 实例，管理预设编辑器中的子标签页。各引擎在 `register*Client()` 中注册自己的标签。
