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
  // Ada tabrakan pada ukuran f? Memakai kisi (grid) supaya tiap kotak hanya dibandingkan dengan tetangganya (cepat untuk ratusan kavling).
  const collides = (f) => {
    const boxes = items.map((it) => box(it, f));
    let cs = 1;
    boxes.forEach((b) => { cs = Math.max(cs, b.w, b.h); });
    const grid = new Map();
    for (let i = 0; i < items.length; i++) {
      const gx = Math.floor(items[i].x / cs), gy = Math.floor(items[i].y / cs);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const list = grid.get(`${gx + dx},${gy + dy}`);
          if (!list) continue;
          for (let k = 0; k < list.length; k++) {
            const j = list[k];
            if (overlaps(items[i], boxes[i], items[j], boxes[j])) return true;
          }
        }
      }
      const key = `${gx},${gy}`;
      if (grid.has(key)) grid.get(key).push(i); else grid.set(key, [i]);
    }
    return false;
  };
  // Tabrakan hanya bertambah bila huruf membesar, jadi ukuran terbesar yang aman dicari dengan pencarian biner.
  const n = Math.max(0, Math.floor((max - min) / step + 1e-9));
  const sizeAt = (k) => Math.round((min + k * step) * 100) / 100;
  if (!collides(sizeAt(0))) {
    let lo = 0, hi = n;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (collides(sizeAt(mid))) hi = mid - 1; else lo = mid;
    }
    return { font: sizeAt(lo), shown: items.map((i) => i.id) };
  }
  // Ukuran terkecil pun masih bertabrakan: pertahankan poligon yang lebih lebar, buang yang bertabrakan
  const sorted = [...items].sort((a, b) => b.fit - a.fit);
  const kept = [];
  const bMin = new Map(sorted.map((it) => [it.id, box(it, min)]));
  sorted.forEach((it) => {
    const bi = bMin.get(it.id);
    if (!kept.some((k) => overlaps(it, bi, k, bMin.get(k.id)))) kept.push(it);
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
