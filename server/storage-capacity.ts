import { statfsSync } from 'node:fs';
export class StorageCapacityError extends Error {
  constructor() {
    super(
      'Storage is temporarily unavailable. Your saved uploads remain available; try again after the service has recovered.',
    );
  }
}
/** Conservative pre-write check, not a reservation against other processes or a disk quota. */
export function requireStorageCapacity(
  directory: string,
  incomingBytes: number,
  available = () => {
    const s = statfsSync(directory);
    return s.bavail * s.bsize;
  },
) {
  if (!Number.isSafeInteger(incomingBytes) || incomingBytes < 0)
    throw Error('Invalid storage estimate.');
  let free: number;
  try {
    free = available();
  } catch {
    throw new StorageCapacityError();
  }
  // SQLite WAL/chunk writes and original copies can coexist. Keep metadata/erasure headroom.
  if (!Number.isFinite(free) || free < 256 * 1024 * 1024 + incomingBytes * 4)
    throw new StorageCapacityError();
}
