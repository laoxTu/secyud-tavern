# Utils 层设计

## 概述

`src/utils/` 提供项目的通用基础设施：依赖感知的注册表（Registry）、加密工具（Hasher）、PNG 解析、流读取和通用工具函数。零业务依赖。

## Registry 注册表 (`register.ts`)

`Registry<T extends Registerable>` 是整个项目的基石。所有插件系统、拦截器管道、存储提供者和对话管道都基于它。

### 接口

```typescript
interface Registerable {
    id: string;
    requires?: string[];
}
```

### Registry 类

```typescript
class Registry<T extends Registerable> {
    constructor(name: string);

    register(...items: T[]): void;        // 按 id 注册，重复的覆盖
    unregister(id: string): void;         // 移除并清除排序缓存
    getSorted(): T[];                     // 缓存拓扑排序，变更时失效
    use(action: (item: T) => Promise<void>, endFlag?: () => boolean): Promise<void>;
    has(id: string): boolean;
    getIds(): string[];
}
```

### 拓扑排序 (Kahn 算法)

`sortByRequires()` 实现：
1. 构建入度表 + 邻接表（从 `requires` 数组）
2. 入度为零的节点入队
3. BFS 遍历：出队 → 加入结果 → 后继节点入度减一 → 入度为零则入队
4. 结果数 < 节点总数 → 抛出循环依赖错误（明确指出涉及的节点）
5. `requires` 包含未注册 id → 抛出缺失依赖错误
6. 排序结果缓存直到 `register`/`unregister` 触发失效

O(V+E) 时间复杂度。所有注册表（interceptor, pluginManager, llmapiEngineRegistry, conversationManager 各阶段, presetTabManager, businessNavigationManager, lorebookMatcherRegistry, presetStorage 等）都使用此实现。

### 子类

- `ServerRegistry<T>` — 添加 `moduleName: string`
- `ClientRegistry<T>` — 添加 `moduleName: string`

## Hasher 加密工具 (`hasher.ts`)

自定义字符容器密码，用于加密数据库中的 LLM API Key。

### 原理

- **字符容器**：键盘字符全集（94 个字符）
- **加密**：对每个明文字符 → 计算位置偏移（基于 salt + keys）→ 生成 2-4 个干扰字符 → 随机排列
- **解密**：按段读取密文 → 奇偶校验找到正确字符 → 减去偏移还原

### 初始化

`registerHasher()` 从环境变量 `SECRET_SALT` 和 `SECRET_KEYS` 创建 `Hasher.instance` 单例。在 `registerServerPlugins()` 中调用。

## PNG 工具 (`png.ts`)

`splitPNGAndDataUniversal(input: Uint8Array)` — 扫描二进制数据中的 PNG IEND 标记（`49 45 4E 44`），将数据分为图片部分（IEND+8 字节前）和附加数据部分（之后）。用于预设的封面图+JSON 合并导出/导入。

## 通用工具 (`index.ts`)

| 函数 | 用途 |
|---|---|
| `tryParseJson(str, defaultValue?)` | 安全 JSON 解析，失败返回默认值 |
| `mergeObjects(target, source)` | 深度递归合并普通对象，数组不合并直接覆盖 |
| `tryGetLastItem(items)` | 安全获取数组最后一个元素 |
| `mergeSortedArrays(arr1, arr2, valueFn)` | 按数值键合并两个有序数组 |
| `readStream(stream)` | 异步生成器：读取 ReadableStream，按 `\n\n` (SSE 边界) 分隔，yield 解析的 JSON |

`readStream` 用于 LLM 聊天流式响应的客户端消费。`mergeObjects` 用于 Repository 的 `update()` 方法中合并 content JSON 字段。
