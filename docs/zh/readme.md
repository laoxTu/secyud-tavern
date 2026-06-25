# Secyud Tavern

一个高度可定制化的 AI 角色扮演与互动叙事平台。没有繁杂的设定 — 一切由**预设**、**模型**、**故事**三个简洁的概念组成。

## 为什么是 Secyud Tavern

SillyTavern 等传统工具中，角色卡、世界书、主题样式、脚本需要分别导入和管理。一个完整的角色体验要组合多个分散的文件，维护依赖关系令人头疼。

Secyud Tavern 换了一种思路：

- **预设即捆绑**：一个 JSON 文件打包角色设定、世界书、正则规则、样式、脚本和宏定义。作者发布一个角色，用户导入一个文件即可获得完整体验。
- **多核并联**：同时激活多个预设，像搭积木一样组合不同作者的作品。引擎不强制冲突处理，由预设作者通过命名约定自行规避。
- **高度客制化 UI**：没有预设时是一片干净的白色界面，UI 完全由预设定义和渲染。输入栏和功能键在鼠标悬停时才显示。
- **变量驱动**：结构化变量表驱动世界状态演变，加载存档直接读取快照，无需重放历史。
- **楼层渲染**：一个界面只展示一个楼层，适合 MVU 模式和状态栏，不会因楼层堆积而崩溃。

## 三个核心概念

### 1. 预设 (Preset)

预设是一个单元集合，把可编辑内容整合在一起，由 `tags` 标明它属于哪一类。

它是面向插件可扩展的，初始支持编辑五种内容：

| 引擎 | 作用 | 说明 |
|---|---|---|
| **Macro** | 宏定义 | 键值对，通过 Eta 模板引擎在拼装提示词和渲染时替换占位符 |
| **Lorebook** | 世界书 | 条件性背景知识，三种匹配模式精准控制注入时机 |
| **Regex** | 正则替换 | 在发送前或展示前对文本做查找替换，支持按层数控制生效范围 |
| **Script** | 脚本 | JavaScript 注入 iframe，接收消息通知并自定义渲染 |
| **Style** | 样式 | CSS 注入 iframe，自定义界面外观 |

#### 世界书的三种匹配模式

世界书是条件性背景知识注入引擎，根据消息内容匹配条目，将匹配到的知识注入 LLM 上下文。它通过**可插拔的匹配器**实现不同的触发策略，目前内置三种模式，支持通过插件扩展更多匹配方式。

**总是 (Always)**

一种特殊的匹配模式——世界书条目始终存在于上下文中，不依赖关键字触发。

- `lastMessage`：控制条目的放置位置。关闭时每轮对话都前置注入；开启时只在最后一条消息后置注入。
- `layer`（层级）：`< 100` 时内容置于消息之前，`≥ 100` 时置于消息之后。配合 `priority`（优先级）在同一层内排序。

适合固定的角色设定、世界观背景描述——这些信息每轮对话都需要，没必要每次重新匹配。

**一般 (Normal)**

关键字匹配模式。相比 SillyTavern 的关键字系统做了升级——支持最高 **8 组关键字**，组内是**或逻辑**，组间是**满足数量逻辑**。

举个例子：我写一个关于角色的世界书。第一组放角色可能出现的地点（学校、商店、街道），第二组放角色的外在特征（长发、眼镜、高个子），第三组放角色的性格（温柔、内向、毒舌）。如果 `fitCount` 设为 2，那么 AI 回复中只要同时命中至少两组关键字——比如"温柔的长发女生"（特征 + 性格），或者"A市的学生"（地点 + 身份）——这条世界书就会被激活，把角色的完整信息注入上下文。

这样设计的好处是**精准控制匹配条件**，不会因为提到一个词就触发，也不会要求全部命中才触发。对地点型世界书、人物档案、势力介绍之类的内容特别有用。

**事件 (Event)**

在一般匹配的基础上增加**时间匹配**。除了需要满足关键字条件，还必须有一个时间被提及——也就是变量表中存在 `relatedDates`——事件才会触发。

