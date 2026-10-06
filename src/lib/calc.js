import { C, PALETTE } from "../theme";

// Perhitungan murni per-kavling (HPP, harga jual, margin, dst). Dibuat lewat
// fungsi pabrik supaya cukup dihitung ulang kalau data yang dipakainya
// berubah, bukan di tiap render. Kunci nomor kavling kembar dihitung sekali
// (peta jumlah) sehingga cek duplikat per baris tidak perlu menyisir semua
// kavling lagi.
export function makeCalc({ tipeOptions, blocks, houses, statusFields }) {
  const tipeByName = new Map(tipeOptions.map((t) => [t.name, t]));
  const dupCount = new Map();
  houses.forEach((h) => {
    const k = `${h.blok}\u0000${h.noKavling}`;
    dupCount.set(k, (dupCount.get(k) || 0) + 1);
  });

  function blockColor(name) {
    const idx = blocks.findIndex((b) => b.name === name);
    return PALETTE[(idx < 0 ? 0 : idx) % PALETTE.length];
  }
  function tipeColor(name) { return tipeByName.get(name)?.color || C.steel; }
  function luasBangunanOf(h) { return tipeByName.get(h.tipe)?.luasBangunan || 0; }
  function isDuplicateKavling(h) { return (dupCount.get(`${h.blok}\u0000${h.noKavling}`) || 0) > 1; }
  function isIncomplete(h) { return !luasBangunanOf(h) || !h.hppPerM2 || !h.hargaJualPerM2; }
  function hppTotal(h) { const lb = luasBangunanOf(h); return (h.hppPerM2 && lb) ? h.hppPerM2 * lb : 0; }
  function hargaJualTotal(h) { const lb = luasBangunanOf(h); return (h.hargaJualPerM2 && lb) ? h.hargaJualPerM2 * lb : 0; }
  function finalHpp(h) { return hppTotal(h) + (h.adendum ? (h.adendumAmount || 0) : 0); }
  function finalHppPerM2(h) { const lb = luasBangunanOf(h); return lb ? finalHpp(h) / lb : 0; }
  function marginOf(h) { const hj = hargaJualTotal(h); return hj - finalHpp(h); }
  function marginPct(h) { const hj = hargaJualTotal(h); return hj ? (marginOf(h) / hj) * 100 : 0; }
  function aggregateMarginPct(units) {
    const sumHarga = units.reduce((s, h) => s + hargaJualTotal(h), 0);
    const sumHpp = units.reduce((s, h) => s + finalHpp(h), 0);
    return sumHarga ? ((sumHarga - sumHpp) / sumHarga) * 100 : 0;
  }
  function getSortValue(h, key) {
    if (statusFields.some((s) => s.key === key)) return h.status[key] ? 1 : 0;
    switch (key) {
      case "statusGab": return statusFields.filter((f) => h.status[f.key]).length;
      case "kavling": return `${h.blok}-${String(h.noKavling).padStart(4, "0")}`;
      case "tipe": return h.tipe || "";
      case "kategori": return h.kategori || "";
      case "noSpk": return h.spkNo || "";
      case "thSpk": return h.spkTahun || 0;
      case "blnSpk": return h.spkBulan || 0;
      case "luasBangunan": return luasBangunanOf(h);
      case "hpp": return h.hppPerM2 || 0;
      case "adendum": return h.adendumAmount || 0;
      case "hargaJual": return h.hargaJualPerM2 || 0;
      case "margin": return luasBangunanOf(h) ? marginPct(h) : -Infinity;
      default: return "";
    }
  }

  return {
    blockColor, tipeColor, luasBangunanOf, isDuplicateKavling, isIncomplete, hppTotal, hargaJualTotal,
    finalHpp, finalHppPerM2, marginOf, marginPct, aggregateMarginPct, getSortValue,
  };
}

export function timeAgo(ts) {
  if (!ts) return null;
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
