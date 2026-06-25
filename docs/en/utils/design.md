# Utils Layer Design

## Overview

`src/utils/` provides the project's common infrastructure: a dependency-aware Registry, an encryption utility (Hasher), PNG parsing, stream reading, and general utility functions. Zero business dependencies.

## Registry (`register.ts`)

`Registry<T extends Registerable>` is the cornerstone of the entire project. All plugin systems, interceptor pipelines, storage providers, and conversation pipelines are built on it.

### Interface

```typescript
interface Registerable {
    id: string;
    requires?: string[];
}
```

### Registry Class

```typescript
class Registry<T extends Registerable> {
    constructor(name: string);

    register(...items: T[]): void;        // Register by id, duplicates overwrite
    unregister(id: string): void;         // Remove and clear sorted cache
    getSorted(): T[];                     // Cached topological sort, invalidated on change
    use(action: (item: T) => Promise<void>, endFlag?: () => boolean): Promise<void>;
    has(id: string): boolean;
    getIds(): string[];
}
```

### Topological Sort (Kahn's Algorithm)

`sortByRequires()` implements:
1. Build indegree table + adjacency list (from `requires` array)
2. Enqueue nodes with indegree zero
3. BFS traversal: dequeue → add to result → decrement successor indegree → enqueue if indegree reaches zero
4. Result count < total node count → throw circular dependency error (explicitly listing affected nodes)
5. `requires` contains unregistered id → throw missing dependency error
6. Sorted result cached until `register`/`unregister` triggers invalidation

O(V+E) time complexity. All registries (interceptor, pluginManager, llmapiEngineRegistry, conversationManager stages, presetTabManager, businessNavigationManager, lorebookMatcherRegistry, presetStorage, etc.) use this implementation.

### Subclasses

- `ServerRegistry<T>` — adds `moduleName: string`
- `ClientRegistry<T>` — adds `moduleName: string`

## Hasher Encryption Utility (`hasher.ts`)

Custom character-container cipher for encrypting LLM API Keys in the database.

### Principle

- **Character container**: Full set of keyboard characters (94 characters)
- **Encryption**: For each plaintext character → compute position offset (based on salt + keys) → generate 2-4 noise characters → random permutation
- **Decryption**: Read ciphertext in segments → parity check to find the correct character → subtract offset to restore

### Initialization

`registerHasher()` creates the `Hasher.instance` singleton from environment variables `SECRET_SALT` and `SECRET_KEYS`. Called within `registerServerPlugins()`.

## PNG Utility (`png.ts`)

`splitPNGAndDataUniversal(input: Uint8Array)` — Scans binary data for the PNG IEND marker (`49 45 4E 44`), splitting the data into an image portion (before IEND+8 bytes) and an appended data portion (after). Used for preset cover image + JSON combined export/import.

## General Utilities (`index.ts`)

| Function | Purpose |
|---|---|
| `tryParseJson(str, defaultValue?)` | Safe JSON parsing, returns default on failure |
| `mergeObjects(target, source)` | Deep recursive merge of plain objects; arrays are not merged but overwritten directly |
| `tryGetLastItem(items)` | Safely get the last element of an array |
| `mergeSortedArrays(arr1, arr2, valueFn)` | Merge two sorted arrays by a numeric key |
| `readStream(stream)` | Async generator: reads a ReadableStream, splits on `\n\n` (SSE boundaries), yields parsed JSON |

`readStream` is used for client-side consumption of LLM chat streaming responses. `mergeObjects` is used in the Repository's `update()` method for merging content JSON fields.
