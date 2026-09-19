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
} /**
 * 标准 FNV-1a 64 位 hash
 * @returns 8 字节 Uint8Array
 */
export function fnv1a64Bytes(str: string): Uint8Array {
  let h1 = 0xcbf29ce4;
  let h2 = 0x84222325;
  const p1 = 0x00000100;
  const p2 = 0x000001b3;

  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h2 ^= c;

    const lo = (h2 >>> 0) * p2;
    const loLow = lo >>> 0;
    const loHigh = Math.floor(lo / 0x100000000);

    const mid1 = (h1 >>> 0) * p2;
    const mid2 = (h2 >>> 0) * p1;

    h2 = loLow;
    h1 = (loHigh + (mid1 >>> 0) + (mid2 >>> 0)) >>> 0;
  }

  // 大端序：h1 在前，h2 在后
  const out = new Uint8Array(8);
  out[0] = (h1 >>> 24) & 0xff;
  out[1] = (h1 >>> 16) & 0xff;
  out[2] = (h1 >>> 8) & 0xff;
  out[3] = h1 & 0xff;
  out[4] = (h2 >>> 24) & 0xff;
  out[5] = (h2 >>> 16) & 0xff;
  out[6] = (h2 >>> 8) & 0xff;
  out[7] = h2 & 0xff;
  return out;
}

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export const strUtils = {
  fnv1a64Bytes,
  random,
  wrap,
  buffer(buffer?: Buffer | ArrayBuffer | string) {
    return typeof buffer === 'string' ? buffer : textDecoder.decode(buffer);
  },
  toBuffer(text?: string) {
    return Buffer.from(textEncoder.encode(text));
  },
};
