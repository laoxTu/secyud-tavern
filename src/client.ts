// src/client/index.ts
/**
 * 此文件只用于client请求server。调用第三方接口请使用fetch。
 */
import type {paths} from './schema.d.ts';
import {ApiError} from "@/handler/client/models";

type Paths = paths;
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.origin
    }
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}
// 基础请求函数
const baseRequest = async (url: string, options: RequestInit) => {
    const response = await fetch(getBaseUrl() + url, options);
    const contentType = response.headers.get("Content-Type");

    if (!contentType?.includes("application/json")) {
        return response;
    }

    const json = await response.json();
    if (!response.ok) {
        throw new ApiError(json.message ?? "Internal Server Error", json.code, json.data);
    }

    return json;
}

// 构建 URL
const buildUrl = (url: string, params?: Record<string, any>) => {
    if (!params) return url;

    let result = url;
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (result.includes(`{${key}}`)) {
            result = result.replace(`{${key}}`, String(value));
        } else {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${result}?${queryString}` : result;
}

/**
 * 统一的 API 请求函数
 * @example
 * // GET 请求
 * const user = await api('/api/users/{id}', 'get', {
 *     params: { id: '123', include: 'posts' }
 * });
 *
 * // POST 请求
 * const newUser = await api('/api/users', 'post', {
 *     body: { name: 'John' }
 * });
 *
 * // PUT 请求
 * const updated = await api('/api/users/{id}', 'put', {
 *     params: { id: '123' },
 *     body: { name: 'Jane' }
 * });
 */
export async function api<
    P extends keyof Paths,
    M extends HttpMethod
>(
    url: P,
    method: M,
    options?: {
        params?: Record<string, any>;
        body?: any;
        headers?: HeadersInit;
        next?: any;
        cache?: RequestCache;
    }
): Promise<any> {
    const fullUrl = buildUrl("/api" + url as string, options?.params);

    const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
            ...(options?.body && {'Content-Type': 'application/json'}),
            ...options?.headers,
        },
        next: options?.next,
        cache: options?.cache,
    };

    if (options?.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    return baseRequest(fullUrl, fetchOptions);
}

export const get = (url: keyof Paths, options?: any) => api(url, 'get', options);
export const post = (url: keyof Paths, body?: any, options?: any) => api(url, 'post', {...options, body});
export const put = (url: keyof Paths, body?: any, options?: any) => api(url, 'put', {...options, body});
export const del = (url: keyof Paths, options?: any) => api(url, 'delete', options);