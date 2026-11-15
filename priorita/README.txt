PRIORITA v2.0 — Adaptive Daily Planner
Jalankan (wajib lewat server agar PWA & service worker aktif):
  cd priorita && python3 -m http.server 8080   ->  buka http://localhost:8080
Di HP: deploy ke hosting HTTPS (Netlify/Vercel/GitHub Pages) lalu buka di Chrome/Safari.
Uji kalender : Tambah aktivitas (jam mulai + durasi) -> tab Kalender -> ketuk tanggal. Dua aktivitas yang jamnya tumpang tindih menampilkan peringatan.
Uji reminder : Atur -> izinkan notifikasi, lalu buat aktivitas jam mulai 2 menit lagi, "Ingatkan: Tepat waktu". Banner + bunyi muncul; coba Tunda/Matikan.
Uji PWA      : Chrome DevTools -> Application -> Manifest/Service Workers; atau Atur -> Pasang di Layar Utama.
Data lama (kunci 'priorita-adaptive-v1') dibaca apa adanya; aktivitas "Simpan nanti" lama dipindah otomatis ke Kalau Ada Waktu.
