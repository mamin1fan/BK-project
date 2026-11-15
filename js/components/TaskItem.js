import { h } from '../core/h.js';
import { categoryColor, QUADRANT_LABEL } from '../core/config.js';
import { quadrantOf, timeSpan } from '../core/domain.js';
import { toClock, today, shortDate } from '../core/dates.js';
import { IconButton } from './Button.js';

/**
 * Satu baris aktivitas. Komponen ini "bodoh": hanya menggambar dari props.
 *
 * props:
 *   task         data aktivitas
 *   actions      tombol yang ditampilkan: 'remind' | 'tomorrow' | 'edit' | 'delete'
 *   conflictWith aktivitas lain yang jamnya bentrok (atau null)
 *   showDate     tampilkan tanggal di meta
 *   onToggle(done)  onEdit()  onDelete()  onTomorrow()  onRemind()
 */
export function TaskItem({ task, actions = ['edit', 'delete'], conflictWith = null, showDate = true,
                           onToggle, onEdit, onDelete, onTomorrow, onRemind }) {
  const span = timeSpan(task);
  const hasReminder = task.start && task.remind !== '' && task.remind != null;

  const meta = [
    span && `${task.start}–${toClock(span[1])}`,
    task.category || 'Lainnya',
    showDate && (task.date === today() ? 'Hari ini' : shortDate(task.date)),
    QUADRANT_LABEL[quadrantOf(task)],
    hasReminder && (task.roff ? '🔕' : '🔔'),
    task.repeat && '↻',
  ].filter(Boolean).join(' · ');

  const buttons = {
    remind:   hasReminder && IconButton({ icon: task.roff ? '🔕' : '🔔', title: task.roff ? 'Aktifkan pengingat' : 'Nonaktifkan pengingat', onClick: onRemind }),
    tomorrow: IconButton({ icon: '→', title: 'Pindah ke besok', onClick: onTomorrow }),
    edit:     IconButton({ icon: '✎', title: 'Edit', onClick: onEdit }),
    delete:   IconButton({ icon: '×', title: 'Hapus', onClick: onDelete }),
  };

  return h('div', { class: 'task' + (task.done ? ' done' : ''), style: `border-left:4px solid ${categoryColor(task.category)}` },
    h('input', { class: 'check', type: 'checkbox', checked: !!task.done, 'aria-label': 'Tandai selesai', onChange: e => onToggle?.(e.target.checked) }),
    h('div', { class: 'task-content' },
      h('div', { class: 'task-name' }, task.name),
      h('div', { class: 'task-meta' }, meta),
      conflictWith && h('div', { class: 'warn' }, `⚠ Waktunya bertabrakan dengan “${conflictWith.name}”. Coba geser salah satunya — kamu yang memutuskan.`)),
    h('div', { class: 'task-actions' }, actions.map(a => buttons[a])));
}
