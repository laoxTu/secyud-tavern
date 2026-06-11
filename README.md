# Secyud Tavern

AI 驱动的角色扮演与互动叙事平台。将角色卡、世界书、正则规则、主题样式和交互脚本打包为单一预设文件，一键导入即可获得完整的故事体验。

## 为什么选择 Secyud Tavern

传统的 AI 角色扮演工具（如 SillyTavern）要求用户分别管理角色卡、世界书、主题和脚本 — 一个完整的体验需要组装多个分散的文件。Secyud Tavern 将这些全部打包为一个**预设（Preset）**，作者只需提供一个 JSON 文件，用户导入后即刻获得完整角色体验。

- **预设即分发**：一个文件包含角色设定、世界观知识、界面皮肤和交互逻辑
- **多核并联**：同时激活多个预设，像搭积木一样组合不同作者的创作
- **变量驱动**：结构化变量表驱动世界演变，而非依赖 AI 的上下文记忆
- **即时测试**：编辑预设 → 点击重载 → 效果立即生效，无需重启、无需发布
- **插件架构**：引擎系统通过注册表扩展，新增匹配器或 AI 服务商无需修改核心代码

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router) + React 19 |
| 样式 | Tailwind CSS 4 + shadcn/ui + Radix UI |
| 数据库 | SQLite (libsql) + Drizzle ORM |
| AI SDK | OpenAI SDK (兼容 Deepseek API) |
| 国际化 | next-intl |
| 测试 | Vitest + Testing Library |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 数据库迁移
npm run db-migrate

# 生成 API 类型
npm run gen-api
```

打开 [http://localhost:3000](http://localhost:3000)，页面会自动跳转到业务仪表板。

## 项目架构

```
src/
├── app/           # Next.js 页面与 REST API（App Router）
├── business/      # 数据持久化层（Repository 模式 + Drizzle ORM）
├── components/    # 三层 UI 体系（ui 基元 / custom 组合 / template 页面）
├── engines/       # 五大可插拔引擎
│   ├── deepseek/  #   AI 推理适配器
│   ├── lorebooks/ #   世界书（关键字/事件匹配）
│   ├── regexes/   #   文本正则替换
│   ├── scripts/   #   用户 JS 注入
│   └── styles/    #   主题 CSS 注入
├── handler/       # 请求拦截器管道（参数解析 + 错误处理）
├── lib/           # 通用工具（cn() 类名合并）
├── llmapis/       # LLM API 抽象层（多服务商支持）
├── plugins/       # 插件系统 + Registry 注册表基础设施
├── presets/       # 预设管理（CRUD + 导入导出）
├── slots/         # 会话运行时（ConversationProvider 生命周期）
├── stories/       # 故事/存档系统（变量驱动状态管理）
└── utils/         # 工具函数（加密、流读取、对象合并）
```

### 核心概念

**预设 (Preset)** — 最小功能单元。一个预设将角色设定、世界书条目、正则替换、CSS 样式和 JS 脚本打包为单个 JSON 文件，支持导入/导出。预设之间可以声明依赖关系。

**故事 (Story)** — 叙事框架。指定需要哪些预设、使用哪个 LLM API、以及开场白（系统提示词）。

**存档 / 会话 (Slot)** — 运行时组合体。将一个 Story + 一组 Preset + 一个 LLM API 绑定为可交互的会话实例，管理对话历史和变量状态。

**变量系统** — 每轮对话的变量变更被精确记录（JSON Patch 风格），形成完整的状态演变轨迹。加载时直接读取最新状态快照，删除消息时通过重放重建历史状态。

**引擎 (Engine)** — 可插拔的功能模块。五大引擎通过注册表自我注册，按拓扑排序执行：Lorebook（匹配）→ Regex（替换）→ Script（注入）。

### 数据流

```
用户输入
  → Lorebook 引擎：匹配激活世界书条目
  → Regex 引擎：应用输入正则替换
  → LLM API 引擎：构建消息 → 调用 AI → 流式响应
  → Regex 引擎：应用输出正则替换
  → 变量提取：解析 AI 回复中的变量变更
  → 渲染：实时流式渲染到 iframe
```

## 可用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run gen-api` | 生成 OpenAPI 客户端类型 |
| `npm run db-migrate` | 数据库迁移 |
| `npm run test` | 运行测试 |

## 文档

详细设计文档见 `docs/` 目录，按模块分层组织：

- [`docs/app`](docs/app/) — 页面与 API 路由
- [`docs/business`](docs/business/) — 数据持久化层
- [`docs/components`](docs/components/) — UI 组件体系
- [`docs/engines`](docs/engines/) — 可插拔引擎系统
- [`docs/handler`](docs/handler/) — 请求拦截器管道
- [`docs/llmapis`](docs/llmapis/) — LLM API 抽象层
- [`docs/plugins`](docs/plugins/) — 插件系统
- [`docs/presets`](docs/presets/) — 预设系统
- [`docs/slots`](docs/slots/) — 会话运行时
- [`docs/stories`](docs/stories/) — 故事/存档系统
- [`docs/utils`](docs/utils/) — 工具函数

每个模块目录包含 `design.md`（设计理念与架构）和 `using.md`（使用指南）。

## 插件开发

外部插件放入 `plugins/` 目录即可自动发现：

```
plugins/my-plugin/
├── manifest.json     # { id, version, serverScript, clientScript }
├── server.ts         # 服务端脚本（动态 import）
└── client.js         # 客户端脚本（需编译为 JS）
```

内置引擎也通过相同的注册表基础设施接入，详见 [`docs/plugins/design.md`](docs/plugins/design.md)。
