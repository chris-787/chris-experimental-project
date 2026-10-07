// Konstanta aplikasi: kunci penyimpanan, nilai bawaan, dan teks "What's New".

export const SITE_IMAGE_DEFAULT = "/default-site-plan.jpg";
export const MAX_IMG_DIM = 1600;

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

export const WHATS_NEW_GROUPS = [
  {
    version: "Versi 2.0",
    versionNote: "Tampilan baru: sidebar, Dashboard, mode gelap",
    date: "7 Oktober 2026",
    items: [
      { icon: "🎨", title: "Detail Kavling lebih berwarna", desc: "Tiga kolom di Detail Kavling (Data dan status, Kontraktor dan SPK, Harga dan HPP) kini punya latar warna lembut sendiri: biru, ungu, dan hijau, di mode terang maupun gelap. Saklar status memakai warna statusnya masing-masing, sama dengan label di header." },
      { icon: "📊", title: "Grafik dashboard menyala saat disorot", desc: "Arahkan kursor ke diagram donat, batang Margin per Tipe, atau batang Kavling per blok: bagian yang disorot menyala, sisanya memudar, dan muncul keterangan kecil yang mengikuti kursor (nama, jumlah unit, persen). Di diagram donat, legenda dan potongannya saling menyala bersamaan, dan angka di tengah berganti ke jumlah potongan itu." },
      { icon: "🎞️", title: "Animasi buka-tutup, pop up, dan pindah halaman", desc: "Panel yang bisa dibuka-tutup (Rincian kavling, Cek Data, Cluster diarsipkan) kini terbuka dan menutup dengan halus, lengkap dengan panah yang berputar. Pop up muncul dengan memudar dan naik sedikit, isi Detail Kavling bergeser masuk saat Prev/Next, penanda menu di sidebar berpindah halus, dan isi halaman memudar naik saat pindah menu. Semua mati otomatis bila perangkat memakai pengaturan kurangi gerakan." },
      { icon: "🔎", title: "Hasil pencarian kavling menyala saat disorot", desc: "Baris hasil pencarian kini berubah warna saat kursor melewatinya, supaya jelas baris mana yang akan dibuka." },
      { icon: "✋", title: "Geser Site Plan dengan ditarik", desc: "Saat peta di-zoom, tarik di area kosong untuk menggeser peta (kursor jadi tangan terbuka, lalu menggenggam saat ditarik). Di atas kavling kursor tetap tangan menunjuk dan klik tetap memilih kavling." },
      { icon: "🖨️", title: "Print ringkasan memuat posisi di Site Plan", desc: "Print ringkasan kavling kini menyertakan potongan peta diperbesar dan peta utuh dengan bingkai merah di kavling tersebut. Tombol Cetak diganti Print." },
      { icon: "⭐", title: "Pin cluster berwarna emas", desc: "Tombol bintang di kartu cluster (Home) kini berwarna emas, lengkap dengan garis tepi kartu emas, saat cluster di-pin, sehingga mudah dibedakan dari yang belum." },
      { icon: "🔦", title: "Kavling terpilih di peta lebih jelas", desc: "Penanda kavling yang dipilih tidak lagi garis emas tipis. Sekarang bingkainya merah terang dengan garis luar gelap, dan tebalnya menyesuaikan zoom dan ukuran layar (tipis di HP). Isinya berkedip merah terang pelan supaya langsung terlihat mana yang sedang dipilih, dan diam otomatis di perangkat dengan pengaturan kurangi gerakan." },
      { icon: "🎯", title: "Baris terpilih di tabel lebih jelas", desc: "Baris yang dipilih sekarang berlatar biru yang tegas dengan penanda tebal di sisi kiri, berbeda dari warna saat kursor melewati baris (lebih lembut) dan dari baris selang-seling. Berlaku di mode terang dan gelap, di Main Mode maupun Data Mode." },
      { icon: "🏷️", title: "Status lengkap di header Detail Kavling", desc: "Header Detail Kavling kini menampilkan semua status yang sedang aktif sebagai label berwarna (mis. Marketing, AC: 2 PK 1 unit), termasuk status baru yang ditambahkan di Settings, dan menunjukkan siapa yang terakhir mengubah." },
      { icon: "🖨️", title: "Show Blok ikut tercetak dan ter-ekspor", desc: "Bila tombol Show Blok aktif, kode kavling (mis. B-01) kini tampil juga di hasil Cetak dan PNG, dengan tata letak yang sama seperti di layar; bila nonaktif, tidak ada kode. Posisi poligon di PNG yang sebelumnya bergeser ke atas sudah diperbaiki." },
      { icon: "👀", title: "Pratinjau sebelum Import Excel", desc: "Import Excel/CSV tidak lagi langsung menimpa data. Muncul pratinjau berisi jumlah kavling dan sel yang akan berubah, lengkap dengan nilai lama dan barunya per kavling, serta daftar yang dilewati. Data baru berubah setelah menekan Terapkan; tombol Batalkan membuangnya tanpa mengubah apa pun." },
      { icon: "🩺", title: "Tab Cek Data di Dashboard", desc: "Daftar kavling bermasalah: tipe tidak dikenal, luas bangunan tipe belum diisi, HPP atau harga jual kosong, nomor kavling kembar, blok tidak dikenal, margin negatif, dan kontraktor kosong. Tiap baris punya isian dan tombol Perbaiki; kavlingnya hilang dari daftar setelah beres. Angka merah di tab menunjukkan jumlah masalah." },
      { icon: "🤝", title: "Bentrok edit lebih jelas", desc: "Bila dua orang mengubah data bersamaan, kini ada tombol Lihat dan gabungkan: perubahan di kavling atau kolom yang berbeda digabung otomatis, dan untuk kolom yang bentrok Anda memilih punya Anda atau punya orang lain, dengan nama dan waktu penyimpannya. Setiap perubahan kini mencatat siapa yang terakhir mengubah." },
      { icon: "🗺️", title: "Peta lebih interaktif", desc: "Tombol Show Blok menampilkan kode kavling (mis. B-01) di peta saat di-zoom. Semua kode memakai satu ukuran huruf seragam, arah tulisannya mendatar atau tegak otomatis mengikuti bentuk poligon (juga untuk kavling yang baru Anda tambah), dan kode yang tidak muat disembunyikan sampai di-zoom lebih besar. Klik legenda untuk menyembunyikan satu kelompok warna, dan Tampilkan semua untuk mengembalikan. Tombol PNG menyimpan peta berwarna lengkap dengan judul dan legenda." },
      { icon: "🔑", title: "Login lebih jelas", desc: "Halaman login punya tombol Lihat untuk menampilkan password yang diketik, dan pesan gagal kini dibedakan: password salah, terlalu banyak percobaan, atau tidak bisa terhubung ke server. Kolom login juga tidak lagi mengubah huruf awal otomatis." },
      { icon: "📌", title: "Tabel tidak lagi loncat saat baris dipilih", desc: "Di Main Mode, mengklik baris tabel untuk pertama kali tidak lagi membuat halaman melompat ke Detail Kavling. Posisi tabel di layar ditahan walau kartu detail di atasnya membesar." },
    ],
  },
  {
    date: "6 Oktober 2026",
    items: [
      { icon: "🧭", title: "Versi 2.0: tampilan baru", desc: "Menu pindah ke sidebar di kiri (bar menu di bawah layar di HP) dan bisa dilipat jadi ikon; pilihannya diingat, dan di Data Mode otomatis terlipat. Warna diganti jadi putih sejuk dan navy (mode terang) serta slate lembut (mode gelap)." },
      { icon: "✨", title: "Perapian tampilan", desc: "Font diganti Plus Jakarta Sans, kotak cari kavling berfungsi di semua halaman, tombol zoom peta jadi kotak mengambang, urutan tombol warna peta diubah (Per Tipe, Per Blok, Per Kontraktor, Terjual, Status Lain), status simpan tampil di bawah tombol, dan grafik Dashboard dibuat ulang. Nama aplikasi sekarang Chris Project." },
      { icon: "🎞️", title: "Pilihan yang bergeser, peta dan tabel beranimasi", desc: "Saat memilih Per Tipe, Per Blok, Per Kontraktor, status, tab Dashboard, Ringkas/Lengkap, dan Daftar/Kalender, latar tombol terpilih kini bergeser halus ke pilihan baru. Kavling di Site Plan muncul bergantian per blok, dan baris tabel masuk satu per satu dari kiri saat halaman dibuka." },
      { icon: "🎬", title: "Animasi pada grafik", desc: "Setiap kali membuka cluster atau pindah halaman dan tab (Dashboard: Ringkasan, Kontraktor, Margin dan Harga), bar tumbuh dari kosong, donat menyapu melingkar, kartu naik pelan satu per satu, dan angka kartu atas menghitung naik. Otomatis dimatikan di perangkat yang memakai pengaturan kurangi gerakan." },
      { icon: "🧪", title: "Tabel kuat untuk ratusan kavling, ditambah pengujian otomatis", desc: "Kalau satu tabel berisi lebih dari 60 kavling, hanya baris yang terlihat yang digambar sehingga gulir tetap ringan. Hitungan margin dan impor Excel kini diuji otomatis tiap kali ada perubahan; deploy dibatalkan bila ada yang gagal. Sekalian impor Excel dilengkapi: status boleh ditulis Ya/TRUE/1 (bukan hanya Sudah), dan bulan SPK boleh ditulis Agustus atau Agu." },
      { icon: "🔧", title: "Perapian kotak zoom dan filter di mode gelap", desc: "Kotak angka zoom tabel tidak lagi punya latar abu persegi di dalam bentuk bulatnya, dan kotak pilihan Semua Status serta pilihan aksi massal ikut warna kartu di mode gelap." },
      { icon: "🎯", title: "Titik warna di kolom Tipe", desc: "Di tabel Data Mode, kolom Tipe kini diberi titik warna kecil sesuai warna tipe (sama dengan di Settings, Dashboard, dan Site Plan) sehingga tipe mudah dikenali sekilas. Lebar minimum kolom Tipe dinaikkan supaya tulisan seperti 7x12 Sudut tidak terpotong." },
      { icon: "🚀", title: "Lebih ringan dan lebih rapi", desc: "Dashboard, Settings, dan pop-up kini dimuat belakangan sehingga halaman pertama tampil lebih cepat (berkas utama sekitar 13% lebih kecil). Tata letak Main Mode tidak lagi meluber di layar sekitar 1000 px, kolom No disembunyikan di HP supaya tabel lebih lega, kartu angka di tab Kontraktor ikut berwarna, dan label status bisa dioperasikan dengan keyboard." },
      { icon: "🌙", title: "Mode gelap baru: slate lembut", desc: "Warna mode gelap diganti dari biru malam yang pekat menjadi abu kebiruan lembut (terinspirasi tampilan Finder di Mac): latar, kartu, dan baris selang-seling berbeda tipis, header tabel dan tombol terpilih berwarna slate, serta label status dan aksen dilembutkan supaya tidak menyala. Warna grafik, bar, dan kartu angka di mode gelap juga dikurangi kejenuhannya agar serasi dengan palet slate. Mode terang tidak berubah." },
      { icon: "⏳", title: "Layar memuat mengikuti tampilan baru", desc: "Saat data masih diunduh, kerangka abu-abu kini berbentuk sama dengan halaman sebenarnya: sidebar (atau bar menu bawah di HP), header, empat kartu angka, Site Plan dengan panel kanan, dan tabel. Home juga punya kerangka dengan bar atas, kartu cluster, dan kalender." },
      { icon: "🏷️", title: "Kolom Status gabungan dan Isi cepat", desc: "Di tampilan Ringkas, lima kolom status digabung jadi satu kolom Status: yang aktif tampil sebagai label berwarna (detail seperti 2 PK 1 unit ikut di dalam label). Tombol + status menambah status, tanda × mematikannya. Tombol Isi cepat: pilih satu status, lalu klik sel Status di tiap baris untuk menyalakan atau mematikannya. Tampilan Lengkap tetap memakai lingkaran per status, dan detail kini sebaris dengan lingkarannya supaya tinggi baris sama. Tabel juga memakai baris selang-seling tanpa garis vertikal." },
      { icon: "📏", title: "Tabel Data Mode lebih rapat", desc: "Tinggi baris dan header tabel dikecilkan sehingga 24 kavling muat dalam satu layar tanpa digulir. Kolom Tipe dan Kontraktor di tampilan Ringkas juga dilebarkan sedikit supaya teksnya tidak terpotong." },
      { icon: "📐", title: "Header tabel bisa diperkecil dan ada garis antar kolom", desc: "Geser tepi kolom untuk mengecilkan lebar; judul kolom otomatis turun ke baris berikutnya (seperti wrap text di Excel), misalnya Order / Marketing. Batas terkecil kolom adalah kata terpanjang di judulnya, jadi tulisan tidak pernah terpotong. Setiap kolom juga diberi garis pemisah tipis." },
      { icon: "🎨", title: "Tabel Data Mode lebih berwarna", desc: "Header tabel kini berisi warna navy dan rata tengah supaya terpisah jelas dari data. Kolom HPP/m² tampil dalam label teal dan Harga Jual/m² dalam label biru, dengan angka hasil hitung dicetak tebal." },
      { icon: "🛠️", title: "Perbaikan kolom tabel", desc: "Kolom yang dimatikan lewat menu Kolom (misalnya Terjual) sekarang benar-benar hilang, tidak ada lagi centang yang tersisa. Titik warna kontraktor juga tidak lagi tertimpa lingkaran status. Judul Perlu Ditindaklanjuti di Home diposisikan di tengah." },
      { icon: "🎛️", title: "Kartu angka berwarna dan panel kanan baru", desc: "Empat kartu angka di atas kini punya warna dan ikon masing-masing. Panel kanan Main Mode disusun: Distribusi tipe dan Progres Status berdampingan, lalu Margin per Tipe dan Kontraktor. Menu Kolom di Ringkas menampilkan semua kolom kecuali No, Kavling, dan Tipe, dan judul halaman login dibuat dua baris." },
      { icon: "📅", title: "Kalender di Tindak lanjut", desc: "Tab Tindak lanjut di Dashboard sekarang punya kalender bulanan dengan penanda tanggal follow-up (merah = lewat tenggat, kuning = akan datang). Klik tanggal untuk melihat kavlingnya. Panel kanan Main Mode juga diisi: distribusi tipe, kontraktor, dan kavling yang terakhir diubah, dengan warna per status, tipe, dan kontraktor." },
      { icon: "🌈", title: "Detail kavling dan tabel lebih berwarna", desc: "Nama kontraktor kini berwarna (sama dengan warna di peta), label tipe punya titik warna, total HPP dan harga tampil sebagai label berwarna, dan margin tampil sebagai label hijau atau merah. Logo diganti ikon kompas, serta animasi buka-tutup sidebar dan ganti tema dibuat lebih halus." },
      { icon: "🧰", title: "Tampilan Ringkas bisa diatur", desc: "Di tampilan Ringkas, tombol Kolom sekarang memilih kolom mana yang tampil, dan lebar kolom bisa digeser. Pengaturannya tersimpan di perangkat Anda dan tombol Reset mengembalikannya ke bawaan." },
      { icon: "🕒", title: "Jam di Home dan sidebar", desc: "Jam WIB tampil di Home (lengkap dengan hari dan detik) dan di sidebar. Logo CB diganti ikon bangunan, dan bar geser ukuran Site Plan memanjang sampai ke panel di kanannya dengan warna yang sama seperti bar vertikal." },
      { icon: "🎨", title: "Warna lebih tenang", desc: "Palet baru: putih sejuk dengan aksen biru navy untuk mode terang, dan biru malam untuk mode gelap. Aksen hanya dipakai untuk aksi utama dan logo, pilihan yang sedang aktif (tombol warna peta, tab, chip filter) memakai warna gelap, dan grafik memakai warna teal. Ganti sidebar dan ganti tema kini beranimasi." },
      { icon: "📈", title: "Halaman Dashboard", desc: "Menu baru Dashboard berisi empat bagian: Ringkasan (alur status, margin per tipe, kavling per blok, dan distribusi tipe), Kontraktor (rekap lengkap dengan total HPP dan status per kontraktor), Margin dan Harga, serta Tindak lanjut. Tombol Simulasi Harga dan Print Laporan pindah ke sini." },
      { icon: "🗺️", title: "Main Mode lebih ringkas", desc: "Empat angka utama kini di atas peta, tombol Edit Site Plan dan Cetak ada di kartu Site Plan, dan pilihan Warna peta berupa tombol bulat. Panel di samping hanya berisi progres status dan margin per tipe; grafik dan rekap ada di menu Dashboard. Bar atas tidak lagi menempel saat di-scroll." },
      { icon: "🏠", title: "Home baru", desc: "Bar atas dengan kotak cari lintas cluster, sapaan, dan tombol Export, Backup, Restore. Kartu cluster menampilkan progres, margin, terjual, dan Order Marketing. Kalender follow-up dan kartu Keamanan data (Backup sekarang) ada di kanan." },
    ],
  },
  {
    version: "Versi 1.0",
    versionNote: "Versi awal aplikasi",
    date: "3 Oktober 2026",
    items: [
      { icon: "📋", title: "Rincian kavling di bawah legenda", desc: "Di bawah legenda Site Plan ada daftar kavling per kelompok warna yang sedang aktif (kontraktor, Sudah/Belum, blok, atau tipe), dikelompokkan per tipe, mis. \"Tipe 6x12 (4 unit) : RB/D-06, RB/D-08, ...\". Bisa disembunyikan, dan ikut tercetak di Cetak Site Plan." },
      { icon: "©️", title: "Credit di hasil cetak", desc: "Cetak Site Plan, cetak laporan Dashboard, dan Ringkasan Kavling sekarang memuat credit chrisproject.site di atas judul." },
      { icon: "🧩", title: "Tabel Ringkas / Lengkap", desc: "Di atas tabel ada tombol Ringkas (kolom inti saja: No, Kavling, Tipe, Status, Kontraktor, HPP, Harga Jual, Margin) dan Lengkap (semua kolom, bisa diatur lewat menu Kolom). Pilihan ini hanya berlaku di perangkat Anda." },
      { icon: "🎨", title: "Warna peta per kontraktor", desc: "Pilihan baru \"Per Kontraktor\" di Warna peta, lengkap dengan legenda dan jumlah unit tiap kontraktor." },
      { icon: "📱", title: "Lebih rapi di HP", desc: "Opacity dan Cetak Site Plan dilipat ke tombol \"Opsi\", tinggi Site Plan mengikuti gambar, dan tombol Simpan Perubahan menyala oranye hanya saat ada perubahan." },
      { icon: "💀", title: "Layar memuat berupa kerangka", desc: "Saat membuka cluster, bentuk halaman (header, tab, site plan, tabel) langsung tampil sebagai kotak abu-abu berdenyut, bukan layar kosong." },
      { icon: "⌨️", title: "Edit dari tabel tidak lagi meloncat", desc: "Mengubah Kontraktor, No. SPK, harga, dan isian lain dari tabel tidak lagi menggulung halaman ke panel detail kavling. Kursor tetap di tempat yang Anda klik." },
      { icon: "📏", title: "Tabel Main Mode lebih tinggi", desc: "Kotak tabel di Main Mode sekarang menampilkan sekitar 25 baris sebelum perlu di-scroll." },
      { icon: "📌", title: "Tabel lebih padat, kolom beku", desc: "Baris tabel dirapatkan, dan kolom No serta Kavling tetap terlihat saat tabel digeser ke samping. Di Data Mode, tabel tampil penuh dan judul kolomnya menempel." },
      { icon: "🔠", title: "Tampilan lebih padat", desc: "Font dasar sedikit diperkecil, jarak antar bagian dirapatkan, dan tombol utama diberi ikon." },
      { icon: "↕️", title: "Ubah tinggi Site Plan", desc: "Tarik bar di tepi bawah kartu Site Plan untuk menaikkan atau menurunkan tingginya (klik 2x untuk kembali ke awal). Di HP tinggi mengikuti gambar." },
      { icon: "🔀", title: "Move Dashboard dan Edit Site Plan", desc: "Tombol Move Dashboard memindahkan dashboard ke kanan atau ke bawah site plan. Tombol Edit Site Plan menyalakan alat gambar kavling. Detail kavling dibagi tiga kolom." },
      { icon: "📊", title: "Dashboard dan Home lebih informatif", desc: "Dashboard punya ringkasan angka utama, progres status, dan margin per tipe dengan warna yang bermakna. Grafik bisa dilipat. Kartu cluster di Home menampilkan progres dan ringkasan angka." },
      { icon: "🚀", title: "Buka lebih cepat", desc: "Data cluster dan halaman Home sekarang diunduh bersamaan, bukan satu per satu, jadi login dan membuka cluster terasa lebih cepat. Pengecekan duplikat juga lebih ringan." },
      { icon: "🖨️", title: "Warna cetak Site Plan benar", desc: "Warna status (Sudah/Belum) dan legendanya sekarang tercetak sesuai tampilan di layar." },
      { icon: "🔒", title: "Akun lihat-saja lebih bersih", desc: "Akun View Mode tidak lagi melihat tombol Hapus, Duplikat, dan aksi massal di tabel maupun panel detail." },
      { icon: "🗺️", title: "Main Mode, Data Mode, Settings", desc: "Mode Kalibrasi dan Mode Kerja digabung jadi Main Mode. Alat gambar kavling sekarang ada di tombol \"Edit Site Plan\" (hanya nyala kalau Anda sengaja menyalakannya, jadi lebih aman). Di Main Mode: site plan dan dashboard sebaris, detail kavling di bawahnya dibagi tiga kolom, lalu tabel. Data Mode berisi tabel saja, dan Pengaturan berganti nama jadi Settings." },
    ],
  },
  {
    date: "30 September 2026",
    items: [
      { icon: "🎨", title: "Desain Baru", desc: "Tampilan Home, Mode Kalibrasi/Kerja/Pengaturan, dan Login dirombak: kartu putih berbayang lembut, tombol berbentuk pil, ikon pengganti emoji, dan label tombol lebih ringkas (Export to Excel, Backup (JSON), Restore (JSON), Print)." },
      { icon: "👋", title: "Sapaan Personal di Home", desc: "Home sekarang menyapa sesuai waktu (Selamat Pagi/Siang/Sore/Malam) beserta nama Anda, di atas jam dan tanggal." },
      { icon: "📅", title: "Kalender Follow-up di Home", desc: "Kartu \"Perlu Ditindaklanjuti\" sekarang punya tampilan kalender bulanan, bukan cuma daftar. Titik merah = lewat tenggat, kuning = akan datang. Klik tanggalnya untuk lihat & langsung buka kavlingnya." },
      { icon: "🖨️", title: "Ringkasan Kavling (PDF)", desc: "Tombol \"Ringkasan\" di panel detail kavling (Mode Kerja) mencetak satu halaman berisi data, status, kontraktor, harga, dan margin kavling itu — cocok dilampirkan ke berkas atau dikirim ke atasan." },
      { icon: "👷", title: "Rekap Kontraktor", desc: "Tombol di Dashboard cluster menampilkan rekap jumlah unit, total HPP, dan progres Order SPK per kontraktor." },
      { icon: "⌨️", title: "Autocomplete Nama Kontraktor", desc: "Kolom Kontraktor (di tabel & panel detail) sekarang menyarankan nama-nama yang sudah pernah diketik di cluster itu, supaya penulisannya konsisten dan gampang direkap." },
    ],
  },
  {
    date: "19 September 2026",
    items: [
      { icon: "🧮", title: "Simulasi Harga", desc: "Coba-coba ubah harga jual atau HPP per m² (naik/turun persen atau ganti angka) untuk semua kavling, satu blok, atau satu tipe, lalu lihat dampaknya ke total harga, margin, dan margin per tipe. Data asli tidak berubah. Tombolnya ada di Dashboard cluster." },
    ],
  },
  {
    date: "18 September 2026",
    items: [
      { icon: "🆕", title: "Popup What's New di Home", desc: "Menampilkan ringkasan pembaruan tiap kali login, tidak muncul lagi kalau cuma pindah dari cluster ke Home. Bisa dibuka lagi kapan saja lewat tombol What's New di Home." },
      { icon: "🔍", title: "Zoom Site Plan Lebih Cepat", desc: "Tombol +/− di peta Site Plan sekarang melompat 20% tiap klik (sebelumnya 5%), lebih cepat untuk memperbesar detail." },
      { icon: "⌨️", title: "Tutup Popup Kalibrasi Pakai Esc", desc: "Selain klik ikon ×, popup edit Blok/Nomor/Tipe di Mode Kalibrasi kini bisa ditutup cukup dengan tombol Esc." },
      { icon: "🧹", title: "Rapikan Judul Cluster", desc: "Celah kosong aneh antara subjudul cluster dan info \"target unit, blok\" sudah dihilangkan." },
    ],
  },
  {
    date: "17 September 2026",
    items: [
      { icon: "🔔", title: "Notifikasi Lintas-Cluster di Home", desc: "Kavling yang follow-up-nya lewat tenggat dan nomor kavling duplikat kini langsung terlihat di Home, dari semua cluster sekaligus." },
      { icon: "⚠️", title: "Deteksi Duplikat per Cluster", desc: "Banner otomatis muncul di tabel Data Blok kalau ada nomor kavling yang sama persis di cluster yang sama, lengkap tombol filter \"Lihat\"." },
      { icon: "✏️", title: "Edit Blok/Nomor/Tipe dari Popup Peta", desc: "Di Mode Kalibrasi, klik kavling yang sudah digambar untuk langsung ubah Blok, Nomor, dan Tipe-nya, lengkap tombol OK & Batal." },
      { icon: "🗂️", title: "Tombol Edit Bentuk & Hapus Dirapikan", desc: "Kedua tombol kini sejajar dalam satu baris supaya popup edit kavling tidak makan tempat." },
    ],
  },
  {
    date: "16 September 2026",
    items: [
      { icon: "🔎", title: "Kontrol Zoom di Tabel Data Blok", desc: "Tombol perbesar, perkecil, dan reset kini tersedia khusus untuk tampilan tabel." },
      { icon: "🔢", title: "Kolom Nomor Urut Otomatis", desc: "Kolom \"No\" ditambahkan di paling kiri tabel Data Blok supaya lebih mudah dibaca." },
      { icon: "📌", title: "Header Tabel Benar-Benar Freeze", desc: "Perbaikan bug: header tabel sekarang benar-benar menempel di atas saat tabel discroll." },
      { icon: "⚡", title: "Scroll Tabel Lebih Halus", desc: "Perbaikan performa besar supaya scroll tabel data yang panjang tidak lagi patah-patah." },
      { icon: "🔍", title: "Pencarian Nomor Kavling di Tabel", desc: "Bisa langsung cari nomor kavling di dalam tabel Data Blok satu cluster." },
    ],
  },
  {
    date: "14 September 2026",
    items: [
      { icon: "🖨️", title: "Cetak Site Plan & Dashboard ke PDF", desc: "Site Plan berwarna dan Dashboard kini bisa langsung dicetak atau diekspor jadi PDF untuk laporan." },
      { icon: "↩️", title: "Undo & Konfirmasi Sebelum Hapus", desc: "Ada jendela Undo dan konfirmasi tambahan sebelum data Blok, Tipe, Status, atau Kategori terhapus permanen." },
      { icon: "📌", title: "Header Cluster Jadi Sticky", desc: "Nama cluster & jam tetap terlihat menempel di atas saat halaman discroll." },
      { icon: "📱", title: "Perbaikan Tampilan di HP", desc: "Site Plan kini tampil penuh selebar layar di HP, tidak lagi terpotong." },
    ],
  },
  {
    date: "13 September 2026",
    items: [
      { icon: "🔄", title: "Sinkronisasi Real-Time", desc: "Perubahan data, pengaturan, gambar, dan daftar cluster langsung terlihat ke semua pengguna yang sedang login." },
      { icon: "🛡️", title: "Cegah Data Tertimpa", desc: "Sistem memperingatkan kalau ada dua orang mengedit data yang sama nyaris bersamaan, supaya tidak ada yang tertimpa diam-diam." },
      { icon: "🔍", title: "Pencarian Kavling Lintas-Cluster", desc: "Cari nomor kavling apa saja langsung dari Home, tanpa perlu buka cluster satu-satu." },
      { icon: "📶", title: "Deteksi Offline Proaktif", desc: "Muncul notifikasi kalau koneksi internet terputus saat sedang bekerja, supaya tahu perubahan belum tersimpan." },
    ],
  },
];

