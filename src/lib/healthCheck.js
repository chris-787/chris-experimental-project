// Pemeriksa kesehatan data: mencari kavling yang datanya bermasalah supaya bisa dibereskan satu per satu.
// Fungsi murni (tanpa tampilan) supaya bisa diuji.
//
// Hasil: daftar kelompok masalah. Tiap kelompok punya `kind` (cara memperbaikinya di layar),
// `items` (kavling atau tipe yang bermasalah), dan `severity` ("error" harus diperbaiki, "warn" perlu dicek).
export function checkHealth(houses, tipeOptions, blocks) {
  const tipeByName = new Map(tipeOptions.map((t) => [t.name, t]));
  const blokNames = new Set(blocks.map((b) => b.name));
  const dupCount = new Map();
  houses.forEach((h) => {
    const k = `${h.blok}\u0000${h.noKavling}`;
    dupCount.set(k, (dupCount.get(k) || 0) + 1);
  });
  const kode = (h) => `${h.blok}-${h.noKavling}`;
  const lb = (h) => (tipeByName.get(h.tipe) || {}).luasBangunan || 0;

  const groups = [];
  const add = (id, title, hint, severity, kind, items) => { if (items.length) groups.push({ id, title, hint, severity, kind, items }); };

  add("tipe", "Tipe tidak dikenal", "Kavling ini memakai tipe yang tidak ada di Settings, sehingga luas bangunan dan margin tidak bisa dihitung.", "error", "tipe",
    houses.filter((h) => !tipeByName.has(h.tipe)).map((h) => ({ id: h.id, kode: kode(h), value: h.tipe || "" })));

  // Tipe yang dipakai tetapi luas bangunannya belum diisi: dikelompokkan per tipe (satu isian memperbaiki semua kavlingnya)
  const usedNoLb = new Map();
  houses.forEach((h) => { const t = tipeByName.get(h.tipe); if (t && !t.luasBangunan) usedNoLb.set(t.name, (usedNoLb.get(t.name) || 0) + 1); });
  add("lb", "Luas bangunan tipe belum diisi", "Satu isian per tipe memperbaiki semua kavling bertipe itu.", "error", "lb",
    [...usedNoLb.entries()].map(([name, n]) => ({ id: name, kode: name, count: n })));

  add("hpp", "HPP per m² belum diisi", "Margin kavling ini tampil 0 sampai HPP diisi.", "error", "hpp",
    houses.filter((h) => tipeByName.has(h.tipe) && !h.hppPerM2).map((h) => ({ id: h.id, kode: kode(h), value: "" })));

  add("harga", "Harga jual per m² belum diisi", "Margin kavling ini tampil 0 sampai harga jual diisi.", "error", "harga",
    houses.filter((h) => tipeByName.has(h.tipe) && !h.hargaJualPerM2).map((h) => ({ id: h.id, kode: kode(h), value: "" })));

  add("duplikat", "Nomor kavling kembar", "Dua kavling dengan blok dan nomor yang sama. Ubah salah satu nomornya.", "error", "nomor",
    houses.filter((h) => (dupCount.get(`${h.blok}\u0000${h.noKavling}`) || 0) > 1).map((h) => ({ id: h.id, kode: kode(h), value: h.noKavling })));

  add("blok", "Blok tidak dikenal", "Kavling ini berada di blok yang tidak ada di Settings.", "error", "info",
    houses.filter((h) => !blokNames.has(h.blok)).map((h) => ({ id: h.id, kode: kode(h) })));

  add("margin", "Margin negatif", "HPP (termasuk adendum) di atas harga jual. Cek apakah angkanya benar.", "warn", "info",
    houses.filter((h) => {
      const l = lb(h);
      if (!l || !h.hppPerM2 || !h.hargaJualPerM2) return false;
      const hpp = h.hppPerM2 * l + (h.adendum ? (h.adendumAmount || 0) : 0);
      return h.hargaJualPerM2 * l - hpp < 0;
    }).map((h) => ({ id: h.id, kode: kode(h) })));

  add("kontraktor", "Kontraktor belum diisi", "Kavling ini belum punya kontraktor, jadi tidak ikut dalam rekap kontraktor.", "warn", "kontraktor",
    houses.filter((h) => !(h.kontraktor || "").trim()).map((h) => ({ id: h.id, kode: kode(h), value: "" })));

  return groups;
}

export const healthCount = (groups) => groups.reduce((n, g) => n + g.items.length, 0);
