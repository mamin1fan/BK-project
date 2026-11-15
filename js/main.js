// Pintu masuk aplikasi: sambungkan data -> tampilan.
import { state, subscribe, save } from './core/store.js';
import { ui, initUi, openModal } from './core/ui.js';
import { today, nowMinutes } from './core/dates.js';
import { App } from './App.js';
import { initPwa } from './services/pwa.js';
import { startReminders } from './services/reminders.js';

const root = document.getElementById('root');

function render() {
  const scrollY = window.scrollY;               // jaga posisi gulir saat gambar ulang
  document.documentElement.classList.toggle('dark', state.set.theme === 'dark');
  document.querySelector('meta[name=theme-color]').content = state.set.theme === 'dark' ? '#171620' : '#f8f7f4';
  document.body.dataset.page = ui.page;

  root.replaceChildren(App());
  ui.enter = false;
  window.scrollTo(0, scrollY);
}

// Banyak perubahan beruntun -> cukup satu kali gambar ulang
let queued = false;
subscribe(() => {
  if (queued) return;
  queued = true;
  queueMicrotask(() => { queued = false; render(); });
});

/** Tawarkan Penutup Hari sekali per sesi, setelah jam tutup lewat dan masih ada tugas tertinggal */
let wrapPrompted = false;
function maybeShowWrapUp() {
  const [h, m] = state.endTime.split(':').map(Number);
  const pastEndTime = nowMinutes() >= h * 60 + m;
  const hasLeftovers = state.tasks.some(t => t.date === today() && !t.done);
  if (wrapPrompted || ui.modal || !state.onboarded || !pastEndTime || state.wrapDate === today() || !hasLeftovers) return;
  wrapPrompted = true;
  openModal('wrapup');
}

initUi();
initPwa();
save();                       // tulis hasil migrasi data lama
render();
startReminders();
if (!state.onboarded) openModal('onboard');
setTimeout(maybeShowWrapUp, 500);
setInterval(maybeShowWrapUp, 60000);
