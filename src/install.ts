// Installing JKY-Folder as an app. Browsers offer installation once, early, so the offer is
// kept here until the applicant chooses Install in Settings.
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
let offer: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function watchInstall() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    offer = event as InstallPrompt;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    offer = null;
    notify();
  });
  // The service worker makes the app installable and shows an offline page. Development
  // servers skip it so hot reloading and browser tests always see the network.
  if (import.meta.env.PROD && 'serviceWorker' in navigator)
    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    });
}
export const installState = () =>
  window.matchMedia?.('(display-mode: standalone)').matches
    ? ('installed' as const)
    : offer
      ? ('available' as const)
      : /iphone|ipad|ipod/i.test(navigator.userAgent)
        ? ('ios' as const)
        : ('unavailable' as const);
export function onInstallChange(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}
export async function install() {
  if (!offer) return false;
  await offer.prompt();
  const { outcome } = await offer.userChoice;
  offer = null;
  notify();
  return outcome === 'accepted';
}
