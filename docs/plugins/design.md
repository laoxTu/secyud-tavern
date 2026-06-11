# Plugins 模块 — 设计文档

## 概述

`src/plugins/` 实现了**插件系统**和**通用注册表基础设施**。它是项目扩展机制的核心——既支撑外部插件的动态发现与加载，也作为所有内部模块的注册基础。

## 设计理念

### 目录即注册

外部插件通过文件系统约定发现：将插件目录放入 `plugins/` 文件夹，应用启动时自动扫描 `manifest.json` 并加载。

```
plugins/
└── example-plugin/
    ├── manifest.json        # 插件元信息
    ├── server.ts            # 服务端脚本
    └── client.js            # 客户端脚本（编译后）
```

### 双运行时设计

插件系统同时支持 Node.js 和 Edge Runtime：

| 运行时 | 发现机制 | 脚本加载 |
|---|---|---|
| Node.js | 文件系统扫描 `plugins/` 目录 | `import()` 动态加载 |
| Edge | 预留 API 端点发现 | TODO |

通过 `process.env.NEXT_RUNTIME` 在运行时判断。

### 两层扩展机制

```
外部插件 (动态发现)
    │  pluginManager.discover() → 读取 manifest.json → 动态 import
    │
    └──→ Registry<T>
           │
内部模块 (静态注册)
    │  engine.registerXxxClient() → registry.register(item)
    │
    └──→ Registry<T>
```

外部插件和内部引擎使用同一套 Registry 基础设施。区别只是注册时机和发现方式。

## 核心架构

### Registry — 带依赖排序的注册表

```ts
class Registry<T extends Registerable> {
    records: Record<string, T>;
    register(...items: T[]): void;
    use(action: (t: T) => Promise<void>, endFlag?: () => boolean): Promise<void>;
    getSorted(): T[];  // 拓扑排序结果（带缓存）
}
```

排序算法：**Kahn 算法**（BFS 拓扑排序）
- 构建邻接表 + 入度表
- 入度为 0 的节点入队
- 广度优先遍历，每出队一个节点，后继入度减 1
- 检测循环依赖（排序结果数量 ≠ 节点总数）

### 注册表继承体系

```
Registry<T>                     (src/utils/register.ts)
├── ServerRegistry<T>           (src/plugins/server/)
│   └── ModelStorage<T>        (src/business/server/storage.ts)
│   └── Interceptor             (src/handler/server/interceptor.ts)
└── ClientRegistry<T>           (src/plugins/client/)
    └── TabManager              (src/components/custom/tab/)
        └── businessNavigationManager
    └── MatcherRegistry         (src/engines/lorebooks/client/match.ts)
    └── LlmapiConfigRegistry    (src/llmapis/client/config.ts)
    └── LlmapiInputBuilderManager
    └── LlmEngineRegistry       (src/llmapis/server/engine.ts)
    └── ConversationManager     (src/slots/client/conversation.ts)
```

**设计意图**：`ServerRegistry` 和 `ClientRegistry` 是类型标记子类。它们不添加额外方法，但通过类型系统确保服务端和客户端注册表不会混淆。

### PluginManager 生命周期

```
1. 初始化
    ├── Node.js: getPluginManifests() → 扫描 plugins/*/manifest.json
    └── Edge: fetch API (TBD)

2. 加载服务端插件
    ├── 遍历已注册的 PluginManifest
    ├── import(plugin.directory + serverScript)
    └── 调用 default export (注册函数)

3. 加载客户端插件
    └── TODO
```

### PluginManifest

```ts
interface PluginManifest extends Registerable {
    version: string;
    serverScript?: string;   // 文件名（如 "server.ts"）
    clientScript?: string;   // 文件名（如 "client.js"）
    directory?: string;      // 自动填充：插件文件夹的 file:// URL
}
```

## 项目中的注册表分布

整个项目的模块协作完全建立在 Registry 基础设施之上：

| 注册表实例 | 类型 | 注册的内容 | 使用者 |
|---|---|---|---|
| `interceptor` | ServerRegistry | 请求拦截器 | API 路由 |
| `modelStorage` | ServerRegistry | 模型存储提供者 | Business 层 |
| `llmapiEngineRegistry` | Registry | LLM 引擎 | Chat API |
| `conversationManager` | Registry | ConversationProvider | 会话生命周期 |
| `llmapiConfigRegistry` | Registry | LLM 配置 UI | LlmApi 编辑器 |
| `llmapiInputBuilderManager` | Registry | 输入构建器 | 消息处理 |
| `presetTabManager` | ClientRegistry | 预设编辑标签 | Preset 编辑器 |
| `businessNavigationManager` | ClientRegistry | 主导航标签 | Business 仪表板 |
| `lorebookMatcherRegistry` | ClientRegistry | 世界书匹配器 | Lorebook 引擎 |

## 依赖排序的实际应用

注册表的拓扑排序确保正确的引擎执行顺序：

```
Lorebook (无依赖)
    │
    ▼
Regex (requires: ["lorebook"])
    │
    ▼
Script (requires: ["regex"])
```

在 `ConversationManager.use()` 中，`getSorted()` 保证 LorebookProvider 先执行，RegexProvider 其次，ScriptProvider 最后。
