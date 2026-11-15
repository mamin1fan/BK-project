import { h } from '../core/h.js';
import { state } from '../core/store.js';
import { ui, setUi } from '../core/ui.js';
import { CATEGORIES, categoryColor } from '../core/config.js';
import * as actions from '../core/actions.js';
import { toast } from '../services/toast.js';
import { Button, FilterButton, IconButton } from '../components/Button.js';
import { Select } from '../components/Form.js';
import { PageHeader, Nudge, Empty } from '../components/Layout.js';

const DURATIONS = [[5, '5 menit'], [15, '15 menit'], [30, '30 menit'], [60, '60 menit']];
const DUR_FILTERS = [[0, 'Semua'], [5, '5′'], [15, '15′'], [30, '30′'], [60, '60′']];
const catOptions = CATEGORIES.map(c => [c.id, c.id]);

/** Form tambah ide. Nilai dibaca langsung dari input saat tombol ditekan. */
function AddForm() {
  const name = h('input', { class: 'field', placeholder: 'Mis. baca buku 15 menit', maxlength: 100 });
  const dur = Select({ options: DURATIONS, value: 15 });
  const cat = Select({ options: catOptions, value: 'Pribadi' });

  const submit = () => {
    const text = name.value.trim();
    if (!text) return toast('Tulis dulu aktivitasnya.');
    actions.addFlex({ name: text, dur: +dur.value, cat: cat.value });
    toast('Disimpan di Kalau Ada Waktu');
  };
  name.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

  return h('div', { class: 'panel gap' },
    name,
    h('div', { class: 'row2', style: 'margin-top:8px' }, dur, cat),
    Button({ label: 'Simpan', variant: 'primary', style: 'width:100%;margin-top:8px', onClick: submit }));
}

function FlexItem({ item }) {
  return h('div', { class: 'task' + (item.done ? ' done' : ''), style: `border-left:4px solid ${categoryColor(item.cat)}` },
    h('input', { class: 'check', type: 'checkbox', checked: !!item.done, onChange: e => {
      actions.toggleFlex(item.id, e.target.checked);
      toast(e.target.checked ? 'Mantap, selesai! 🌿' : 'Dikembalikan');
    } }),
    h('div', { class: 'task-content' },
      h('div', { class: 'task-name' }, item.name),
      h('div', { class: 'task-meta' }, `${item.dur} menit · ${item.cat}`)),
    h('div', { class: 'task-actions' },
      !item.done && h('button', { class: 'icon-btn', type: 'button', style: 'font-size:10px', onClick: () => { actions.flexToToday(item.id); toast('Dipindah ke Today'); } }, 'Ke Today'),
      IconButton({ icon: '×', title: 'Hapus', onClick: () => { if (confirm('Hapus aktivitas ini?')) actions.deleteFlex(item.id); } })));
}

export function FlexPage() {
  const { dur, cat } = ui.flexFilter;
  const list = state.flex
    .filter(x => (!dur || x.dur <= dur) && (!cat || x.cat === cat))
    .sort((a, b) => a.done - b.done);

  return h('div', {},
    PageHeader({ title: 'Kalau Ada Waktu', subtitle: 'Hal-hal yang ingin kamu lakukan, tanpa tekanan dan tanpa tenggat.' }),
    Nudge('Punya sedikit waktu luang? Mungkin kamu bisa melakukan salah satu hal ini. Tapi beristirahat juga pilihan yang baik. 🌿'),
    AddForm(),
    h('div', { class: 'filters' },
      DUR_FILTERS.map(([v, label]) => FilterButton({ label, active: dur === v, onClick: () => setUi({ flexFilter: { dur: v, cat } }) })),
      Select({ options: [['', 'Semua kategori'], ...catOptions], value: cat, style: 'width:auto;padding:6px 8px;font-size:10px',
               onChange: v => setUi({ flexFilter: { dur, cat: v } }) })),
    h('div', { class: 'tasks' },
      list.length === 0 && Empty('Belum ada aktivitas di sini. Simpan ide-ide kecil yang ingin kamu lakukan saat longgar.'),
      list.map(item => FlexItem({ item }))));
}
