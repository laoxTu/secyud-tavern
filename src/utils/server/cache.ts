import {BusinessError} from "@/handler/models";

export interface CacheItem {
    data: any;
    expires: Date;
}


export const cacheStorage = (() => {
    const g = globalThis as { __cache?: Map<string, CacheItem> };
    g.__cache ??= new Map<string, CacheItem>();
    return g.__cache;
})();

export interface Span {
    month?: number;
    week?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
}

const remainCount = 1000;

// 把月/周/天/时/分/秒统一折算成毫秒偏移量加到 date 上
function getDate(date: Date, span: Span) {
    const {month, week, day, hour, minute, second} = {
        ...{
            month: 0,
            week: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
        }, ...span
    }
    return new Date(date.getTime() +
        ((((month * 30 + week * 7 + day) * 24 + hour) * 60 + minute) * 60 + second) * 1000);
}

export async function getCache<T>(key: string, factory?: () => Promise<T>, expire: Span = {
    day: 1,
}) {
    let cache = cacheStorage.get(key);
    if (cache) {
        const now = new Date();
        if (cache.expires >= now || !factory) {
            cache.expires = getDate(now, expire); // 命中即续期，形成滑动过期
            return cache.data as T;
        }
    }
    if (!factory) {
        throw new BusinessError("cache not found");
    }
    return setCache(key, await factory(), expire);
}

export async function setCache<T>(key: string, data: T, expire: Span = {
    day: 1,
}) {
    const cache = {
        data,
        expires: getDate(new Date(), expire)
    };
    cacheStorage.set(key, cache);
    if (cacheStorage.size > remainCount) {
        // 超上限时按过期时间清掉最旧的一批，防止缓存无限增长
        const items = Array.from(cacheStorage)
            .sort((a, b) =>
                a[1].expires.getTime() -
                b[1].expires.getTime());
        for (let i = 0; i < items.length - remainCount; i++) {
            cacheStorage.delete(items[i][0]);
        }
    }
    return cache.data;
}

export async function deleteCache<T>(key: string): Promise<T> {
    const cache = cacheStorage.get(key);
    if (cache) {
        cacheStorage.delete(key);
    }
    return cache?.data;
}