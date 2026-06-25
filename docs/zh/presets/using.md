# Presets 模块使用指南

## 创建预设

1. 进入 Business 仪表板的 "Presets" 标签
2. 点击"创建"
3. 填写 Code（唯一标识，建议 `作者.预设名`）、Name、Version、Tags、Requires（依赖）

## 编辑预设内容

创建后在编辑器中配置各引擎条目：

- **Lorebook** — 世界书条目，设置匹配类型和关键字
- **Macro** — 键值对模板变量
- **Regex** — 文本正则替换规则
- **Script** — JavaScript 代码（Monaco 编辑器）
- **Style** — CSS 样式（Monaco 编辑器）

每个条目可独立启用/禁用（`disabled` 开关）。

## 导入/导出

- **导出**：点击导出按钮 → 有封面图下载 .png，无封面图下载 .json
- **导入**：点击导入 → 选择文件 → 自动解析（支持 .json 和 .png+json 复合格式）
- **克隆**：点击克隆 → 输入新 code/name → 创建副本

## PresetModel 字段

```typescript
interface PresetModel {
    id: string;                     // UUID（自动生成）
    name: string;                   // 显示名称
    code: string;                   // 唯一标识符
    version: string;                // 语义版本号
    tags: string[];                 // 分类标签
    requires: RequireModel[];       // 依赖预设 [{code, version}]
    content: Record<string, any>;   // 扩展数据（description, author, coverId 等）
    entries: {
        lorebooks?: PresetLorebookModel[];
        regexes?: PresetRegexModel[];
        styles?: PresetStyleModel[];
        scripts?: PresetScriptModel[];
        macros?: PresetMacroModel[];
    };
}
```

## 依赖管理

在预设的 `requires` 字段声明依赖：

```json
[
    { "code": "shared.fantasy-world", "version": "1.0.0" },
    { "code": "ui.dark-theme", "version": "2.1.0" }
]
```

加载存档时系统自动 BFS 解析所有依赖。

## API 端点

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/presets` | GET | 分页列表（name/code 模糊搜索，tags 过滤） |
| `/api/presets` | POST | 创建（code 唯一性检查） |
| `/api/presets/{id}` | GET | 详情（支持 withDetails） |
| `/api/presets/{id}` | PUT | 更新 |
| `/api/presets/{id}` | DELETE | 删除 |
| `/api/presets/{id}/export` | GET | 导出（.png 或 .json） |
| `/api/presets/import` | POST | 导入（支持 PNG+JSON） |
| `/api/presets/{id}/entries/{type}` | GET, POST | 条目列表/创建 |
| `/api/presets/{id}/entries/{type}/{entryId}` | PUT, DELETE | 条目更新/删除 |
| `/api/presets/{id}/entries/{type}/{entryId}/disabled` | PUT | 切换禁用 |

## 程序化操作

```typescript
// 获取列表
const { data, totalCount } = await fetch(
    `/api/presets?page=0&pageSize=20&search=${encodeURIComponent(JSON.stringify({name: "alice"}))}`
).then(r => r.json());

// 创建
const preset = await fetch("/api/presets", {
    method: "POST",
    body: JSON.stringify({
        name: "Alice Catgirl", code: "alice.cat-girl",
        version: "1.0.0", tags: ["character"],
        requires: [], content: {}
    }),
}).then(r => r.json());

// 更新
await fetch(`/api/presets/${preset.id}`, {
    method: "PUT",
    body: JSON.stringify({ version: "1.0.1", tags: ["character", "updated"] }),
});
```
