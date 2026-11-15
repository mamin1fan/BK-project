import { h } from '../core/h.js';
import { state } from '../core/store.js';
import { conflictsOf } from '../core/domain.js';
import * as actions from '../core/actions.js';
import { openModal } from '../core/ui.js';
import { toast } from '../services/toast.js';
import { Empty } from './Layout.js';
import { TaskItem } from './TaskItem.js';

/**
 * Daftar aktivitas lengkap dengan aksinya (centang, edit, hapus, pindah).
 *   <TaskList tasks emptyText actions showDate showConflict />
 * Inilah satu-satunya tempat TaskItem disambungkan ke actions.
 */
export function TaskList({ tasks, emptyText = 'Belum ada aktivitas di sini.', actions: buttons, showDate = true, showConflict = false, className = 'tasks' }) {
  return h('div', { class: className },
    tasks.length === 0 && Empty(emptyText),
    tasks.map(task => TaskItem({
      task, actions: buttons, showDate,
      conflictWith: showConflict ? conflictsOf(task, state.tasks)[0] : null,
      onToggle: done => actions.toggleTask(task.id, done),
      onEdit: () => openModal('task', { task }),
      onDelete: () => { if (confirm('Hapus aktivitas ini?')) actions.deleteTask(task.id); },
      onTomorrow: () => { actions.moveTaskToTomorrow(task.id); toast('Dipindah ke besok'); },
      onRemind: () => { actions.toggleTaskReminder(task.id); toast(task.roff ? 'Pengingat dinonaktifkan' : 'Pengingat aktif'); },
    })));
}
