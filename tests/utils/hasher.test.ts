import {describe, it, expect, beforeEach} from 'vitest';
import {Hasher} from '@/utils/server/hasher';

describe('Hasher', () => {
    const CONTAINER = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const SALT = [1, 2, 3, 4, 5];
    const KEYS = [10, 20, 30, 40, 50];

    let hasher: Hasher;

    beforeEach(() => {
        hasher = new Hasher(CONTAINER, SALT, KEYS);
    });

    it('应该正确加密和解密各种文本', () => {
        const testCases = [
            'a',
            'Hello',
            'HelloWorld123',
            'TheQuickBrownFox',
            CONTAINER
        ];

        for (const plaintext of testCases) {
            const encrypted = hasher.encrypt(plaintext);
            const decrypted = hasher.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
        }
    });

    it('加密结果应该具有随机性', () => {
        const plaintext = 'test';
        const encrypted1 = hasher.encrypt(plaintext);
        const encrypted2 = hasher.encrypt(plaintext);

        expect(encrypted1).not.toBe(encrypted2);
        expect(hasher.decrypt(encrypted1)).toBe(plaintext);
        expect(hasher.decrypt(encrypted2)).toBe(plaintext);
    });

    it('应该拒绝不在容器中的字符', () => {
        expect(() => hasher.encrypt('Hello!')).toThrow();
        expect(() => hasher.encrypt('test@email')).toThrow();
        expect(() => hasher.encrypt(' ')).toThrow();
    });

    it('应该处理空字符串', () => {
        const encrypted = hasher.encrypt('');
        const decrypted = hasher.decrypt('');
        expect(encrypted).toBe('');
        expect(decrypted).toBe('');
    });
});