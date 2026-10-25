const MISS=new Set();
const NUL=new Proxy(function(){},{get:(t,k)=>k==='classList'?{add(){},remove(){},toggle(){},contains(){return false}}:k==='style'||k==='dataset'?{}:k==='value'?'':k==='querySelector'?()=>NUL:()=>{},set:()=>true,apply:()=>NUL});
const $=id=>document.getElementById(id)||(MISS.add(id),NUL),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ensure(){if(!document.body)return;if(!document.getElementById('res')){const r=document.createElement('div');r.id='res';r.className='res';r.innerHTML='<div class="rc"><i id="rI"></i><h2 id="rT"></h2><p id="rP"></p></div>';r.onclick=()=>hideRes();document.body.appendChild(r);}
  if(!document.getElementById('toast')){const t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}}
if(document.body)ensure();else addEventListener('DOMContentLoaded',ensure);
const _L={};function lib(u,t){return _L[u]||(_L[u]=new Promise((ok,no)=>{if(t())return ok();const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>{delete _L[u];no(new Error('Gagal memuat library. Periksa koneksi.'))};document.head.appendChild(s);}));}
const FA='https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.js',JQ='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',QG='https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
const S={boot:null,tok:null,snap:null,cam:null,run:false,hit:0,desc:null,foto:null,after:null,tab:'rs'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function toast(m){ensure();const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),3200);}
function dbn(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

/* ── Navigasi SPA: tanpa server, 0 ms ── */
function go(v){stopCam();S.after=null;
  if((v==='wajah'||v==='barcode')&&!(S.boot&&S.boot.pertemuan)){toast('Belum ada pertemuan yang dibuka.');v='home';}
  document.querySelectorAll('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));
  document.querySelectorAll('.top nav button').forEach(b=>b.classList.toggle('act',b.dataset.v===v||(v==='admin'&&b.dataset.v==='login')));
  if(v==='wajah')startFace();if(v==='barcode')startQR();if(v==='daftar')resetReg();if(v==='admin')loadAdmin();scrollTo(0,0);}
function goAdmin(){go(S.tok?'admin':'login');}

/* ── Bootstrap: tampilkan cache lokal dulu, segarkan di latar belakang ── */
function renderHome(b){const p=b.pertemuan;$('hSt').textContent=p?'PERTEMUAN DIBUKA':'TIDAK ADA PERTEMUAN';
  $('hJudul').textContent=p?p.judul:'Belum ada pertemuan dibuka';$('hMeta').textContent=p?[p.tanggal,p.lokasi].filter(Boolean).join(' • '):'Hubungi pengurus.';
  $('hHadir').textContent=b.hadir;$('hTotal').textContent=b.total;
  $('rm').innerHTML='<option value="">Pilih majelis…</option>'+b.majelis.map(m=>`<option>${esc(m)}</option>`).join('');}
function refreshBoot(){return call('getBootstrap').then(b=>{S.boot=b;renderHome(b);try{localStorage.setItem('boot',JSON.stringify(b))}catch(e){}}).catch(e=>toast(e.message));}
let _mp=null;function models(){if(_mp)return _mp;const u='https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
  _mp=lib(FA,()=>window.faceapi).then(()=>Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(u),faceapi.nets.faceLandmark68TinyNet.loadFromUri(u),faceapi.nets.faceRecognitionNet.loadFromUri(u)])).catch(e=>{_mp=null;throw e});return _mp;}
addEventListener('load',()=>{const need=['v-home','v-wajah','v-barcode','v-daftar','v-login','v-admin','admC','hJudul','hSt','hHadir','hTotal','vf','vq','vr','fs','qs','rs','rm','rsv','rc','pin','lbtn'].filter(i=>!document.getElementById(i));
  if(need.length){const b=document.createElement('div');b.style.cssText='background:#FFE4E6;color:#9F1239;padding:12px;font:13px monospace;position:relative;z-index:99';b.textContent='File Index di editor tidak lengkap. Elemen hilang: '+need.join(', ')+'. Ganti isi Index dengan versi terbaru.';document.body.prepend(b);}
  try{const c=JSON.parse(localStorage.getItem('boot')||'null');if(c){S.boot=c;renderHome(c);}}catch(e){}
  refreshBoot();setTimeout(()=>models().catch(()=>{}),600);setInterval(()=>{if($('v-home').classList.contains('on'))refreshBoot()},30000);});

