import { h, stateful } from '../core/h.js';
import { state } from '../core/store.js';
import { closeModal } from '../core/ui.js';
import { today, toMinutes, nowMinutes } from '../core/dates.js';
import { quadrantOf } from '../core/domain.js';
import * as actions from '../core/actions.js';
import { toast } from '../services/toast.js';
import { Button } from '../components/Button.js';
import { Select } from '../components/Form.js';
import { Modal, ModalHead, ModalActions } from '../components/Modal.js';
import { Label, Nudge, Empty } from '../components/Layout.js';

const CHOICES = [['keep', 'Pertahankan hari ini'], ['tomorrow', 'Pindah ke besok'], ['flex', 'Simpan ke Kalau Ada Waktu']];

/** Saran (bukan perintah): pindahkan yang bentrok atau kurang penting */
function recommend(task, busyUntil, freeMinutes) {
  const clash = task.start && toMinutes(task.start) < toMinutes(busyUntil) && toMinutes(task.start) + (task.dur || 60) > nowMinutes();
  const q = quadrantOf(task);
  return { clash, choice: clash || q > 2 || (q === 2 && freeMinutes < 60) ? 'tomorrow' : 'keep' };
}

/** Langkah 1: tanya sibuk sampai jam berapa */
const AskStep = ({ value, onChange, onNext }) => [
  ModalHead({ title: 'Jadwalmu berubah?', subtitle: 'Kita sesuaikan rencana, tanpa menghakimi.' }),
  Label('Sampai jam berapa kamu akan sibuk?'),
  h('input', { class: 'field', type: 'time', value, onChange: e => onChange(e.target.value) }),
  h('p', { class: 'muted-note' }, 'Priorita akan menunjukkan sisa aktivitas hari ini. Kamu tetap memilih sendiri mana yang dipertahankan atau dijadwalkan ulang.'),
  ModalActions({}, Button({ label: 'Batal', variant: 'quiet', onClick: closeModal }), Button({ label: 'Sesuaikan hariku', variant: 'primary', onClick: onNext })),
];

/** Langkah 2: rekomendasi per aktivitas */
function PlanStep({ busyUntil, choices, onChoice }) {
  const pending = state.tasks.filter(t => t.date === today() && !t.done);
  const [eh, em] = state.endTime.split(':').map(Number);
  const free = eh * 60 + em - toMinutes(busyUntil);

  return [
    ModalHead({ title: 'Sibuk sampai ' + busyUntil, subtitle: 'Ini rekomendasi saja. Kamu yang memilih, tidak ada yang berubah sebelum kamu menekan terapkan.' }),
    Nudge(free > 0
      ? `Setelah acara, kamu masih punya sekitar ${Math.floor(free / 60)} jam ${free % 60} menit sebelum jam tutup harianmu (${state.endTime}).`
      : 'Acaranya melewati jam tutup harianmu. Pertimbangkan memindahkan yang tidak mendesak.'),
    !pending.length && Empty('Tidak ada aktivitas tersisa hari ini. 🌿'),
    pending.map(task => {
      const rec = recommend(task, busyUntil, free);
      return h('div', { class: 'wrap-item' },
        h('strong', {}, task.name),
        h('div', { class: 'task-meta' }, (rec.clash ? 'Bentrok dengan acaramu · ' : '') + 'Disarankan: ' + (rec.choice === 'keep' ? 'pertahankan hari ini' : 'pindah')),
        Select({ options: CHOICES, value: choices[task.id] ?? rec.choice, style: 'margin-top:8px', onChange: v => onChoice(task.id, v) }));
    }),
    ModalActions({},
      Button({ label: 'Batal', variant: 'quiet', onClick: closeModal }),
      Button({ label: 'Terapkan pilihan', variant: 'primary', onClick: () => {
        const final = Object.fromEntries(pending.map(t => [t.id, choices[t.id] ?? recommend(t, busyUntil, free).choice]));
        closeModal();
        actions.setBusyUntil(busyUntil);
        actions.applyChoices(final);
        toast('Rencanamu sudah disesuaikan');
      } })),
  ];
}

export function ScheduleModal() {
  return stateful({ step: 'ask', busyUntil: state.busyUntil || '20:00', choices: {} }, (s, set) => Modal({},
    s.step === 'ask'
      ? AskStep({ value: s.busyUntil, onChange: v => { s.busyUntil = v; },
                  onNext: () => { if (s.busyUntil) set({ step: 'plan' }); } })
      : PlanStep({ busyUntil: s.busyUntil, choices: s.choices, onChoice: (id, v) => { s.choices[id] = v; } })));
}
