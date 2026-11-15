import { h } from '../core/h.js';
import { state, replaceAll, notify as refresh } from '../core/store.js';
import { ui } from '../core/ui.js';
import { today } from '../core/dates.js';
import { PROFILE_OPTIONS, STORAGE_KEY } from '../core/config.js';
import * as actions from '../core/actions.js';
import { toast } from '../services/toast.js';
import { canInstall, install, isStandalone } from '../services/pwa.js';
import { playTestReminder } from '../services/reminders.js';
import { Button, Chip } from '../components/Button.js';
import { TextInput, Select } from '../components/Form.js';
import { PageHeader, Panel, Hint, Nudge, Label } from '../components/Layout.js';

const END_TIMES = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(t => [t, t]);
const gap = { style: 'margin:6px 6px 0 0' };

/** Baris pilihan: <ChipGroup options selected onPick /> */
const ChipGroup = ({ options, isSelected, onPick }) =>
  h('div', { class: 'option-chips' }, options.map(([value, label]) =>
    Chip({ label, selected: isSelected(value), onClick: () => onPick(value) })));

const Guide = (title, steps) =>
  h('details', {}, h('summary', {}, title), h('ol', {}, steps.map(s => h('li', {}, s))));

/* ---------- validasi & pemuatan data ---------- */
function parseData(text) {
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.tasks)) throw new Error('bukan data Priorita');
  return data;
}
function applyData(data, message) {
  if (!confirm('Ini akan MENGGANTI semua data saat ini. Lanjutkan?')) return;
  replaceAll(data);
  toast(message);
}

/* ---------- bagian-bagian halaman ---------- */
const ProfileSection = () => Panel({ title: 'Profil & kebiasaan' },
  Label('Nama panggilan'),
  TextInput({ value: state.set.nick, placeholder: 'Mau dipanggil apa?',
              onChange: v => { actions.setSetting('nick', v.trim().slice(0, 20)); toast('Tersimpan'); } }),
  Label('Aktivitas utama'),
  ChipGroup({ options: PROFILE_OPTIONS, isSelected: v => state.profile.includes(v), onPick: actions.toggleProfile }),
  Label('Jam mulai aktivitas (opsional)'),
  TextInput({ type: 'time', value: state.set.start, onChange: v => { actions.setSetting('start', v); toast('Tersimpan'); } }),
  Label('Jam selesai harian'),
  Select({ options: END_TIMES, value: state.endTime, onChange: v => { actions.setEndTime(v); toast('Jam tutup hari diperbarui'); } }),
  Hint('Setelah jam ini, Priorita menawarkan Penutup Hari bila masih ada tugas tertinggal.'));

function NotificationSection() {
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  const message = {
    granted: '✅ Notifikasi diizinkan.',
    denied: 'Notifikasi diblokir. Ubah lewat pengaturan situs di browser.',
    unsupported: 'Browser ini tidak mendukung notifikasi.',
    default: 'Notifikasi belum diaktifkan. Kami tidak akan memaksa.',
  }[perm];
  return Panel({ title: 'Notifikasi' },
    Nudge(message),
    perm === 'default' && Button({ label: 'Izinkan notifikasi', variant: 'primary', ...gap, onClick: () => Notification.requestPermission().then(refresh) }),
    Button({ label: 'Coba bunyi & notifikasi', variant: 'soft', ...gap, onClick: () => { playTestReminder(); toast('Mencoba pengingat…'); } }),
    Label('Suara pengingat (saat aplikasi terbuka)'),
    ChipGroup({ options: [[1, '🔔 Hidup'], [0, '🔕 Mati']], isSelected: v => !!v === state.set.sound, onPick: v => actions.setSetting('sound', !!v) }),
    Hint('Penting: pengingat berjalan dari dalam aplikasi (saat Priorita terbuka atau masih aktif di latar belakang). Pengingat lokal tidak dijamin berbunyi bila browser ditutup penuh. Pengingat yang andal saat aplikasi mati butuh server Web Push (belum tersedia di versi ini). Pengingat yang terlewat akan muncul saat Priorita dibuka kembali.'),
    Hint('Waktu dan pengulangan pengingat diatur per aktivitas (form tambah/edit).'));
}

