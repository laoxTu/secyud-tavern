# Utils 层使用指南

## Registry 使用

### 创建和注册

```typescript
import { Registry } from "@/utils/register";

interface MyPlugin extends Registerable {
    run(): void;
}

const registry = new Registry<MyPlugin>("my-plugins");

registry.register(
    { id: "base", run: () => console.log("base") },
    { id: "ext", requires: ["base"], run: () => console.log("ext") },
);
```

### 按依赖顺序执行

```typescript
await registry.use(async (item) => {
    await item.run();
});
// base → ext

// 带提前退出
await registry.use(async (item) => process(item), () => shouldStop());
```

### 获取排序列表

```typescript
const sorted = registry.getSorted();
// 保证 base 在 ext 之前
```

### 循环依赖检测

```typescript
registry.register(
    { id: "a", requires: ["b"] },
    { id: "b", requires: ["a"] },
);
registry.getSorted(); // Error: Circular dependency detected involving: a, b
```

## Hasher 使用

### 加解密

```typescript
import { Hasher } from "@/utils/hasher";

const encrypted = Hasher.instance.encrypt("sk-my-api-key");
// 存入数据库

const decrypted = Hasher.instance.decrypt(encrypted);
// 使用前解密: "sk-my-api-key"
```

### 配置

```bash
# .env
SECRET_SALT=9,1,2,6,6,8,2
SECRET_KEYS=8,8,3,4,7,2,3,7
```

有内置默认值，生产环境应使用自定义值。

## PNG 工具

```typescript
import { splitPNGAndDataUniversal } from "@/utils/png";

const buffer = await file.arrayBuffer();
const { image, data } = splitPNGAndDataUniversal(new Uint8Array(buffer));

if (image) {
    // image 是纯 PNG 字节
    await saveImage(image);
}
if (data) {
    // data 是 PNG 尾部附加的任意数据
    const json = JSON.parse(new TextDecoder().decode(data));
}
```

## 流读取

```typescript
import { readStream } from "@/utils";

const response = await fetch("/api/llmapis/id/chat", { method: "POST", body: data });

for await (const chunk of readStream(response.body)) {
    // chunk 是已解析的 JSON 对象
    // 用于 SSE (Server-Sent Events) 流式响应消费
}
```

## 通用工具函数

```typescript
import { tryParseJson, mergeObjects, tryGetLastItem, mergeSortedArrays } from "@/utils";

// 安全 JSON 解析
tryParseJson('{"a":1}');        // { a: 1 }
tryParseJson('bad json', {});   // {}

// 深度合并（数组不合并，直接覆盖）
mergeObjects(
    { a: { b: 1 }, c: 2 },
    { a: { d: 3 }, e: 4 }
);
// → { a: { b: 1, d: 3 }, c: 2, e: 4 }

// 安全获取最后一个元素
tryGetLastItem([1, 2, 3]);  // 3
tryGetLastItem([]);          // null

// 合并有序数组
mergeSortedArrays(
    [{ v: 1 }, { v: 3 }],
    [{ v: 2 }, { v: 4 }],
    item => item.v
);
// → [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }]
```

## cn() — 类名合并

```typescript
import { cn } from "@/lib/utils";

cn("flex items-center", "gap-2");
// → "flex items-center gap-2"

cn("text-sm", { "text-red-500": isError, "text-green-500": !isError });
// 条件为 true 时追加对应类名
```
