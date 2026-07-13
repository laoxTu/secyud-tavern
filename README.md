# Secyud Tavern

一个高度可定制化的 AI 角色扮演与互动叙事平台。没有繁杂的设定 — 一切由**预设**、**模型**、**故事**三个简洁的概念组成。

A highly customizable AI role-playing and interactive storytelling platform. No clutter — everything revolves around
three simple concepts: **Presets**, **Models**, and **Stories**.

---

## 快速开始 / Quick Start

```bash
pnpm install          # 安装依赖
pnpm pre-build        # 前置 
pnpm gen-db-migrate   # 生成数据库迁移
pnpm build            # 生产构建
pnpm start -p 12804   # 启动 → http://localhost:12804
```

## 开源 / License

项目已开源，随意学习，禁止商用。Open source. Free to study, commercial use prohibited.

🔗 [项目地址](https://github.com/laoxTu/secyud-tavern)
🔗 [使用指南](https://github.com/laoxTu/secyud-tavern-docs)

## 插件

> 本项目插件默认为编译期插件，下载插件后需要调用start脚本重启项目。

* [project-info](https://github.com/laoxTu/secyud-tavern) 项目信息，这是一个插件示例，介绍了如何写插件并添加一个tab到主页面，同时展示了secyud-tavern的项目信息。
    * 若要禁用插件，可在manifest.json配置`"disabled": false`，然后重新调用start脚本即可。
* [secyud-tavern-importer](https://github.com/laoxTu/secyud-tavern-importer)
  导入插件，可以导入SillyTavern格式的角色卡和预设。目前只可以导入文字描述之类的内容，不能复刻脚本，需要自行调整。