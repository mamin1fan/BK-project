import { h } from './core/h.js';
import { state } from './core/store.js';
import { ui, go, openModal } from './core/ui.js';
import { PAGES } from './core/config.js';
import { greeting } from './pages/TodayPage.js';

import { TodayPage } from './pages/TodayPage.js';
import { FocusPage } from './pages/FocusPage.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { FlexPage } from './pages/FlexPage.js';
import { InsightPage } from './pages/InsightPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

import { TaskModal } from './modals/TaskModal.js';
import { OnboardModal } from './modals/OnboardModal.js';
import { WrapUpModal } from './modals/WrapUpModal.js';
import { ScheduleModal } from './modals/ScheduleModal.js';
import { TomorrowModal } from './modals/TomorrowModal.js';

// Daftar halaman & modal. Mau tambah halaman baru? Buat file di pages/, daftarkan di sini dan di PAGES (config.js).
const PAGE_VIEWS = { today: TodayPage, focus: FocusPage, cal: CalendarPage, flex: FlexPage, insight: InsightPage, set: SettingsPage };
const MODALS = { task: TaskModal, onboard: OnboardModal, wrapup: WrapUpModal, schedule: ScheduleModal, tomorrow: TomorrowModal };

function Header() {
  const initial = (state.set.nick || state.profile[0] || 'P')[0].toUpperCase();
  const dateLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return h('header', { class: 'top' },
    h('div', { class: 'brand' }, h('div', { class: 'mark' }, '✳'), 'priorita', h('span', { style: 'color:var(--purple)' }, '.')),
    h('div', { class: 'top-right' }, h('div', { class: 'date-label' }, dateLabel), h('div', { class: 'avatar' }, initial)));
}

const BottomNav = ({ current, onNavigate }) =>
  h('nav', { class: 'bnav', 'aria-label': 'Navigasi' }, PAGES.map(p =>
    h('button', { class: current === p.id ? 'on' : '', type: 'button', onClick: () => onNavigate(p.id) }, h('span', {}, p.icon), p.label)));

const AddButton = ({ onClick }) => h('button', { class: 'fab', type: 'button', 'aria-label': 'Tambah aktivitas', onClick }, '＋');

// Modal yang sedang terbuka dipakai ulang saat halaman digambar ulang,
// supaya isi form / langkah wizard-nya tidak ter-reset.
let openModalCache = { ref: null, node: null };
function currentModal() {
  if (!ui.modal) return (openModalCache = { ref: null, node: null }).node;
  if (openModalCache.ref !== ui.modal) openModalCache = { ref: ui.modal, node: MODALS[ui.modal.name](ui.modal.props) };
  return openModalCache.node;
}

export function App() {
  const View = PAGE_VIEWS[ui.page];

  return h('div', { style: 'display:contents' },
    h('div', { class: 'app' },
      Header(),
      h('div', { class: 'page active' + (ui.enter ? ' enter' : '') }, View()),
      h('footer', { class: 'footer' }, 'PRIORITA · Jalani harimu, tanpa kehilangan arah.')),
    AddButton({ onClick: () => openModal('task', ui.page === 'cal' ? { presetDate: ui.calCursor } : {}) }),
    currentModal(),
    BottomNav({ current: ui.page, onNavigate: go }));
}
