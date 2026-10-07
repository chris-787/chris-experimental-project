import { MONTHS } from "./constants";

// Penggabungan tiga arah untuk daftar kavling saat dua orang mengedit bersamaan.
//   base   = data saat Anda membuka/terakhir menyimpan (titik awal yang sama untuk kedua pihak)
//   mine   = data di layar Anda sekarang (dengan perubahan yang belum tersimpan)
//   theirs = data terbaru di server (hasil simpanan orang lain)
// Kolom yang hanya diubah satu pihak digabung otomatis. Kolom yang diubah kedua pihak dengan isi
// berbeda disebut "bentrok" dan perlu dipilih satu. Fungsi murni supaya bisa diuji.

const SKIP = new Set(["lastEditedAt", "lastEditedBy"]);
const LABELS = {
  kategori: "Kategori", kontraktor: "Kontraktor", spkNo: "No. SPK", spkTahun: "Th. SPK", spkBulan: "Bln. SPK",
  hppPerM2: "HPP/m²", hargaJualPerM2: "Harga Jual/m²", adendum: "Adendum", adendumAmount: "Nominal adendum",
  tipe: "Tipe", blok: "Blok", noKavling: "Nomor kavling", catatan: "Catatan", followUpDate: "Tanggal follow-up", points: "Posisi di peta",
};
const eq = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function show(key, v) {
  if (v === undefined || v === null || v === "") return "-";
  if (key === "spkBulan") return MONTHS[v - 1] || String(v);
  if (key === "hppPerM2" || key === "hargaJualPerM2" || key === "adendumAmount") return v ? `Rp ${Number(v).toLocaleString("id-ID")}` : "-";
  if (key === "adendum") return v ? "Ya" : "Tidak";
  if (key === "points") return "(berubah)";
  if (typeof v === "boolean") return v ? "Sudah" : "Belum";
  return String(v);
}

// Daftar "slot" yang dibandingkan pada satu kavling: kolom biasa, tiap status, dan tiap detail status.
function slotsOf(...houses) {
  const keys = new Set();
  houses.forEach((h) => h && Object.keys(h).forEach((k) => { if (!SKIP.has(k) && k !== "status" && k !== "details") keys.add(k); }));
  const slots = [...keys].map((k) => ({ id: k, get: (h) => h && h[k], set: (h, v) => { h[k] = v; }, label: LABELS[k] || k, key: k }));
  const stKeys = new Set();
  houses.forEach((h) => h && Object.keys(h.status || {}).forEach((k) => stKeys.add(k)));
  stKeys.forEach((k) => slots.push({ id: `status.${k}`, get: (h) => !!(h && h.status && h.status[k]), set: (h, v) => { h.status = { ...(h.status || {}), [k]: v }; }, label: null, statusKey: k, key: "status" }));
  const dKeys = new Set();
  houses.forEach((h) => h && Object.keys(h.details || {}).forEach((k) => dKeys.add(k)));
  dKeys.forEach((k) => slots.push({ id: `details.${k}`, get: (h) => (h && h.details && h.details[k]) || "", set: (h, v) => { h.details = { ...(h.details || {}), [k]: v }; }, label: null, detailKey: k, key: "details" }));
  return slots;
}

