// Konstanta aplikasi: kunci penyimpanan, nilai bawaan, dan teks "What's New".

export const SITE_IMAGE_DEFAULT = "/default-site-plan.jpg";
export const MAX_IMG_DIM = 1600;

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

export const WHATS_NEW_GROUPS = [
  {
    date: "3 Oktober 2026",
    items: [
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
