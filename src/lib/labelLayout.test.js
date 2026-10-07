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
