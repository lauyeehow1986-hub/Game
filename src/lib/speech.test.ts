import { describe, it, expect } from 'vitest';
import { localeToBcp47 } from './speech';

describe('localeToBcp47', () => {
  it('maps each supported locale to a real BCP-47 tag', () => {
    expect(localeToBcp47('en')).toBe('en-SG');
    expect(localeToBcp47('zh')).toBe('zh-CN');
    expect(localeToBcp47('ms')).toBe('ms-MY');
    expect(localeToBcp47('ta')).toBe('ta-IN');
  });
});
