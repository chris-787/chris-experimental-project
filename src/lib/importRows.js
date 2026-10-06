import { MONTHS } from "./constants";

// Menerapkan baris hasil baca Excel/CSV ke daftar kavling. Fungsi murni (tidak
// menyentuh layar atau database) supaya bisa diuji. Kavling dicocokkan lewat
// kolom "Kavling" (mis. "RB/A-01"); kolom lain yang kosong/tidak ada dibiarkan.
// Mengembalikan daftar kavling baru plus daftar yang diperbarui dan dilewati.
// Ejaan bulan lain yang wajar (Agustus/Agu, Agt, Aug, dst) selain singkatan di aplikasi (Ags).
const MONTH_ALIASES = { agu: 8, agt: 8, aug: 8, des: 12, dec: 12, may: 5, oct: 10 };

// Nilai sel status dianggap "sudah" bila diawali s (Sudah/Selesai), atau berisi ya/y/true/1/x/centang.
export function isYes(value) {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return false;
  return v.startsWith("s") || ["ya", "y", "true", "1", "x", "v", "\u2713", "\u2714"].includes(v);
}

export function applyImportRows(rows, houses, statusFields) {
  const updatedList = [];
  const skippedList = [];
  const next = [...houses];
  rows.forEach((row) => {
    const kavlingStr = String(row["Kavling"] || "").trim();
    const idx = kavlingStr.lastIndexOf("-");
    if (idx < 0) { skippedList.push(kavlingStr || "(kosong)"); return; }
    const blok = kavlingStr.slice(0, idx);
    const noKavling = kavlingStr.slice(idx + 1);
    const hi = next.findIndex((h) => h.blok === blok && h.noKavling === noKavling);
    if (hi === -1) { skippedList.push(kavlingStr); return; }
    const h = { ...next[hi] };
    if (row["Kategori"] !== undefined && row["Kategori"] !== "") h.kategori = String(row["Kategori"]);
    if (row["Kontraktor"] !== undefined) h.kontraktor = String(row["Kontraktor"]);
    if (row["No. SPK"] !== undefined) h.spkNo = String(row["No. SPK"]);
    if (row["Th. SPK"] !== undefined && row["Th. SPK"] !== "") h.spkTahun = Number(row["Th. SPK"]) || null;
    if (row["Bln. SPK"] !== undefined && row["Bln. SPK"] !== "") {
      const key = String(row["Bln. SPK"]).trim().toLowerCase().slice(0, 3);
      const mi = MONTHS.findIndex((m) => m.toLowerCase() === key);
      if (mi >= 0) h.spkBulan = mi + 1;
      else if (MONTH_ALIASES[key]) h.spkBulan = MONTH_ALIASES[key];
    }
    if (row["HPP/m2 (Rp)"] !== undefined && row["HPP/m2 (Rp)"] !== "") h.hppPerM2 = Number(row["HPP/m2 (Rp)"]) || 0;
    if (row["Harga Jual/m2 (Rp)"] !== undefined && row["Harga Jual/m2 (Rp)"] !== "") h.hargaJualPerM2 = Number(row["Harga Jual/m2 (Rp)"]) || 0;
    if (row["Adendum (Rp)"] !== undefined && row["Adendum (Rp)"] !== "") {
      const amt = Number(row["Adendum (Rp)"]) || 0;
      h.adendum = amt !== 0; h.adendumAmount = amt;
    }
    statusFields.forEach((s) => {
      if (row[s.label] !== undefined) h.status = { ...h.status, [s.key]: isYes(row[s.label]) };
      if (s.hasDetail && row[`${s.label} - Detail`] !== undefined) {
        h.details = { ...(h.details || {}), [s.key]: String(row[`${s.label} - Detail`]) };
      }
    });
    next[hi] = h;
    updatedList.push(kavlingStr);
  });
  return { next, updatedList, skippedList };
}