事件型世界书是为了**引导故事走向**。用它来写未来的伏笔（"三天后城里会爆发瘟疫"）或过往的历史背景（"二十年前那场大战的真相"），让故事在合适的时机自然展开，而不是一股脑把所有设定都塞给 AI。配合变量系统使用效果最好——比如玩家调查到某个日期，变量表更新了 `relatedDates`，对应的世界书事件就自动解锁。

**扩展性**

匹配模式是插件化的。`lorebookMatcherRegistry` 管理所有匹配器，每个匹配器只需实现 `match(ctx, expression) => boolean` 接口和对应的编辑器 UI。想增加概率匹配、情绪匹配、递归匹配之类的自定义模式，写个插件注册进去就行，不用改引擎代码。

当预设数量庞大时，通过 `tags` 进行筛选过滤。

### 2. 模型 (LLM API)

和 SillyTavern 的"插头"一样，是对模型 API 的配置。它拆成两个独立的关注点：

**LLM 引擎** — 模型 API 本身。面向插件可扩展，每个服务商实现两个接口：

| 接口 | 运行时 | 职责 |
|---|---|---|
| **Config** | 客户端 | 配置表单 UI（模型选择、参数设置） |
| **Engine** | 服务端 | 调用模型 API，返回 SSE 流式响应 |

新增模型服务商只需注册 Config 和 Engine 即可接入。

**InputBuilder** — 构建上下文的模式。它和模型 API 是分开的，负责将对话历史 + 激活的世界书拼成最终发送给 LLM 的消息数组。InputBuilder 也是可插拔的，目前内置了一个默认构建器（按层级注入世界书、合并同角色连续消息），可以通过插件替换或扩展。

目前内置了 **Deepseek** 和 **OpenAI** 两个引擎。以 Deepseek 为例，配置内容包括：

- 模型选择（deepseek-v4-flash / deepseek-v4-pro）
- API Key（加密存储，自定义字符偏移加密）
- Temperature / Top-P / Stream / Logprobs
- Thinking 推理模式（reasoning_effort）

OpenAI 引擎支持自定义 baseURL，兼容任何 OpenAI 协议的服务（LocalAI、Ollama 等）。

### 3. 故事 (Story)

故事不是角色卡 — 它是**存档**。

- 选一个模型 + 加载一些预设（连同它们依赖的预设）= 一个故事
- 新开存档时可以自由配置，也可以从现有故事复制一份
- 导出存档 = 分享完整体验方案：用了哪些预设、聊了什么、世界变成了什么样

**变量系统**：AI 回复中嵌入 `<variable_changes>` 标签即可自动解析变量变更并从正文剔除，原生支持，无需插件：

```text
<variable_changes>
[{
  "op": "add",
  "path": "time/hour",
  "value": 23
}]
</variable_changes>
```

**总结功能**：标记 `summary` 的消息之前的内容在提示词拼接时会被忽略，配合总结提示词使用可有效控制上下文长度。

**楼层渲染**：消息按楼层展示，界面只显示当前楼层，点击翻页切换。这样设计更适合 MVU 模式和状态栏展示，也不会因为楼层太多而撑爆 iframe。

## 开始游玩

1. 在 Business 仪表板的 Stories 列表中，点击故事旁边的回车图标（↘）
2. 进入游玩界面 — 如果没有配置任何预设，是一片干净的白色
3. 输入栏和功能键默认隐藏，鼠标悬停时才出现
4. 加载预设后，UI 由预设脚本渲染，实现高度客制化
5. 输入消息 → AI 流式回复 → 变量自动解析 → 楼层更新

## 快速开始

```bash
pnpm install
pnpm db-migrate   # 初始化数据库
pnpm dev          # 启动开发服务器 → http://localhost:12804
```

