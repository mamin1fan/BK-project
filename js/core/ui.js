// State sementara tampilan (halaman aktif, modal terbuka, dll). Tidak disimpan ke localStorage.
import { PAGES } from './config.js';
import { today } from './dates.js';
import { state, notify } from './store.js';

export const ui = {
  page: 'today',
  enter: false,          // true sesaat setelah pindah halaman (untuk animasi fade)
  modal: null,           // { name, props }
  quickText: '',         // isi kolom catat-cepat, supaya tidak hilang saat gambar ulang
  focusFilter: 'all',
  flexFilter: { dur: 0, cat: '' },
  calView: 'month',
  calCursor: today(),
};

const validPage = p => (PAGES.some(x => x.id === p) ? p : 'today');

export function setUi(patch, { silent = false } = {}) {
  Object.assign(ui, patch);
  if (!silent) notify();
}

export function go(page) {
  page = validPage(page);
  if (location.hash !== '#' + page) history.replaceState(null, '', '#' + page);
  window.scrollTo(0, 0);
  setUi({ page, enter: true });
}

export const openModal = (name, props = {}) => setUi({ modal: { name, props } });
export const closeModal = () => setUi({ modal: null });

export function initUi() {
  ui.calView = state.set.view;
  ui.page = validPage(location.hash.slice(1));
  addEventListener('hashchange', () => {
    const p = validPage(location.hash.slice(1));
    if (p !== ui.page) setUi({ page: p, enter: true });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && ui.modal) closeModal(); });
}
