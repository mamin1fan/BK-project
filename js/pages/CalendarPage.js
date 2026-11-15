import { h } from '../core/h.js';
import { state } from '../core/store.js';
import { ui, setUi, openModal } from '../core/ui.js';
import { today, addDays, toYmd, parseYmd, formatDate, mondayOf } from '../core/dates.js';
import { CATEGORIES, categoryColor } from '../core/config.js';
import { conflictsOf, tasksOnDay } from '../core/domain.js';
import * as actions from '../core/actions.js';
import { Button, FilterButton } from '../components/Button.js';
import { PageHeader } from '../components/Layout.js';
import { TaskList } from '../components/TaskList.js';

const VIEWS = [['month', 'Bulan'], ['week', 'Minggu'], ['day', 'Agenda']];
const DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const ROW_ACTIONS = ['remind', 'tomorrow', 'edit', 'delete'];

export const addTaskOn = date => openModal('task', { presetDate: date });

/** Geser kursor kalender: n bulan / minggu / hari tergantung tampilan */
function stepCursor(n) {
  const cur = ui.calCursor;
  if (ui.calView === 'month') {
    const d = parseYmd(cur);
    return toYmd(new Date(d.getFullYear(), d.getMonth() + n, 1));
  }
  return addDays(cur, n * (ui.calView === 'week' ? 7 : 1));
}

function title() {
  const cur = ui.calCursor;
  if (ui.calView === 'month') return formatDate(cur, { month: 'long', year: 'numeric' });
  if (ui.calView === 'week') {
    const m = mondayOf(cur);
    return `${formatDate(m, { day: 'numeric', month: 'short' })} – ${formatDate(addDays(m, 6), { day: 'numeric', month: 'short' })}`;
  }
  return formatDate(cur, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** <DayBox date /> — kotak berisi aktivitas satu hari */
function DayBox({ date }) {
  return h('div', { class: 'panel daybox' },
    h('div', { class: 'mini-head' },
      h('strong', {}, formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' }) + (date === today() ? ' · Hari ini' : '')),
      Button({ label: '＋ Tambah', variant: 'soft', size: 'small', onClick: () => addTaskOn(date) })),
    TaskList({ tasks: tasksOnDay(state.tasks, date), actions: ROW_ACTIONS, showDate: false, showConflict: true,
               emptyText: 'Belum ada kegiatan. Hari yang lowong juga bagus.' }));
}

/** <MonthCell date tasks selected /> — satu kotak tanggal dengan titik warna */
function MonthCell({ date, tasks, selected }) {
  const hasConflict = tasks.some(t => conflictsOf(t, state.tasks).length);
  return h('button', {
    class: 'mcell' + (date === today() ? ' today' : '') + (selected ? ' sel' : ''), type: 'button',
    onClick: () => setUi({ calCursor: date }),
  },
    h('span', {}, Number(date.slice(8))),
    h('i', { class: 'dots' },
      tasks.slice(0, 4).map(t => h('b', { style: `background:${categoryColor(t.category)};${t.done ? 'opacity:.35' : ''}` })),
      hasConflict && h('em', {}, '!')));
}

function MonthGrid() {
  const first = parseYmd(ui.calCursor);
  const y = first.getFullYear(), m = first.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  return h('div', { class: 'mgrid' },
    DOW.map(d => h('div', { class: 'mdow' }, d)),
    Array.from({ length: lead }, () => h('div')),
    Array.from({ length: days }, (_, i) => {
      const date = toYmd(new Date(y, m, i + 1));
      return MonthCell({ date, tasks: tasksOnDay(state.tasks, date), selected: date === ui.calCursor });
    }));
}

export function CalendarPage() {
  const view = ui.calView;
  const go = cursor => setUi({ calCursor: cursor });
  return h('div', {},
    PageHeader({ title: 'Kalender', subtitle: 'Semua kuliah, organisasi, kepanitiaan, dan rencana pribadimu di satu tempat.' }),
    h('div', { class: 'cbar' },
      Button({ label: '‹', variant: 'outline', size: 'small', onClick: () => go(stepCursor(-1)) }),
      h('div', { class: 'ttl' }, title()),
      Button({ label: '›', variant: 'outline', size: 'small', onClick: () => go(stepCursor(1)) }),
      Button({ label: 'Hari ini', variant: 'soft', size: 'small', onClick: () => go(today()) })),
    h('div', { class: 'seg' }, VIEWS.map(([id, label]) =>
      FilterButton({ label, active: view === id, onClick: () => { actions.setSetting('view', id); setUi({ calView: id }); } }))),
    h('div', { class: 'legend' }, CATEGORIES.map(c =>
      h('span', {}, h('b', { style: `background:${c.color}` }), c.id))),
    view === 'month' && [MonthGrid(), DayBox({ date: ui.calCursor })],
    view === 'week' && Array.from({ length: 7 }, (_, i) => DayBox({ date: addDays(mondayOf(ui.calCursor), i) })),
    view === 'day' && DayBox({ date: ui.calCursor }));
}
