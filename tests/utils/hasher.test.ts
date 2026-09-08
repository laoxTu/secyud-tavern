import crypto from 'crypto';
import { describe, expect, it } from 'vitest';

import { hasher } from '@/utils/server/hasher';

describe('Hasher', () => {
  const SALT = 'get21389ghjo#$^12f';
  const KEYS = '93^*sy%^45yhh54';

  it('同样的盐和密码应该生成相同的密钥', () => {
    const key1 = hasher.generateKey(KEYS, SALT);
    const key2 = hasher.generateKey(KEYS, SALT);
    console.info('key1', key1);
    console.info('key1', key2);
    expect(key1.equals(key2)).toBe(true);
  });

  it('应该正确加密和解密各种文本', () => {
    const key = hasher.generateKey(KEYS, SALT);
    const instance = hasher.create(key);
    const testCases = ['a', 'Hello', 'HelloWorld123', 'TheQuickBrownFox'];

    for (const plaintext of testCases) {
      const iv = crypto.randomBytes(16);
      const encrypted = instance.encrypt(plaintext, iv);
      const decrypted = instance.decrypt(encrypted, iv);
      expect(decrypted).toBe(plaintext);
    }
  });

  it('加密结果应该具有随机性', () => {
    const key = hasher.generateKey(KEYS, SALT);
    const instance = hasher.create(key);
    const plaintext = 'test';
    const iv1 = crypto.randomBytes(16);
    const iv2 = crypto.randomBytes(16);
    const encrypted1 = instance.encrypt(plaintext, iv1);
    const encrypted2 = instance.encrypt(plaintext, iv2);

    expect(encrypted1).not.toBe(encrypted2);
    expect(instance.decrypt(encrypted1, iv1)).toBe(plaintext);
    expect(instance.decrypt(encrypted2, iv2)).toBe(plaintext);
  });

  it('应该处理空字符串', () => {
    const key = hasher.generateKey(KEYS, SALT);
    const instance = hasher.create(key);
    const iv = crypto.randomBytes(16);
    const encrypted = instance.encrypt('', iv);
    const decrypted = instance.decrypt('', iv);
    expect(encrypted).toBe('');
    expect(decrypted).toBe('');
  });
});
