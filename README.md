# Cluster Bintaro Jaya — Papan Status Tender

Aplikasi pelacak status tender penjualan kavling rumah (multi-cluster, peta
site plan, kalibrasi poligon, tabel data, dashboard, export/import Excel).

Ini adalah versi "website sungguhan" dari aplikasi yang tadinya berjalan di
dalam Claude.ai. Dua yang berubah dari versi asli:

1. **Tampilan** mengikuti desain "Blueprint Modern" (krem/navy) yang Anda buat.
2. **Penyimpanan data** yang tadinya `window.storage` (cuma jalan di Claude.ai)
   sekarang memakai **Supabase** (database sungguhan, gratis, tersimpan permanen).

Cara kerja/logika aplikasinya (kalkulasi margin, kalibrasi kavling di peta,
export Excel, dst) **tidak diubah sama sekali** — hanya tampilan dan tempat
penyimpanan datanya.

Panduan ini ditulis untuk yang belum pernah setup project seperti ini.
Ikuti urut dari atas, jangan ada yang dilompati.

---

## Bagian 1 — Install Node.js (sekali saja di komputer Anda)

Node.js adalah "mesin" yang dipakai untuk menjalankan aplikasi ini di
komputer Anda. Kalau belum pernah install:

1. Buka https://nodejs.org
2. Unduh versi **LTS** (yang tulisannya "Recommended for Most Users").
3. Jalankan installernya, klik Next/Continue terus sampai selesai (opsi
   default sudah benar, tidak perlu diubah).
4. Buka Terminal, ketik:
   ```bash
   node -v
   ```
   Kalau muncul angka versi (misal `v20.17.0`), berarti berhasil.

---

## Bagian 2 — Siapkan Supabase (database gratis)

Supabase adalah tempat data Anda (cluster, kavling, gambar site plan)
disimpan secara online, supaya bisa diakses dari komputer mana saja dan
tidak hilang.

### 2.1 Buat akun & project

1. Buka https://supabase.com → **Start your project** → daftar/masuk
   (bisa pakai akun Google).
2. Klik **New Project**.
3. Isi:
   - **Name**: `cluster-bintaro-jaya` (bebas)
   - **Database Password**: buat password baru, **simpan di tempat aman**
     (dipakai kalau nanti perlu akses langsung ke database, bukan untuk
     login sehari-hari ke aplikasi).
   - **Region**: pilih yang paling dekat (misal Singapore).
4. Klik **Create new project**, tunggu 1–2 menit sampai statusnya siap.

### 2.2 Buat tabel penyimpanan

1. Di sidebar kiri project Supabase, klik **SQL Editor**.
2. Klik **New query**.
3. Buka file [`supabase/schema.sql`](supabase/schema.sql) di folder proyek
   ini, salin **semua isinya**, tempel ke SQL Editor.
4. Klik **Run** (atau tombol ▶). Harus muncul "Success. No rows returned".

Ini membuat satu tabel bernama `kv_store` tempat semua data aplikasi
disimpan, plus aturan supaya hanya orang yang login yang bisa
baca/tulis data.

### 2.3 Buat 1 akun login (karena Anda memilih pakai proteksi password)

Di halaman login aplikasi ini, Anda cukup ingat **username** (bukan email).
Tapi Supabase di baliknya tetap menyimpannya sebagai "email", jadi saat
membuat user di dashboard, tambahkan `@cluster-bintaro-jaya.local` di
belakang username pilihan Anda. Domain ini tidak nyata dan tidak akan pernah
dikirimi email sungguhan — cuma dipakai sebagai "nama akun" di belakang layar.

1. Di sidebar kiri, klik **Authentication** → tab **Users**.
2. Klik **Add user** → **Create new user**.
3. Isi:
   - **Email address**: `<username-pilihan-anda>@cluster-bintaro-jaya.local`
     (misal mau username `admin`, isi `admin@cluster-bintaro-jaya.local`)
   - **User Password**: password yang mau Anda pakai untuk login ke aplikasi nanti.
   - Pastikan **Auto Confirm User** tercentang.
4. Klik **Create user**.

Di halaman login aplikasi, isi kolom Username dengan `admin` (tanpa bagian
`@cluster-bintaro-jaya.local` — itu ditambahkan otomatis oleh aplikasinya).
Kalau nanti ada rekan kerja lain yang perlu akses, ulangi langkah ini dengan
username lain untuk membuatkan akun mereka.

### 2.4 Ambil URL & anon key

