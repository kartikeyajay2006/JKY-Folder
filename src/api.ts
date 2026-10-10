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

export function uploadOriginal<T>(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Upload cancelled.', 'AbortError'));
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const cleanup = () => signal.removeEventListener('abort', abort);
    xhr.open('POST', '/api' + path);
    xhr.withCredentials = true;
    if (csrf) xhr.setRequestHeader('x-csrf-token', csrf);
    xhr.timeout = 120000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      cleanup();
      let result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        return reject(
          new Error('The upload response was unreadable. Refresh the folder before retrying.'),
        );
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(result);
      else reject(new ApiError(xhr.status, result.error || 'Upload failed.'));
    };
    xhr.onerror = () => {
      cleanup();
      reject(
        new Error(
          'Connection interrupted. Accepted files stay saved. Reconnect and retry; duplicates are detected.',
        ),
      );
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new Error('Upload timed out. Refresh the folder before retrying.'));
    };
    xhr.onabort = () => {
      cleanup();
      reject(
        new DOMException(
          'Upload cancelled. A file already accepted by the server may still appear in the folder.',
          'AbortError',
        ),
      );
    };
    signal.addEventListener('abort', abort, { once: true });
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}
