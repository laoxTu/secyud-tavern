// src/client/index.ts
/**
 * 此文件只用于client请求server。调用第三方接口请使用fetch。
 */
import type {paths} from './schema.d.ts';
import {ApiError} from "@/handler/client/models";

type Paths = paths;
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'open';
export const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.origin
    }
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

export async function handleResponse(response: Response) {
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

    for (const key of Object.keys(params)) {
        const value = params[key];
        if (value === undefined) {
            delete params[key];
        } else if (result.includes(`{${key}}`)) {
            result = result.replace(`{${key}}`, String(value));
            delete params[key];
        } else if (typeof value === 'object') {
            params[key] = JSON.stringify(value);
        }
    }

    const queryString = new URLSearchParams(params).toString();
    return queryString && queryString.length > 0 ?
        `${result}?${queryString}` : result;
}

interface RequestOptions {
    params?: Record<string, any>;
    body?: any;
    headers?: HeadersInit;
    next?: any;
    cache?: RequestCache;
    signal?: AbortSignal;
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
    options?: RequestOptions
): Promise<any> {
    const fullUrl = buildUrl("/api" + url as string, options?.params);

    const headers = new Headers(options?.headers || {});
    const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: headers,
        next: options?.next,
        cache: options?.cache,
        signal: options?.signal,
    };

    if (options?.body) {
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
            fetchOptions.body = JSON.stringify(options.body);
        } else {
            fetchOptions.body = options.body;
        }
    }

    if (method === "open") {
        window.open(fullUrl);
        return;
    }
    const response = await fetch(getBaseUrl() + fullUrl, fetchOptions);
    return await handleResponse(response);
}

export const get = (url: keyof Paths, options?: RequestOptions) => api(url, 'get', options);
export const post = (url: keyof Paths, body?: any, options?: RequestOptions) => api(url, 'post', {...options, body});
export const put = (url: keyof Paths, body?: any, options?: RequestOptions) => api(url, 'put', {...options, body});
export const del = (url: keyof Paths, options?: RequestOptions) => api(url, 'delete', options);
export const open = (url: keyof Paths, options?: RequestOptions) => api(url, 'open', options);