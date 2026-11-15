import { h } from '../core/h.js';
import { closeModal } from '../core/ui.js';

/** Bingkai modal: klik latar gelap = tutup. */
export const Modal = ({ class: cls = '' }, ...children) =>
  h('div', { class: 'overlay open', onClick: e => { if (e.target === e.currentTarget) closeModal(); } },
    h('div', { class: ('modal ' + cls).trim() }, children));

/** Kepala modal dengan judul + tombol × */
export const ModalHead = ({ eyebrow, title, subtitle }) =>
  h('div', { class: 'modal-head' },
    h('div', {}, eyebrow && h('div', { class: 'eyebrow' }, eyebrow), h('h2', {}, title), subtitle && h('p', {}, subtitle)),
    h('button', { class: 'close', type: 'button', onClick: closeModal }, '×'));

export const ModalActions = ({ style }, ...children) => h('div', { class: 'modal-actions', style }, children);