export const DEFAULT_BLOCKS = [
  { id: "blk-a", name: "RB/A", target: 16 }, { id: "blk-b", name: "RB/B", target: 11 }, { id: "blk-c", name: "RB/C", target: 11 },
  { id: "blk-d", name: "RB/D", target: 20 }, { id: "blk-e", name: "RB/E", target: 2 }, { id: "blk-f", name: "RB/F", target: 16 },
  { id: "blk-g", name: "RB/G", target: 13 }, { id: "blk-h", name: "RB/H", target: 18 }, { id: "blk-i", name: "RB/I", target: 10 },
  { id: "blk-j", name: "RB/J", target: 10 },
];
export const DEFAULT_TIPE = [
  { id: "tp-5x12", name: "Standar 5x12", color: "#2E6F9E", luasBangunan: 0 },
  { id: "tp-6x12", name: "Standar 6x12", color: "#C1622D", luasBangunan: 0 },
  { id: "tp-sudut", name: "Sudut", color: "#3D8361", luasBangunan: 0 },
  { id: "tp-khusus", name: "Khusus", color: "#8B4F9F", luasBangunan: 0 },
];
export const DEFAULT_STATUS = [
  { key: "terjual", label: "Terjual", hasDetail: false }, { key: "marketingOrder", label: "Order Marketing", hasDetail: false },
  { key: "pancang", label: "Pancang", hasDetail: false }, { key: "spkOrder", label: "Order SPK", hasDetail: false },
  { key: "acOrder", label: "Order AC", hasDetail: true },
];
export const DEFAULT_KATEGORI = ["Rumah Massal", "Rumah Contoh", "Kavling"];

