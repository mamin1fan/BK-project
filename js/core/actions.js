// Semua hal yang "mengubah data" ada di sini, dengan nama yang menjelaskan dirinya sendiri.
// Komponen tinggal memanggil: actions.toggleTask(id, true)
import { commit, replaceAll, state } from './store.js';
import { addDays, today } from './dates.js';
import { newId } from './domain.js';

const find = id => state.tasks.find(t => t.id === id);

/* ---------- aktivitas ---------- */
export function addTask(data) {
  commit(s => s.tasks.push({ id: newId(), done: false, createdAt: Date.now(), moveCount: 0, ...data }));
}

export function quickAddTask(name) {
  addTask({ name, date: today(), category: 'Lainnya', important: 'yes', urgent: 'yes' });
}

export const updateTask = (id, patch) => commit(() => Object.assign(find(id) || {}, patch));

export const toggleTask = (id, done) =>
  commit(() => { const t = find(id); if (t) { t.done = done; t.completedAt = done ? Date.now() : null; } });

export const deleteTask = id => commit(s => { s.tasks = s.tasks.filter(t => t.id !== id); });

export function moveTask(id, date) {
  commit(() => { const t = find(id); if (t) { t.date = date; t.moveCount = (t.moveCount || 0) + 1; } });
}
export const moveTaskToTomorrow = id => { const t = find(id); if (t) moveTask(id, addDays(t.date, 1)); };

export const toggleTaskReminder = id => commit(() => { const t = find(id); if (t) t.roff = !t.roff; });

/* ---------- "Kalau Ada Waktu" (daftar luang) ---------- */
function moveToFlex(s, t) {
  s.flex.push({ id: t.id, name: t.name, cat: t.category || 'Lainnya', dur: t.dur || 15, done: false });
  s.tasks = s.tasks.filter(x => x.id !== t.id);
}
export const sendTaskToFlex = id => commit(s => { const t = find(id); if (t) moveToFlex(s, t); });

export const addFlex = ({ name, dur, cat }) =>
  commit(s => s.flex.push({ id: 'f' + newId(), name, dur, cat, done: false }));

export const toggleFlex = (id, done) =>
  commit(s => { const f = s.flex.find(x => x.id === id); if (f) f.done = done; });

export const deleteFlex = id => commit(s => { s.flex = s.flex.filter(x => x.id !== id); });

export function flexToToday(id) {
  commit(s => {
    const f = s.flex.find(x => x.id === id);
    if (!f) return;
    s.tasks.push({
      id: f.id, name: f.name, date: today(), category: f.cat, important: 'yes', urgent: 'no',
      dur: f.dur, done: false, createdAt: Date.now(), moveCount: 0,
    });
    s.flex = s.flex.filter(x => x !== f);
  });
}

/* ---------- penutup hari & jadwal berubah ---------- */
/** choices: { [taskId]: 'tomorrow' | 'later' | 'keep' | 'flex' | 'del' } ; laterDates: { [taskId]: 'YYYY-MM-DD' } */
export function applyChoices(choices, laterDates = {}) {
  commit(s => {
    s.tasks.filter(t => t.date === today() && !t.done).forEach(t => {
      const v = choices[t.id];
      if (v === 'tomorrow') { t.date = addDays(today(), 1); t.moveCount = (t.moveCount || 0) + 1; }
      else if (v === 'later') { t.date = laterDates[t.id] || addDays(today(), 2); t.moveCount = (t.moveCount || 0) + 1; }
      else if (v === 'flex') moveToFlex(s, t);
      else if (v === 'del') s.tasks = s.tasks.filter(x => x.id !== t.id);
    });
  });
}
export const finishWrapUp = (choices, laterDates) => { applyChoices(choices, laterDates); commit(s => { s.wrapDate = today(); }); };

/* ---------- pengaturan & profil ---------- */
export const setSetting = (key, value) => commit(s => { s.set[key] = value; });
export const setEndTime = v => commit(s => { s.endTime = v; });
export const setBusyUntil = v => commit(s => { s.busyUntil = v; });
export const setTaskFilter = v => commit(s => { s.filter = v; });
export const setProfile = list => commit(s => { s.profile = [...list]; });
export const toggleProfile = v =>
  commit(s => { s.profile = s.profile.includes(v) ? s.profile.filter(x => x !== v) : [...s.profile, v]; });
export const finishOnboarding = ({ profile, endTime }) =>
  commit(s => { s.onboarded = true; if (profile) s.profile = [...profile]; if (endTime) s.endTime = endTime; });

/* ---------- data ---------- */
export { replaceAll };
