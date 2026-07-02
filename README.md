# Secyud Tavern

一个高度可定制化的 AI 角色扮演与互动叙事平台。没有繁杂的设定 — 一切由**预设**、**模型**、**故事**三个简洁的概念组成。

A highly customizable AI role-playing and interactive storytelling platform. No clutter — everything revolves around three simple concepts: **Presets**, **Models**, and **Stories**.

---

- [中文](docs/zh/readme.md) | [English](docs/en/readme.md)

## 快速开始 / Quick Start

```bash
pnpm install          # 安装依赖
pnpm gen-plugin       # 生成插件依赖
pnpm gen-db-migrate   # 生成数据库迁移
pnpm build            # 生产构建
pnpm start -p 12804   # 启动 → http://localhost:12804
```

## 开源 / License

项目已开源，随意学习，禁止商用。Open source. Free to study, commercial use prohibited.

## 环境

注意，为了防止数据库泄露导致的api key被盗，一定要创建.env文件并配置，这些数字您不必记住，只要足够复杂即可，并且将程序拷贝给他人时，注意不要拷贝.env 文件！

Note, to prevent your API key from being stolen due to a database leak, make sure to create a .env file and configure it. You don't need to remember these numbers, just make them complex enough.And when you copy the program to others, be careful not to copy the .env file!

SECRET_SALT=随机的数字 Random number
SECRET_KEYS=随机的数字 Random number
```dotenv
SECRET_SALT=567891561654987498
SECRET_KEYS=4489977816556689136
```

🔗 [项目地址](https://github.com/laoxTu/secyud-tavern)
🔗 [使用指南](https://github.com/laoxTu/secyud-tavern-docs)
