import {describe, it, expect} from 'vitest';
import {generateKey, Hasher} from '@/utils/server/hasher';
import crypto from 'crypto';

describe('Hasher', () => {
    const SALT = "get21389ghjo#$^12f";
    const KEYS = "93^*sy%^45yhh54";

    it('同样的盐和密码应该生成相同的密钥', () => {
        const key1 = generateKey(KEYS, SALT);
        const key2 = generateKey(KEYS, SALT);
        console.info("key1", key1);
        console.info("key1", key2);
        expect(key1.equals(key2)).toBe(true);
    })

    it('应该正确加密和解密各种文本', () => {
        const key = generateKey(KEYS, SALT);
        const hasher = new Hasher(key);
        const testCases = [
            'a',
            'Hello',
            'HelloWorld123',
            'TheQuickBrownFox'
        ];

        for (const plaintext of testCases) {
            const iv = crypto.randomBytes(16);
            const encrypted = hasher.encrypt(plaintext, iv);
            const decrypted = hasher.decrypt(encrypted, iv);
            expect(decrypted).toBe(plaintext);
        }
    });

    it('加密结果应该具有随机性', () => {
        const key = generateKey(KEYS, SALT);
        const hasher = new Hasher(key);
        const plaintext = 'test';
        const iv1 = crypto.randomBytes(16);
        const iv2 = crypto.randomBytes(16);
        const encrypted1 = hasher.encrypt(plaintext, iv1);
        const encrypted2 = hasher.encrypt(plaintext, iv2);

        expect(encrypted1).not.toBe(encrypted2);
        expect(hasher.decrypt(encrypted1, iv1)).toBe(plaintext);
        expect(hasher.decrypt(encrypted2, iv2)).toBe(plaintext);
    });

    it('应该处理空字符串', () => {
        const key = generateKey(KEYS, SALT);
        const hasher = new Hasher(key);
        const iv = crypto.randomBytes(16);
        const encrypted = hasher.encrypt('',iv);
        const decrypted = hasher.decrypt('',iv);
        expect(encrypted).toBe('');
        expect(decrypted).toBe('');
    });
});