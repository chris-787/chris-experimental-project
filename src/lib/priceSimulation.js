// Hitung simulasi "bagaimana kalau harga/HPP diubah" tanpa menyentuh data asli.
// Rumus margin sama dengan yang dipakai Dashboard: harga jual total - (HPP total + adendum).

function num(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function applyChange(base, mode, rawValue) {
  const v = num(rawValue);
  if (v === null) return base;
  if (mode === "persen") return Math.max(0, base * (1 + v / 100));
  if (mode === "angka") return v > 0 ? v : base;
  return base;
}

function emptyTotals() {
  return { sumHarga: 0, sumHpp: 0 };
}

function withDerived(t) {
  const margin = t.sumHarga - t.sumHpp;
  return { ...t, margin, pct: t.sumHarga ? (margin / t.sumHarga) * 100 : 0 };
}

export function simulatePrice(houses, tipeOptions, opts) {
  const { scopeType = "all", scopeValue = "", hargaMode = "persen", hargaValue = "", hppMode = "persen", hppValue = "" } = opts || {};
  const luasOf = (h) => tipeOptions.find((t) => t.name === h.tipe)?.luasBangunan || 0;

  const before = emptyTotals();
  const after = emptyTotals();
  const perTipe = {};
  let counted = 0;
  let skipped = 0;

  houses.forEach((h) => {
    const inScope =
      scopeType === "all" ||
      (scopeType === "blok" && h.blok === scopeValue) ||
      (scopeType === "tipe" && h.tipe === scopeValue);
    if (!inScope) return;

    const lb = luasOf(h);
    if (!lb || !h.hppPerM2 || !h.hargaJualPerM2) { skipped += 1; return; }

    const adendum = h.adendum ? (h.adendumAmount || 0) : 0;
    const beforeHarga = h.hargaJualPerM2 * lb;
    const beforeHpp = h.hppPerM2 * lb + adendum;
    const afterHarga = applyChange(h.hargaJualPerM2, hargaMode, hargaValue) * lb;
    const afterHpp = applyChange(h.hppPerM2, hppMode, hppValue) * lb + adendum;

    before.sumHarga += beforeHarga; before.sumHpp += beforeHpp;
    after.sumHarga += afterHarga; after.sumHpp += afterHpp;

    const key = h.tipe;
    if (!perTipe[key]) perTipe[key] = { tipe: key, n: 0, before: emptyTotals(), after: emptyTotals() };
    perTipe[key].n += 1;
    perTipe[key].before.sumHarga += beforeHarga; perTipe[key].before.sumHpp += beforeHpp;
    perTipe[key].after.sumHarga += afterHarga; perTipe[key].after.sumHpp += afterHpp;
    counted += 1;
  });

  return {
    counted,
    skipped,
    before: withDerived(before),
    after: withDerived(after),
    perTipe: Object.values(perTipe).map((t) => ({ tipe: t.tipe, n: t.n, before: withDerived(t.before), after: withDerived(t.after) })),
  };
}
