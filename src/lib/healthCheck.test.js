import { describe, expect, it } from "vitest";
import { checkHealth, healthCount } from "./healthCheck";

const tipe = [{ id: "t1", name: "6x12", luasBangunan: 87 }, { id: "t2", name: "7x12", luasBangunan: 0 }];
const blocks = [{ id: "b1", name: "RB/A" }];
const h = (over) => ({ id: "x", blok: "RB/A", noKavling: "01", tipe: "6x12", hppPerM2: 7000000, hargaJualPerM2: 9000000, kontraktor: "PT. A", adendum: false, adendumAmount: 0, ...over });
const ids = (groups, id) => (groups.find((g) => g.id === id) || { items: [] }).items.map((i) => i.id);

describe("checkHealth", () => {
  it("data sehat tidak menghasilkan masalah", () => {
    expect(healthCount(checkHealth([h({ id: "1" })], tipe, blocks))).toBe(0);
  });

  it("mendeteksi tipe tidak dikenal, dan tidak menghitungnya sebagai HPP kosong", () => {
    const g = checkHealth([h({ id: "1", tipe: "9x9", hppPerM2: 0 })], tipe, blocks);
    expect(ids(g, "tipe")).toEqual(["1"]);
    expect(ids(g, "hpp")).toEqual([]);
  });

  it("luas bangunan kosong dikelompokkan per tipe dengan jumlah kavlingnya", () => {
    const g = checkHealth([h({ id: "1", tipe: "7x12" }), h({ id: "2", noKavling: "02", tipe: "7x12" })], tipe, blocks);
    const lb = g.find((x) => x.id === "lb");
    expect(lb.items).toEqual([{ id: "7x12", kode: "7x12", count: 2 }]);
  });

  it("HPP dan harga jual kosong terdeteksi terpisah", () => {
    const g = checkHealth([h({ id: "1", hppPerM2: 0 }), h({ id: "2", noKavling: "02", hargaJualPerM2: 0 })], tipe, blocks);
    expect(ids(g, "hpp")).toEqual(["1"]);
    expect(ids(g, "harga")).toEqual(["2"]);
  });

  it("nomor kembar di blok yang sama terdeteksi, beda blok tidak", () => {
    const blocks2 = [{ id: "b1", name: "RB/A" }, { id: "b2", name: "RB/B" }];
    const g = checkHealth([h({ id: "1" }), h({ id: "2" }), h({ id: "3", blok: "RB/B" })], tipe, blocks2);
    expect(ids(g, "duplikat").sort()).toEqual(["1", "2"]);
  });

  it("blok tidak dikenal dan kontraktor kosong terdeteksi", () => {
    const g = checkHealth([h({ id: "1", blok: "RB/Z" }), h({ id: "2", noKavling: "02", kontraktor: "  " })], tipe, blocks);
    expect(ids(g, "blok")).toEqual(["1"]);
    expect(ids(g, "kontraktor")).toEqual(["2"]);
  });

  it("margin negatif memperhitungkan adendum", () => {
    const aman = h({ id: "1", hppPerM2: 8900000 });
    const rugi = h({ id: "2", noKavling: "02", hppPerM2: 8900000, adendum: true, adendumAmount: 50000000 });
    expect(ids(checkHealth([aman, rugi], tipe, blocks), "margin")).toEqual(["2"]);
  });

  it("masalah yang harus diperbaiki ditandai error, yang perlu dicek ditandai warn", () => {
    const g = checkHealth([h({ id: "1", hppPerM2: 0, kontraktor: "" })], tipe, blocks);
    expect(g.find((x) => x.id === "hpp").severity).toBe("error");
    expect(g.find((x) => x.id === "kontraktor").severity).toBe("warn");
  });
});
