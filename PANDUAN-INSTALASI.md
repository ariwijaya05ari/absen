# PANDUAN INSTALASI — Absensi Pengajian

## A. Backend (Google Apps Script)
1. Buka proyek Apps Script lama Anda (data & PIN admin tetap aman). Hapus file `Index`, `Stylesheet`, `JavaScript`.
2. Ganti seluruh isi `Kode.gs` dengan `Kode.gs` baru (REST API).
3. Kalau proyek baru: jalankan `setupAppEnvironment` SEKALI, catat PIN di Execution Log.
4. Deploy → **New deployment** → Web app → Execute as **Me**, Who has access **Anyone** → Deploy.
5. Salin URL yang berakhiran `/exec`. Tes: buka `URL/exec?action=ping` → harus tampil `{"success":true,"data":"pong"}`.

## B. Frontend (GitHub Pages)
1. Ekstrak ZIP. Folder `absensi-pengajian` berisi `index.html` — **inilah folder yang di-`git init`**.
2. Buka `js/config.js`, ganti `GANTI_DENGAN_URL_EXEC_ANDA` dengan URL `/exec`. Simpan.
3. Install Git (git-scm.com), lalu setel identitas:
   `git config --global user.name "Nama Anda"` dan `git config --global user.email "email@github-anda"`
4. Di github.com buat repository baru, **Public**, tanpa README/.gitignore/license.
5. Buka terminal DI folder `absensi-pengajian`, pastikan `ls`/`dir` menampilkan `index.html`, lalu:
   ```
   git init
   git add .
   git commit -m "Upload pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
   Saat diminta password, tempel **Personal Access Token** (scope `repo`); layar tidak menampilkan apa pun, itu normal.
6. Repo → Settings → Pages → Deploy from a branch → `main` / `(root)` → Save. Tunggu 1–2 menit.
7. Buka `https://USERNAME.github.io/NAMA-REPO/`.

## C. Update di kemudian hari
`git add .` → `git commit -m "update"` → `git push`. Perubahan backend: edit `Kode.gs` → Deploy → New deployment (URL `/exec` baru → perbarui `config.js`).

## D. Tes
Beranda memuat pertemuan → daftar jamaah (kamera berfungsi karena halaman bukan iframe) → absen wajah/barcode → login admin.