/* ── Kamera ── */
async function startCam(v){stopCam();S.cam=await navigator.mediaDevices.getUserMedia({video:{facingMode:v.dataset.f,width:{ideal:640},height:{ideal:480}},audio:false});v.srcObject=S.cam;await v.play();}
function stopCam(){S.run=false;if(S.cam){S.cam.getTracks().forEach(t=>t.stop());S.cam=null;}}
const camErr=id=>{$(id).textContent='KAMERA DIBLOKIR — PAKAI BARCODE / ID';toast('Kamera tidak bisa dipakai. Gunakan barcode atau ID manual.');};
function detect(v){return faceapi.detectSingleFace(v,new faceapi.TinyFaceDetectorOptions({inputSize:224,scoreThreshold:.5})).withFaceLandmarks(true).withFaceDescriptor();}
function showRes(t,h,p,after){ensure();const r=$('res');r.querySelector('.rc').className='rc '+t;$('rI').className='bi '+(t==='ok'?'bi-check-circle-fill':t==='warn'?'bi-info-circle-fill':'bi-x-circle-fill');
  $('rT').textContent=h;$('rP').textContent=p||'';r.classList.add('on');S.after=after;clearTimeout(r._t);r._t=setTimeout(hideRes,2400);}
function hideRes(){ensure();$('res').classList.remove('on');const f=S.after;S.after=null;if(f)f();}
function hasil(m,resume){showRes(m.sudah?'warn':'ok',m.sudah?'Sudah absen':'Selamat datang',m.nama,resume);
  if(!m.sudah){S.boot.hadir++;$('hHadir').textContent=S.boot.hadir;}}

/* ── Absen wajah ── */
async function startFace(){$('fs').textContent='MEMUAT MODEL AI…';
  try{await models();await startCam($('vf'));}catch(e){return camErr('fs');}
  S.run=true;S.hit=0;faceLoop();}
function faceLoop(){if(!S.run)return;detect($('vf')).then(async r=>{if(!S.run)return;
  if(r){$('fs').textContent='FACE DETECTED: '+Math.round(r.detection.score*100)+'%';
    if(++S.hit>=2){S.run=false;S.hit=0;$('fs').textContent='MENGENALI…';
      try{hasil(await call('absen',S.boot.pertemuan.id_pertemuan,'wajah',Array.from(r.descriptor).map(x=>+x.toFixed(3))),resumeFace);}
      catch(e){showRes('err','Belum dikenali',e.message,resumeFace);}return;}}
  else{S.hit=0;$('fs').textContent='POSISIKAN WAJAH DI BINGKAI';}
  setTimeout(faceLoop,250);}).catch(()=>setTimeout(faceLoop,500));}
function resumeFace(){if($('v-wajah').classList.contains('on')&&S.cam){S.run=true;S.hit=0;faceLoop();}}

/* ── Absen barcode / ID manual ── */
async function startQR(){$('qs').textContent='ARAHKAN KE QR PADA KARTU';try{await lib(JQ,()=>window.jsQR);await startCam($('vq'));}catch(e){return camErr('qs');}S.run=true;qrLoop();}
function qrLoop(){if(!S.run)return;const v=$('vq');if(v.videoWidth){const c=qrLoop.c||(qrLoop.c=document.createElement('canvas'));c.width=320;c.height=Math.round(320*v.videoHeight/v.videoWidth);
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(v,0,0,c.width,c.height);const q=jsQR(x.getImageData(0,0,c.width,c.height).data,c.width,c.height);
  if(q&&q.data){S.run=false;return kirimId(q.data);}}setTimeout(qrLoop,200);}
function manual(){const v=$('mid').value.trim();if(!/^JMH-\d{4,}$/i.test(v))return toast('Format ID: JMH-0001');S.run=false;kirimId(v);}
async function kirimId(id){try{hasil(await call('absen',S.boot.pertemuan.id_pertemuan,'barcode',id),resumeQR);$('mid').value='';}catch(e){showRes('err','Gagal',e.message,resumeQR);}}
function resumeQR(){if($('v-barcode').classList.contains('on')&&S.cam){S.run=true;qrLoop();}}

