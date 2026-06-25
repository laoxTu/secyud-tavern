# Utils Layer Usage Guide

## Registry Usage

### Creation and Registration

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

### Execute in Dependency Order

```typescript
await registry.use(async (item) => {
    await item.run();
});
// base → ext

// With early exit
await registry.use(async (item) => process(item), () => shouldStop());
```

### Get Sorted List

```typescript
const sorted = registry.getSorted();
// Guarantees base comes before ext
```

### Circular Dependency Detection

```typescript
registry.register(
    { id: "a", requires: ["b"] },
    { id: "b", requires: ["a"] },
);
registry.getSorted(); // Error: Circular dependency detected involving: a, b
```

## Hasher Usage

### Encryption and Decryption

```typescript
import { Hasher } from "@/utils/hasher";

const encrypted = Hasher.instance.encrypt("sk-my-api-key");
// Store in database

const decrypted = Hasher.instance.decrypt(encrypted);
// Decrypt before use: "sk-my-api-key"
```

### Configuration

```bash
# .env
SECRET_SALT=9,1,2,6,6,8,2
SECRET_KEYS=8,8,3,4,7,2,3,7
```

Built-in defaults exist; production environments should use custom values.

## PNG Utility

```typescript
import { splitPNGAndDataUniversal } from "@/utils/png";

const buffer = await file.arrayBuffer();
const { image, data } = splitPNGAndDataUniversal(new Uint8Array(buffer));

if (image) {
    // image is pure PNG bytes
    await saveImage(image);
}
if (data) {
    // data is arbitrary data appended after the PNG trailer
    const json = JSON.parse(new TextDecoder().decode(data));
}
```

## Stream Reading

```typescript
import { readStream } from "@/utils";

const response = await fetch("/api/llmapis/id/chat", { method: "POST", body: data });

for await (const chunk of readStream(response.body)) {
    // chunk is a parsed JSON object
    // Used for consuming SSE (Server-Sent Events) streaming responses
}
```

## General Utility Functions

```typescript
import { tryParseJson, mergeObjects, tryGetLastItem, mergeSortedArrays } from "@/utils";

// Safe JSON parsing
tryParseJson('{"a":1}');        // { a: 1 }
tryParseJson('bad json', {});   // {}

// Deep merge (arrays are overwritten, not merged)
mergeObjects(
    { a: { b: 1 }, c: 2 },
    { a: { d: 3 }, e: 4 }
);
// → { a: { b: 1, d: 3 }, c: 2, e: 4 }

// Safely get last element
tryGetLastItem([1, 2, 3]);  // 3
tryGetLastItem([]);          // null

// Merge sorted arrays
mergeSortedArrays(
    [{ v: 1 }, { v: 3 }],
    [{ v: 2 }, { v: 4 }],
    item => item.v
);
// → [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }]
```

## cn() — Class Name Merging

```typescript
import { cn } from "@/lib/utils";

cn("flex items-center", "gap-2");
// → "flex items-center gap-2"

cn("text-sm", { "text-red-500": isError, "text-green-500": !isError });
// Appends corresponding class names when conditions are true
```
