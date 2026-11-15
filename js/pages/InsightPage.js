import { h } from '../core/h.js';
import { state } from '../core/store.js';
import { go } from '../core/ui.js';
import { today, parseYmd } from '../core/dates.js';
import { toMinutes } from '../core/dates.js';
import { Button } from '../components/Button.js';
import { PageHeader, Panel, Empty } from '../components/Layout.js';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** Hitung kemunculan, urut dari yang terbanyak: [[kunci, jumlah], ...] */
function countBy(items, keyOf) {
  const counts = {};
  items.forEach(i => { const k = keyOf(i); if (k != null) counts[k] = (counts[k] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

const StatBox = ({ value, label }) => h('div', {}, h('strong', {}, value), h('span', {}, label));
const InsightCard = ({ title, text }) => Panel({ title, class: 'gap' }, h('p', { class: 'insight-copy' }, text));

export function InsightPage() {
  const tasks = state.tasks.filter(t => t.date);
  const page = h('div', {}, PageHeader({
    title: 'Kenali Pola Sibukmu',
    subtitle: 'Dihitung langsung dari aktivitas yang kamu catat. Ini perhitungan sederhana, bukan AI.',
  }));

  if (tasks.length < 5) {
    page.append(Empty(`Insight masih butuh lebih banyak data (${tasks.length}/5 aktivitas). Priorita tidak mau menebak-nebak kesibukanmu.`));
  } else {
    const days = countBy(tasks, t => parseYmd(t.date).getDay());
    const cats = countBy(tasks, t => t.category || 'Lainnya');
    const hours = countBy(tasks, t => (t.start ? Math.floor(toMinutes(t.start) / 60) : null));
    const planned = tasks.filter(t => t.date <= today());
    const often = state.tasks.filter(t => (t.moveCount || 0) >= 2);

    page.append(
      h('div', { class: 'insight-stat' },
        StatBox({ value: `${planned.filter(t => t.done).length}/${planned.length}`, label: 'Selesai dari yang terencana' }),
        StatBox({ value: tasks.filter(t => t.done).length, label: 'Total selesai' }),
        StatBox({ value: state.tasks.filter(t => t.moveCount > 0).length, label: 'Pernah dijadwal ulang' })),
      InsightCard({ title: 'Hari paling padat',
        text: `${DAY_NAMES[days[0][0]]} menjadi hari paling padat (${days[0][1]} aktivitas). Coba sisakan ruang untuk tugas pribadi dan istirahat di hari itu.` }),
      InsightCard({ title: 'Kategori terbesar',
        text: `${cats[0][0]} paling banyak mengisi jadwalmu (${cats[0][1]} dari ${tasks.length} aktivitas).` }),
      InsightCard({ title: 'Sering dijadwalkan ulang',
        text: often.length
          ? `${often.slice(0, 3).map(t => `“${t.name}”`).join(', ')} sudah beberapa kali digeser. Mungkin ukurannya terlalu besar — coba pecah jadi langkah kecil.`
          : 'Belum ada aktivitas yang digeser berkali-kali. Bagus.' }),
      hours.length && hours.reduce((sum, x) => sum + x[1], 0) >= 3 &&
        InsightCard({ title: 'Pola jam', text: `Aktivitas berjam paling sering dimulai sekitar pukul ${String(hours[0][0]).padStart(2, '0')}.00.` }));
  }

  page.append(Button({ label: 'Lihat Matriks Eisenhower', variant: 'outline', onClick: () => go('focus') }));
  return page;
}
