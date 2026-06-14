import {describe, it, expect, beforeEach} from 'vitest';
import {Eta} from 'eta/core';

describe('Eta', () => {
    const CONTAINER = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let eta = new Eta();

    beforeEach(() => {
    });

    it('应当正确拼接', () => {
        const testCases = eta.renderString("Hi <%= it.name %>!", {name: "Ben"});
        expect(testCases).toBe("Hi Ben!");
    });
});