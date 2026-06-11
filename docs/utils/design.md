# Utils 模块 — 设计文档

## 概述

`src/utils/` 提供项目的**通用工具函数和基础设施类**，包括：
- `Registry<T>` — 带依赖排序的通用注册表（整个插件系统的基石）
- `Hasher` — API Key 等敏感信息的加密/解密工具
- 通用工具函数 — JSON 解析、对象合并、流读取等

## 设计理念

### 纯工具，零业务依赖

`utils/` 中的代码不依赖任何业务模块。它们是最底层的基础设施，被 `plugins/`、`handler/`、`business/` 等上层模块引用。

### Registry — 单一实现，多处复用

`Registry<T>` 只在一个文件中定义一次，但整个项目的所有注册表都基于它：

| 注册表实例 | 所在模块 | 类型参数 |
|---|---|---|
| `interceptor` | handler/server | `InterceptorModels` |
| `pluginManager` | plugins/manager | `PluginManifest` |
| `llmapiEngineRegistry` | llmapis/server | `LlmapiEngine` |
| `llmapiConfigRegistry` | llmapis/client | `LlmapiConfig` |
| `llmapiInputBuilderManager` | llmapis/client | `LlmapiInputBuilder` |
| `conversationManager` | slots/client | `ConversationProvider` |
| `presetTabManager` | presets/client | `TabConfig` |
| `businessNavigationManager` | business/client | `TabConfig` |
| `lorebookMatcherRegistry` | engines/lorebooks | `Matcher` |
| `modelStorage` | business/server | `ModelStorageProvider` |

## 核心组件

### 1. Registry<T> — 拓扑排序注册表

```ts
class Registry<T extends Registerable> {
    records: Record<string, T>;
    register(...items: T[]): void;
    unregister(id: string): boolean;
    use(action: (t: T) => Promise<void>, endFlag?: () => boolean): Promise<void>;
    getSorted(): T[];
    has(id: string): boolean;
    getIds(): string[];
}
```

排序算法：**Kahn 算法**（BFS 拓扑排序）
- O(V + E) 时间复杂度
- 自动检测循环依赖并抛出明确错误
- 排序结果被缓存，注册/注销后失效

### 2. Hasher — 自定义字符偏移加密

`Hasher` 实现一种基于字符容器 + 盐值 + 密钥的自定义加密算法：

- **字符容器**：包含键盘字符的完整集合（94 个字符）
- **盐值**：从环境变量 `SECRET_SALT` 读取的数字数组
- **密钥**：从环境变量 `SECRET_KEYS` 读取的数字数组

**加密原理**：
1. 每个明文字符在容器中定位 → 加上偏移量（由盐值和密钥计算）→ 得到密文位置
2. 为每个字符生成 2-4 个干扰字符（从容器中随机选择与正确位置不匹配的字符）
3. 随机排列正确字符和干扰字符

**解密原理**：
1. 按步长分段读取密文
2. 在每段中通过匹配规则识别正确字符
3. 减去偏移量还原原始字符

**设计意图**：简单的字符级混淆，防止 API Key 在数据库中明文存储。不是工业级加密，但足以防御数据库文件泄露时的密钥暴露。

### 3. mergeObjects — 深度对象合并

```ts
function mergeObjects(target: any, source: any): any
```

递归合并两个对象：
- 两个值都是普通对象 → 递归合并
- 其他情况 → source 覆盖 target
- 数组不合并，直接覆盖

在 Repository 的 `update()` 方法中使用，用于部分更新 `content` JSON 字段。

### 4. readStream — SSE 流异步生成器

```ts
async function* readStream(stream: ReadableStream): AsyncGenerator<string>
```

逐块读取 ReadableStream（用于 SSE），每次 yield 解码后的文本块。用于 AI 聊天的流式响应处理。

### 5. 其他工具函数

| 函数 | 用途 |
|---|---|
| `tryParseJson(str, defaultValue)` | 安全 JSON 解析，失败返回默认值 |
| `tryGetLastItem(arr)` | 安全获取数组最后一个元素（空数组返回 null） |
| `mergeSortedArrays(arr1, arr2, valueFn)` | 归并两个已排序数组 |

## 文件组织

```
src/utils/
├── register.ts    # Registry<T> — 整个插件系统的基石
├── hasher.ts      # Hasher — 加密/解密
├── index.ts       # 通用工具函数集合
└── (其他)
```

`src/lib/utils.ts` 与 `src/utils/` 的关系：
- `lib/utils.ts`：**通用工具**（纯函数，无业务语义）— `cn()` 类名合并
- `utils/`：**项目工具**（有业务语义）— `Registry`、`Hasher`、`mergeObjects`
