import { describe, expect, it } from "vitest";
import { layoutLabels } from "./labelLayout";

const mk = (id, x, y, text = "D-30", extra = {}) => ({ id, x, y, text, vertical: false, fit: 20, ...extra });

describe("layoutLabels", () => {
  it("label yang berjauhan memakai ukuran terbesar", () => {
    const r = layoutLabels([mk("a", 0, 0), mk("b", 200, 0), mk("c", 0, 200)], { min: 6.5, max: 12 });
    expect(r.font).toBe(12);
    expect(r.shown).toEqual(["a", "b", "c"]);
  });

  it("ukuran huruf mengecil sampai tidak ada yang bertumpuk", () => {
    const r = layoutLabels([mk("a", 0, 0), mk("b", 30, 0), mk("c", 60, 0)], { min: 6.5, max: 12 });
    expect(r.font).toBeLessThan(12);
    expect(r.font).toBeGreaterThanOrEqual(6.5);
    expect(r.shown).toHaveLength(3);
    // pada ukuran itu lebar kotak <= jarak antar label
    expect(r.font * 4 * 0.66 + 4).toBeLessThanOrEqual(30 + 1e-6);
  });

  it("bila ukuran terkecil pun bertabrakan, yang poligonnya lebih sempit disembunyikan", () => {
    const r = layoutLabels([mk("lebar", 0, 0, "D-30", { fit: 30 }), mk("sempit", 5, 0, "D-28", { fit: 8 })], { min: 6.5, max: 12 });
    expect(r.font).toBe(6.5);
    expect(r.shown).toEqual(["lebar"]);
  });

  it("tidak ada item menghasilkan daftar kosong", () => {
    expect(layoutLabels([])).toEqual({ font: 0, shown: [] });
  });
});

import { layoutHouseLabels } from "./labelLayout";

describe("layoutHouseLabels", () => {
  const poly = (id, x, y, w, h) => ({ id, blok: "RB/A", noKavling: id, points: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }] });
  const labelOf = (h) => `A-${h.noKavling}`;

  it("memakai ruang persegi: tinggi poligon dihitung dari lebar gambar", () => {
    // poligon 2% x 6% pada persegi 1000px = 20px x 60px (tegak)
    const r = layoutHouseLabels([poly("01", 10, 10, 2, 6)], { labelOf, size: 1000, min: 6, max: 14 });
    expect(r.labels).toHaveLength(1);
    expect(r.labels[0].vertical).toBe(true);
    expect(r.labels[0].cx).toBeCloseTo(11);
    expect(r.labels[0].cy).toBeCloseTo(13);
  });

  it("poligon lebar memakai tulisan mendatar", () => {
    const r = layoutHouseLabels([poly("01", 10, 10, 8, 2)], { labelOf, size: 1000, min: 6, max: 14 });
    expect(r.labels[0].vertical).toBe(false);
  });

  it("kavling yang disembunyikan tidak diberi label", () => {
    const r = layoutHouseLabels([poly("01", 10, 10, 8, 2), poly("02", 30, 10, 8, 2)], { labelOf, isHidden: (h) => h.id === "02", size: 1000, min: 6, max: 14 });
    expect(r.labels.map((l) => l.id)).toEqual(["01"]);
  });
});
