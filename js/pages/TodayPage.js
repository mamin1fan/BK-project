import { h } from '../core/h.js';
import { state } from '../core/store.js';
import { ui, setUi, openModal } from '../core/ui.js';
import { today } from '../core/dates.js';
import { quadrantOf, weeklyStats, insightMessage } from '../core/domain.js';
import * as actions from '../core/actions.js';
import { toast } from '../services/toast.js';
import { Button, FilterButton } from '../components/Button.js';
import { Panel } from '../components/Layout.js';
import { TaskList } from '../components/TaskList.js';

const FILTERS = [['today', 'Hari ini'], ['upcoming', 'Mendatang'], ['done', 'Selesai'], ['all', 'Semua']];

function Welcome({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return h('section', { class: 'welcome' },
    h('div', {},
      h('div', { class: 'eyebrow' }, 'Ruang kendali harianmu'),
      h('h1', {}, greeting()),
      h('p', {}, 'Kita urutkan yang paling penting. Satu hal pada satu waktu.')),
    h('div', { class: 'day-progress' },
      h('div', { class: 'progress-top' }, h('span', {}, 'Progres hari ini'), h('span', {}, `${done} dari ${total} selesai`)),
      h('div', { class: 'track' }, h('span', { style: `width:${pct}%` }))));
}

export function greeting() {
  if (state.set.nick) return `Hai, ${state.set.nick}!`;
  return state.profile.includes('Kuliah') ? 'Hai, pejuang aktivitas!' : 'Hai, waktunya atur fokus.';
}

function QuickAdd() {
  const submit = () => {
    const name = ui.quickText.trim();
    if (!name) return openModal('task');
    actions.quickAddTask(name);
    setUi({ quickText: '' });
    toast('Dicatat untuk hari ini');
  };
  return h('div', { class: 'quickbar' },
    h('div', { class: 'quick-input' },
      h('span', { style: 'color:#9a91ad' }, '＋'),
      h('input', {
        placeholder: 'Catat cepat: rapat divisi, tugas, revisi...', maxlength: 100, value: ui.quickText,
        onInput: e => { ui.quickText = e.target.value; },          // simpan tanpa gambar ulang
        onKeydown: e => { if (e.key === 'Enter') submit(); },
      }),
      Button({ label: 'Tambah', variant: 'primary', size: 'small', onClick: submit })),
    Button({ label: 'Detail', variant: 'outline', onClick: () => openModal('task') }),
    Button({ label: 'Jadwal berubah?', variant: 'quiet', size: 'small', onClick: () => openModal('schedule') }));
}

function FocusCard({ q1 }) {
  return h('section', { class: 'focus-card' },
    h('div', { class: 'focus-heading' },
      h('div', { class: 'focus-title' }, h('span', { class: 'focus-icon' }, '⚡'), 'Fokus sekarang'),
      h('span', { class: 'pill' }, `${q1.length} prioritas`)),
    TaskList({ tasks: q1, emptyText: 'Hari ini belum ada tugas mendesak. Kamu bisa mulai dengan satu hal kecil atau menikmati jeda.' }));
}

function OtherGrid({ q2, q3, q4 }) {
  return h('section', { class: 'secondary-grid' },
    h('div', { class: 'mini-panel' },
      h('div', { class: 'mini-head' }, h('strong', {}, '🌱 Tetap terencana · Q2'), h('span', {}, q2.length)),
      TaskList({ tasks: q2, emptyText: 'Belum ada rencana penting.' })),
    h('div', { class: 'mini-panel' },
      h('div', { class: 'mini-head' }, h('strong', {}, 'Aktivitas lain'), h('span', {}, `${q3.length + q4.length} aktivitas`)),
      h('div', { class: 'q3q4' },
        h('div', { class: 'q-card q3' }, h('h3', {}, '↗ Delegasikan'), h('p', {}, 'Q3 · Mendesak'), TaskList({ tasks: q3, emptyText: 'Kosong' })),
        h('div', { class: 'q-card q4' }, h('h3', {}, '− Kurangi'), h('p', {}, 'Q4 · Tidak mendesak'), TaskList({ tasks: q4, emptyText: 'Kosong' })))));
}

function AllTasks() {
  const d = today(), f = state.filter;
  const list = state.tasks
    .filter(t => (f === 'today' ? t.date === d : f === 'upcoming' ? t.date > d && !t.done : f === 'done' ? t.done : true))
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || quadrantOf(a) - quadrantOf(b));
  return Panel({ title: 'Semua aktivitas', sub: 'Lihat yang sedang berjalan, nanti, atau sudah selesai.' },
    h('div', { class: 'filters' }, FILTERS.map(([id, label]) =>
      FilterButton({ label, active: f === id, onClick: () => actions.setTaskFilter(id) }))),
    TaskList({ tasks: list, emptyText: 'Tidak ada aktivitas untuk filter ini.', className: 'all-list' }));
}

function InsightSummary() {
  const { completed, moved } = weeklyStats(state.tasks);
  return Panel({},
    h('div', { class: 'insight-top' },
      h('span', { class: 'insight-icon' }, '✦'),
      h('div', {}, h('h3', {}, 'Kenali pola sibukmu'), h('p', { class: 'panel-sub', style: 'margin:3px 0 0' }, 'Insight dari aktivitas yang kamu catat.'))),
    h('div', { class: 'insight-stat' },
      h('div', {}, h('strong', {}, completed), h('span', {}, 'Selesai 7 hari ini')),
      h('div', {}, h('strong', {}, moved), h('span', {}, 'Perlu dijadwal ulang'))),
    h('div', { class: 'insight-copy' }, insightMessage(state.tasks)));
}

export function TodayPage() {
  const todayTasks = state.tasks.filter(t => t.date === today());
  const pending = todayTasks.filter(t => !t.done);
  const inQuadrant = n => pending.filter(t => quadrantOf(t) === n);
  const q1 = inQuadrant(1).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  return h('div', {},
    Welcome({ done: todayTasks.length - pending.length, total: todayTasks.length }),
    QuickAdd(),
    FocusCard({ q1 }),
    h('div', { class: 'section-head' },
      h('div', {}, h('h2', {}, 'Jangan lupakan'), h('p', {}, 'Hal penting yang menjaga tujuanmu tetap berjalan.')),
      h('button', { class: 'link-btn', type: 'button', onClick: () => openModal('tomorrow') }, 'Rencana besok →')),
    OtherGrid({ q2: inQuadrant(2), q3: inQuadrant(3), q4: inQuadrant(4) }),
    h('div', { class: 'bottom-grid' }, AllTasks(), InsightSummary()));
}
