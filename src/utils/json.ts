/**
 * 安全解析json，失败会静默warning
 * @param text 要解析的字符串
 * @param defaultValue 解析失败的返回值
 */
export function parse(text?: any | null, defaultValue: any = null) {
  try {
    return text?.trim() ? JSON.parse(text) : defaultValue;
  } catch (e) {
    console.warn(`[json](parse error): `, e);
    return defaultValue;
  }
}

/**
 * 压缩json，将json文字压缩
 * 若无法解析，给出空字符串
 * @param text
 */
export function minify(text?: string) {
  const json = parse(text);
  return json ? JSON.stringify(json) : '';
}

/**
 * 原地合并JSON对象，lft为空则返回rht的深度拷贝，
 * 同时为空返回空对象，否则返回lft
 */
export function merge(lft: any, rht: any) {
  if (!lft && !rht) return {};
  if (!lft) return structuredClone(rht);

  const result = lft;

  if (rht) {
    for (const key in rht) {
      const s = rht[key];
      if (s === undefined || s === null) continue;
      const t = result[key];
      // 如果当前值和源值都是普通对象，则递归合并
      if (
        s &&
        typeof s === 'object' &&
        !Array.isArray(s) &&
        t &&
        typeof t === 'object' &&
        !Array.isArray(t)
      ) {
        result[key] = merge(t, s);
      } else {
        // 否则，直接覆盖或添加
        result[key] = s;
      }
    }
  }
  return result;
}

export const jsonUtils = {
  parse,
  minify,
  merge,
};
