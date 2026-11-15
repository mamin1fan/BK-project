import { h } from '../core/h.js';
import { state } from '../core/store.js';
import { ui, setUi, openModal } from '../core/ui.js';
import { today } from '../core/dates.js';
import { quadrantOf } from '../core/domain.js';
import { TaskList } from '../components/TaskList.js';

const FILTERS = [['all', 'Semua'], ['today', 'Hari ini'], ['upcoming', 'Mendatang']];
const QUADS = [
  { n: 1, title: 'Q1 · Kerjakan sekarang', sub: 'Penting & mendesak' },
  { n: 2, title: 'Q2 · Jadwalkan', sub: 'Penting, tidak mendesak' },
  { n: 3, title: 'Q3 · Delegasikan', sub: 'Tidak penting, mendesak' },
  { n: 4, title: 'Q4 · Kurangi / hindari', sub: 'Tidak penting & tidak mendesak' },
];

/** Satu kuadran Eisenhower: <Quadrant n title sub tasks /> */
const Quadrant = ({ n, title, sub, tasks }) =>
  h('article', { class: `focus-quadrant q${n}` },
    h('div', { class: 'fq-head' }, h('div', {}, h('h2', {}, title), h('p', {}, sub)), h('span', { class: 'fq-count' }, tasks.length)),
    TaskList({ tasks, emptyText: 'Belum ada aktivitas di kuadran ini.', className: 'fq-list' }));

export function FocusPage() {
  let pending = state.tasks.filter(t => !t.done);
  if (ui.focusFilter === 'today') pending = pending.filter(t => t.date === today());
  if (ui.focusFilter === 'upcoming') pending = pending.filter(t => t.date && t.date > today());

  const q1Count = pending.filter(t => quadrantOf(t) === 1).length;
  const byTime = (a, b) => (a.date || '').localeCompare(b.date || '') || (a.start || '').localeCompare(b.start || '');

  return h('section', { class: 'focus-page' },
    h('div', { class: 'focus-page-head' },
      h('div', {}, h('div', { class: 'eyebrow' }, 'Pusat perhatian'), h('h1', {}, 'Matriks Fokus'), h('p', {}, 'Kelompokkan aktivitasmu dan tentukan langkah berikutnya.')),
      h('span', { class: 'pill' }, `${pending.length} aktivitas`)),
    h('div', { class: 'focus-tools' },
      h('div', { class: 'focus-filters', role: 'group', 'aria-label': 'Filter aktivitas fokus' },
        FILTERS.map(([id, label]) =>
          h('button', { class: 'focus-filter' + (ui.focusFilter === id ? ' active' : ''), type: 'button', onClick: () => setUi({ focusFilter: id }) }, label))),
      h('button', { class: 'focus-add', type: 'button', onClick: () => openModal('task') }, '＋ Tambah aktivitas')),
    h('div', { class: 'focus-priority' },
      h('div', { class: 'focus-priority-icon' }, '🎯'),
      h('div', {},
        h('strong', {}, q1Count ? `${q1Count} aktivitas perlu ditangani sekarang` : 'Mulai dari Q2'),
        h('span', {}, q1Count
          ? 'Dahulukan Q1, lalu sisihkan waktu untuk aktivitas penting di Q2.'
          : 'Tidak ada tugas Q1 pada filter ini. Gunakan waktu untuk aktivitas penting yang sudah direncanakan.'))),
    h('div', { class: 'focus-board' },
      QUADS.map(q => Quadrant({ ...q, tasks: pending.filter(t => quadrantOf(t) === q.n).sort(byTime) }))),
    h('p', { class: 'focus-hint' }, 'Tips: mulai dari Q1, sisihkan waktu untuk Q2, pertimbangkan bantuan untuk Q3, dan batasi aktivitas Q4.'));
}
