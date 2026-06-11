# Utils 模块 — 使用指南

## Registry<T>

### 创建和使用

```ts
import { Registry, Registerable } from "@/utils/register";

interface MyItem extends Registerable {
    name: string;
    execute(): Promise<void>;
}

const registry = new Registry<MyItem>("my-registry");

// 注册
registry.register({
    id: "step-a",
    name: "Step A",
    async execute() { console.log("A"); }
});

registry.register({
    id: "step-b",
    name: "Step B",
    requires: ["step-a"],  // 在 step-a 之后
    async execute() { console.log("B"); }
});

// 按依赖顺序执行
await registry.use(async (item) => {
    await item.execute();
});
// 输出: A → B
```

### 循环依赖检测

```ts
registry.register(
    { id: "a", requires: ["b"] },
    { id: "b", requires: ["a"] },
);
// registry.getSorted() 会抛出:
// Error: [Sort Error] Circular dependency detected involving: a, b
```

## Hasher — 加密/解密

### 初始化

```ts
import { registerHasher, Hasher } from "@/utils/hasher";

// 注册（通常在 server-registerer.ts 中调用）
registerHasher();

// 之后可通过单例访问
const hasher = Hasher.instance;
```

### 加密

```ts
const encrypted = Hasher.instance.encrypt("my-api-key-123");
// 返回加密后的字符串（长度是原文的 3-5 倍）
```

### 解密

```ts
const decrypted = Hasher.instance.decrypt(encrypted);
// 返回原始字符串: "my-api-key-123"
```

### 配置

加密参数通过环境变量配置：

```bash
SECRET_SALT=9,1,2,6,6,8,2
SECRET_KEYS=8,8,3,4,7,2,3,7
```

默认为内置盐值和密钥。

## 工具函数

### tryParseJson

```ts
import { tryParseJson } from "@/utils";

// 安全 JSON 解析
tryParseJson('{"name":"Alice"}');           // → { name: "Alice" }
tryParseJson('invalid json');               // → null
tryParseJson('invalid', { fallback: true }); // → { fallback: true }
```

### mergeObjects

```ts
import { mergeObjects } from "@/utils";

const target = { name: "Alice", profile: { age: 20 } };
const source = { profile: { mood: "happy" }, location: "tavern" };

mergeObjects(target, source);
// → {
//     name: "Alice",
//     profile: { age: 20, mood: "happy" },  // 深度合并
//     location: "tavern",                    // 新增
//   }

// 注意：数组不合并，直接覆盖
mergeObjects(
    { tags: ["a", "b"] },
    { tags: ["c"] }
);
// → { tags: ["c"] }
```

### tryGetLastItem

```ts
import { tryGetLastItem } from "@/utils";

tryGetLastItem([1, 2, 3]);  // → 3
tryGetLastItem([]);          // → null
```

### mergeSortedArrays

```ts
import { mergeSortedArrays } from "@/utils";

const arr1 = [{ v: 1 }, { v: 3 }, { v: 5 }];
const arr2 = [{ v: 2 }, { v: 4 }];

mergeSortedArrays(arr1, arr2, item => item.v);
// → [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }]
```

### readStream

```ts
import { readStream } from "@/utils";

// 读取 SSE 流
const response = await fetch("/api/chat", { method: "POST", body: data });
const stream = response.body!;

for await (const chunk of readStream(stream)) {
    console.log("Received:", chunk);
    // 逐块处理流式数据
}
```

## cn() — 类名合并

```ts
import { cn } from "@/lib/utils";

cn("flex items-center", "gap-2");
// → "flex items-center gap-2"

cn("px-4", { "text-red-500": isError, "text-green-500": isSuccess });
// → "px-4 text-red-500" (条件成立时)
```
