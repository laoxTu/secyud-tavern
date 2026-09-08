/**
 * 在数组间插入分割项
 * 变值可在操作数组时改变项目值
 * @param arr 数组
 * @param separator 分割项
 * @param value 数组变值
 */
function intersperse<T, S = T>(
  arr: T[],
  separator: (t: T, i: number) => S,
  value: (t: T, i: number) => S,
) {
  const result: S[] = [];
  if (arr?.length) {
    result.push(value(arr[0], -1));
    for (let i = 1; i < arr.length; i++) {
      const t = arr[i];
      result.push(separator(t, i));
      result.push(value(t, i));
    }
  }
  return result;
}

/**
 * 将数组拼接为字符串
 * @param arr 带拼接数组，可为空
 * @param separator 分隔符，默认','
 * @param value 值选项，获取项目的字符串
 */
function join<T>(
  arr?: T[] | null,
  separator?: string,
  value?: (t: T) => string | null | undefined,
) {
  if (!arr?.length) return '';

  if (value) {
    return arr
      .map((u) => value(u))
      .filter((u) => u?.trim())
      .join(separator);
  }

  // 检查数组中的元素是否为字符串
  if (typeof arr[0] === 'string') {
    return arr.filter((u) => u).join(separator);
  }

  // 其他类型处理
  return arr
    .map((u) => String(u))
    .filter((u) => u)
    .join(separator);
}

/**
 * 按连续值分组
 * @param arr
 * @param value
 */
function groupSerial<TItem, TKey = string>(
  arr: TItem[],
  value: (t: TItem) => TKey,
) {
  return arr.reduce(
    (acc, item) => {
      const lastGroup = acc[acc.length - 1];
      const key = value(item);
      if (lastGroup && lastGroup.key === key) {
        lastGroup.items.push(item);
      } else {
        acc.push({ key, items: [item] });
      }
      return acc;
    },
    [] as {
      key: TKey;
      items: TItem[];
    }[],
  );
}

function joinPath(...args: string[]) {
  return join(args, '/');
}

export const arrUtils = {
  join,
  intersperse,
  groupSerial,
  joinPath,
};
