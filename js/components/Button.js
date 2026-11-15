import { h } from '../core/h.js';

/** <Button label="Simpan" variant="primary" size="small" onClick={...} /> */
export function Button({ label, variant = 'outline', size = '', onClick, title, style }) {
  return h('button', { class: `btn ${variant} ${size}`.trim(), type: 'button', title, style, onClick }, label);
}

/** Tombol ikon kecil di baris aktivitas (✎ × → 🔔) */
export function IconButton({ icon, title, onClick }) {
  return h('button', { class: 'icon-btn', type: 'button', title, 'aria-label': title, onClick }, icon);
}

/** Pil pilihan (kategori, profil, dst) */
export function Chip({ label, selected, onClick }) {
  return h('button', { class: 'chip' + (selected ? ' selected' : ''), type: 'button', onClick }, label);
}

/** Pilihan besar di form (Hari ini / Besok / Penting ...) */
export function Choice({ label, selected, onClick }) {
  return h('button', { class: 'choice' + (selected ? ' selected' : ''), type: 'button', onClick }, label);
}

/** Tab filter (Hari ini / Mendatang / ...) */
export function FilterButton({ label, active, onClick }) {
  return h('button', { class: 'filter' + (active ? ' active' : ''), type: 'button', onClick }, label);
}
