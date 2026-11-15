(()=>{'use strict';
const P=window.P,S=P.state,$=id=>document.getElementById(id),T=P.today,KEY='priorita-adaptive-v1';
Object.assign(S,{flex:S.flex||[],fired:S.fired||{},snz:S.snz||{},set:Object.assign({nick:'',start:'',sound:true,theme:'light',view:'month'},S.set||{})});
S.profile=S.profile||[];
S.tasks.filter(t=>t.archived&&!t.date).forEach(t=>S.flex.push({id:t.id,name:t.name,cat:t.category||'Lainnya',dur:15,done:false}));
S.tasks=S.tasks.filter(t=>!(t.archived&&!t.date));S.ver=2;
const toFlex=t=>{S.flex.push({id:t.id,name:t.name,cat:t.category||'Lainnya',dur:t.dur||15,done:false});S.tasks=S.tasks.filter(x=>x.id!==t.id)};P.toFlex=toFlex;
const CAT={Kuliah:'#7965bd',Organisasi:'#6c91bb',Kepanitiaan:'#dc8c83',Pribadi:'#639d83',Lainnya:'#bd9149'},col=c=>CAT[c]||CAT.Lainnya;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,pd=s=>new Date(s+'T12:00:00'),fmt=(s,o)=>new Intl.DateTimeFormat('id-ID',o).format(pd(s));
const mins=s=>{const[a,b]=s.split(':').map(Number);return a*60+b},hm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const span=t=>t.start?[mins(t.start),mins(t.start)+(t.dur||60)]:null;
const conflicts=t=>{const a=span(t);return(!a||t.done)?[]:S.tasks.filter(o=>o.id!==t.id&&o.date===t.date&&!o.done&&span(o)&&span(o)[0]<a[1]&&a[0]<span(o)[1])};
const byDay=d=>S.tasks.filter(t=>t.date===d).sort((a,b)=>(a.start||'99').localeCompare(b.start||'99'));
const hd=(h,p)=>{const d=el('div','hd');d.append(el('div','eyebrow','Priorita'),el('h1','',h),el('p','',p));return d};
const sec=(t,...k)=>{const d=el('section','panel gap');d.append(el('h3','',t));k.forEach(x=>d.append(x));return d};
const btn=(t,c,f)=>{const b=el('button','btn '+c,t);b.onclick=f;return b};
let page='today',cv=S.set.view,cur=T();
/* ---------- navigasi ---------- */
function go(p){if(!['today','cal','flex','insight','set'].includes(p))p='today';page=p;document.body.dataset.page=p;if(location.hash!=='#'+p)history.replaceState(null,'','#'+p);R();scrollTo(0,0)}
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));addEventListener('hashchange',()=>go(location.hash.slice(1)));
/* ---------- baris aktivitas ---------- */
function row(t){const r=el('div','task'+(t.done?' done':''));r.style.borderLeft='4px solid '+col(t.category);
const cb=el('input','check');cb.type='checkbox';cb.checked=!!t.done;cb.onchange=()=>{t.done=cb.checked;t.completedAt=t.done?Date.now():null;P.save();P.render()};
const c=el('div','task-content');c.append(el('div','task-name',t.name));const rem=t.start&&t.remind!==''&&t.remind!=null;
c.append(el('div','task-meta',(t.start?t.start+'–'+hm(span(t)[1])+' · ':'')+(t.category||'Lainnya')+' · Q'+P.q(t)+(rem?(t.roff?' · 🔕':' · 🔔'):'')+(t.repeat?' · ↻':'')));
const cf=conflicts(t);if(cf.length)c.append(el('div','warn','⚠ Waktunya bertabrakan dengan “'+cf[0].name+'”. Coba geser salah satunya — kamu yang memutuskan.'));
const a=el('div','task-actions');const ib=(x,ti,f)=>{const b=el('button','icon-btn',x);b.title=ti;b.onclick=f;a.append(b)};
if(rem)ib(t.roff?'🔕':'🔔',t.roff?'Aktifkan pengingat':'Nonaktifkan pengingat',()=>{t.roff=!t.roff;P.save();P.render();P.toast(t.roff?'Pengingat dinonaktifkan':'Pengingat aktif')});
ib('→','Pindah ke besok',()=>{t.date=P.addDays(t.date,1);t.moveCount=(t.moveCount||0)+1;P.save();P.render();P.toast('Dipindah ke besok')});
ib('✎','Edit',()=>P.openTask(t));ib('×','Hapus',()=>{if(confirm('Hapus aktivitas ini?')){S.tasks=S.tasks.filter(x=>x.id!==t.id);P.save();P.render()}});
r.append(cb,c,a);return r}
const addOn=d=>{P.openTask();document.querySelector('[data-date=later]').click();$('customDate').value=d};
/* ---------- kalender ---------- */
function dayBox(d){const b=el('div','panel daybox'),h=el('div','mini-head');h.append(el('strong','',fmt(d,{weekday:'long',day:'numeric',month:'long'})+(d===T()?' · Hari ini':'')),btn('＋ Tambah','soft small',()=>addOn(d)));b.append(h);const l=el('div','tasks'),ts=byDay(d);if(!ts.length)l.append(el('div','empty','Belum ada kegiatan. Hari yang lowong juga bagus.'));ts.forEach(t=>l.append(row(t)));b.append(l);return b}
function calR(){const p=$('p-cal');p.replaceChildren(hd('Kalender','Semua kuliah, organisasi, kepanitiaan, dan rencana pribadimu di satu tempat.'));
const step=n=>{if(cv==='month'){const d=pd(cur);cur=ymd(new Date(d.getFullYear(),d.getMonth()+n,1))}else cur=P.addDays(cur,n*(cv==='week'?7:1));calR()};
const ttl=cv==='month'?fmt(cur,{month:'long',year:'numeric'}):cv==='week'?fmt(mon(cur),{day:'numeric',month:'short'})+' – '+fmt(P.addDays(mon(cur),6),{day:'numeric',month:'short'}):fmt(cur,{day:'numeric',month:'long',year:'numeric'});
const bar=el('div','cbar');bar.append(btn('‹','outline small',()=>step(-1)),el('div','ttl',ttl),btn('›','outline small',()=>step(1)),btn('Hari ini','soft small',()=>{cur=T();calR()}));
const sg=el('div','seg');[['month','Bulan'],['week','Minggu'],['day','Agenda']].forEach(([v,l])=>{const b=el('button','filter'+(cv===v?' active':''),l);b.onclick=()=>{cv=v;S.set.view=v;P.save();calR()};sg.append(b)});
const lg=el('div','legend');Object.keys(CAT).forEach(k=>{const s=el('span');const i=el('b');i.style.background=col(k);s.append(i,k);lg.append(s)});p.append(bar,sg,lg);
if(cv==='month'){const d0=pd(cur),f=new Date(d0.getFullYear(),d0.getMonth(),1),lead=(f.getDay()+6)%7,dim=new Date(d0.getFullYear(),d0.getMonth()+1,0).getDate(),g=el('div','mgrid');
['Sen','Sel','Rab','Kam','Jum','Sab','Min'].forEach(x=>g.append(el('div','mdow',x)));for(let i=0;i<lead;i++)g.append(el('div'));
for(let n=1;n<=dim;n++){const ds=ymd(new Date(f.getFullYear(),f.getMonth(),n)),b=el('button','mcell'+(ds===T()?' today':'')+(ds===cur?' sel':'')),ts=byDay(ds),dots=el('i','dots');b.append(el('span','',n));
ts.slice(0,4).forEach(t=>{const s=el('b');s.style.background=col(t.category);if(t.done)s.style.opacity=.35;dots.append(s)});if(ts.some(t=>conflicts(t).length))dots.append(el('em','','!'));b.append(dots);b.onclick=()=>{cur=ds;calR()};g.append(b)}
p.append(g,dayBox(cur))}else if(cv==='week'){for(let i=0;i<7;i++)p.append(dayBox(P.addDays(mon(cur),i)))}else p.append(dayBox(cur))}
const mon=s=>{const d=pd(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return ymd(d)};
/* ---------- Kalau Ada Waktu ---------- */
let ff={dur:0,cat:''};
function flexR(){const p=$('p-flex');p.replaceChildren(hd('Kalau Ada Waktu','Hal-hal yang ingin kamu lakukan, tanpa tekanan dan tanpa tenggat.'));
p.append(el('div','nudge','Punya sedikit waktu luang? Mungkin kamu bisa melakukan salah satu hal ini. Tapi beristirahat juga pilihan yang baik. 🌿'));
const f=el('div','panel gap'),q=el('input','field');q.id='fq';q.placeholder='Mis. baca buku 15 menit';q.maxLength=100;const r2=el('div','row2');r2.style.marginTop='8px';
const ds=el('select','field');[[5,'5 menit'],[15,'15 menit'],[30,'30 menit'],[60,'60 menit']].forEach(([v,l])=>ds.add(new Option(l,v)));ds.value=15;const cs=el('select','field');Object.keys(CAT).forEach(k=>cs.add(new Option(k,k)));cs.value='Pribadi';r2.append(ds,cs);
const add=()=>{const n=q.value.trim();if(!n){P.toast('Tulis dulu aktivitasnya.');return}S.flex.push({id:'f'+Date.now()+Math.random().toString(36).slice(2,6),name:n,dur:+ds.value,cat:cs.value,done:false});P.save();flexR();P.toast('Disimpan di Kalau Ada Waktu')};q.onkeydown=e=>{if(e.key==='Enter')add()};
const ab=btn('Simpan','primary',add);ab.style.cssText='width:100%;margin-top:8px';f.append(q,r2,ab);p.append(f);
const fl=el('div','filters');[[0,'Semua'],[5,'5′'],[15,'15′'],[30,'30′'],[60,'60′']].forEach(([v,l])=>{const b=el('button','filter'+(ff.dur===v?' active':''),l);b.onclick=()=>{ff.dur=v;flexR()};fl.append(b)});
const fc=el('select','field');fc.style.cssText='width:auto;padding:6px 8px;font-size:10px';fc.add(new Option('Semua kategori',''));Object.keys(CAT).forEach(k=>fc.add(new Option(k,k)));fc.value=ff.cat;fc.onchange=()=>{ff.cat=fc.value;flexR()};fl.append(fc);p.append(fl);
const list=S.flex.filter(x=>(!ff.dur||x.dur<=ff.dur)&&(!ff.cat||x.cat===ff.cat)).sort((a,b)=>a.done-b.done),box=el('div','tasks');
if(!list.length)box.append(el('div','empty','Belum ada aktivitas di sini. Simpan ide-ide kecil yang ingin kamu lakukan saat longgar.'));
list.forEach(x=>{const r=el('div','task'+(x.done?' done':''));r.style.borderLeft='4px solid '+col(x.cat);const cb=el('input','check');cb.type='checkbox';cb.checked=x.done;cb.onchange=()=>{x.done=cb.checked;P.save();flexR();P.toast(x.done?'Mantap, selesai! 🌿':'Dikembalikan')};
const c=el('div','task-content');c.append(el('div','task-name',x.name),el('div','task-meta',x.dur+' menit · '+x.cat));const a=el('div','task-actions');
if(!x.done){const m=el('button','icon-btn','Ke Today');m.style.fontSize='10px';m.onclick=()=>{S.tasks.push({id:x.id,name:x.name,date:T(),category:x.cat,important:'yes',urgent:'no',dur:x.dur,done:false,createdAt:Date.now(),moveCount:0});S.flex=S.flex.filter(y=>y!==x);P.save();flexR();P.toast('Dipindah ke Today')};a.append(m)}
const d=el('button','icon-btn','×');d.onclick=()=>{if(confirm('Hapus aktivitas ini?')){S.flex=S.flex.filter(y=>y!==x);P.save();flexR()}};a.append(d);r.append(cb,c,a);box.append(r)});p.append(box)}
/* ---------- Insight ---------- */
function insR(){const p=$('p-insight');p.replaceChildren(hd('Kenali Pola Sibukmu','Dihitung langsung dari aktivitas yang kamu catat. Ini perhitungan sederhana, bukan AI.'));const ts=S.tasks.filter(t=>t.date);
if(ts.length<5){p.append(el('div','empty','Insight masih butuh lebih banyak data ('+ts.length+'/5 aktivitas). Priorita tidak mau menebak-nebak kesibukanmu.'))}else{
const DN=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],cnt=(f)=>{const o={};ts.forEach(t=>{const k=f(t);if(k!=null)o[k]=(o[k]||0)+1});return Object.entries(o).sort((a,b)=>b[1]-a[1])};
const dc=cnt(t=>pd(t.date).getDay()),cc=cnt(t=>t.category||'Lainnya'),hc=cnt(t=>t.start?Math.floor(mins(t.start)/60):null),planned=ts.filter(t=>t.date<=T()),done=planned.filter(t=>t.done).length,mv=S.tasks.filter(t=>(t.moveCount||0)>=2);
const st=el('div','insight-stat');[[done+'/'+planned.length,'Selesai dari yang terencana'],[ts.filter(t=>t.done).length,'Total selesai'],[S.tasks.filter(t=>t.moveCount>0).length,'Pernah dijadwal ulang']].forEach(([a,b])=>{const d=el('div');d.append(el('strong','',a),el('span','',b));st.append(d)});p.append(st);
const card=(h,x)=>{const c=el('div','panel gap');c.append(el('h3','',h),el('p','insight-copy',x));p.append(c)};
card('Hari paling padat',DN[dc[0][0]]+' menjadi hari paling padat ('+dc[0][1]+' aktivitas). Coba sisakan ruang untuk tugas pribadi dan istirahat di hari itu.');
card('Kategori terbesar',cc[0][0]+' paling banyak mengisi jadwalmu ('+cc[0][1]+' dari '+ts.length+' aktivitas).');
card('Sering dijadwalkan ulang',mv.length?mv.slice(0,3).map(t=>'“'+t.name+'”').join(', ')+' sudah beberapa kali digeser. Mungkin ukurannya terlalu besar — coba pecah jadi langkah kecil.':'Belum ada aktivitas yang digeser berkali-kali. Bagus.');
if(hc.length&&hc.reduce((a,b)=>a+b[1],0)>=3)card('Pola jam',`Aktivitas berjam paling sering dimulai sekitar pukul ${String(hc[0][0]).padStart(2,'0')}.00.`)}
const m=btn('Lihat Matriks Eisenhower','outline',()=>{go('today');if(!$('matrixSection').classList.contains('open'))$('toggleMatrix').click();$('matrixSection').scrollIntoView()});p.append(m)}
/* ---------- Pengingat ---------- */
const beep=()=>{if(!S.set.sound)return;try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=660;g.gain.setValueAtTime(.25,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.9);o.start();o.stop(c.currentTime+.9)}catch(e){}};
const notify=(t,b)=>{if(!('Notification' in window)||Notification.permission!=='granted')return;const o={body:b,icon:'icons/icon-192.png',tag:'priorita'};(navigator.serviceWorker?navigator.serviceWorker.ready.then(r=>r.showNotification(t,o)):Promise.reject()).catch(()=>{try{new Notification(t,o)}catch(e){}})};
const bar=el('div');bar.id='alertBar';document.body.append(bar);
function fire(t){const k=T()+':'+t.id;S.fired[k]=1;P.save();bar.replaceChildren(el('strong','','🔔 '+t.name),el('div','',''));bar.firstChild.after(el('div','task-meta','Mulai '+t.start));bar.classList.add('open');const a=bar.lastChild;
a.append(btn('Tunda 5 mnt','soft small',()=>{S.snz[t.id]=Date.now()+3e5;P.save();bar.classList.remove('open')}),btn('Matikan','quiet small',()=>{t.roff=true;P.save();bar.classList.remove('open');P.render()}),btn('Tutup','quiet small',()=>bar.classList.remove('open')));beep();notify('Priorita · '+t.name,'Mulai pukul '+t.start)}
function tick(){const d=T(),wd=x=>pd(x).getDay(),n=new Date(),nm=n.getHours()*60+n.getMinutes();
S.tasks.forEach(t=>{if((t.done&&!t.repeat)||t.roff||!t.start||t.remind===''||t.remind==null||!t.date)return;
if(!(t.date===d||(t.date<d&&(t.repeat==='daily'||(t.repeat==='weekly'&&wd(t.date)===wd(d))))))return;
if(S.snz[t.id]){if(Date.now()>=S.snz[t.id]){delete S.snz[t.id];fire(t)}return}
const st=mins(t.start);if(!S.fired[d+':'+t.id]&&nm>=st-Number(t.remind)&&nm<st+Math.max(t.dur||0,30))fire(t)})}
setInterval(tick,15000);
const so=$('saveTask').onclick;$('saveTask').onclick=()=>{if($('taskRemind').value!==''&&!$('taskStart').value){P.toast('Isi jam mulai dulu untuk memakai pengingat.');return}if($('taskRemind').value!==''&&'Notification' in window&&Notification.permission==='default')P.toast('Tips: aktifkan notifikasi di Atur → Notifikasi.');so()};
/* ---------- Jadwalku berubah ---------- */
const ov=el('div','overlay');ov.id='schedPlan';document.body.append(ov);
$('applySchedule').onclick=()=>{const bu=$('busyUntil').value;if(!bu)return;S.busyUntil=bu;P.save();P.close('scheduleOverlay');const nm=new Date().getHours()*60+new Date().getMinutes(),pend=S.tasks.filter(t=>t.date===T()&&!t.done),ch={};
const m=el('div','modal');m.append(el('h2','','Sibuk sampai '+bu),el('p','hint','Ini rekomendasi saja. Kamu yang memilih, tidak ada yang berubah sebelum kamu menekan terapkan.'));
const [eh,em]=S.endTime.split(':').map(Number),free=eh*60+em-mins(bu);m.append(el('div','nudge',free>0?'Setelah acara, kamu masih punya sekitar '+Math.floor(free/60)+' jam '+free%60+' menit sebelum jam tutup harianmu ('+S.endTime+').':'Acaranya melewati jam tutup harianmu. Pertimbangkan memindahkan yang tidak mendesak.'));
if(!pend.length)m.append(el('div','empty','Tidak ada aktivitas tersisa hari ini. 🌿'));
pend.forEach(t=>{const clash=t.start&&mins(t.start)<mins(bu)&&mins(t.start)+(t.dur||60)>nm,rec=(clash||P.q(t)>2||(P.q(t)===2&&free<60))?'tomorrow':'keep';ch[t.id]=rec;const b=el('div','wrap-item');b.append(el('strong','',t.name),el('div','task-meta',(clash?'Bentrok dengan acaramu · ':'')+'Disarankan: '+(rec==='keep'?'pertahankan hari ini':'pindah')));const s=el('select','field');s.style.marginTop='8px';[['keep','Pertahankan hari ini'],['tomorrow','Pindah ke besok'],['flex','Simpan ke Kalau Ada Waktu']].forEach(([v,l])=>s.add(new Option(l,v)));s.value=rec;s.onchange=()=>ch[t.id]=s.value;b.append(s);m.append(b)});
const ac=el('div','modal-actions');ac.append(btn('Batal','quiet',()=>P.close('schedPlan')),btn('Terapkan pilihan','primary',()=>{pend.forEach(t=>{if(ch[t.id]==='tomorrow'){t.date=P.addDays(T(),1);t.moveCount=(t.moveCount||0)+1}else if(ch[t.id]==='flex')toFlex(t)});P.save();P.close('schedPlan');P.render();P.toast('Rencanamu sudah disesuaikan')}));m.append(ac);ov.replaceChildren(m);P.open('schedPlan')};
ov.onclick=e=>{if(e.target===ov)P.close('schedPlan')};
/* ---------- PWA & Pengaturan ---------- */
let dp=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;if(page==='set')setR()});addEventListener('appinstalled',()=>{dp=null;P.toast('Priorita terpasang');if(page==='set')setR()});
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
const lab=t=>el('label','field-label',t),inp=(type,v,fn,ph)=>{const i=el('input','field');i.type=type;i.value=v||'';if(ph)i.placeholder=ph;i.onchange=()=>{fn(i.value);P.save();P.render();P.toast('Tersimpan')};return i};
const chips=(o,on,fn)=>{const d=el('div','option-chips');o.forEach(([v,l])=>{const b=el('button','chip'+(on(v)?' selected':''),l);b.onclick=()=>{fn(v);P.save();setR()};d.append(b)});return d};
function setR(){const p=$('p-set');p.replaceChildren(hd('Pengaturan','Atur Priorita sesuai ritmemu.'));
const es=el('select','field');['17:00','18:00','19:00','20:00','21:00','22:00','23:00'].forEach(v=>es.add(new Option(v,v)));es.value=S.endTime;es.onchange=()=>{S.endTime=es.value;P.save();P.toast('Jam tutup hari diperbarui')};
p.append(sec('Profil & kebiasaan',lab('Nama panggilan'),inp('text',S.set.nick,v=>S.set.nick=v.trim().slice(0,20),'Mau dipanggil apa?'),lab('Aktivitas utama'),chips([['Kuliah','🎓 Kuliah'],['Organisasi','🏢 Organisasi'],['Kepanitiaan','🎪 Kepanitiaan'],['Kerja','💼 Kerja'],['Belajar skill','💻 Skill'],['Hobi','🌿 Hobi']],v=>S.profile.includes(v),v=>S.profile=S.profile.includes(v)?S.profile.filter(x=>x!==v):[...S.profile,v]),lab('Jam mulai aktivitas (opsional)'),inp('time',S.set.start,v=>S.set.start=v),lab('Jam selesai harian'),es,el('p','hint','Setelah jam ini, Priorita menawarkan Penutup Hari bila masih ada tugas tertinggal.')));
const perm='Notification' in window?Notification.permission:'unsupported',ns=el('div','nudge',perm==='granted'?'✅ Notifikasi diizinkan.':perm==='denied'?'Notifikasi diblokir. Ubah lewat pengaturan situs di browser.':perm==='unsupported'?'Browser ini tidak mendukung notifikasi.':'Notifikasi belum diaktifkan. Kami tidak akan memaksa.');
const nb=[];if(perm==='default')nb.push(btn('Izinkan notifikasi','primary',()=>Notification.requestPermission().then(setR)));
nb.push(btn('Coba bunyi & notifikasi','soft',()=>{beep();notify('Priorita','Ini contoh pengingat 🔔');P.toast('Mencoba pengingat…')}));
const lim=el('p','hint','Penting: pengingat berjalan dari dalam aplikasi (saat Priorita terbuka atau masih aktif di latar belakang). Pengingat lokal tidak dijamin berbunyi bila browser ditutup penuh. Pengingat yang andal saat aplikasi mati butuh server Web Push (belum tersedia di versi ini). Pengingat yang terlewat akan muncul saat Priorita dibuka kembali.');
p.append(sec('Notifikasi',ns,...nb.map(b=>{b.style.cssText='margin:0 6px 6px 0';return b}),lab('Suara pengingat (saat aplikasi terbuka)'),chips([[1,'🔔 Hidup'],[0,'🔕 Mati']],v=>!!v===S.set.sound,v=>S.set.sound=!!v),lim,el('p','hint','Waktu dan pengulangan pengingat diatur per aktivitas (form tambah/edit).')));
p.append(sec('Tampilan',lab('Tema'),chips([['light','☀️ Terang'],['dark','🌙 Gelap']],v=>S.set.theme===v,v=>S.set.theme=v),lab('Tampilan kalender awal'),chips([['month','Bulan'],['week','Minggu'],['day','Agenda']],v=>S.set.view===v,v=>{S.set.view=v;cv=v})));
const ib=btn(dp?'Pasang Priorita di Layar Utama':'Pasang (lihat panduan di bawah)',dp?'primary':'quiet',()=>{if(!dp){P.toast('Gunakan panduan manual di bawah.');return}dp.prompt();dp.userChoice.then(()=>{dp=null;setR()})});
const g=(h,a)=>{const d=el('details');d.append(el('summary','',h));const o=el('ol');a.forEach(x=>o.append(el('li','',x)));d.append(o);return d};
p.append(sec('Aplikasi',el('div','nudge',standalone()?'✅ Priorita sedang berjalan sebagai aplikasi terpasang.':'Status pemasangan tidak bisa dipastikan oleh browser. Bila belum terpasang, gunakan tombol atau panduan di bawah.'),ib,g('Panduan Android (Chrome)',['Buka Priorita menggunakan Chrome.','Buka menu browser (⋮).','Pilih “Add to Home screen” atau “Install app”.','Konfirmasi pemasangan.']),g('Panduan iPhone (Safari)',['Buka Priorita menggunakan Safari.','Tekan tombol Share.','Pilih “Add to Home Screen”.','Tekan Add.']),el('p','hint','Priorita v2.0.0 · PWA hanya aktif lewat HTTPS atau localhost.')));
const fi=el('input');fi.type='file';fi.accept='.json';fi.hidden=true;fi.onchange=()=>{const f=fi.files[0];if(!f)return;f.text().then(x=>{const d=JSON.parse(x);if(!d||!Array.isArray(d.tasks))throw 0;if(!confirm('Impor akan MENGGANTI semua data saat ini. Lanjutkan?'))return;localStorage.setItem(KEY,JSON.stringify(d));location.reload()}).catch(()=>P.toast('File tidak valid.'))};
p.append(sec('Data',el('p','hint','Datamu hanya tersimpan di browser ini. Ekspor secara berkala sebagai cadangan.'),btn('Ekspor data','soft',()=>{const a=el('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='priorita-backup-'+T()+'.json';a.click();P.toast('Data diekspor')}),btn('Impor data','outline',()=>fi.click()),fi,btn('Hapus semua data','quiet',()=>{if(prompt('Semua aktivitas, pengaturan, dan daftar akan dihapus permanen. Ketik HAPUS untuk melanjutkan.')==='HAPUS'){localStorage.removeItem(KEY);location.reload()}})));
p.lastChild.querySelectorAll('.btn').forEach(b=>b.style.margin='6px 6px 0 0')}
/* ---------- render ---------- */
function R(){document.documentElement.classList.toggle('dark',S.set.theme==='dark');document.querySelector('meta[name=theme-color]').content=S.set.theme==='dark'?'#171620':'#f8f7f4';
['today','cal','flex','insight','set'].forEach(x=>{$('p-'+x).classList.toggle('active',x===page);document.querySelector(`[data-nav=${x}]`).classList.toggle('on',x===page)});
if(S.set.nick){$('greeting').textContent='Hai, '+S.set.nick+'!';$('avatar').textContent=S.set.nick[0].toUpperCase()}
({cal:calR,flex:flexR,insight:insR,set:setR})[page]?.()}
window.onRender=R;$('fab').onclick=()=>page==='cal'?addOn(cur):P.openTask();
P.save();go(location.hash.slice(1)||'today');tick();
})();
