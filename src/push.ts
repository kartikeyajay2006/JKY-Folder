import { api, body } from './api';

export type PushState = 'unsupported' | 'blocked' | 'off' | 'on';
export const pushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

async function registration() {
  return navigator.serviceWorker.register('/sw.js', { scope: '/' });
}
/** Whether this browser currently delivers reminders for the signed-in account. */
export async function pushState(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = await reg?.pushManager.getSubscription();
  return sub ? 'on' : 'off';
}
export async function enablePush() {
  if (!pushSupported()) throw new Error('This browser cannot receive notifications.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted')
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked for this site. Allow them in your browser’s site settings.'
        : 'Notifications were not allowed.',
    );
  const { publicKey } = await api<{ publicKey: string }>('/push');
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: Uint8Array.from(
        atob(publicKey.replace(/-/g, '+').replace(/_/g, '/')),
        (c) => c.charCodeAt(0),
      ),
    }));
  const json = sub.toJSON();
  await api('/push/subscriptions', {
    method: 'POST',
    body: body({ endpoint: json.endpoint, keys: json.keys }),
  });
}
export async function disablePush() {
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await api('/push/subscriptions', { method: 'DELETE', body: body({ endpoint: sub.endpoint }) });
  await sub.unsubscribe();
}
export const sendTestPush = () =>
  api<{ sent: number; failed: number }>('/push/test', { method: 'POST', body: body({}) });
