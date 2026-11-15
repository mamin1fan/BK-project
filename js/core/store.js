// "Database"-nya Priorita: satu objek `state` yang disimpan di localStorage.
// Mirip file .txt di Python — ubah datanya, lalu tampilan digambar ulang dari data itu.
import { STORAGE_KEY } from './config.js';

const listeners = new Set();
export const subscribe = fn => (listeners.add(fn), () => listeners.delete(fn));
export const notify = () => listeners.forEach(fn => fn());

const defaults = () => ({
  tasks: [],
  profile: [],
  endTime: '21:00',
  onboarded: false,
  wrapDate: '',
  busyUntil: '',
  filter: 'today',
  flex: [],
  fired: {},
  snz: {},
  set: { nick: '', start: '', sound: true, theme: 'light', view: 'month' },
  ver: 2,
});

/** Rapikan data apa pun (data lama / hasil impor) jadi bentuk terbaru */
export function normalize(raw) {
  const d = { ...defaults(), ...(raw && typeof raw === 'object' ? raw : {}) };
  d.tasks = Array.isArray(d.tasks) ? d.tasks : [];
  d.flex = Array.isArray(d.flex) ? d.flex : [];
  d.profile = Array.isArray(d.profile) ? d.profile : [];
  d.set = { ...defaults().set, ...(d.set || {}) };
  d.fired = d.fired || {};
  d.snz = d.snz || {};

  // Migrasi v1: aktivitas "Simpan nanti" (archived, tanpa tanggal) -> Kalau Ada Waktu
  d.tasks.filter(t => t.archived && !t.date).forEach(t =>
    d.flex.push({ id: t.id, name: t.name, cat: t.category || 'Lainnya', dur: 15, done: false }));
  d.tasks = d.tasks.filter(t => !(t.archived && !t.date));
  d.ver = 2;
  return d;
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

export const state = normalize(load());

export function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

/**
 * Satu-satunya pintu untuk mengubah data:
 *   commit(s => { s.tasks.push(...) })
 * Otomatis menyimpan, lalu memberi tahu tampilan untuk digambar ulang.
 * Pakai { silent: true } kalau tidak perlu gambar ulang (mis. penanda pengingat).
 */
export function commit(mutate, { silent = false } = {}) {
  mutate(state);
  save();
  if (!silent) notify();
}

/** Ganti seluruh isi data (impor / editor JSON / hapus semua) */
export function replaceAll(raw) {
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, normalize(raw));
  save();
  notify();
}
