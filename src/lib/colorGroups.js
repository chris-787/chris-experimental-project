import { C } from "../theme";

// Kelompok warna peta (Per Blok / Per Tipe / Per Kontraktor / status Sudah-Belum)
// beserta daftar kavlingnya per tipe. Dipakai bersama oleh tampilan layar
// (rincian di bawah legenda) dan hasil cetak Site Plan, supaya isinya selalu sama.
export function buildColorGroups({ colorMode, houses, blocks, tipeOptions, kontraktorLegend, blockColor }) {
  let items;
  let groupOf;
  if (colorMode === "blok") {
    items = blocks.map((b) => ({ key: b.name, label: b.name, color: blockColor(b.name) }));
    groupOf = (h) => h.blok;
  } else if (colorMode === "tipe") {
    items = tipeOptions.map((t) => ({ key: t.name, label: t.name, color: t.color }));
    groupOf = (h) => h.tipe;
  } else if (colorMode === "kontraktor") {
    items = kontraktorLegend.map((k) => ({ key: k.label, label: `${k.label} (${k.count})`, color: k.color }));
    groupOf = (h) => (h.kontraktor || "").trim() || "(belum diisi)";
  } else {
    items = [{ key: "Sudah", label: "Sudah", color: C.green }, { key: "Belum", label: "Belum", color: C.red }];
    groupOf = (h) => (h.status[colorMode] ? "Sudah" : "Belum");
  }
  const alwaysShow = colorMode !== "blok" && colorMode !== "tipe" && colorMode !== "kontraktor";
  const tipeOrder = [...new Set([...tipeOptions.map((t) => t.name), ...houses.map((h) => h.tipe)])];
  const byKavling = (a, b) => (a.blok === b.blok ? String(a.noKavling).localeCompare(String(b.noKavling), undefined, { numeric: true }) : a.blok.localeCompare(b.blok));
  return items
    .map((it) => {
      const inGroup = houses.filter((h) => groupOf(h) === it.key);
      const perTipe = tipeOrder
        .map((tp) => ({ tipe: tp, names: inGroup.filter((h) => h.tipe === tp).sort(byKavling).map((h) => `${h.blok}-${h.noKavling}`) }))
        .filter((x) => x.names.length);
      return { ...it, total: inGroup.length, perTipe };
    })
    .filter((g) => g.total > 0 || alwaysShow);
}