### 可用命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 启动开发服务器，端口 12804 |
| `pnpm build` | 生产构建 |
| `pnpm db-migrate` | 生成并执行数据库迁移 |
| `pnpm gen-stubs` | 生成插件 API stub（新增模块后运行） |
| `pnpm build-plugin <name>` | 打包插件（自动 gen-stubs） |
| `pnpm test` | 运行测试 |

## 项目结构

```
src/
├── app/           # Next.js 页面与 REST API
├── business/      # 数据持久化（Repository 工厂 + Drizzle ORM + SQLite）
├── components/    # UI 组件（ui 基元 / custom 组合 / template 页面模板）
├── engines/       # 驱动引擎
│   ├── macros/    #   宏系统 ──┐
│   ├── lorebooks/ #   世界书    │
│   ├── regexes/   #   正则替换  ├─ 预设引擎（预设编辑器中配置）
│   ├── scripts/   #   脚本      │
│   ├── styles/    #   样式 ────┘
│   ├── deepseek/  #   Deepseek ──┐
│   └── openai/    #   OpenAI ────┘─ 模型引擎（模型配置中配置）
├── handler/       # 请求拦截器管道（参数解析 + 错误处理）
├── lib/           # 通用工具（cn() 类名合并）
├── llmapis/       # LLM API 抽象层（配置 + 引擎 + 输入构建）
├── plugins/       # 插件系统（Registry 注册表 + 客户端插件框架）
├── presets/       # 预设管理
├── slots/         # 会话运行时（ConversationProvider 生命周期）
├── stories/       # 故事/存档系统
└── utils/         # 工具函数（加密、Registry 拓扑排序、流读取）

plugins/           # 外部插件目录
├── _shared/       #   构建共享（shim / stub / alias）
└── project-info/  #   示例插件
```

### 引擎执行流程

引擎负责**处理字符串**（替换占位符、变换文本、注入上下文），不直接渲染 UI。真正的渲染由预设脚本在 iframe 中完成。

```
初始化 (initializer):
    Macro   → 收集所有预设的键值对 → slot.content.macros = { key: value, ... }
    Lorebook → 解析世界书条目，按匹配类型分组
    Regex   → 按 target (input/output/both) 拆分正则规则
    Script  → 收集脚本，按 priority 排序
    Style   → 收集样式，按 priority 排序

输入处理 (inputProcesser):
    Lorebook → 扫描历史消息，匹配激活世界书
    Regex   → 对消息原文应用输入正则替换
    Llmapi  → 构建 LLM 消息格式，注入激活的世界书内容
    Macro   → 用 Eta 引擎将消息中的 <%= it.key %> 替换为对应值

AI 调用 (page.tsx → POST /api/llmapis/{id}/chat):
    Deepseek/OpenAI → 服务端调用模型 API，返回 SSE 流

流式输出 (streamRenderer):
    Regex   → 对输出流应用输出正则替换
    Macro   → 替换输出流中的 Eta 模板占位符
    → page.tsx 调用 postMessage({ type: "streamContent", data: { output } })
    → iframe 内预设脚本接收消息，自定义渲染

完整渲染 (contentRenderer):
    Regex   → 对全部历史消息应用正则替换
    Macro   → 替换全部历史中的模板占位符
    Style   → 注入 CSS <style> 到 iframe head
    Script  → 注入 JS <script> 到 iframe body
    → page.tsx 调用 postMessage({ type: "renderContent", data: { inputs, output } })
    → iframe 内预设脚本接收消息，自定义渲染
    → postMessage({ type: "variables", data: {...} }) 同步变量到 iframe
```

## 文档

详细文档见 `docs/` 目录，每个模块含 `design.md` 和 `using.md`。

## 后续计划

- [ ] **其他模型 API**：欢迎贡献
- [ ] **SillyTavern 角色卡导入**：按规则导入到预设中
- [ ] **历史记录管理**：带缓存的消息编辑

## 开源

项目已开源，随意学习，禁止商用。

🔗 [https://github.com/laoxTu/secyud-tavern](https://github.com/laoxTu/secyud-tavern)

---

*注：文档由 AI 辅助生成，有些细节可能有出入，不要全信。*
