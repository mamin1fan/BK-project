// Aturan bisnis murni (tanpa DOM, tanpa localStorage) — gampang dibaca dan dites.
import { toMinutes } from './dates.js';

/** Eisenhower: 1 = penting+mendesak, 2 = penting, 3 = mendesak, 4 = sisanya */
export const quadrantOf = t =>
  t.important === 'yes' ? (t.urgent === 'yes' ? 1 : 2) : t.urgent === 'yes' ? 3 : 4;

/** [mulai, selesai] dalam menit, atau null kalau tidak punya jam */
export const timeSpan = t => (t.start ? [toMinutes(t.start), toMinutes(t.start) + (t.dur || 60)] : null);

/** Aktivitas lain di hari yang sama yang jamnya tumpang tindih */
export function conflictsOf(task, allTasks) {
  const a = timeSpan(task);
  if (!a || task.done) return [];
  return allTasks.filter(o => {
    const b = timeSpan(o);
    return o.id !== task.id && o.date === task.date && !o.done && b && b[0] < a[1] && a[0] < b[1];
  });
}

export const tasksOnDay = (tasks, day) =>
  tasks.filter(t => t.date === day).sort((a, b) => (a.start || '99').localeCompare(b.start || '99'));

export const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2, 6);

/** Ringkasan 7 hari terakhir untuk kartu insight di Home */
export function weeklyStats(tasks, now = Date.now()) {
  const since = now - 7 * 86400000;
  return {
    completed: tasks.filter(t => t.done && t.completedAt >= since).length,
    moved: tasks.filter(t => (t.moveCount || 0) > 0).length,
  };
}

export function insightMessage(tasks) {
  const { completed, moved } = weeklyStats(tasks);
  if (tasks.length < 5) return 'Catat beberapa aktivitas lagi. Priorita akan mulai melihat pola setelah punya cukup data, tanpa menebak-nebak kesibukanmu.';
  if (moved >= 3) return 'Beberapa aktivitasmu beberapa kali dijadwalkan ulang. Mungkin kapasitas harianmu sedang penuh. Coba sisakan ruang kosong sebelum menerima komitmen baru.';
  if (completed >= 4) return 'Kamu sudah menyelesaikan beberapa aktivitas minggu ini. Coba perhatikan jenis kegiatan yang paling sering membuatmu kehilangan waktu.';
  return 'Aktivitasmu mulai tercatat. Perhatikan hari dan kategori yang paling sering menyita perhatianmu.';
}
