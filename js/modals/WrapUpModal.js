import { h, stateful } from '../core/h.js';
import { state } from '../core/store.js';
import { closeModal } from '../core/ui.js';
import { today } from '../core/dates.js';
import * as actions from '../core/actions.js';
import { toast } from '../services/toast.js';
import { Button } from '../components/Button.js';
import { Modal, ModalHead, ModalActions } from '../components/Modal.js';

const OPTIONS = [['tomorrow', 'Besok'], ['later', 'Tanggal lain'], ['keep', 'Tetap hari ini'], ['flex', 'Kalau Ada Waktu'], ['del', 'Hapus']];

/** Satu aktivitas tertinggal + pilihan nasibnya. props: task, choice, laterDate, onChoice, onDate */
const WrapItem = ({ task, choice, laterDate, onChoice, onDate }) =>
  h('div', { class: 'wrap-item' },
    h('strong', {}, task.name),
    h('div', { class: 'wrap-actions' }, OPTIONS.map(([id, label]) =>
      h('button', { class: choice === id ? 'selected' : '', type: 'button', onClick: () => onChoice(id) }, label))),
    choice === 'later' && h('input', { class: 'field', type: 'date', value: laterDate || '', style: 'margin-top:8px', onChange: e => onDate(e.target.value) }));

/** Penutup hari: tentukan nasib aktivitas yang belum selesai */
export function WrapUpModal() {
  const missed = state.tasks.filter(t => t.date === today() && !t.done);
  const initial = { choices: Object.fromEntries(missed.map(t => [t.id, 'tomorrow'])), dates: {} };

  return stateful(initial, (s, set) => Modal({},
    ModalHead({ eyebrow: 'Daily wrap-up', title: 'Terima kasih sudah berusaha hari ini 🌙',
                subtitle: 'Hari yang padat tidak harus selalu berakhir dengan semua tugas selesai.' }),
    h('p', { class: 'desc', style: 'font-size:12px;color:var(--muted);line-height:1.6' },
      'Masih ada aktivitas yang belum selesai. Tentukan langkah berikutnya untuk setiap aktivitas.'),
    h('div', { class: 'wrapup-list' }, missed.map(task => WrapItem({
      task, choice: s.choices[task.id], laterDate: s.dates[task.id],
      onChoice: id => set({ choices: { ...s.choices, [task.id]: id } }),
      onDate: d => set({ dates: { ...s.dates, [task.id]: d } }),
    }))),
    ModalActions({ style: 'justify-content:space-between' },
      Button({ label: 'Pindahkan semua ke besok', variant: 'quiet', onClick: () => set({ choices: Object.fromEntries(missed.map(t => [t.id, 'tomorrow'])) }) }),
      Button({ label: 'Simpan pilihan', variant: 'primary', onClick: () => {
        closeModal();
        actions.finishWrapUp(s.choices, s.dates);
        toast('Rencanamu sudah diperbarui. Istirahat juga bagian dari progres.');
      } }))));
}
