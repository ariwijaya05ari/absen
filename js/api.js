// Jembatan ke backend Apps Script (REST). Nama fungsi = nama action di Kode.gs.
const call = (fn, ...a) => new Promise((ok, no) => {
  if (typeof GAS_URL === 'undefined' || GAS_URL.indexOf('script.google.com') < 0) return no(new Error('GAS_URL belum diisi di js/config.js'));
  const get = fn === 'getBootstrap';
  fetch(get ? GAS_URL + '?action=getBootstrap' : GAS_URL, get ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // wajib: hindari preflight CORS
    body: JSON.stringify({ action: fn, args: a })
  }).then(r => r.json()).then(r => r && r.success ? ok(r.data) : no(new Error((r && r.message) || 'Gagal')))
    .catch(e => no(new Error(e.message === 'Failed to fetch' ? 'Tidak bisa terhubung ke server.' : e.message)));
});
