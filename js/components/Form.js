import { h } from '../core/h.js';

/** <TextInput value onChange placeholder /> — onChange dipanggil saat selesai mengetik (change event) */
export const TextInput = ({ type = 'text', value, onChange, placeholder, maxLength, id }) =>
  h('input', { class: 'field', type, id, value: value ?? '', placeholder, maxlength: maxLength, onChange: e => onChange?.(e.target.value) });

/** <Select options={[[nilai, label], ...]} value onChange /> */
export function Select({ options, value, onChange, style }) {
  const el = h('select', { class: 'field', style, onChange: e => onChange?.(e.target.value) },
    options.map(([v, label]) => h('option', { value: v }, label)));
  el.value = String(value ?? '');
  return el;
}
