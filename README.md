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
| **Lorebook** | 世界书 | 条件性背景知识，按关键字/事件匹配后注入上下文 |
| **Regex** | 正则替换 | 在发送前或展示前对文本做查找替换，支持按层数控制生效范围 |
| **Script** | 脚本 | JavaScript 注入 iframe，接收消息通知并自定义渲染 |
| **Style** | 样式 | CSS 注入 iframe，自定义界面外观 |

一个主题预设可能只需要 CSS。一个故事预设可能包含 CSS + JS + 世界书。一个模型预设可能包含世界书。不用再为整合各要素而到处添加链接。

当预设数量庞大时，通过 `tags` 进行筛选过滤。

### 2. 模型 (LLM API)

和 SillyTavern 的"插头"一样，是对模型 API 的配置。同样是面向插件可扩展的，每个模型服务商作为一个引擎插件接入，实现三个接口：

| 接口 | 运行时 | 职责 |
|---|---|---|
| **Config** | 客户端 | 配置表单 UI（模型选择、参数设置） |
| **InputBuilder** | 客户端 | 将对话历史 + 世界书转换为 LLM 消息格式 |
| **Engine** | 服务端 | 调用模型 API，返回 SSE 流式响应 |

目前内置了 **Deepseek** 引擎（Deepseek 官方 API），配置内容包括：

- 模型选择（deepseek-v4-flash / deepseek-v4-pro）
- API Key（加密存储，自定义字符偏移加密）
- Temperature / Top-P / Stream / Logprobs
- Thinking 推理模式（reasoning_effort）

新增模型服务商只需实现上述三个接口并注册到对应 Registry。

### 3. 故事 (Story)

故事不是角色卡 — 它是**存档**。

- 选一个模型 + 加载一些预设（连同它们依赖的预设）= 一个故事
- 新开存档时可以自由配置，也可以从现有故事复制一份
- 导出存档 = 分享完整体验方案：用了哪些预设、聊了什么、世界变成了什么样

**变量系统**：AI 回复中嵌入 `<variable_changes>` 标签即可自动解析变量变更并从正文剔除，原生支持，无需插件：

```text
<variable_changes>
{
  "op": "add",
  "path": "time/hour",
  "value": 23
}
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
npm install
npm run db-migrate   # 初始化数据库
npm run dev          # 启动开发服务器 → http://localhost:3000
```

### 可用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run db-migrate` | 数据库迁移 |
| `npm run gen-stubs` | 生成插件 API stub（新增模块后运行） |
| `npm run build-plugin <name>` | 打包插件（自动 gen-stubs） |
| `npm run test` | 运行测试 |

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
│   └── styles/    #   样式 ────┘
│   └── deepseek/  #   Deepseek ── 模型引擎（模型配置中配置）
├── handler/       # 请求拦截器管道（参数解析 + 错误处理）
├── lib/           # 通用工具（cn() 类名合并）
├── llmapis/       # LLM API 抽象层（配置 + 引擎 + 输入构建）
├── plugins/       # 插件系统（Registry 注册表 + 客户端插件框架）
│   └── client/
│       └── api.ts #   控制反转容器（def() 注册 + pluginApi）
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
    Deepseek → 服务端调用 Deepseek API，返回 SSE 流

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
- [ ] **思维链支持**：独立字段或正文内嵌
- [ ] **历史记录管理**：带缓存的消息编辑
- [ ] **正则测试工具**：编辑器内嵌匹配测试
- [ ] **宏系统增强**：注入 variables、history 到模板上下文

## 开源

项目已开源，随意学习，禁止商用。

🔗 [https://github.com/laoxTu/secyud-tavern](https://github.com/laoxTu/secyud-tavern)

---

*注：本人是 Web 开发新手，边学边写，很多东西没有考虑到，欢迎指正。文档由 AI 辅助生成，有些细节可能有出入，不要全信。*
