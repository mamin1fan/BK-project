// Urusan PWA: daftar service worker & tombol "Pasang di Layar Utama".
import { notify as refresh } from '../core/store.js';
import { toast } from './toast.js';

let installEvent = null;

export const canInstall = () => !!installEvent;
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

export async function install() {
  if (!installEvent) return toast('Gunakan panduan manual di bawah.');
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent = null;
  refresh();
}

export function initPwa() {
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker gagal:', err));
  }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; refresh(); });
  addEventListener('appinstalled', () => { installEvent = null; toast('Priorita terpasang'); refresh(); });
}
