/**
 * h() — pembuat elemen kecil, rasanya mirip JSX/React.
 *
 *   h('button', { class: 'btn primary', onClick: simpan }, 'Simpan')
 *
 * - props `onXxx`  -> addEventListener('xxx')
 * - props `style`  -> string atau object
 * - children       -> string / angka / Node / array (null & false dilewati)
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);

  for (const [key, val] of Object.entries(props || {})) {
    if (val == null || val === false) continue;

    if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === 'class') {
      el.className = val;
    } else if (key === 'style') {
      if (typeof val === 'string') el.style.cssText = val;
      else Object.assign(el.style, val);
    } else if (key === 'value' || key === 'checked' || key === 'disabled' || key === 'hidden') {
      el[key] = val; // properti, bukan atribut
    } else {
      el.setAttribute(key, val === true ? '' : val);
    }
  }

  el.append(...children.flat(Infinity).filter(c => c != null && c !== false));
  return el;
}

/**
 * stateful() — mirip useState untuk satu komponen kecil (mis. isi form di modal).
 *
 *   stateful({ step: 1 }, (s, set) => h('button', { onClick: () => set({ step: 2 }) }, s.step))
 *
 * `set` menggabungkan patch ke state lalu menggambar ulang komponen ini saja.
 */
export function stateful(initial, view) {
  let state = initial;
  const root = h('div', { style: 'display:contents' });
  const set = patch => {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
    paint();
  };
  const paint = () => root.replaceChildren(view(state, set));
  paint();
  return root;
}
