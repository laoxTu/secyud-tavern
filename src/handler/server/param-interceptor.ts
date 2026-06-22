import {NextRequest, NextResponse} from "next/server";
import {errorInterceptor} from "./error-interceptor";
import {InterceptorModels} from "./interceptor-models";

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
class ParamInterceptor implements InterceptorModels {
    id: string = "param interceptor";
    requires: string[] = [errorInterceptor.id];

    async handle(
        request: NextRequest,
        records: Record<string, any>,
        next: () => Promise<NextResponse>
    ): Promise<NextResponse> {
        // 解析 query 参数（统一命名）
        records.searchParams = deserializeSearchParams(request.nextUrl.searchParams);

        return await next();
    }
}

export const paramInterceptor = new ParamInterceptor();