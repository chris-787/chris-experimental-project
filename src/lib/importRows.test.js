import { describe, expect, it } from "vitest";
import { applyImportRows, isYes } from "./importRows";

const statusFields = [
  { key: "terjual", label: "Terjual" },
  { key: "acOrder", label: "Order AC", hasDetail: true },
];
const houses = () => [
  { id: "1", blok: "RB/A", noKavling: "01", status: { terjual: false }, kontraktor: "Lama" },
  { id: "2", blok: "RB/A", noKavling: "02", status: {} },
];

describe("isYes", () => {
  it("mengenali berbagai tulisan 'sudah'", () => {
    ["Sudah", "sudah", "S", "Selesai", "ya", "Ya", "TRUE", "true", "1", "x", "✓"].forEach((v) => expect(isYes(v)).toBe(true));
  });
  it("menolak 'belum' dan kosong", () => {
    ["Belum", "belum", "Tidak", "tidak", "0", "false", "", null, undefined].forEach((v) => expect(isYes(v)).toBe(false));
  });
});

describe("applyImportRows", () => {
  it("mencocokkan kavling lewat kolom Kavling dan memperbarui isinya", () => {
    const { next, updatedList, skippedList } = applyImportRows([{ Kavling: "RB/A-01", Kontraktor: "PT. Baru", Terjual: "Sudah" }], houses(), statusFields);
    expect(updatedList).toEqual(["RB/A-01"]);
    expect(skippedList).toEqual([]);
    expect(next[0].kontraktor).toBe("PT. Baru");
    expect(next[0].status.terjual).toBe(true);
    expect(next[1].kontraktor).toBeUndefined();
  });

  it("tidak mengubah daftar asli (data lama tetap utuh)", () => {
    const original = houses();
    applyImportRows([{ Kavling: "RB/A-01", Kontraktor: "X" }], original, statusFields);
    expect(original[0].kontraktor).toBe("Lama");
  });

  it("kavling yang tidak ada atau salah format dilewati", () => {
    const { updatedList, skippedList } = applyImportRows([{ Kavling: "RB/Z-99" }, { Kavling: "tanpastrip" }, { Kavling: "" }], houses(), statusFields);
    expect(updatedList).toEqual([]);
    expect(skippedList).toEqual(["RB/Z-99", "tanpastrip", "(kosong)"]);
  });

  it("kolom yang tidak ada di file tidak menimpa data yang sudah ada", () => {
    const { next } = applyImportRows([{ Kavling: "RB/A-01" }], houses(), statusFields);
    expect(next[0].kontraktor).toBe("Lama");
    expect(next[0].status.terjual).toBe(false);
  });

  it("harga, HPP, adendum, dan SPK terbaca benar", () => {
    const row = { Kavling: "RB/A-02", "HPP/m2 (Rp)": 7000000, "Harga Jual/m2 (Rp)": "9500000", "Adendum (Rp)": 2500000, "No. SPK": "SPK-1", "Th. SPK": 2026, "Bln. SPK": "Okt" };
    const h = applyImportRows([row], houses(), statusFields).next[1];
    expect(h.hppPerM2).toBe(7000000);
    expect(h.hargaJualPerM2).toBe(9500000);
    expect(h.adendum).toBe(true);
    expect(h.adendumAmount).toBe(2500000);
    expect(h.spkNo).toBe("SPK-1");
    expect(h.spkTahun).toBe(2026);
    expect(h.spkBulan).toBe(10);
  });

  it("adendum 0 mematikan penanda adendum", () => {
    const h = applyImportRows([{ Kavling: "RB/A-02", "Adendum (Rp)": 0 }], houses(), statusFields).next[1];
    expect(h.adendum).toBe(false);
  });

  it("kolom angka berisi tulisan menjadi 0, bukan NaN", () => {
    const h = applyImportRows([{ Kavling: "RB/A-02", "HPP/m2 (Rp)": "abc" }], houses(), statusFields).next[1];
    expect(h.hppPerM2).toBe(0);
  });

  it("bulan SPK dikenali dari 3 huruf pertama, tidak peduli huruf besar", () => {
    expect(applyImportRows([{ Kavling: "RB/A-02", "Bln. SPK": "MEI" }], houses(), statusFields).next[1].spkBulan).toBe(5);
    expect(applyImportRows([{ Kavling: "RB/A-02", "Bln. SPK": "Agustus" }], houses(), statusFields).next[1].spkBulan).toBe(8);
    expect(applyImportRows([{ Kavling: "RB/A-02", "Bln. SPK": "Ags" }], houses(), statusFields).next[1].spkBulan).toBe(8);
    expect(applyImportRows([{ Kavling: "RB/A-02", "Bln. SPK": "entah" }], houses(), statusFields).next[1]).not.toHaveProperty("spkBulan");
  });

  it("detail status hanya dibaca untuk status yang punya detail", () => {
    const h = applyImportRows([{ Kavling: "RB/A-01", "Order AC": "Sudah", "Order AC - Detail": "2 PK 1 unit", "Terjual - Detail": "abaikan" }], houses(), statusFields).next[0];
    expect(h.details).toEqual({ acOrder: "2 PK 1 unit" });
    expect(h.status.acOrder).toBe(true);
  });

  it("kavling dengan tanda hubung di nama blok tetap terbaca (dipotong di tanda hubung terakhir)", () => {
    const hs = [{ id: "9", blok: "RB-A", noKavling: "01", status: {} }];
    const { updatedList } = applyImportRows([{ Kavling: "RB-A-01" }], hs, statusFields);
    expect(updatedList).toEqual(["RB-A-01"]);
  });
});
