# App 层设计

## 概述

`src/app/` 是 Next.js App Router 的页面与 API 路由层，承载前端 UI 页面和后端 RESTful API。

## 页面路由

```
/                          → "use client" 页面，立即 router.replace("/business")
/business                  → 主管理页面，通过 PluginLayout 初始化客户端插件
/business/stories/[id]     → 故事对话页面，加载 Slot 并运行对话管道
```

### 根布局 (`layout.tsx`)

包裹 `NextIntlClientProvider` (i18n) + `TooltipProvider` (shadcn/ui) + `Toaster` (sonner)。

### Business 布局 (`business/layout.tsx`)

`<PluginLayout>` — 调用 `useClientPlugins()` 初始化所有客户端插件系统和引擎，初始化完成前显示加载 iframe。

### Business 页面 (`business/page.tsx`)

渲染 `<BusinessPageContent>` — 遍历 `businessNavigationManager.getSorted()` 渲染顶部导航标签，活动标签用 `bg-gray-100` 高亮。包含语言切换下拉菜单（设置 locale cookie 后 reload）和版权信息。

### 故事页面 (`business/stories/[id]/page.tsx`)

渲染 `<StoryPageContent>` — 获取 slot 数据 → 运行 `conversationManager.initializer.use()` → 渲染对话 iframe + 底部工具栏（历史翻页器、输出翻页器、slot 功能按钮）+ 聊天输入框。

## API 路由设计

### 模板工厂 (`api/template.ts`)

所有 CRUD 操作由工厂函数生成，消除样板代码。每个工厂接收 `TemplateConfig<TModel>`：

```typescript
interface TemplateConfig<TModel> {
    repository: Repository<TModel>;
    conditionSearch?: (search) => ConditionFunc;
    conditionMatchId?: (id) => ConditionFunc;
    checkCreate?, checkUpdate?: (model) => Promise<void>;
    filename?: (model) => string;
    exportHandler?, importHandler?: ...;
}
```

**工厂函数列表**：

| 函数 | HTTP 方法 | 用途 |
|---|---|---|
| `apiGetModelList` | GET | 分页列表（PageOptions 来自 searchParams） |
| `apiGetModel` | GET /[id] | 单条详情（可选 withDetails） |
| `apiCreateModel` | POST | 创建（自动生成 UUID，可选 checkCreate 校验） |
| `apiUpdateModel` | PUT /[id] | 部分更新（mergeObjects 合并 content） |
| `apiDeleteModel` | DELETE /[id] | 删除 |
| `apiExportModel` | GET /[id]/export | 文件下载（ReadableStream + Content-Disposition） |
| `apiImportModel` | POST /import | 文件上传 upsert（查重→删除旧→创建新） |
| `apiGetEntryList` | GET /[id]/entries/[type] | 子实体分页列表 |
| `apiCreateEntry` | POST /[id]/entries/[type] | 创建子实体（自动递增 entryId） |
| `apiUpdateEntry` | PUT /.../[entryId] | 更新子实体 |
| `apiDeleteEntry` | DELETE /.../[entryId] | 删除子实体 |
| `apiDisableEntry` | PUT /.../disabled | 切换 disabled 状态 |

### 中间件包装

所有 API 路由通过 `interceptor.createRoute(handler)` 包装，自动叠加：
1. **ErrorInterceptor** — 捕获 BusinessError → JSON `{message, code, data}`
2. **ParamInterceptor** — 解析 `nextUrl.searchParams`，对每个值尝试 JSON.parse

```typescript
// 典型路由文件
export const GET = interceptor.createRoute(apiGetModelList(apiConfig));
```

### 各领域 API

**Stories** (`/api/stories/`):
- 标准 CRUD + 导入导出 + 子实体管理（history 条目）
- `/api/stories/[id]/slot` — **Slot 组装端点**：获取 story → 按 requires BFS 递归解析所有 preset → 获取 llmapi → 加载 history 条目 → 返回完整 SlotModel
- 校验：name 非空
- 搜索：name LIKE 模糊匹配

**Presets** (`/api/presets/`):
- 标准 CRUD + 导入导出 + 子实体管理（lorebooks/regexes/styles/scripts/macros 条目）
- **PNG 导出**：如果有封面图，先流式输出图片字节，再拼接 JSON 数据字节
- **PNG 导入**：使用 `splitPNGAndDataUniversal` 分离图片和 JSON，图片存入 imageRepository
- 校验：code 和 name 非空，code 唯一性检查
- 搜索：name + code 模糊匹配，tags 数组重叠过滤
- ID 匹配：支持 UUID 或可读 code

**LLM APIs** (`/api/llmapis/`):
- 标准 CRUD + 导入导出 + 子实体管理
- `/api/llmapis/[id]/chat` — **聊天端点**：查找配置 → 根据 provider 在 `llmapiEngineRegistry` 找引擎 → `Hasher.instance.decrypt(key)` 解密 → `engine.run(messages, config, apiKey, signal)` → 返回 `text/event-stream` SSE 流（Cache-Control: no-cache, Connection: keep-alive）
- 校验：code 和 name 非空，code 唯一性检查
- ID 匹配：支持 UUID 或可读 code

**Images** (`/api/images/`):
- POST — 读取 ArrayBuffer，根据 Content-Type 判断 MIME，`imageRepository.create()`，SHA-256 去重
- GET /[id] — 返回图片，1 年缓存（max-age=31536000, immutable）
- DELETE /[id] — 删除文件和记录

**Plugins** (`/api/plugins/`):
- GET — 返回 `pluginManager.getPlugins()` JSON 列表
- GET /[pluginId] — 读取插件目录下的 clientScript 文件，返回 `application/javascript`（Cache-Control: no-cache, no-store, must-revalidate）

## 样式

- `globals.css` — Tailwind v4、tw-animate-css、shadcn 主题（oklch 色彩空间，:root/.dark）
- `app.css` — `body, html { overflow: hidden; height: 100%; }` + `.form-reset { all: inherit; }`
