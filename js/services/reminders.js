// Pengingat: bunyi, notifikasi browser, dan banner. Dicek tiap 15 detik selama aplikasi hidup.
import { h } from '../core/h.js';
import { state, commit } from '../core/store.js';
import { today, parseYmd, toMinutes, nowMinutes } from '../core/dates.js';
import { Button } from '../components/Button.js';

export function beep() {
  if (!state.set.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.start(); osc.stop(ctx.currentTime + 0.9);
  } catch { /* browser tidak mendukung audio */ }
}

export function showNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, icon: 'icons/icon-192.png', tag: 'priorita' };
  const viaWorker = navigator.serviceWorker ? navigator.serviceWorker.ready.then(r => r.showNotification(title, opts)) : Promise.reject();
  viaWorker.catch(() => { try { new Notification(title, opts); } catch { /* abaikan */ } });
}

export function playTestReminder() {
  beep();
  showNotification('Priorita', 'Ini contoh pengingat 🔔');
}

/* ---------- banner ---------- */
let bar;
const hideBar = () => bar.classList.remove('open');

function showBanner(task) {
  bar.replaceChildren(
    h('strong', {}, '🔔 ' + task.name),
    h('div', { class: 'task-meta' }, 'Mulai ' + task.start),
    h('div', {},
      Button({ label: 'Tunda 5 mnt', variant: 'soft', size: 'small', onClick: () => { commit(s => { s.snz[task.id] = Date.now() + 5 * 60000; }, { silent: true }); hideBar(); } }),
      Button({ label: 'Matikan', variant: 'quiet', size: 'small', onClick: () => { commit(() => { task.roff = true; }); hideBar(); } }),
      Button({ label: 'Tutup', variant: 'quiet', size: 'small', onClick: hideBar })));
  bar.classList.add('open');
}

function fire(task) {
  commit(s => { s.fired[today() + ':' + task.id] = 1; }, { silent: true });
  showBanner(task);
  beep();
  showNotification('Priorita · ' + task.name, 'Mulai pukul ' + task.start);
}

/** Apakah aktivitas ini "jatuh" di hari d (termasuk yang berulang)? */
function isDueOn(t, d) {
  if (t.date === d) return true;
  if (t.date > d) return false;
  const sameWeekday = parseYmd(t.date).getDay() === parseYmd(d).getDay();
  return t.repeat === 'daily' || (t.repeat === 'weekly' && sameWeekday);
}

export function tick() {
  const d = today(), nowMin = nowMinutes();

  // buang penanda hari-hari lalu supaya data tidak menumpuk
  const stale = Object.keys(state.fired).filter(k => !k.startsWith(d + ':'));
  if (stale.length) commit(s => stale.forEach(k => delete s.fired[k]), { silent: true });

  state.tasks.forEach(t => {
    const noReminder = t.remind === '' || t.remind == null;
    if ((t.done && !t.repeat) || t.roff || !t.start || noReminder || !t.date || !isDueOn(t, d)) return;

    if (state.snz[t.id]) {                       // sedang ditunda
      if (Date.now() >= state.snz[t.id]) { commit(s => { delete s.snz[t.id]; }, { silent: true }); fire(t); }
      return;
    }
    const start = toMinutes(t.start);
    const inWindow = nowMin >= start - Number(t.remind) && nowMin < start + Math.max(t.dur || 0, 30);
    if (inWindow && !state.fired[d + ':' + t.id]) fire(t);
  });
}

export function startReminders() {
  bar = h('div', { id: 'alertBar' });
  document.body.append(bar);
  setInterval(tick, 15000);
  tick();
}
