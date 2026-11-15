import { h } from '../core/h.js';

export const PageHeader = ({ title, subtitle }) =>
  h('div', { class: 'hd' }, h('div', { class: 'eyebrow' }, 'Priorita'), h('h1', {}, title), h('p', {}, subtitle));

/** Kartu putih berjudul. children = isi kartu */
export const Panel = ({ title, sub, class: cls = '' }, ...children) =>
  h('section', { class: ('panel ' + cls).trim() },
    title && h('h3', {}, title),
    sub && h('p', { class: 'panel-sub' }, sub),
    children);

export const Hint = text => h('p', { class: 'hint' }, text);
export const Nudge = text => h('div', { class: 'nudge' }, text);
export const Empty = text => h('div', { class: 'empty' }, text);
export const Label = text => h('label', { class: 'field-label' }, text);
