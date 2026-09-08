import { Eta } from 'eta/core';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Eta', () => {
  let eta = new Eta();

  beforeEach(() => {});

  it('应当正确拼接', () => {
    const testCases = eta.renderString('Hi <%= it.name %>!', { name: 'Ben' });
    expect(testCases).toBe('Hi Ben!');
  });
});
