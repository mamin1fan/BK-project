import { h, stateful } from '../core/h.js';
import { state } from '../core/store.js';
import { closeModal } from '../core/ui.js';
import { PROFILE_OPTIONS } from '../core/config.js';
import * as actions from '../core/actions.js';
import { toast } from '../services/toast.js';
import { Button, Chip } from '../components/Button.js';
import { Modal } from '../components/Modal.js';

const END_TIMES = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const Note = text => h('div', { class: 'muted-note' }, text);

const StepProfile = ({ profile, toggle }) => h('div', {},
  h('h2', {}, 'Aktif di banyak hal?'),
  h('p', { class: 'desc' }, 'Biar Priorita memahami dunia aktivitasmu. Pilih yang paling sering mengisi harimu. Kamu bisa melewati tahap ini.'),
  h('div', { class: 'option-chips' }, PROFILE_OPTIONS.map(([id, label]) =>
    Chip({ label, selected: profile.has(id), onClick: () => toggle(id) }))),
  Note('Pilih beberapa atau lewati. Tidak ada jawaban yang benar atau salah.'));

const StepEndTime = ({ endTime, pick }) => h('div', {},
  h('h2', {}, 'Kapan kamu ingin menutup harimu?'),
  h('p', { class: 'desc' }, 'Ini batas waktu rencana harian, bukan larangan beraktivitas setelahnya.'),
  h('div', { class: 'time-grid' }, END_TIMES.map(t =>
    h('button', { class: 'time-choice' + (endTime === t ? ' selected' : ''), type: 'button', onClick: () => pick(t) }, t.replace(':', '.')))),
  Note('Priorita akan mengingatkanmu untuk meninjau aktivitas yang tertinggal ketika kamu siap menutup hari.'));

export function OnboardModal() {
  return stateful({ step: 1, profile: new Set(state.profile), endTime: state.endTime || '21:00' }, (s, set) => {
    const toggle = id => { const next = new Set(s.profile); next.has(id) ? next.delete(id) : next.add(id); set({ profile: next }); };
    const finish = withTime => {
      actions.finishOnboarding({ profile: s.profile, endTime: withTime ? s.endTime : null });
      closeModal();
      if (withTime) toast('Priorita siap menemani harimu.');
    };

    return Modal({ class: 'onboard' },
      h('div', { class: 'eyebrow' }, 'Selamat datang di Priorita'),
      h('div', { class: 'step-dots' }, h('i', { class: 'active' }), h('i', { class: s.step === 2 ? 'active' : '' })),
      s.step === 1 ? StepProfile({ profile: s.profile, toggle }) : StepEndTime({ endTime: s.endTime, pick: endTime => set({ endTime }) }),
      h('div', { class: 'modal-actions' },
        Button({ label: s.step === 1 ? 'Lewati' : 'Kembali', variant: 'quiet', onClick: () => (s.step === 1 ? finish(false) : set({ step: 1 })) }),
        Button({ label: s.step === 1 ? 'Lanjut' : 'Mulai gunakan Priorita', variant: 'primary', onClick: () => (s.step === 1 ? set({ step: 2 }) : finish(true)) })));
  });
}