const AppearanceSection = () => Panel({ title: 'Tampilan' },
  Label('Tema'),
  ChipGroup({ options: [['light', '☀️ Terang'], ['dark', '🌙 Gelap']], isSelected: v => state.set.theme === v, onPick: v => actions.setSetting('theme', v) }),
  Label('Tampilan kalender awal'),
  ChipGroup({ options: [['month', 'Bulan'], ['week', 'Minggu'], ['day', 'Agenda']], isSelected: v => state.set.view === v,
              onPick: v => { ui.calView = v; actions.setSetting('view', v); } }));

const InstallSection = () => Panel({ title: 'Aplikasi' },
  Nudge(isStandalone()
    ? '✅ Priorita sedang berjalan sebagai aplikasi terpasang.'
    : 'Status pemasangan tidak bisa dipastikan oleh browser. Bila belum terpasang, gunakan tombol atau panduan di bawah.'),
  Button({ label: canInstall() ? 'Pasang Priorita di Layar Utama' : 'Pasang (lihat panduan di bawah)', variant: canInstall() ? 'primary' : 'quiet', onClick: install }),
  Guide('Panduan Android (Chrome)', ['Buka Priorita menggunakan Chrome.', 'Buka menu browser (⋮).', 'Pilih “Add to Home screen” atau “Install app”.', 'Konfirmasi pemasangan.']),
  Guide('Panduan iPhone (Safari)', ['Buka Priorita menggunakan Safari.', 'Tekan tombol Share.', 'Pilih “Add to Home Screen”.', 'Tekan Add.']),
  Hint('Priorita v2.1.0 · PWA hanya aktif lewat HTTPS atau localhost.'));

function DataSection() {
  const fileInput = h('input', { type: 'file', accept: '.json', hidden: true, onChange: () => {
    const file = fileInput.files[0];
    if (!file) return;
    file.text().then(parseData).then(d => applyData(d, 'Data diimpor'), () => toast('File tidak valid.'));
    fileInput.value = '';
  } });

  const exportData = () => {
    const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })), download: `priorita-backup-${today()}.json` });
    a.click();
    toast('Data diekspor');
  };

  const loadDemo = () => fetch('data/demo.json').then(r => r.json()).then(d => applyData(parseData(JSON.stringify(d)), 'Data contoh dimuat'))
    .catch(() => toast('Gagal memuat data/demo.json (jalankan lewat server).'));

  const wipe = () => {
    if (prompt('Semua aktivitas, pengaturan, dan daftar akan dihapus permanen. Ketik HAPUS untuk melanjutkan.') === 'HAPUS') {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  };

  return Panel({ title: 'Data' },
    Hint('Datamu hanya tersimpan di browser ini. Ekspor secara berkala sebagai cadangan.'),
    Button({ label: 'Ekspor data', variant: 'soft', ...gap, onClick: exportData }),
    Button({ label: 'Impor data', variant: 'outline', ...gap, onClick: () => fileInput.click() }),
    Button({ label: 'Muat data contoh', variant: 'outline', ...gap, onClick: loadDemo }),
    Button({ label: 'Hapus semua data', variant: 'quiet', ...gap, onClick: wipe }),
    fileInput,
    RawEditor());
}

/** Editor data mentah: ubah JSON-nya, tekan terapkan, tampilan ikut berubah (seperti file .txt di Python). */
function RawEditor() {
  const box = h('textarea', { class: 'field', rows: 12, spellcheck: false,
    style: 'font:11px/1.5 ui-monospace,Menlo,monospace;margin-top:8px;white-space:pre' });
  box.value = JSON.stringify(state, null, 2);
  return h('details', {},
    h('summary', {}, 'Editor data mentah (JSON)'),
    Hint('Ini isi “database” aplikasi. Ubah angkanya, tekan Terapkan, dan tampilan langsung mengikuti.'),
    box,
    Button({ label: 'Terapkan ke aplikasi', variant: 'primary', size: 'small', style: 'margin-top:8px', onClick: () => {
      try { replaceAll(parseData(box.value)); toast('Data diterapkan'); }
      catch { toast('JSON tidak valid — periksa tanda koma/kurungnya.'); }
    } }));
}

export function SettingsPage() {
  return h('div', {},
    PageHeader({ title: 'Pengaturan', subtitle: 'Atur Priorita sesuai ritmemu.' }),
    ProfileSection(), NotificationSection(), AppearanceSection(), InstallSection(), DataSection());
}
