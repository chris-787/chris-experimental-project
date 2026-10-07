import { describe, expect, it } from "vitest";
import { shortKavlingLabel } from "./helpers";

describe("shortKavlingLabel", () => {
  it("memotong awalan blok sebelum garis miring", () => {
    expect(shortKavlingLabel({ blok: "RB/B", noKavling: "01" })).toBe("B-01");
    expect(shortKavlingLabel({ blok: "RB/D", noKavling: "02" })).toBe("D-02");
  });
  it("blok tanpa garis miring dipakai apa adanya", () => {
    expect(shortKavlingLabel({ blok: "A", noKavling: "15" })).toBe("A-15");
  });
});