/* ── Pendaftaran ── */
function resetReg(){S.desc=S.foto=null;['rn','rh','ra'].forEach(i=>$(i).value='');$('rm').value='';$('rc').checked=false;$('rs').textContent='KAMERA MATI';$('regForm').classList.remove('hide');$('regDone').classList.add('hide');regOk();}
function regOk(){$('rsv').disabled=!(S.desc&&$('rc').checked);}
async function camReg(){$('rs').textContent='MEMUAT MODEL AI…';
  try{await models();await startCam($('vr'));}catch(e){return camErr('rs');}
  $('rs').textContent='MENCARI WAJAH…';S.run=true;S.hit=0;(function lp(){if(!S.run)return;detect($('vr')).then(r=>{if(!S.run)return;
    if(r&&++S.hit>=3){S.desc=Array.from(r.descriptor).map(x=>+x.toFixed(3)).join(',');const c=document.createElement('canvas'),v=$('vr');c.width=240;c.height=Math.round(240*v.videoHeight/v.videoWidth);
      c.getContext('2d').drawImage(v,0,0,c.width,c.height);S.foto=c.toDataURL('image/jpeg',.7).split(',')[1];stopCam();$('rs').textContent='WAJAH TEREKAM ✓';regOk();return;}
    if(!r)S.hit=0;setTimeout(lp,250);}).catch(()=>setTimeout(lp,500));})();}
async function simpanReg(){const nama=$('rn').value.trim(),al=$('ra').value.trim(),mj=$('rm').value;
  if(!nama||!al||!mj)return toast('Nama, alamat, dan majelis wajib diisi.');const b=$('rsv');b.disabled=true;b.textContent='Menyimpan…';
  try{const r=await call('daftarJamaah',{nama,no_hp:$('rh').value,alamat:al,kelompok_majelis:mj,descriptor:S.desc,foto:S.foto});
    await lib(QG,()=>window.qrcode);$('dN').textContent=r.nama;$('dI').textContent=r.id;const q=qrcode(0,'M');q.addData(r.id);q.make();$('dQ').innerHTML=q.createSvgTag({cellSize:6,margin:2,scalable:true}).replace('<svg','<svg style="width:180px;margin:10px auto;display:block"');
    $('regForm').classList.add('hide');$('regDone').classList.remove('hide');S.boot.total++;$('hTotal').textContent=S.boot.total;refreshBoot();}
  catch(e){toast(e.message);}b.textContent='Simpan Pendaftaran';regOk();}

/* ── Admin ── */
async function login(){const b=$('lbtn');b.disabled=true;try{S.tok=await call('adminLogin',$('pin').value);$('pin').value='';go('admin');}catch(e){toast(e.message);}b.disabled=false;}
function logout(){S.tok=null;S.snap=null;go('home');}
async function loadAdmin(){tab(S.tab);try{S.snap=await call('adminSnapshot',S.tok);tab(S.tab);}catch(e){if(e.message==='SESI'||/SESI/.test(e.message)){S.tok=null;go('login');toast('Sesi berakhir, masuk lagi.');}else toast(e.message);}}
function tab(t){S.tab=t;document.querySelectorAll('.adm aside [data-t]').forEach(b=>b.classList.toggle('act',b.dataset.t===t));const d=S.snap;
  if(!d)return $('admC').innerHTML='<div class="card tc">Memuat data…</div>';$('admC').innerHTML=({rs:vRs,pt:vPt,jm:vJm,hd:vHd,rk:vRk})[t](d);if(t==='jm')fJm();if(t==='hd')fHd();if(t==='rk')fRk();}
