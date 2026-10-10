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

interface UploadSession {
  id: string;
  offset: number;
  size: number;
  expiresAt: number;
  result?: unknown;
}
export async function uploadOriginal<T>(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
  intakeId?: string,
  owner = 'session',
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
  if (saved) {
    try {
      session = await api<UploadSession>(`/uploads/${saved.id}`, { signal });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 404)) throw e;
    }
  }
  if (!session) {
    session = await api<UploadSession>('/uploads', {
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
    });
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ id: session.id, intakeId: saved?.intakeId || intakeId }),
      );
    } catch {
      /* session still usable within this upload */
    }
  }
  if (session.result) {
    try {
      localStorage.removeItem(key);
    } catch {}
    return session.result as T;
  }
  onProgress(Math.floor((session.offset / file.size) * 100));
  while (session.offset < file.size) {
    signal.throwIfAborted();
    const offset = session.offset,
      chunk = file.slice(offset, offset + 512 * 1024);
    try {
      session = await sendChunk(session.id, offset, chunk, file.size, onProgress, signal);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        session = await api<UploadSession>(`/uploads/${session.id}`, { signal });
        if (session.result) break;
      } else throw e;
    }
  }
  const result =
    (session.result as T) ||
    (await api<T>(`/uploads/${session.id}/complete`, { method: 'POST', body: body({}), signal }));
  try {
    localStorage.removeItem(key);
  } catch {}
  onProgress(100);
  return result;
}
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
