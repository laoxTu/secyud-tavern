// src/interceptor/param-interceptor.ts
import {Interceptor} from "@/interceptor";
import {NextRequest, NextResponse} from "next/server";
import {errorInterceptor} from "@/utils/error-interceptor";

/**
 * 从 URLSearchParams 反序列化为对象
 */
export function deserializeSearchParams(searchParams: URLSearchParams) {
    const raw = Object.fromEntries(searchParams);
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(raw)) {
        if (value === '' || value === undefined) continue;

        try {
            result[key] = JSON.parse(value);
        } catch {
            result[key] = value;
        }
    }

    return result;
}

/**
 * 参数解析拦截器
 * 自动将 query params 和 body 注入到 records 中
 */
class ParamInterceptor implements Interceptor {
    id: string = "param interceptor";
    requires: string[] = [errorInterceptor.id];

    async handle(
        request: NextRequest,
        records: Record<string, any>,
        next: () => Promise<NextResponse>
    ): Promise<NextResponse> {
        // 解析 query 参数（统一命名）
        records.searchParams = deserializeSearchParams(request.nextUrl.searchParams);

        // 仅解析有 body 的请求
        const methodsWithBody = ['POST', 'PUT', 'PATCH'];
        if (methodsWithBody.includes(request.method)) {
            try {
                records.body = await request.json();
            } catch {
                // body 可能为空或非 JSON
                records.body = null;
            }
        }

        return await next();
    }
}

export const paramInterceptor = new ParamInterceptor();