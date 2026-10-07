// Tata letak kode kavling di peta: SATU ukuran huruf untuk semua, dipilih serapat mungkin yang tidak membuat
// kode saling menimpa. Bila pada ukuran terkecil masih bertabrakan, kode yang bertabrakan (yang poligonnya
// lebih sempit) disembunyikan. Fungsi murni supaya bisa diuji.
//
// items: [{ id, x, y, text, vertical, fit }]  (x,y = titik tengah dalam piksel; fit = huruf terbesar yang muat di poligonnya)
export function layoutLabels(items, { min = 6.5, max = 12, step = 0.25 } = {}) {
  if (!items.length) return { font: 0, shown: [] };
  const box = (it, f) => {
    const len = it.text.length * 0.66 * f + 4;
    const thick = f + 3;
    return it.vertical ? { w: thick, h: len } : { w: len, h: thick };
  };
  const overlaps = (a, ba, b, bb) => Math.abs(a.x - b.x) < (ba.w + bb.w) / 2 && Math.abs(a.y - b.y) < (ba.h + bb.h) / 2;
  const collides = (list, f) => {
    const boxes = list.map((it) => box(it, f));
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (overlaps(list[i], boxes[i], list[j], boxes[j])) return true;
      }
    }
    return false;
  };
  for (let f = max; f >= min - 1e-9; f -= step) {
    if (!collides(items, f)) return { font: Math.round(f * 100) / 100, shown: items.map((i) => i.id) };
  }
  // Ukuran terkecil pun masih bertabrakan: pertahankan poligon yang lebih lebar, buang yang bertabrakan
  const sorted = [...items].sort((a, b) => b.fit - a.fit);
  const kept = [];
  sorted.forEach((it) => {
    const bi = box(it, min);
    if (!kept.some((k) => overlaps(it, bi, k, box(k, min)))) kept.push(it);
  });
  return { font: min, shown: kept.map((i) => i.id) };
}
