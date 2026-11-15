PRIORITA v2.1 — Adaptive Daily Planner (versi terstruktur)

JALANKAN (wajib lewat server, karena pakai ES Module + service worker)
  cd priorita && python3 -m http.server 8080   ->  buka http://localhost:8080
Di HP: deploy ke hosting HTTPS (Netlify/Vercel/GitHub Pages).
Folder icons/ (icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png) tidak ikut di sini — taruh sendiri di priorita/icons/.

STRUKTUR
  index.html          kerangka kosong: cuma <div id="root"> + 1 script
  css/                style.css (dari <style> lama) + extra.css
  data/demo.json      data contoh; muat lewat Atur -> Data -> "Muat data contoh"
  sw.js, manifest.json
  js/
    main.js           pintu masuk: data berubah -> gambar ulang
    App.js            menyusun Header + halaman + modal + navigasi
    core/             "otak" aplikasi, tanpa tampilan
      store.js        state + localStorage (si "file txt"-nya). Ubah lewat commit()
      actions.js      semua aksi pengubah data: addTask, toggleTask, moveTask, ...
      domain.js       aturan murni: kuadran Eisenhower, bentrok jadwal, insight
      dates.js        urusan tanggal & jam
      config.js       kategori, label, daftar halaman
      ui.js           state sementara: halaman aktif, modal terbuka
      h.js            h('tag', props, ...anak) + stateful() — rasa JSX/useState
    components/       potongan UI yang menerima props
      Button.js  Layout.js  Form.js  Modal.js  TaskItem.js  TaskList.js
    pages/            1 file = 1 halaman (Today, Focus, Calendar, Flex, Insight, Settings)
    modals/           1 file = 1 modal (Task, Onboard, WrapUp, Schedule, Tomorrow)
    services/         pengingat, PWA, toast

ALUR DATA (satu arah)
  klik tombol -> actions.xxx() -> commit() ubah state & simpan -> render() gambar ulang dari state

CONTOH PROPS
  Button({ label: 'Simpan', variant: 'primary', onClick: simpan })
  TaskItem({ task, actions: ['edit','delete'], conflictWith, onToggle, onEdit, onDelete })

TAMBAH KATEGORI : 1 baris di js/core/config.js (CATEGORIES)
TAMBAH HALAMAN  : buat js/pages/XPage.js, daftarkan di App.js (PAGE_VIEWS) dan config.js (PAGES)

UJI "kayak file .txt di Python"
  Atur -> Data -> Editor data mentah (JSON): ubah isinya, tekan "Terapkan ke aplikasi", tampilan ikut berubah.

Data lama (kunci 'priorita-adaptive-v1') tetap terbaca. "Simpan nanti" lama dipindah otomatis ke Kalau Ada Waktu.
