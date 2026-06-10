export function tryParseJson(str: string, defaultValue: any = null) {
    try {
        console.log(str);
        return JSON.parse(str);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
        return defaultValue;
    }
}

// 原生实现（支持嵌套对象合并）
export function mergeObjects(target: any, source: any) {
    if (!target && !source) return {};
    if (!target) return source;

    const result = target;

    if (source) {
        for (const key in source) {
            // 如果当前值和源值都是普通对象，则递归合并
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
                result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                result[key] = mergeObjects(result[key], source[key]);
            } else {
                // 否则，直接覆盖或添加
                result[key] = source[key];
            }
        }
    }
    return result;
}

export function tryGetLastItem<T>(items: T[]) {
    if (items.length == 0) {
        return null;
    }
    return items[items.length - 1];
}