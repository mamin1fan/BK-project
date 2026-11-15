// Toast = pesan kecil di bawah layar. Elemennya hidup di luar #app supaya tidak ikut hilang saat gambar ulang.
let el, timer;

export function toast(msg) {
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.append(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('show'), 2300);
}
