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
  if (!response.ok) throw new Error('The report could not be downloaded. Refresh and try again.');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
