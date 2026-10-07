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

// Kode kavling untuk satu daftar rumah. Koordinat poligon tersimpan dalam ruang PERSEGI (sisi = lebar gambar),
// jadi 1% sumbu x maupun y sama dengan 1% lebar gambar -- `size` adalah panjang sisi persegi itu dalam piksel.
// Mengembalikan ukuran huruf (piksel pada `size` tsb) dan daftar label dengan posisi dalam persen.
export function layoutHouseLabels(houses, { labelOf, isHidden = () => false, size, min, max, step }) {
  const items = [];
  houses.forEach((h) => {
    if (isHidden(h) || !h.points || h.points.length < 3) return;
    const xs = h.points.map((p) => p.x), ys = h.points.map((p) => p.y);
    const wpx = ((Math.max(...xs) - Math.min(...xs)) / 100) * size;
    const hpx = ((Math.max(...ys) - Math.min(...ys)) / 100) * size;
    const text = labelOf(h);
    const len = text.length * 0.6;
    // Arah tulisan (mendatar atau tegak) dipilih yang memberi huruf lebih besar di poligon itu
    const fitH = Math.min(wpx / len, hpx / 1.25);
    const fitV = Math.min(wpx / 1.25, hpx / len);
    const vertical = fitV > fitH * 1.1;
    const cx = xs.reduce((a, c) => a + c, 0) / xs.length;
    const cy = ys.reduce((a, c) => a + c, 0) / ys.length;
    items.push({ id: h.id, house: h, text, vertical, fit: Math.max(fitH, fitV), cx, cy, x: (cx / 100) * size, y: (cy / 100) * size });
  });
  const { font, shown } = layoutLabels(items, { min, max, step });
  const set = new Set(shown);
  return { font, labels: items.filter((i) => set.has(i.id)) };
}
