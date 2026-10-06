import { describe, expect, it } from "vitest";
import { makeCalc } from "./calc";

const tipeOptions = [
  { id: "t1", name: "6x12", luasBangunan: 87, color: "#111111" },
  { id: "t2", name: "7x12", luasBangunan: 107, color: "#222222" },
  { id: "t3", name: "Tanpa LB", luasBangunan: 0, color: "#333333" },
];
const blocks = [{ id: "b1", name: "RB/A", target: 10 }, { id: "b2", name: "RB/B", target: 10 }];
const statusFields = [{ key: "terjual", label: "Terjual" }, { key: "spk", label: "SPK" }];
const house = (over) => ({ id: "h", blok: "RB/A", noKavling: "01", tipe: "6x12", kategori: "Massal", status: {}, hppPerM2: 7000000, hargaJualPerM2: 9000000, adendum: false, adendumAmount: 0, ...over });

const calc = (houses) => makeCalc({ tipeOptions, blocks, houses, statusFields });

describe("hitungan HPP, harga jual, margin", () => {
  const h = house({});
  const c = calc([h]);

  it("HPP dan harga jual = per m² x luas bangunan tipe", () => {
    expect(c.hppTotal(h)).toBe(7000000 * 87);
    expect(c.hargaJualTotal(h)).toBe(9000000 * 87);
  });

  it("margin = harga jual - HPP, persen terhadap harga jual", () => {
    expect(c.marginOf(h)).toBe((9000000 - 7000000) * 87);
    expect(c.marginPct(h)).toBeCloseTo((2000000 / 9000000) * 100, 6);
  });

  it("adendum menambah HPP akhir dan mengurangi margin", () => {
    const withAdd = house({ adendum: true, adendumAmount: 5000000 });
    const cc = calc([withAdd]);
    expect(cc.finalHpp(withAdd)).toBe(7000000 * 87 + 5000000);
    expect(cc.marginOf(withAdd)).toBe(2000000 * 87 - 5000000);
    expect(cc.finalHppPerM2(withAdd)).toBeCloseTo((7000000 * 87 + 5000000) / 87, 6);
  });

  it("adendum yang dimatikan tidak ikut dihitung walau ada nilainya", () => {
    const off = house({ adendum: false, adendumAmount: 5000000 });
    expect(calc([off]).finalHpp(off)).toBe(7000000 * 87);
  });

  it("tipe tanpa luas bangunan menghasilkan 0 (bukan NaN)", () => {
    const x = house({ tipe: "Tanpa LB" });
    const cc = calc([x]);
    expect(cc.hppTotal(x)).toBe(0);
    expect(cc.hargaJualTotal(x)).toBe(0);
    expect(cc.marginPct(x)).toBe(0);
    expect(cc.finalHppPerM2(x)).toBe(0);
  });

  it("harga jual belum diisi: margin persen 0, tidak membagi nol", () => {
    const x = house({ hargaJualPerM2: 0 });
    expect(calc([x]).marginPct(x)).toBe(0);
  });

  it("margin negatif bila HPP di atas harga jual", () => {
    const x = house({ hppPerM2: 10000000 });
    expect(calc([x]).marginOf(x)).toBeLessThan(0);
    expect(calc([x]).marginPct(x)).toBeLessThan(0);
  });
});

describe("margin gabungan (agregat)", () => {
  it("dihitung dari total harga dan total HPP, bukan rata-rata persen", () => {
    const a = house({ id: "a", hppPerM2: 7000000, hargaJualPerM2: 9000000 });
    const b = house({ id: "b", tipe: "7x12", hppPerM2: 8000000, hargaJualPerM2: 10000000 });
    const c = calc([a, b]);
    const harga = 9000000 * 87 + 10000000 * 107;
    const hpp = 7000000 * 87 + 8000000 * 107;
    expect(c.aggregateMarginPct([a, b])).toBeCloseTo(((harga - hpp) / harga) * 100, 6);
  });

  it("daftar kosong menghasilkan 0", () => {
    expect(calc([]).aggregateMarginPct([])).toBe(0);
  });
});

describe("cek data", () => {
  it("nomor kavling kembar di blok yang sama terdeteksi, beda blok tidak", () => {
    const a = house({ id: "a", blok: "RB/A", noKavling: "05" });
    const b = house({ id: "b", blok: "RB/A", noKavling: "05" });
    const d = house({ id: "d", blok: "RB/B", noKavling: "05" });
    const c = calc([a, b, d]);
    expect(c.isDuplicateKavling(a)).toBe(true);
    expect(c.isDuplicateKavling(b)).toBe(true);
    expect(c.isDuplicateKavling(d)).toBe(false);
  });

  it("data belum lengkap bila LB, HPP, atau harga jual kosong", () => {
    const ok = house({});
    expect(calc([ok]).isIncomplete(ok)).toBe(false);
    expect(calc([ok]).isIncomplete(house({ hppPerM2: 0 }))).toBe(true);
    expect(calc([ok]).isIncomplete(house({ hargaJualPerM2: 0 }))).toBe(true);
    expect(calc([ok]).isIncomplete(house({ tipe: "Tanpa LB" }))).toBe(true);
  });
});

describe("nilai urutan tabel", () => {
  const c = calc([]);
  it("kavling diurutkan secara angka, bukan abjad (B-02 sebelum B-10)", () => {
    const v2 = c.getSortValue(house({ noKavling: "2" }), "kavling");
    const v10 = c.getSortValue(house({ noKavling: "10" }), "kavling");
    expect(v2 < v10).toBe(true);
  });
  it("kolom Status gabungan = jumlah status yang aktif", () => {
    expect(c.getSortValue(house({ status: { terjual: true, spk: true } }), "statusGab")).toBe(2);
    expect(c.getSortValue(house({ status: { terjual: true } }), "statusGab")).toBe(1);
    expect(c.getSortValue(house({ status: {} }), "statusGab")).toBe(0);
  });
  it("kolom status tunggal bernilai 1 atau 0", () => {
    expect(c.getSortValue(house({ status: { terjual: true } }), "terjual")).toBe(1);
    expect(c.getSortValue(house({ status: {} }), "terjual")).toBe(0);
  });
  it("margin tanpa luas bangunan diurutkan paling bawah", () => {
    expect(c.getSortValue(house({ tipe: "Tanpa LB" }), "margin")).toBe(-Infinity);
  });
});
