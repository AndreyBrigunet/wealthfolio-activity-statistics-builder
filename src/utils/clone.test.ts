import { describe, expect, it } from 'vitest';
import { cloneSerializable } from './clone';

describe('cloneSerializable', () => {
  it('uses the native clone implementation when available', () => {
    const source = { nested: { value: 1 } };
    const clone = cloneSerializable(source, (value) => ({ ...value, native: true }));
    expect(clone).toEqual({ nested: { value: 1 }, native: true });
  });

  it('clones dashboard-compatible data without structuredClone', () => {
    const source = { title: 'Widget', filters: { types: ['DEPOSIT'] } };
    const clone = cloneSerializable(source, null);
    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);
    expect(clone.filters).not.toBe(source.filters);
  });
});
