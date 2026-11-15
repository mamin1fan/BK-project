// Konstanta aplikasi. Mau tambah kategori baru? Cukup tambah satu baris di CATEGORIES.

export const STORAGE_KEY = 'priorita-adaptive-v1'; // sama dengan versi lama, jadi data lama tetap terbaca

export const CATEGORIES = [
  { id: 'Kuliah',      emoji: '🎓', color: '#7965bd' },
  { id: 'Organisasi',  emoji: '🏢', color: '#6c91bb' },
  { id: 'Kepanitiaan', emoji: '🎪', color: '#dc8c83' },
  { id: 'Pribadi',     emoji: '🌿', color: '#639d83' },
  { id: 'Hiburan',     emoji: '🎮', color: '#c47fa6' },
  { id: 'Kesehatan',   emoji: '💪', color: '#5aa3a3' },
  { id: 'Lainnya',     emoji: '＋', color: '#bd9149' },
];
export const categoryColor = id => (CATEGORIES.find(c => c.id === id) || CATEGORIES.at(-1)).color;

export const PROFILE_OPTIONS = [
  ['Kuliah', '🎓 Kuliah'],
  ['Organisasi', '🏢 Organisasi'],
  ['Kepanitiaan', '🎪 Kepanitiaan'],
  ['Kerja', '💼 Kerja / magang'],
  ['Belajar skill', '💻 Belajar skill'],
  ['Hobi', '🌿 Hobi'],
];

export const QUADRANT_LABEL = {
  1: 'Q1 · Fokus sekarang',
  2: 'Q2 · Tetap terencana',
  3: 'Q3 · Delegasikan',
  4: 'Q4 · Kurangi',
};

export const PAGES = [
  { id: 'today',   icon: '🏠', label: 'Home' },
  { id: 'focus',   icon: '▦',  label: 'Matriks Fokus' },
  { id: 'cal',     icon: '📅', label: 'Kalender' },
  { id: 'flex',    icon: '🌿', label: 'Luang' },
  { id: 'insight', icon: '✦',  label: 'Insight' },
  { id: 'set',     icon: '⚙️', label: 'Atur' },
];
