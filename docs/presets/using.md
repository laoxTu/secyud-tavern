# Presets 模块 — 使用指南

## 管理预设

### 创建预设

1. 进入 Business 仪表板的 "Presets" 标签
2. 点击"创建"
3. 填写：
   - **Code**：唯一标识符，建议格式 `作者.预设名`（如 `alice.cat-girl`）
   - **Name**：显示名称
   - **Version**：语义版本号（如 `1.0.0`）
   - **Tags**：分类标签（如 `character`, `fantasy`, `rpg`）
   - **Requires**：依赖的其他预设（通过 PresetCombobox 选择）
   - **Description**：描述文本

### 编辑预设内容

创建预设后，在编辑器中可以配置各引擎内容：

#### 世界书（Lorebooks）

- 添加知识条目
- 设置匹配类型（always / normal / event）
- 配置关键字和匹配条件
- 设置优先级和层级

#### 正则替换（Regexes）

- 设置正则表达式模式
- 设置替换文本
- 选择目标（input / output / both）
- 配置生效的层数范围

#### 样式（Styles）

- 输入 CSS 文本
- 设置优先级

#### 脚本（Scripts）

- 输入 JavaScript 文本
- 设置优先级

### 导入/导出

- **导出**：点击预设列表中的导出按钮 → 下载 JSON 文件
- **导入**：点击导入按钮 → 选择 JSON 文件 → 自动解析并创建
- **克隆**：点击克隆 → 输入新的 name/code → 创建副本

### 启用/禁用条目

每个预设条目的 `disabled` 开关可以临时禁用某个规则，无需删除。

## PresetModel 字段说明

```ts
interface PresetModel {
    id: string;                     // UUID（自动生成）
    name: string;                   // 显示名称
    code: string;                   // 唯一标识符
    version: string;                // 语义版本
    tags: string[];                 // 标签
    requires: RequireModel[];       // 依赖预设 [{code, version}]
    content: {
        description?: string;       // 描述
        author?: string;            // 作者
    };
    entries: {
        lorebooks?: PresetLorebookModel[];
        regexes?: PresetRegexModel[];
        scripts?: PresetScriptModel[];
        styles?: PresetStyleModel[];
    };
}
```

## 预设依赖管理

### 声明依赖

```ts
// 在预设的 requires 字段中添加
requires: [
    { code: "shared.fantasy-world", version: "1.0.0" },
    { code: "ui.dark-theme", version: "2.1.0" },
]
```

### 依赖解析

加载存档时，系统自动：
1. 读取故事的 `requires` 列表
2. BFS 遍历所有预设的 `requires`
3. 检测缺失的预设并提示
4. 按依赖顺序加载

## PresetCombobox 使用

```tsx
import { PresetCombobox } from "@/presets/client/combobox";

<PresetCombobox
    name="requires"
    defaultValue={model?.requires?.map(r => JSON.stringify(r)) ?? []}
/>
```

搜索自动完成（300ms 去抖），结果格式为 `{code}-{version}`。

## API 端点

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/presets` | GET | 分页列表（支持模糊搜索 name/code） |
| `/api/presets` | POST | 创建预设（code 唯一性检查） |
| `/api/presets/{id}` | GET | 获取详情（支持 `withDetails`） |
| `/api/presets/{id}` | PUT | 更新 |
| `/api/presets/{id}` | DELETE | 删除 |
| `/api/presets/{id}/export` | GET | 导出为 JSON |
| `/api/presets/{id}/entries/{type}` | GET, POST | 条目列表/创建 |
| `/api/presets/{id}/entries/{type}/{entryId}` | PUT, DELETE | 条目更新/删除 |
| `/api/presets/{id}/entries/{type}/{entryId}/disabled` | PUT | 切换禁用 |

## 程序化操作

```ts
import { get, post, put, del } from "@/client";

// 获取预设列表
const { data, totalCount } = await get("/presets", {
    params: { page: 0, pageSize: 20, search: "alice" }
});

// 创建预设
const preset = await post("/presets", {
    name: "Alice Catgirl",
    code: "alice.cat-girl",
    version: "1.0.0",
    tags: ["character", "fantasy"],
    requires: [],
    content: { description: "A catgirl character", author: "me" }
});

// 更新预设标签
await put("/presets/{id}", {
    tags: ["character", "updated"],
    version: "1.0.1",
}, { params: { id: preset.id } });

// 导出预设
const response = await get(`/presets/{id}/export`, {
    params: { id: preset.id }
});
// 响应为 JSON 文件下载
```
