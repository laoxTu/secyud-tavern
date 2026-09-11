# 贡献指南

感谢你对 Secyud Tavern 感兴趣。本文档说明如何搭建开发环境、需要遵循哪些约定，以及如何提交你的改动。

第一次贡献建议先开一个 Issue 说说你的想法，避免方向不一致导致白做。

---

## 我能贡献什么

| 方向              | 说明                                                                            |
| ----------------- | ------------------------------------------------------------------------------- |
| 缺陷修复 / 新功能 | 直接改 `src/` 下的模块                                                          |
| 插件              | 在 `plugins/` 下开发，见 [插件开发指南](docs/zh/develop/plugin.md)              |
| 文档              | 提到独立仓库 [secyud-tavern-docs](https://github.com/laoxTu/secyud-tavern-docs) |
| 翻译              | 每个模块 `localization/` 下的 `zh.json` / `en.json`                             |
| 预设模板          | 放到 `docs/templates/presets/`                                                  |
| 反馈              | 用 Issue 描述你遇到的情况：期望行为、实际行为、复现步骤                         |

---

## 环境准备

前置：Node.js 20.9+（Next.js 16 的最低要求）、pnpm、Git。

```bash
git clone --recursive https://github.com/laoxTu/secyud-tavern.git
cd secyud-tavern
pnpm install
pnpm prepare
pnpm dev          # → http://localhost:12804
```

- `--recursive` 用于拉取 `docs` 子模块。已经 clone 过的执行 `git submodule update --init --recursive`。
- `pnpm prepare` 是**必须执行**的前置步骤，它会：生成 `.env`、执行数据库迁移、下载推理模型到 `public/models`、扫描模块与插件的 `manifest.json` 并生成注册代码和 API 路由。
  - 首次执行会联网下载模型（默认走 `hf-mirror.com`，可在 `scripts/build-config.json` 中更换镜像）。
  - **新增、重命名或修改任何 `manifest.json` 之后，都要重新执行一次并重启。** 编译期插件无法热更新。
- 生产构建：`pnpm build && pnpm start -p 12804`。仓库根目录的 `start.sh` / `start.bat` 是给最终用户的一键更新脚本（拉代码 → 装依赖 → 构建 → 启动），开发时用不到。

### 不要提交的内容

`.gitignore` 已经覆盖了这些，请不要用 `-f` 强行加进来：

- `.env` / `.env.local` —— 含 `SECRET_SALT`、`SECRET_KEYS` 等密钥。本地私密配置（如第三方服务 Token）写在 `.env.local` 里。
- `data/` —— 本地数据库。
- `public/`、`.next/` —— 构建产物与下载的模型。
- `src/app/api/`、`src/generated/`、`scripts/generated/` —— 自动生成的代码，下次 `pnpm prepare` 会被覆盖。
- `plugins/` —— 插件各自是独立仓库。

---

## 项目结构

`src/` 下每个目录是一个能力模块（模型、预设、故事、记忆、ComfyUI……），结构统一：

```
src/<模块>/
├── index.ts          类型、常量、模块元信息（导出复数形式对象，如 presets）
├── manifest.json     模块声明：{ id, client, server }
├── client/           浏览器侧：组件、hook、状态、注册
│   ├── index.tsx     对外导出并完成注册
│   ├── component.tsx / content.tsx / state.ts / proxy.ts / factory.ts
├── server/           服务端
│   ├── api.ts        接口定义 → 自动生成 Next.js 路由
│   ├── repository.ts / schema.ts / storage.ts / factory.ts
└── localization/     zh.json + en.json
```

路径别名（`tsconfig.json` 与 `vitest.config.ts` 中均已配置）：

| 别名       | 指向                     |
| ---------- | ------------------------ |
| `@`        | `src/`                   |
| `@/lib`    | `src/utils/lib`          |
| `@/hooks`  | `src/utils/client/hooks` |
| `@plugins` | `plugins/`               |

插件放在 `plugins/<name>/`，每个插件是一个独立的 Git 仓库（主仓库不跟踪该目录）。clone 进去之后执行一次 `pnpm prepare` 即会被自动加载。

---

## 代码约定

- **接口写在模块的 `server/api.ts` 里**，`src/app/api/` 下的路由是生成的，手改无效。
- **导出风格**：类型、工厂、hook 直接导出；工具函数与常量集合以对象形式导出（如 `presets`、`strUtils`、`jsonUtils`、`fileUtils`）。
- **格式化**：Prettier 负责，配置为单引号、80 列，并启用 import 排序与 JSON key 排序插件。执行 `pnpm format`，注意它的作用范围只有 `src/`。VS Code 的保存自动格式化已经配好（`.vscode/settings.json`）。
- **多语言**：目前只有 `zh`、`en` 两种 locale，默认 `zh`。新增文案时 `zh.json` 与 `en.json` 要成对更新，只补一边会导致另一种语言下文案缺失。

## 测试

```bash
pnpm test        # watch 模式
pnpm test run    # 跑一次，提交前用这个
```

- 框架为 Vitest + jsdom，用例放在 `tests/<模块>/<名称>.test.ts`，`tests/**/*.{test,spec}.{ts,tsx}` 会被自动收集。
- `globals` 已开启，`vitest.setup.ts` 中已 mock `next-themes` 与 `next/navigation`，不需要在每个用例里重复处理。
- 当前覆盖率较低（仅 ComfyUI、宏、部分工具），纯逻辑部分（宏求值、预设解析、各类 `utils`）非常欢迎补测试。

---

## 提交 Pull Request

1. Fork 本仓库，从 `main` 切出特性分支。
2. 提交信息用简短的英文祈使句，一个提交只做一件事：
   ```
   fix lora
   add json support for macro
   update model setting
   ```
3. 提交前确认以下三条都通过：
   ```bash
   pnpm format
   pnpm test run
   pnpm build
   ```
4. PR 目标分支为 `main`，描述里说明**改了什么、为什么改、如何验证**；涉及界面的改动请附截图。
5. 不要在功能 PR 里修改 `package.json` 的版本号，发版由维护者统一处理。

---

## 关于安全性的取舍

本项目的定位是**自部署的个人应用**，部署者即管理员，不存在多租户边界。预设中的脚本、样式、宏允许执行使用者自己编写的 JS 与 CSS，这是产品刻意提供的核心能力，不是缺陷。

代码里有一些"看起来危险"的写法属于同类取舍。如果你认为某处确实构成风险，请先开 Issue 讨论，不要直接提交"移除这项能力"式的加固 PR —— 这会破坏已有用户的预设与插件。

---

## 许可

本项目以 [GNU AGPL-3.0](LICENSE) 开源。提交 PR 即表示你同意你的贡献以同一协议授权。

有疑问请在 Issue 中提出，或在 PR 里直接留言。
