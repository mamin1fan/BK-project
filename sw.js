// Service worker Priorita: network-first, cadangan dari cache saat offline.
const VERSION = 'priorita-v3';
const ASSETS = [
  './', 'index.html', 'manifest.json', 'css/style.css', 'css/extra.css',
  'js/main.js', 'js/App.js',
  'js/core/h.js', 'js/core/dates.js', 'js/core/config.js', 'js/core/domain.js', 'js/core/store.js', 'js/core/ui.js', 'js/core/actions.js',
  'js/components/Button.js', 'js/components/Layout.js', 'js/components/Form.js', 'js/components/Modal.js', 'js/components/TaskItem.js', 'js/components/TaskList.js',
  'js/pages/TodayPage.js', 'js/pages/FocusPage.js', 'js/pages/CalendarPage.js', 'js/pages/FlexPage.js', 'js/pages/InsightPage.js', 'js/pages/SettingsPage.js',
  'js/modals/TaskModal.js', 'js/modals/OnboardModal.js', 'js/modals/WrapUpModal.js', 'js/modals/ScheduleModal.js', 'js/modals/TomorrowModal.js',
  'js/services/toast.js', 'js/services/pwa.js', 'js/services/reminders.js',
  'data/demo.json', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', e => e.waitUntil(
  caches.open(VERSION)
    .then(cache => Promise.all(ASSETS.map(a => cache.add(a).catch(() => {}))))   // satu file hilang tidak menggagalkan semuanya
    .then(() => self.skipWaiting())));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => (list.length ? list[0].focus() : clients.openWindow('./'))));
});
