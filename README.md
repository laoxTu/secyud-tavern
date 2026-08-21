# Secyud Tavern

一个高度可定制化的 AI 角色扮演与互动叙事平台。

A highly customizable AI role-playing and interactive storytelling platform.

🔗 [详细文档](https://github.com/laoxTu/secyud-tavern-docs)

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

## 插件

> 本项目插件默认为编译期插件，下载插件后需要调用start脚本重启项目。

* [project-info](https://github.com/laoxTu/secyud-tavern) 项目信息，这是一个插件示例，介绍了如何写插件并添加一个tab到主页面，同时展示了secyud-tavern的项目信息。
    * 若要禁用插件，可在manifest.json配置`"disabled": false`，然后重新调用start脚本即可。
* [secyud-tavern-importer](https://github.com/laoxTu/secyud-tavern-importer)
  导入插件，可以导入SillyTavern格式的角色卡和预设。目前只可以导入文字描述之类的内容，不能复刻脚本，需要自行调整。

## 免责声明

* 使用时应当清楚包含但不限于.env，数据库等文件的保密重要性，任何使用过程中因拷贝，传播等行为造成的密钥泄露应当自行担责。
* 使用时应当清楚当地的法律法规，任何因内容生成等使用方面造成的版权等等法律纠纷应当由内容创作者以及模型供应者承担责任。
* 使用时应当清楚本项目是可以随意加载插件和外部代码的，由第三方插件或代码引发的问题应当由第三方承担责任。