1. Di sidebar kiri, klik **Project Settings** (ikon gear) → **API**.
2. Catat dua nilai ini:
   - **Project URL** (bentuknya `https://xxxxx.supabase.co`)
   - **anon public** key (teks panjang di bagian "Project API keys")

---

## Bagian 3 — Hubungkan aplikasi ke Supabase Anda

1. Di folder proyek ini, cari file `.env.example`.
2. Buat salinannya dengan nama **`.env.local`** (titik di depan itu
   disengaja, jangan diubah).
   ```bash
   cp .env.example .env.local
   ```
3. Buka `.env.local`, isi dengan nilai dari langkah 2.4 tadi:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=isi-anon-key-panjang-tadi
   ```
4. Simpan filenya.

File `.env.local` ini berisi kunci akun Anda — jangan dikirim ke orang
lain atau diunggah ke internet (misalnya ke GitHub publik). File ini
sudah otomatis diabaikan lewat `.gitignore`.

---

## Bagian 4 — Jalankan di komputer Anda (localhost)

Di Terminal, masuk ke folder proyek ini lalu jalankan dua perintah ini
**satu kali saja** (instal dependensi):

```bash
cd ~/Documents/cluster-bintaro-jaya
npm install
```

Tunggu sampai selesai (beberapa menit tergantung koneksi internet). Lalu
jalankan aplikasinya:

```bash
npm run dev
```

Akan muncul tulisan seperti:

```
➜  Local:   http://localhost:5173/
```

Buka alamat itu (`http://localhost:5173/`) di browser Anda. Anda akan
melihat halaman login — masuk pakai **username** (tanpa `@cluster-bintaro-jaya.local`)
& password yang dibuat di langkah 2.3.

Untuk mematikan aplikasinya, kembali ke Terminal lalu tekan `Ctrl + C`.
Untuk menjalankan lagi lain kali, cukup ulangi `npm run dev` (tidak perlu
`npm install` lagi kecuali ada dependensi baru).

---

## Struktur proyek (untuk referensi)

```
cluster-bintaro-jaya/
├─ src/
│  ├─ BriaStatusBoard.jsx   ← aplikasi utama (logika & tampilan, dari file asli Anda)
│  ├─ App.jsx               ← pengecekan login, lalu render BriaStatusBoard
│  ├─ theme.js              ← warna "Blueprint Modern" (ganti di sini kalau mau ubah warna)
│  ├─ components/Login.jsx  ← halaman login
│  └─ lib/
│     ├─ supabaseClient.js  ← koneksi ke Supabase
│     └─ storage.js         ← pengganti window.storage, baca/tulis ke Supabase
├─ supabase/schema.sql      ← perintah SQL untuk membuat tabel di Supabase
├─ .env.example             ← contoh isi .env.local
└─ .env.local                ← kunci Supabase Anda (Anda yang buat, tidak ikut ter-upload)
```

---

## Setelah ini: deploy ke internet

Panduan ini sengaja berhenti di localhost dulu sesuai permintaan Anda.
Kalau nanti sudah siap dipublikasikan (supaya bisa diakses dari HP/komputer
lain tanpa perlu `npm run dev`), opsi termudah:

- **Vercel** atau **Netlify** — hubungkan ke repo GitHub, isi environment
  variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di dashboard
  mereka, lalu deploy otomatis dari `npm run build`.

Tanya lagi kalau sudah sampai tahap itu — bisa dipandu langkah per langkah
juga.

---

## Troubleshooting

**Muncul "Supabase belum dikonfigurasi"**
`.env.local` belum ada / belum diisi / salah nama file. Ulangi Bagian 3.

**Muncul "Username atau password salah"**
Pastikan user sudah dibuat di Supabase (langkah 2.3), emailnya diisi
`<username>@cluster-bintaro-jaya.local` (bukan email biasa), dan "Auto
Confirm User" tercentang saat membuatnya.

**`npm install` gagal / `node: command not found`**
Node.js belum ter-install atau Terminal perlu dibuka ulang setelah
install. Ulangi Bagian 1.

**Data lama dari versi Claude.ai tidak muncul**
Versi Supabase ini mulai dari data kosong (kecuali cluster contoh
bawaan). Data lama di `window.storage` Claude.ai tidak otomatis pindah —
kalau perlu dipindahkan, gunakan tombol "Export Semua ke Excel" atau
"Unduh Cadangan (JSON)" di versi lama sebagai referensi, lalu masukkan
ulang datanya di versi baru ini.
