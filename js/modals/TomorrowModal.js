import { h } from '../core/h.js';
import { state } from '../core/store.js';
import { closeModal } from '../core/ui.js';
import { today, addDays } from '../core/dates.js';
import { Button } from '../components/Button.js';
import { Modal, ModalHead, ModalActions } from '../components/Modal.js';
import { TaskList } from '../components/TaskList.js';

export function TomorrowModal() {
  const tomorrow = addDays(today(), 1);
  return Modal({},
    ModalHead({ title: 'Rencana besok ☀️', subtitle: 'Siapkan seperlunya. Hari ini tetap jadi fokus utama.' }),
    TaskList({ tasks: state.tasks.filter(t => t.date === tomorrow && !t.done), emptyText: 'Belum ada rencana besok.' }),
    ModalActions({}, Button({ label: 'Selesai', variant: 'primary', onClick: closeModal })));
}
