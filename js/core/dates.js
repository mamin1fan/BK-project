// Semua urusan tanggal & jam ada di sini. Tanggal disimpan sebagai teks "YYYY-MM-DD".

const pad = n => String(n).padStart(2, '0');

export const toYmd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYmd = s => new Date(s + 'T12:00:00'); // jam 12 supaya aman dari geser zona waktu
export const today = () => toYmd(new Date());

export function addDays(s, n) {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return toYmd(d);
}

export const formatDate = (s, opts) => new Intl.DateTimeFormat('id-ID', opts).format(parseYmd(s));
export const shortDate = s => (s ? formatDate(s, { day: 'numeric', month: 'short' }) : '');

/** Senin dari minggu yang memuat tanggal s */
export function mondayOf(s) {
  const d = parseYmd(s);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toYmd(d);
}

/** "07:30" -> 450 */
export const toMinutes = s => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
/** 450 -> "07:30" */
export const toClock = m => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;

export const nowMinutes = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};
