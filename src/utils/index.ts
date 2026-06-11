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

export function mergeSortedArrays<T>(arr1: T[], arr2: T[], value: (t: T) => number): T[] {
    let i = 0, j = 0;
    const result: T[] = [];

    // 同时遍历两个数组，比较当前元素
    while (i < arr1.length && j < arr2.length) {
        if (value(arr1[i]) <= value(arr2[j])) {
            result.push(arr1[i]);
            i++;
        } else {
            result.push(arr2[j]);
            j++;
        }
    }

    // 将剩余元素直接加入（此时另一个数组已遍历完）
    while (i < arr1.length) {
        result.push(arr1[i]);
        i++;
    }

    while (j < arr2.length) {
        result.push(arr2[j]);
        j++;
    }

    return result;
}

export async function* readStream(stream: ReadableStream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            const chunk = typeof value === 'string' ? value : decoder.decode(value);
            yield chunk;
        }
    } finally {
        reader.releaseLock();
    }
}