// Palet warna aplikasi: putih sejuk + navy (terang) dan slate lembut (gelap), dengan aksen hijau (positif),
// merah (negatif/hapus), dan emas (peringatan). Dipakai bersama oleh
// BriaStatusBoard.jsx dan Login.jsx supaya tampilannya konsisten.
//
// Nilai-nilainya menunjuk ke custom property CSS (didefinisikan di
// index.css, untuk mode terang & gelap) supaya mengganti tema cukup
// mengubah atribut data-theme di <html> — tidak perlu re-render React.
export const C = {
  ink: "var(--ink)",
  paper: "var(--paper)",
  panel: "var(--panel)",
  steel: "var(--steel)",
  faint: "var(--faint)",
  line: "var(--line)",
  accent: "var(--accent)",
  accent2: "var(--accent2)",
  select: "var(--select)",
  selectInk: "var(--select-ink)",
  selectSoft: "var(--select-soft)",
  data: "var(--data)",
  green: "var(--green)",
  amber: "var(--amber)",
  red: "var(--red)",
  gold: "var(--gold)",
  cardShadow: "var(--card-shadow)",
  pillFill: "var(--pill-fill)",
  searchFill: "var(--search-fill)",
  alertAmberBg: "var(--alert-amber-bg)",
  alertRedBg: "var(--alert-red-bg)",
  infoBlueBg: "var(--info-blue-bg)",
  rowSelectedBg: "var(--row-selected-bg)",
  chipAmberBg: "var(--chip-amber-bg)",
  chipRedBg: "var(--chip-red-bg)",
  chipBlueBg: "var(--chip-blue-bg)",
};

// Warna kategori tipe kavling (legenda/peta) — sengaja tetap sama di kedua
// tema, seperti warna kategori pada grafik, supaya setiap tipe tetap
// dikenali dari warnanya walau tema diganti.
export const PALETTE = [
  "#2E6F9E",
  "#C1622D",
  "#3D8361",
  "#8B4F9F",
  "#C9A227",
  "#2E8B8B",
  "#A84459",
  "#6B6B2E",
];
