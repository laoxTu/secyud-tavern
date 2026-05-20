---
name: api-throw-business-error
description: API 接口不得直接返回错误响应，必须通过抛出 BusinessError 处理错误
---

# API 错误处理规则

## 规则

API 路由处理器中，**禁止直接返回错误响应**（如 `NextResponse.json(..., {status: 400/404/500})`），**必须通过抛出 `BusinessError` 来传递错误**。

**Why:** 项目的 `errorInterceptor` 会统一捕获 `BusinessError` 并格式化为标准 JSON 错误响应，直接返回 `NextResponse` 会绕过错误处理链路，导致错误格式不一致。

**How to apply:** 所有路由处理器中，遇到错误场景时：

```ts
// ❌ 错误 — 不要这样做
if (!story) {
    return NextResponse.json({message: "Story not found"}, {status: 404});
}

// ✅ 正确 — 抛出 BusinessError
import {BusinessError} from "@/shared/errors";

if (!story) {
    throw new BusinessError('entity not found', "default.entity_not_found")
        .withValue("id", id);
}
```