const nm=id=>(S.snap.jamaah.find(j=>j.id_jamaah===id)||{}).nama||id,mj=id=>(S.snap.jamaah.find(j=>j.id_jamaah===id)||{}).kelompok_majelis||'-';
const mpill=m=>`<span class="pill">${esc(m)}</span>`,met=m=>`<span class="pill ${m==='wajah'?'v':'b'}">${esc(m).toUpperCase()}</span>`;
const aktif=d=>d.pertemuan.find(p=>p.status==='dibuka');
function vRs(d){const p=aktif(d),A=p?d.absensi.filter(a=>a.id_pertemuan===p.id_pertemuan):[],tot=d.jamaah.filter(j=>j.status==='aktif').length,w=A.filter(a=>a.metode==='wajah').length;
  return`<h1 style="margin-bottom:16px">Ringkasan Presensi</h1><div class="grid"><div class="card kpi"><small class="mono">TOTAL JAMAAH</small><b>${tot}</b></div>
  <div class="card kpi"><small class="mono">PERTEMUAN</small><b>${d.pertemuan.length}</b></div>
  <div class="card kpi"><small class="mono">HADIR SESI INI</small><b>${A.length}</b><div class="bar2"><i style="width:${tot?Math.round(A.length/tot*100):0}%"></i></div></div>
  <div class="card kpi"><small class="mono">WAJAH / BARCODE</small><b>${w} / ${A.length-w}</b></div></div>
  <div class="card"><b>${p?esc(p.judul):'Tidak ada sesi dibuka'}</b>${p?` <span class="pill">DIBUKA</span> <button class="btn red sm" onclick="setSt('${p.id_pertemuan}','ditutup')">Tutup Sesi</button>`:''}</div>
  <h2>Absensi Terbaru</h2>${tbl(['Jamaah','Majelis','Waktu','Metode'],A.slice(-8).reverse().map(a=>[esc(nm(a.id_jamaah)),mpill(mj(a.id_jamaah)),`<span class="mono">${esc(a.waktu.slice(11))}</span>`,met(a.metode)]))}`;}
