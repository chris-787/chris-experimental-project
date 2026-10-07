import { describe, expect, it } from "vitest";
import { mergeHouses, resolveConflicts } from "./mergeHouses";

const sf = [{ key: "terjual", label: "Terjual" }, { key: "acOrder", label: "Order AC", hasDetail: true }];
const H = (id, over = {}) => ({ id, blok: "RB/A", noKavling: id, tipe: "6x12", kontraktor: "PT. A", hppPerM2: 7000000, status: { terjual: false }, details: {}, ...over });
const base = () => [H("01"), H("02")];

describe("mergeHouses (tiga arah)", () => {
  it("perubahan di kavling berbeda digabung otomatis tanpa bentrok", () => {
    const mine = base(); mine[0] = H("01", { kontraktor: "PT. Saya" });
    const theirs = base(); theirs[1] = H("02", { hppPerM2: 8000000, lastEditedBy: "budi", lastEditedAt: 1 });
    const r = mergeHouses(base(), mine, theirs, sf);
    expect(r.conflicts).toHaveLength(0);
    expect(r.merged.find((h) => h.id === "01").kontraktor).toBe("PT. Saya");
    expect(r.merged.find((h) => h.id === "02").hppPerM2).toBe(8000000);
    expect(r.fromTheirs[0]).toMatchObject({ kode: "RB/A-02", by: "budi" });
  });

  it("kolom berbeda di kavling yang sama juga digabung otomatis", () => {
    const mine = base(); mine[0] = H("01", { kontraktor: "PT. Saya" });
    const theirs = base(); theirs[0] = H("01", { hppPerM2: 9000000 });
    const r = mergeHouses(base(), mine, theirs, sf);
    expect(r.conflicts).toHaveLength(0);
    const h = r.merged.find((x) => x.id === "01");
    expect(h.kontraktor).toBe("PT. Saya");
    expect(h.hppPerM2).toBe(9000000);
  });

  it("kolom yang sama diubah dua pihak dengan isi berbeda menjadi bentrok, lengkap dengan siapa", () => {
    const mine = base(); mine[0] = H("01", { kontraktor: "PT. Saya" });
    const theirs = base(); theirs[0] = H("01", { kontraktor: "PT. Dia", lastEditedBy: "sari", lastEditedAt: 123 });
    const r = mergeHouses(base(), mine, theirs, sf);
    expect(r.conflicts).toHaveLength(1);
    expect(r.conflicts[0]).toMatchObject({ kode: "RB/A-01", label: "Kontraktor", base: "PT. A", mine: "PT. Saya", theirs: "PT. Dia", by: "sari", at: 123 });
  });

  it("diubah dua pihak menjadi nilai yang sama bukan bentrok", () => {
    const mine = base(); mine[0] = H("01", { kontraktor: "PT. Sama" });
    const theirs = base(); theirs[0] = H("01", { kontraktor: "PT. Sama" });
    expect(mergeHouses(base(), mine, theirs, sf).conflicts).toHaveLength(0);
  });

  it("status dan detail status dibandingkan per item", () => {
    const mine = base(); mine[0] = H("01", { status: { terjual: true } });
    const theirs = base(); theirs[0] = H("01", { status: { terjual: false, acOrder: true }, details: { acOrder: "2 PK" } });
    const r = mergeHouses(base(), mine, theirs, sf);
    expect(r.conflicts).toHaveLength(0);
    const h = r.merged.find((x) => x.id === "01");
    expect(h.status).toMatchObject({ terjual: true, acOrder: true });
    expect(h.details.acOrder).toBe("2 PK");
  });

  it("detail status yang sama diisi berbeda menjadi bentrok dengan nama status", () => {
    const b = [H("01", { status: { acOrder: true }, details: { acOrder: "1 PK" } })];
    const mine = [H("01", { status: { acOrder: true }, details: { acOrder: "2 PK" } })];
    const theirs = [H("01", { status: { acOrder: true }, details: { acOrder: "3 PK" } })];
    const r = mergeHouses(b, mine, theirs, sf);
    expect(r.conflicts).toHaveLength(1);
    expect(r.conflicts[0]).toMatchObject({ label: "Order AC (detail)", mine: "2 PK", theirs: "3 PK" });
  });

  it("status Sudah/Belum yang diubah dua pihak tidak pernah bentrok (hanya dua nilai)", () => {
    const b = [H("01", { status: { terjual: false } })];
    const mine = [H("01", { status: { terjual: true } })];
    const theirs = [H("01", { status: { terjual: true } })];
    expect(mergeHouses(b, mine, theirs, sf).conflicts).toHaveLength(0);
  });

  it("kavling baru dari orang lain ikut masuk, kavling baru dari saya tetap ada", () => {
    const mine = [...base(), H("03", { kontraktor: "baru-saya" })];
    const theirs = [...base(), H("04", { lastEditedBy: "budi" })];
    const r = mergeHouses(base(), mine, theirs, sf);
    expect(r.merged.map((h) => h.id).sort()).toEqual(["01", "02", "03", "04"]);
  });

  it("dihapus orang lain dan tidak saya ubah: ikut terhapus; kalau saya ubah: bentrok", () => {
    const theirsDel = [H("01")];
    const r1 = mergeHouses(base(), base(), theirsDel, sf);
    expect(r1.merged.map((h) => h.id)).toEqual(["01"]);
    const mine = base(); mine[1] = H("02", { kontraktor: "PT. Saya" });
    const r2 = mergeHouses(base(), mine, theirsDel, sf);
    expect(r2.conflicts[0].slot).toBe("__deleted");
    expect(r2.merged.map((h) => h.id).sort()).toEqual(["01", "02"]);
  });
});

describe("resolveConflicts", () => {
  const mine = base(); mine[0] = H("01", { kontraktor: "PT. Saya" });
  const theirs = base(); theirs[0] = H("01", { kontraktor: "PT. Dia" });
  const r = mergeHouses(base(), mine, theirs, sf);

  it("bawaannya memakai punya saya", () => {
    const out = resolveConflicts(r, mine, theirs, sf, {});
    expect(out.find((h) => h.id === "01").kontraktor).toBe("PT. Saya");
  });

  it("bisa memilih punya orang lain per bentrok", () => {
    const out = resolveConflicts(r, mine, theirs, sf, { "01|kontraktor": "theirs" });
    expect(out.find((h) => h.id === "01").kontraktor).toBe("PT. Dia");
  });

  it("pilihan menghapus kavling yang dihapus orang lain", () => {
    const m2 = base(); m2[1] = H("02", { kontraktor: "PT. Saya" });
    const t2 = [H("01")];
    const r2 = mergeHouses(base(), m2, t2, sf);
    const out = resolveConflicts(r2, m2, t2, sf, { "02|__deleted": "theirs" });
    expect(out.map((h) => h.id)).toEqual(["01"]);
  });
});