export const HOUSES_KEY_BASE = "bria-houses-v2";
export const CONFIG_KEY_BASE = "bria-config-v1";
export const IMAGE_KEY_BASE = "bria-siteplan-image";
export const TABLE_LAYOUT_KEY = "bria-table-layout-v1";
export const TABLE_FILTER_KEY_BASE = "bria-table-filter-v1";
export function tableFilterKeyFor(id) { return id === LEGACY_CLUSTER_ID ? TABLE_FILTER_KEY_BASE : `${TABLE_FILTER_KEY_BASE}:${id}`; }
export const CLUSTERS_INDEX_KEY = "clusters-index-v1";
export const APP_TITLE_KEY = "app-title-v1";
export const LAST_CLUSTER_KEY = "last-cluster-v1";
export const LAST_BACKUP_KEY = "last-backup-v1";
export const LEGACY_CLUSTER_ID = "bria-legacy";
export function housesKeyFor(id) { return id === LEGACY_CLUSTER_ID ? HOUSES_KEY_BASE : `${HOUSES_KEY_BASE}:${id}`; }
export function configKeyFor(id) { return id === LEGACY_CLUSTER_ID ? CONFIG_KEY_BASE : `${CONFIG_KEY_BASE}:${id}`; }
export function imageKeyFor(id) { return id === LEGACY_CLUSTER_ID ? IMAGE_KEY_BASE : `${IMAGE_KEY_BASE}:${id}`; }