const tbl=(h,r)=>`<div class="tw"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${r.length?r.map(c=>`<tr>${c.map(x=>`<td>${x}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${h.length}" class="tc" style="color:var(--mut)">Belum ada data</td></tr>`}</tbody></table></div>`;
function vPt(d){return`<h1 style="margin-bottom:16px">Pertemuan</h1><div class="card"><div class="grid2"><div><label class="lbl">Judul *</label><input id="pj"></div><div><label class="lbl">Tanggal *</label><input id="pd" type="date"></div>
  <div><label class="lbl">Lokasi</label><input id="pl"></div><div><label class="lbl">Majelis (opsional)</label><select id="pm"><option value="">Semua</option>${S.boot.majelis.map(m=>`<option>${esc(m)}</option>`).join('')}</select></div></div>
  <button class="btn full" onclick="buatPt()">Buat Pertemuan</button></div>`+tbl(['Judul','Tanggal','Lokasi','Status',''],d.pertemuan.slice().reverse().map(p=>[esc(p.judul),`<span class="mono">${esc(p.tanggal)}</span>`,esc(p.lokasi||'-'),
  `<span class="pill ${p.status==='dibuka'?'':'a'}">${p.status.toUpperCase()}</span>`,`<button class="btn sm" onclick="setSt('${p.id_pertemuan}','${p.status==='dibuka'?'ditutup':'dibuka'}')">${p.status==='dibuka'?'Tutup':'Buka'}</button>`]));}
async function buatPt(){try{await call('buatPertemuan',S.tok,{judul:$('pj').value,tanggal:$('pd').value,lokasi:$('pl').value,kelompok_majelis:$('pm').value});toast('Pertemuan dibuat.');loadAdmin();}catch(e){toast(e.message);}}
async function setSt(id,st){const p=S.snap.pertemuan;p.forEach(x=>{if(st==='dibuka')x.status='ditutup';});p.find(x=>x.id_pertemuan===id).status=st;tab(S.tab); // optimistik
  try{await call('ubahStatus',S.tok,id,st);refreshBoot();}catch(e){toast(e.message);loadAdmin();}}
function vJm(){return`<h1 style="margin-bottom:16px">Data Jamaah</h1><div class="tools"><input id="jq" placeholder="Cari nama / ID…" oninput="fJmD()"><select id="jmj" onchange="fJm()"><option value="">Semua majelis</option>${S.boot.majelis.map(m=>`<option>${esc(m)}</option>`).join('')}</select></div><div id="jt"></div>`;}
function fJm(){const q=$('jq').value.toLowerCase(),m=$('jmj').value;$('jt').innerHTML=tbl(['Nama','ID','Majelis','HP',''],S.snap.jamaah.filter(j=>(!m||j.kelompok_majelis===m)&&(j.nama.toLowerCase().includes(q)||j.id_jamaah.toLowerCase().includes(q))).slice(0,150)
  .map(j=>[`<b>${esc(j.nama)}</b><br><small style="color:var(--mut)">${esc(j.alamat)}</small>`,`<span class="mono">${esc(j.id_jamaah)}</span>`,mpill(j.kelompok_majelis),esc(j.no_hp||'-'),`<button class="btn red sm" onclick="hapus('${j.id_jamaah}')"><i class="bi bi-trash"></i></button>`]));}
const fJmD=dbn(()=>fJm(),200);
async function hapus(id){if(!confirm('Hapus '+nm(id)+'? Foto wajah di Drive juga dihapus.'))return;const s=S.snap;const bak=s.jamaah.slice();s.jamaah=s.jamaah.filter(j=>j.id_jamaah!==id);fJm();
  try{await call('hapusJamaah',S.tok,id);toast('Terhapus.');}catch(e){s.jamaah=bak;fJm();toast(e.message);}}
function vHd(d){return`<h1 style="margin-bottom:16px">Daftar Hadir</h1><div class="tools"><select id="hp" onchange="fHd()">${d.pertemuan.slice().reverse().map(p=>`<option value="${p.id_pertemuan}">${esc(p.tanggal+' — '+p.judul)}</option>`).join('')}</select><input id="hq" placeholder="Cari nama…" oninput="fHdD()"></div><div id="ht"></div>`;}
function fHd(){const id=$('hp').value,q=$('hq').value.toLowerCase();$('ht').innerHTML=tbl(['Nama','Majelis','Waktu','Metode'],S.snap.absensi.filter(a=>a.id_pertemuan===id&&nm(a.id_jamaah).toLowerCase().includes(q)).map(a=>[esc(nm(a.id_jamaah)),mpill(mj(a.id_jamaah)),`<span class="mono">${esc(a.waktu.slice(11))}</span>`,met(a.metode)]));}
const fHdD=dbn(()=>fHd(),200);
function vRk(){return`<h1 style="margin-bottom:16px">Rekap Kehadiran</h1><div class="tools"><input id="kq" placeholder="Cari nama…" oninput="fRkD()"><select id="km" onchange="fRk()"><option value="">Semua majelis</option>${S.boot.majelis.map(m=>`<option>${esc(m)}</option>`).join('')}</select>
  <input id="k1" type="date" onchange="fRk()"><input id="k2" type="date" onchange="fRk()"><button class="btn sm" onclick="csv()"><i class="bi bi-download"></i> CSV</button></div><div id="kt"></div>`;}
function rkRows(){const q=$('kq').value.toLowerCase(),m=$('km').value,a=$('k1').value,b=$('k2').value,d=S.snap;
  const ps=d.pertemuan.filter(p=>(!a||p.tanggal>=a)&&(!b||p.tanggal<=b)),ids=new Set(ps.map(p=>p.id_pertemuan)),c={};d.absensi.forEach(x=>{if(ids.has(x.id_pertemuan))c[x.id_jamaah]=(c[x.id_jamaah]||0)+1;});
  return d.jamaah.filter(j=>(!m||j.kelompok_majelis===m)&&j.nama.toLowerCase().includes(q)).map(j=>[j.nama,j.id_jamaah,j.kelompok_majelis,c[j.id_jamaah]||0,ps.length]).sort((x,y)=>y[3]-x[3]);}
function fRk(){$('kt').innerHTML=tbl(['Nama','ID','Majelis','Hadir'],rkRows().slice(0,150).map(r=>[esc(r[0]),`<span class="mono">${esc(r[1])}</span>`,mpill(r[2]),`<b>${r[3]}</b> / ${r[4]}`]));}
const fRkD=dbn(()=>fRk(),200);
function csv(){const t='Nama,ID,Majelis,Hadir,Total\n'+rkRows().map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download='rekap.csv';a.click();}
