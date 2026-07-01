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

export async function getCache<T>(key: string, factory: () => Promise<T>, expire: Span = {
    day: 1,
}) {
    const now = new Date();
    let cache = cacheStorage.get(key);
    const expires = getDate(now, expire);
    if (cache) {
        if (cache.expires >= now) {
            cache.expires = expires;
            return cache.data as T;
        }
    }
    cache = {
        data: await factory(),
        expires: expires,
    };
    cacheStorage.set(key, cache);
    return cache.data as T;
}

export async function setCache(key: string, data: any, expire: Span = {
    day: 1,
}) {
    cacheStorage.set(key, {
        data,
        expires: getDate(new Date(), expire)
    });
}