let csrf = '';
export const setCsrf = (value: string) => {
  csrf = value;
};
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const multipart = options.body instanceof FormData;
  const response = await fetch('/api' + path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(!multipart ? { 'Content-Type': 'application/json' } : {}),
      ...(csrf ? { 'x-csrf-token': csrf } : {}),
      ...options.headers,
    },
  }).catch((error: Error) => {
    if (error.name === 'AbortError') throw error;
    throw new Error(
      path.startsWith('/uploads/')
        ? 'Connection interrupted. Select the same file to resume within 24 hours.'
        : 'Connection interrupted. Reconnect and retry.',
    );
  });
  const data = await response
    .json()
    .catch(() => ({ error: 'The service is unavailable. Please retry.' }));
  if (!response.ok)
    throw new ApiError(response.status, data.error || 'This request could not be completed.');
  return data as T;
}
export const body = (value: unknown) => JSON.stringify(value);
export async function download(path: string, name: string) {
  const response = await fetch('/api' + path, { credentials: 'same-origin' });
  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new Error(
      details?.error || 'The download could not be completed. Refresh and try again.',
    );
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface UploadSession {
  id: string;
  name?: string;
  size: number;
  sha256?: string;
  packetId?: string | null;
  offset: number;
  createdAt?: number;
  expiresAt: number;
  result?: unknown;
}
const RETRY_DELAYS = [500, 1000, 2000, 4000, 8000];
const transient = (e: unknown) =>
  (e as Error)?.name !== 'AbortError' &&
  (!(e instanceof ApiError) || e.status >= 500 || e.status === 429);
function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(done, ms);
    function done() {
      signal.removeEventListener('abort', stop);
      resolve();
    }
    function stop() {
      clearTimeout(timer);
      reject(new DOMException('Upload paused.', 'AbortError'));
    }
    signal.addEventListener('abort', stop, { once: true });
  });
}
function online(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (navigator.onLine) return resolve();
    const back = () => {
      signal.removeEventListener('abort', stop);
      resolve();
    };
    const stop = () => {
      window.removeEventListener('online', back);
      reject(new DOMException('Upload paused.', 'AbortError'));
    };
    window.addEventListener('online', back, { once: true });
    signal.addEventListener('abort', stop, { once: true });
  });
}
/**
 * Runs one upload step, retrying transient failures with backoff and waiting out offline
 * periods, so a dropped connection continues from the last saved chunk by itself.
 */
async function resilient<T>(
  step: () => Promise<T>,
  signal: AbortSignal,
  onStatus: (message: string | null) => void,
  progress: () => number,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const value = await step();
      if (attempt) onStatus(null);
      return value;
    } catch (e) {
      if (!transient(e) || attempt >= RETRY_DELAYS.length) throw e;
      if (!navigator.onLine) {
        onStatus(`You’re offline. Upload continues from ${progress()}% when you reconnect.`);
        await online(signal);
        attempt = -1;
        continue;
      }
      onStatus(`Connection interrupted. Retrying from ${progress()}%…`);
      await pause(RETRY_DELAYS[attempt], signal);
    }
  }
}
export async function uploadOriginal<T>(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
  intakeId?: string,
  owner = 'session',
  onStatus: (message: string | null) => void = () => {},
): Promise<T> {
  signal.throwIfAborted();
  const bytes = await file.arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
  const packetId = path.match(/^\/packets\/([^/]+)\/documents$/)?.[1];
  // Cache contains only an opaque session reference; file bytes stay on the server.
  const key = `jky-upload:${owner}:${packetId || 'intake'}:${digest}:${file.name}`;
  let saved: { id: string; intakeId?: string } | undefined;
  try {
    saved = JSON.parse(localStorage.getItem(key) || 'null') || undefined;
  } catch {
    /* storage unavailable */
  }
  let session: UploadSession | undefined;
  const percent = () => (session ? Math.floor((session.offset / file.size) * 100) : 0);
  const retry = <R>(step: () => Promise<R>) => resilient(step, signal, onStatus, percent);
  if (saved) {
    try {
      session = await retry(() => api<UploadSession>(`/uploads/${saved!.id}`, { signal }));
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 404)) throw e;
    }
  }
  if (!session) {
    // Another tab or device may have started this exact original: continue its saved bytes.
    const pending = await retry(() =>
      api<UploadSession[]>(`/uploads?sha256=${digest}`, { signal }),
    ).catch(() => [] as UploadSession[]);
    session = pending.find(
      (s) =>
        s.name === file.name && s.size === file.size && (s.packetId || '') === (packetId || ''),
    );
  }
  if (!session) {
    session = await retry(() =>
      api<UploadSession>('/uploads', {
        method: 'POST',
        signal,
        body: body({
          name: file.name,
          size: file.size,
          sha256: digest,
          ...(packetId
            ? { packetId }
            : { intakeId: saved?.intakeId || intakeId || crypto.randomUUID() }),
        }),
      }),
    );
  }
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ id: session.id, intakeId: saved?.intakeId || intakeId }),
    );
  } catch {
    /* session still usable within this upload */
  }
  if (session.result) {
    try {
      localStorage.removeItem(key);
    } catch {}
    return session.result as T;
  }
  onProgress(percent());
  while (session.offset < file.size) {
    signal.throwIfAborted();
    const current: UploadSession = session;
    try {
      session = await retry(() =>
        sendChunk(
          current.id,
          current.offset,
          file.slice(current.offset, current.offset + 512 * 1024),
          file.size,
          onProgress,
          signal,
        ),
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        session = await retry(() => api<UploadSession>(`/uploads/${current.id}`, { signal }));
        if (session.result) break;
      } else throw e;
    }
  }
  const finished: UploadSession = session;
  const result =
    (finished.result as T) ||
    (await retry(() =>
      api<T>(`/uploads/${finished.id}/complete`, { method: 'POST', body: body({}), signal }),
    ));
  try {
    localStorage.removeItem(key);
  } catch {}
  onProgress(100);
  return result;
}
/** Unfinished uploads saved on the server for this account. */
export const pendingUploads = () => api<UploadSession[]>('/uploads');
function sendChunk(
  id: string,
  offset: number,
  chunk: Blob,
  total: number,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
): Promise<UploadSession> {
  return new Promise((resolve, reject) => {
    if (signal.aborted)
      return reject(
        new DOMException(
          'Upload paused. Select the same file to resume within 24 hours.',
          'AbortError',
        ),
      );
    const xhr = new XMLHttpRequest(),
      abort = () => xhr.abort(),
      cleanup = () => signal.removeEventListener('abort', abort);
    xhr.open('PUT', `/api/uploads/${id}`);
    xhr.withCredentials = true;
    xhr.timeout = 60000;
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('upload-offset', String(offset));
    if (csrf) xhr.setRequestHeader('x-csrf-token', csrf);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.floor(((offset + e.loaded) / total) * 100));
    };
    xhr.onload = () => {
      cleanup();
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new ApiError(xhr.status, data.error || 'Upload failed.'));
      } catch {
        reject(new Error('Upload response unavailable. Select the same file to resume.'));
      }
    };
    xhr.onerror = xhr.ontimeout = () => {
      cleanup();
      reject(
        new Error(
          'Connection interrupted. Select the same file to resume from its saved chunk within 24 hours.',
        ),
      );
    };
    xhr.onabort = () => {
      cleanup();
      reject(
        new DOMException(
          'Upload paused. Select the same file to resume within 24 hours.',
          'AbortError',
        ),
      );
    };
    signal.addEventListener('abort', abort, { once: true });
    xhr.send(chunk);
  });
}
