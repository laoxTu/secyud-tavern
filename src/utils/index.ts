export function tryParseJson(str?: string | null, defaultValue: any = null) {
    try {
        return str ? JSON.parse(str) : defaultValue;
    } catch (e) {
        console.warn(`[json](parse error): `, e);
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
            const s = source[key];
            if (s === undefined || s === null) continue;
            const t = result[key];
            // 如果当前值和源值都是普通对象，则递归合并
            if (s && typeof s === 'object' && !Array.isArray(s) &&
                t && typeof t === 'object' && !Array.isArray(t)) {
                result[key] = mergeObjects(t, s);
            } else {
                // 否则，直接覆盖或添加
                result[key] = s;
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

export async function packSseStream(items: AsyncIterable<any>) {
    return new ReadableStream({
        async start(controller) {
            try {
                for await (const item of items) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(item)}\n\n`));
                }
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });
}

/**
 * sse 流解析
 * @param stream
 */
export async function* readSseStream(stream: ReadableStream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    try {
        let buffer = '';
        while (true) {
            const {done, value} = await reader.read();
            buffer += decoder.decode(value, {stream: true});
            const allEvents = buffer
                .split("\n\n");
            const events = done ?
                allEvents : allEvents.slice(0, -1);
            for (const event of events) {
                const json = analyzeEvent(event);
                if (json) yield json;
            }
            if (done) break;
            if (allEvents.length > 1)
                buffer = allEvents[allEvents.length - 1];
        }
    } finally {
        reader.releaseLock();
    }

    function analyzeEvent(event: string) {
        const dataList = event.split("\n");
        let jsonData = "";
        for (const data of dataList) {
            if (data.startsWith("data:")) {
                let content = data.slice(5); // 移除 "data:"
                // 标准：只移除第一个前导空格
                if (content.startsWith(' ')) {
                    content = content.slice(1);
                }
                if (jsonData) jsonData += "\n";
                jsonData += content;
            }
        }
        return jsonData === "[DONE]" ? null : tryParseJson(jsonData);
    }
}

export function joinAsString<T>(
    arr: T[], separator: string,
    value?: (t: T) => string | null | undefined) {
    if (value) {
        return arr
            .map(u => value(u))
            .filter(u => u?.trim())
            .join(separator);
    }

    // 检查数组中的元素是否为字符串
    if (arr.length > 0 && typeof arr[0] === 'string') {
        return arr
            .filter(u => u)
            .join(separator);
    }

    // 其他类型处理
    return arr
        .map(u => String(u))
        .filter(u => u)
        .join(separator);
}

interface SequenceGroup<T, TKey = string> {
    key: TKey,
    items: T[],
}

export function sequenceGroupBy<T, TKey = string>(arr: T[], value: (t: T) => TKey) {
    return arr.reduce((acc, item) => {
        const lastGroup = acc[acc.length - 1];
        const key = value(item);
        if (lastGroup && lastGroup.key === key) {
            lastGroup.items.push(item);
        } else {
            acc.push({key, items: [item]});
        }
        return acc;
    }, [] as SequenceGroup<T, TKey>[]);
}

export function connectSignal(signal: AbortSignal, controller: AbortController) {
    const onAbort = () => {
        console.warn('client abort the api stream.');
        controller.abort();
        signal.removeEventListener("abort", onAbort);
    };
    signal.addEventListener('abort', onAbort);
}