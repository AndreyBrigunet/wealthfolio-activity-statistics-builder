import { describe, expect, it } from 'vitest';
import { createUuid } from './id';

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('createUuid', () => {
  it('uses randomUUID when the browser provides it', () => {
    const expected = '12345678-1234-4234-9234-123456789abc';
    expect(createUuid({ randomUUID: () => expected })).toBe(expected);
  });

  it('creates a UUID without crypto.randomUUID', () => {
    const id = createUuid({
      getRandomValues: (bytes) => {
        bytes.fill(0);
        return bytes;
      },
    });

    expect(id).toBe('00000000-0000-4000-8000-000000000000');
    expect(id).toMatch(UUID_V4_PATTERN);
  });

  it('falls back when Web Crypto is unavailable', () => {
    expect(createUuid({})).toMatch(UUID_V4_PATTERN);
  });
});