export function mergeHouses(base, mine, theirs, statusFields = []) {
  const baseMap = new Map((base || []).map((h) => [h.id, h]));
  const mineMap = new Map(mine.map((h) => [h.id, h]));
  const theirsMap = new Map(theirs.map((h) => [h.id, h]));
  const sfLabel = (k) => (statusFields.find((s) => s.key === k) || {}).label || k;
  const kode = (h) => `${h.blok}-${h.noKavling}`;

  const conflicts = [];   // bentrok: perlu dipilih
  const fromTheirs = [];  // perubahan orang lain yang masuk otomatis
  const merged = [];
  const ids = [...new Set([...mine.map((h) => h.id), ...theirs.map((h) => h.id)])];

  ids.forEach((id) => {
    const b = baseMap.get(id), m = mineMap.get(id), t = theirsMap.get(id);
    if (m && t) {
      const out = JSON.parse(JSON.stringify(m));
      const slots = slotsOf(b, m, t);
      const theirChanges = [];
      let theirEditor = t.lastEditedBy, theirAt = t.lastEditedAt;
      slots.forEach((s) => {
        const vb = b ? s.get(b) : undefined, vm = s.get(m), vt = s.get(t);
        const mineChanged = b ? !eq(vm, vb) : true;
        const theirsChanged = b ? !eq(vt, vb) : true;
        const label = s.label || (s.statusKey ? sfLabel(s.statusKey) : `${sfLabel(s.detailKey)} (detail)`);
        const disp = (v) => show(s.statusKey ? "status" : s.key, v);
        if (theirsChanged && !mineChanged) { s.set(out, vt); theirChanges.push({ label, from: disp(vb), to: disp(vt) }); }
        else if (theirsChanged && mineChanged && !eq(vm, vt)) {
          conflicts.push({ id, kode: kode(m), slot: s.id, label, base: disp(vb), mine: disp(vm), theirs: disp(vt), theirsRaw: vt, by: theirEditor || null, at: theirAt || null });
        }
      });
      if (theirChanges.length) fromTheirs.push({ id, kode: kode(m), fields: theirChanges, by: theirEditor || null, at: theirAt || null });
      merged.push(out);
    } else if (m && !t) {
      // Ada di saya, tidak ada di server: baru dibuat oleh saya, atau dihapus orang lain
      if (!b) merged.push(m);
      else if (eq(stripMeta(m), stripMeta(b))) fromTheirs.push({ id, kode: kode(m), fields: [{ label: "Kavling", from: "Ada", to: "Dihapus" }], by: null, at: null }); // saya tidak ubah, orang lain hapus: ikut terhapus
      else { conflicts.push({ id, kode: kode(m), slot: "__deleted", label: "Kavling dihapus oleh pengguna lain", base: "-", mine: "Anda mengubahnya", theirs: "Dihapus", theirsRaw: "__deleted", by: null, at: null }); merged.push(m); }
    } else if (!m && t) {
      // Ada di server, tidak ada di saya: baru dibuat orang lain, atau saya hapus
      if (!b) { merged.push(t); fromTheirs.push({ id, kode: kode(t), fields: [{ label: "Kavling", from: "-", to: "Baru" }], by: t.lastEditedBy || null, at: t.lastEditedAt || null }); }
      else if (eq(stripMeta(t), stripMeta(b))) { /* saya hapus, orang lain tidak ubah: tetap terhapus */ }
      else { conflicts.push({ id, kode: kode(t), slot: "__deleted_by_me", label: "Kavling dihapus oleh Anda, tapi diubah pengguna lain", base: "-", mine: "Dihapus", theirs: "Diubah", theirsRaw: "__keep", by: t.lastEditedBy || null, at: t.lastEditedAt || null }); }
    }
  });
  return { merged, conflicts, fromTheirs };
}

function stripMeta(h) { const o = { ...h }; SKIP.forEach((k) => delete o[k]); return o; }

// Terapkan pilihan pengguna untuk tiap bentrok. choices[`${id}|${slot}`] = "mine" | "theirs" (bawaan: mine).
export function resolveConflicts(result, mine, theirs, statusFields, choices) {
  const mineMap = new Map(mine.map((h) => [h.id, h]));
  const theirsMap = new Map(theirs.map((h) => [h.id, h]));
  let out = result.merged.map((h) => ({ ...h }));
  result.conflicts.forEach((c) => {
    const pick = (choices || {})[`${c.id}|${c.slot}`] || "mine";
    if (pick !== "theirs") {
      if (c.slot === "__deleted_by_me") out = out.filter((h) => h.id !== c.id);
      return;
    }
    if (c.slot === "__deleted") { out = out.filter((h) => h.id !== c.id); return; }
    if (c.slot === "__deleted_by_me") { const t = theirsMap.get(c.id); if (t) out.push(t); return; }
    const idx = out.findIndex((h) => h.id === c.id);
    const t = theirsMap.get(c.id), m = mineMap.get(c.id);
    if (idx < 0 || !t || !m) return;
    const slot = slotsOf(m, t).find((s) => s.id === c.slot);
    if (slot) { const copy = { ...out[idx] }; slot.set(copy, slot.get(t)); out[idx] = copy; }
  });
  // Kavling yang sudah ada di server tapi tidak ikut ke hasil (misal dihapus) tidak ditambahkan lagi
  return out;
}
