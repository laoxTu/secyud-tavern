<div align="center">

# Secyud Tavern

**一个可以自己搭的 AI 故事世界。**

聊天、冒险、经营、弹幕——换一个预设，换一个世界。

[开始游玩](#开始游玩) · [它能做什么](#它能做什么) · [自带玩法](#自带玩法) · [常见问题](#常见问题) · [更多文档](#更多文档)

免费开源 · 装在自己电脑上 · 中文 / English

</div>

Secyud Tavern 是一个在自己电脑上运行的 AI 互动故事平台。

你可以把它想成一个「AI 剧场」：AI 负责演角色，预设负责搭舞台。预设是一套打包好的玩法——AI 的设定集、界面、工具、开关都在里面。舞台可以是聊天窗、冒险游戏、经营面板，也可以是满屏弹幕。换一个预设，就换一个世界。

和普通 AI 聊天有什么不一样？

- 普通聊天：界面是固定的，你只能打字。
- 在这里：界面、按钮、状态栏、输入方式，都可以跟着故事变。
- 这些「舞台」还能打包分享，别人拿到就能玩。

**English**: A self-hosted AI roleplay and storytelling platform you can shape yourself. [English docs →](https://github.com/laoxTu/secyud-tavern-docs/blob/main/en/readme.md)

---

## 它能做什么？

### 一个有记忆的世界

世界书就是 AI 的设定集。人物、地点、历史、规则、物品，都可以写进去。AI 在需要时自己翻，不用你每一轮都重复提醒。

找资料的方式有好几种：关键词、时间、你设的条件，或者按意思搜索。长故事里，它只翻跟当前有关的部分。

### 一个真的会做事的 AI

除了聊天，AI 还能用工具：查资料、记事、算数值、画画、问你想怎么选，甚至叫一个「分身」帮它分析。

它可以连续做几步再回答你，而不是只会说一段话。

### 一个不像聊天框的界面

预设可以自带界面：状态面板、弹幕、选项按钮、手机样子的小面板……想做成什么样都行。

所以第一次打开故事，可能是空白的——不是坏了，是在等你搭舞台。导入一个自带玩法，或者照教程做一个，就有了。

### 一个能存、能翻、能改的故事

一个故事就是一个存档，互不打扰。

你可以翻历史、切换回复、重新生成、改输入和输出，也能随时看看「AI 到底收到了什么」。

聊得太长，就打一个「总结」，让 AI 从总结往后接，不用把前面全部重读。

### 边聊边画

接上 ComfyUI（一个本地画图工具），就能在故事里生图。

可以让 AI 根据当前剧情写画图描述，也可以自己改；画完自动存进故事相册。

### 用你习惯的模型

支持 OpenAI、DeepSeek、Claude，也能填兼容 OpenAI 的服务地址。

每个故事可以选不同模型；密钥加密保存在自己电脑上。

---

## 自带玩法

项目里已经准备了 8 套玩法，导入就能玩，也能拆开当教材。

| 玩法 | 一句话 |
| --- | --- |
| **默认设置** | 工具和开关的总控台，其他玩法都靠它打底 |
| **默认交互** | 最基础的聊天界面，第一次可以先玩这个 |
| **预设作家** | 给 AI 一套写故事的骨架 |
| **模拟经营** | 带数值和状态面板的经营玩法 |
| **疯狂水世界** | 在水世界里求生、抽奖、攒资源 |
| **终末** | 资料量很大的末日故事，适合慢慢探索 |
| **思维分析Agent** | 让 AI 叫一个「分身」来分析角色心理 |
| **弹幕** | 满屏弹幕飘过的互动界面 |

> 第一次导入，建议 8 套全选。有些玩法要搭配别的玩法一起用，导入时不会自动帮你补。

另外，项目自带一个导入器，可以把 SillyTavern（另一个 AI 角色扮演工具）的角色卡和预设导进来。文字内容能带过来，里面自动化的部分要自己调整。

---

## 开始游玩

先装两个东西：**Node.js**（20.9 或更新）和 **Git**。都是免费的，装完就不用管了。

**Windows**

```powershell
git clone --recursive https://github.com/laoxTu/secyud-tavern.git
cd secyud-tavern
.\start.bat
```

**Linux / macOS**

```bash
git clone --recursive https://github.com/laoxTu/secyud-tavern.git
cd secyud-tavern
bash start.sh
```

完成后，用浏览器打开 **<http://127.0.0.1:12804>**。

第一次进入，按三步走：

1. 在「模型」里填一个模型密钥（在模型服务网站上申请），选一个模型。
2. 在「预设」里导入自带玩法：把 `docs/templates/root` 压成一个 zip，压缩包里要保留 `root/` 这一层。Windows 可以在 `docs/templates` 文件夹里双击 `build.bat`，会生成 `default.zip`；Mac / Linux 可以在 `docs/templates` 里执行 `zip -r default.zip root`。
3. 回到预设列表，选一个玩法，点「从预设进入」。

> 打开故事是一片空白？正常。先去导入预设，或者照教程做一个自己的界面。

> 第一次启动会下载一个本地用的小模型（用来按意思搜索），需要联网；之后就不用再下了。
>
> 以后更新：先 `git pull`，再按上面的方法重新启动一次。

---

## 常见问题

**要花钱吗？**

软件免费开源。只有你用的模型服务可能按使用量收费。

**我的聊天记录会被上传吗？**

存在你自己电脑上的一个文件里。只有你实际用到的服务（模型、画图、查资料等）会收到内容。

**不会写代码能玩吗？**

能。导入现成玩法就行；想做自己的，可以照教程改，不需要从零写。

**能做自己的界面和玩法吗？**

可以。预设里可以带自己的界面、按钮、面板和工具；教程里有一套从零开始的步骤。

**支持哪些模型？**

OpenAI、DeepSeek、Claude，以及兼容 OpenAI 的服务。

**有中文吗？**

有。界面支持中文和英文，也能切换明暗主题。

---

## 使用前要知道

- **这是给自己用的。** 没有账号系统，装的人就是管理员。别直接把它放到互联网上。
- **有些预设会运行代码。** 这是它好玩的地方，也是风险所在——只导入信得过的预设。
- **密钥要保管好。** 密钥会加密保存；如果保存密钥的文件丢了，旧密钥就解不开，只能重新填。
- **内容自己判断。** 故事是 AI 写的，请自行判断是否合适。

---

## 更多文档

| 想做什么 | 看这里 |
| --- | --- |
| 安装（Windows / Linux / macOS） | [Windows](https://github.com/laoxTu/secyud-tavern-docs/blob/main/zh/install/windows.md) · [Linux / macOS](https://github.com/laoxTu/secyud-tavern-docs/blob/main/zh/install/linux.md) |
| 选模型、做预设、玩故事、画图 | [使用指南](https://github.com/laoxTu/secyud-tavern-docs/blob/main/zh/guide/readme.md) |
| 从零做一个预设 | [预设教程集](https://github.com/laoxTu/secyud-tavern-docs/blob/main/zh/archive/readme.md) |
| 看懂自带的 8 套玩法 | [模板详解](https://github.com/laoxTu/secyud-tavern-docs/blob/main/templates/readme.md) |
| English | [English docs](https://github.com/laoxTu/secyud-tavern-docs/blob/main/en/readme.md) |

---

## 想改代码 / 做插件？

这个项目也欢迎开发者。想读代码、做插件或参与改进，从这里开始：

[贡献指南](CONTRIBUTING.md) · [开发文档](https://github.com/laoxTu/secyud-tavern-docs/blob/main/zh/develop/readme.md) · [源码学习笔记](https://github.com/laoxTu/secyud-tavern-docs/blob/main/learn/00-导读.md)

---

## 许可

开源协议是 [AGPL-3.0](LICENSE)。自己玩、修改、分享都可以；如果把改过的版本放到网上给别人用，需要把改后的代码也公开。

---

<div align="center">

如果它帮到了你，欢迎点个 Star，或把你做的玩法分享出来。

</div>
