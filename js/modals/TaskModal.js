import { h, stateful } from '../core/h.js';
import { state } from '../core/store.js';
import { ui, setUi, closeModal } from '../core/ui.js';
import { today, addDays } from '../core/dates.js';
import { CATEGORIES } from '../core/config.js';
import * as actions from '../core/actions.js';
import { toast } from '../services/toast.js';
import { Button, Chip, Choice } from '../components/Button.js';
import { Select } from '../components/Form.js';
import { Modal, ModalHead, ModalActions } from '../components/Modal.js';
import { Label } from '../components/Layout.js';

const DURATIONS = [[0, 'Tak diatur'], [15, '15 mnt'], [30, '30 mnt'], [60, '1 jam'], [90, '1,5 jam'], [120, '2 jam']];
const REMINDERS = [['', 'Tidak'], ['0', 'Tepat waktu'], ['5', '5 mnt'], ['10', '10 mnt'], ['15', '15 mnt'], ['30', '30 mnt']];
const REPEATS = [['', 'Tidak berulang'], ['daily', 'Setiap hari'], ['weekly', 'Setiap minggu']];

function initialDraft(task, presetDate) {
  const date = task?.date || presetDate || today();
  return {
    name: task?.name || '',
    category: task?.category || 'Kuliah',
    dateMode: date === today() ? 'today' : date === addDays(today(), 1) ? 'tomorrow' : 'later',
    customDate: date,
    start: task?.start || '',
    dur: task?.dur || 0,
    remind: task?.remind ?? '',
    repeat: task?.repeat || '',
    important: task?.important || 'yes',
    urgent: task?.urgent || 'yes',
  };
}

/** Modal tambah / edit aktivitas. props: { task?, presetDate? } */
export function TaskModal({ task = null, presetDate = null }) {
  const draft = initialDraft(task, presetDate);   // isi form; diubah langsung, tanpa gambar ulang

  const save = () => {
    const name = draft.name.trim();
    if (!name) return toast('Tulis nama aktivitas dulu.');
    const date = draft.dateMode === 'today' ? today() : draft.dateMode === 'tomorrow' ? addDays(today(), 1) : draft.customDate;
    if (!date) return toast('Pilih tanggal aktivitas.');
    if (draft.remind !== '' && !draft.start) return toast('Isi jam mulai dulu untuk memakai pengingat.');
    if (draft.remind !== '' && 'Notification' in window && Notification.permission === 'default')
      toast('Tips: aktifkan notifikasi di Atur → Notifikasi.');

    const data = { name, date, category: draft.category, important: draft.important, urgent: draft.urgent,
                   start: draft.start, dur: +draft.dur || 0, remind: draft.remind, repeat: draft.repeat };
    closeModal();
    if (task) actions.updateTask(task.id, data); else actions.addTask(data);
    setUi({ quickText: '' });
    toast(task ? 'Aktivitas diperbarui' : 'Aktivitas ditambahkan');
  };

  // stateful({}) hanya dipakai untuk "gambar ulang modal ini" setelah chip diklik
  return stateful({}, (_, set) => {
    const redraw = () => set({});
    const pick = key => value => () => { draft[key] = value; redraw(); };
    const bind = key => e => { draft[key] = e.target.value; };

    return Modal({},
      ModalHead({ title: task ? 'Edit aktivitas' : 'Tambah aktivitas', subtitle: 'Catat dulu. Prioritas bisa kamu atur dengan cepat.' }),

      Label('Nama aktivitas'),
      h('input', { class: 'field', maxlength: 100, placeholder: 'Contoh: Rapat divisi acara', value: draft.name, onInput: bind('name') }),

      Label('Termasuk aktivitas apa?'),
      h('div', { class: 'option-chips' }, CATEGORIES.map(c =>
        Chip({ label: `${c.emoji} ${c.id}`, selected: draft.category === c.id, onClick: pick('category')(c.id) }))),

      Label('Kapan ingin dikerjakan?'),
      h('div', { class: 'date-row' }, [['today', 'Hari ini'], ['tomorrow', 'Besok'], ['later', 'Tanggal lain']].map(([id, label]) =>
        Choice({ label, selected: draft.dateMode === id, onClick: pick('dateMode')(id) }))),
      draft.dateMode === 'later' &&
        h('input', { class: 'field', type: 'date', value: draft.customDate, style: 'margin-top:8px', onChange: bind('customDate') }),

      h('div', { class: 'date-row', style: 'margin-top:10px' },
        h('div', {}, Label('Jam mulai'), h('input', { class: 'field', type: 'time', value: draft.start, onChange: bind('start') })),
        h('div', {}, Label('Durasi'), Select({ options: DURATIONS, value: draft.dur, onChange: v => { draft.dur = v; } })),
        h('div', {}, Label('Ingatkan'), Select({ options: REMINDERS, value: draft.remind, onChange: v => { draft.remind = v; } }))),

      Label('Pengulangan pengingat'),
      Select({ options: REPEATS, value: draft.repeat, onChange: v => { draft.repeat = v; } }),

      Label('Seberapa penting?'),
      h('div', { class: 'choice-grid' },
        Choice({ label: 'Penting', selected: draft.important === 'yes', onClick: pick('important')('yes') }),
        Choice({ label: 'Tidak terlalu penting', selected: draft.important === 'no', onClick: pick('important')('no') })),

      Label('Seberapa mendesak?'),
      h('div', { class: 'choice-grid' },
        Choice({ label: 'Mendesak', selected: draft.urgent === 'yes', onClick: pick('urgent')('yes') }),
        Choice({ label: 'Tidak mendesak', selected: draft.urgent === 'no', onClick: pick('urgent')('no') })),

      ModalActions({},
        Button({ label: 'Batal', variant: 'quiet', onClick: closeModal }),
        Button({ label: 'Simpan aktivitas', variant: 'primary', onClick: save })));
  });
}
