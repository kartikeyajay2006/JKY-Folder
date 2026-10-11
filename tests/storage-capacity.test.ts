import { expect, it } from 'vitest';
import { requireStorageCapacity } from '../server/storage-capacity';
it('preserves metadata/erasure headroom at exact storage boundaries', () => {
  const incoming = 1024,
    required = 256 * 1024 * 1024 + incoming * 4;
  expect(() => requireStorageCapacity('/unused', incoming, () => required)).not.toThrow();
  expect(() => requireStorageCapacity('/unused', incoming, () => required - 1)).toThrow('Storage');
});
it('refuses unknown storage state and invalid estimates before persisting bytes', () => {
  for (const amount of [NaN, Infinity, -1])
    expect(() => requireStorageCapacity('/unused', amount, () => Infinity)).toThrow('estimate');
  expect(() =>
    requireStorageCapacity('/unused', 1, () => {
      throw Error('offline');
    }),
  ).toThrow('Storage');
  expect(() => requireStorageCapacity('/unused', 1, () => NaN)).toThrow('Storage');
});
