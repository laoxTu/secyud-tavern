/**
 * 生成指定长度的随机字符串
 * @param length
 * @param charset 字符集，随机字符从中产生
 */
export function random(
  length: number,
  charset: string = 'abcdefghijklmnopqrstuvwxyz0123456789',
) {
  return Array.from(
    { length },
    () => charset[Math.floor(Math.random() * charset.length)],
  ).join('');
}

export function wrap(
  template: (text: string) => string,
  text: string,
  pad?: string,
) {
  return template(pad ? pad + text.replace('\n', `\n${pad}`) : text);
}

export const strUtils = {
  random,
  wrap,
};
