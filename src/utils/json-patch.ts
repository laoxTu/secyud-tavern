export interface BaseOperation {
    path: string;
}

export interface AddOperation<T> extends BaseOperation {
    op: 'add';
    value: T;
}

export interface RemoveOperation extends BaseOperation {
    op: 'remove';
}

export interface ReplaceOperation<T> extends BaseOperation {
    op: 'replace';
    value: T;
}

export interface MoveOperation extends BaseOperation {
    op: 'move';
    from: string;
}

export interface CopyOperation extends BaseOperation {
    op: 'copy';
    from: string;
}

export interface TestOperation<T> extends BaseOperation {
    op: 'test';
    value: T;
}

export type Operation =
    AddOperation<any>
    | RemoveOperation
    | ReplaceOperation<any>
    | MoveOperation
    | CopyOperation
    | TestOperation<any>;

export function validate(obj: any) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) ||
        !obj.op || !obj.path) return false;
    switch (obj.op) {
        case 'add':
        case 'replace':
        case 'test':
            return obj.value !== undefined;
        case 'remove':
            return true;
        case 'move':
        case 'copy':
            return !!obj.from;
        default:
            return false;
    }
}

type ExtractNode = { item: any, key: string, pos: number };

// 沿 '/' 路径定位变量节点，create=true 时补建缺失的中间对象，增删改通过返回的 parent 操作。
export function extract(obj: any, path: string, create: boolean = false) {
    const keys = path.split('/').filter(k => k).map(k =>
        k.replace(/~1/g, '/').replace(/~0/g, '~')
    );
    if (!obj) {
        throw new Error("[json patch](error): obj is invalid.");
    }
    let current: ExtractNode = {
        item: obj,
        key: "",
        pos: 0,
    };
    let previous: ExtractNode = null!;
    for (const key of keys) {
        if (!current.item || typeof current.item !== 'object') {
            if (create) {
                current.item = {};
                previous.item[current.key] = current.item;
            } else break;
        }
        previous = current;
        current = {
            item: previous.item[key], key,
            pos: previous.pos + 1,
        }
    }

    return {
        current,
        previous,
        exists: current.pos === keys.length && current.item !== undefined
    };
}

/**
 * 这是针对AI的JSON patch，和一般的json Patch理解不同
 * @param obj
 * @param change
 */
export function patchOne(obj: any, change: Operation) {
    switch (change.op) {
        case "add": {
            const {previous, current} = extract(obj, change.path, true);
            if (!current.item || typeof current.item !== 'object') {
                // 目标没有值或值不为对象，就直接赋值
                previous.item[current.key] = change.value;
            } else if (Array.isArray(current.item)) {
                // 值为数组，直接在后面追加
                current.item.push(change.value);
            } else {
                // 目标是对象，直接展开
                previous.item[current.key] = {
                    ...(current.item ?? {}),
                    ...(change.value ?? {}),
                };
            }
            return true;
        }
        case "replace": {
            // ai 总是会用replace，导致行为不符合预期，所以没有用JSON Patch的标准。
            // JSON Patch 标准：只有目标值存在才会被替换
            const {previous, current} = extract(obj, change.path, true);
            if (!Array.isArray(previous.item)) {
                // 目标没有值，就直接赋值，或值不为对象，就直接赋值
                previous.item[current.key] = change.value;
            } else if (/^\d+$/.test(current.key)) {
                const index = parseInt(current.key, 10);
                if (index >= previous.item.length) {
                    // 追加
                    previous.item.push(change.value);
                } else if (index < 0) {
                    // 插入首位
                    previous.item.unshift(change.value);
                } else {
                    previous.item[index] = change.value;
                }
            } else {
                return false;
            }
            return true;
        }
        case "remove": {
            const {previous, current, exists} = extract(obj, change.path, false);
            if (exists) {
                delete previous.item[current.key];
            }
            return true;
        }
        case "move": {
            const {previous: p, current: c, exists} = extract(obj, change.from, false);
            if (!exists) return false;
            delete p.item[c.key];
            const {previous, current} = extract(obj, change.path, true);
            previous.item[current.key] = c.item;
            return true;
        }
        case "copy": {
            const {current: c, exists} = extract(obj, change.from, false);
            if (!exists) return false;
            const {previous, current} = extract(obj, change.path, true);
            previous.item[current.key] = c.item;
            return true;
        }
        case "test": {
            const {current, exists} = extract(obj, change.path, false);
            return exists && current.item === change.value;
        }
        default:
            return false;
    }
}

export function patch(obj: any, changes?: Operation[]) {
    if (!changes?.length) return [];
    console.debug("[json patch](patch): ", changes);
    return changes.map(u => ({success: patchOne(obj, u)}));
}
