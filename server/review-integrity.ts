import { createHash } from 'node:crypto';

/** JSON property order must not change an evidence or signature hash; array order is significant. */
export function canonicalJson(value: unknown): string {
  const text = JSON.stringify(value, (_key, item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
  if (text === undefined) throw Error('Review evidence must be a JSON value.');
  return text;
}
export const evidenceHash = (value: unknown) =>
  createHash('sha256').update(canonicalJson(value)).digest('hex');
