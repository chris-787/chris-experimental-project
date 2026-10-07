import { C } from "../../theme";
import { Field, IconChip, cellInput, formInput } from "../ui";
import { rupiah } from "../../lib/helpers";
import { simulatePrice } from "../../lib/priceSimulation";
import { useBoard } from "./BoardContext";

export default function SimulasiModal() {
  const { blocks, houses, setShowSimulasi, setSimHargaMode, setSimHargaValue, setSimHppMode, setSimHppValue, setSimScope, simHargaMode, simHargaValue, simHppMode, simHppValue, simScope, tipeOptions } = useBoard();
        const [scopeType, ...scopeRest] = simScope.split(":");
        const sim = simulatePrice(houses, tipeOptions, {
          scopeType, scopeValue: scopeRest.join(":"),
          hargaMode: simHargaMode, hargaValue: simHargaValue, hppMode: simHppMode, hppValue: simHppValue,
        });
        const signed = (n, fmt) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n))}`;
        const diffColor = (n) => (n > 0 ? C.green : n < 0 ? C.red : C.steel);
        const pctFmt = (n) => `${n.toFixed(2)}%`;
        const rows = [
          { label: "Total harga jual", b: sim.before.sumHarga, a: sim.after.sumHarga, fmt: rupiah, colored: false },
          { label: "Total HPP (termasuk adendum)", b: sim.before.sumHpp, a: sim.after.sumHpp, fmt: rupiah, colored: false },
          { label: "Total margin", b: sim.before.margin, a: sim.after.margin, fmt: rupiah, colored: true },
          { label: "Margin rata-rata", b: sim.before.pct, a: sim.after.pct, fmt: pctFmt, colored: true },
        ];
        const changed = simHargaValue !== "" || simHppValue !== "";
        const modeSelect = (value, onChange) => (
          <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...cellInput, width: "auto", flex: "0 0 auto" }}>
            <option value="persen">Naik / turun (%)</option>
            <option value="angka">Ganti jadi (Rp)</option>
          </select>
        );
        return (
          <div className="modal-backdrop" onClick={() => setShowSimulasi(false)} style={{ position: "fixed", inset: 0, background: "rgba(27,42,60,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.25)", overflow: "hidden" }}>
              <div className="flex items-center justify-between" style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
                <div className="text-lg font-semibold flex items-center gap-2" style={{ color: C.ink }}><IconChip name="calculator" bg={C.chipBlueBg} color={C.accent} size={28} /> Simulasi Harga</div>
                <button onClick={() => setShowSimulasi(false)} aria-label="Tutup" style={{ border: "none", background: "transparent", color: C.steel, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>
              <div style={{ overflowY: "auto", padding: "16px 24px 24px" }}>
                <div className="text-xs mb-3 p-2 rounded-lg" style={{ background: C.infoBlueBg, border: `1px solid ${C.line}`, color: C.ink }}>
                  Hanya simulasi — data asli di tabel <b>tidak berubah</b>. Menutup panel ini mengembalikan semuanya seperti semula.
                </div>

                <Field label="Berlaku untuk">
                  <select value={simScope} onChange={(e) => setSimScope(e.target.value)} style={formInput}>
                    <option value="all">Semua kavling</option>
                    {blocks.map((b) => <option key={b.id} value={`blok:${b.name}`}>Blok {b.name}</option>)}
                    {tipeOptions.map((t) => <option key={t.id} value={`tipe:${t.name}`}>Tipe {t.name}</option>)}
                  </select>
                </Field>
                <Field label="Ubah harga jual per m²">
                  <div className="flex gap-2">
                    {modeSelect(simHargaMode, setSimHargaMode)}
                    <input type="number" style={formInput} value={simHargaValue} onChange={(e) => setSimHargaValue(e.target.value)} placeholder={simHargaMode === "persen" ? "mis. -5 untuk turun 5%" : "mis. 9000000"} />
                  </div>
                </Field>
                <Field label="Ubah HPP per m²">
                  <div className="flex gap-2">
                    {modeSelect(simHppMode, setSimHppMode)}
                    <input type="number" style={formInput} value={simHppValue} onChange={(e) => setSimHppValue(e.target.value)} placeholder={simHppMode === "persen" ? "mis. 3 untuk naik 3%" : "mis. 6000000"} />
                  </div>
                </Field>

                <div className="text-xs mb-2 mt-2.5" style={{ color: C.steel }}>
                  {sim.counted} kavling dihitung{sim.skipped > 0 ? ` · ${sim.skipped} dilewati (luas bangunan, HPP, atau harga jual belum lengkap)` : ""}
                </div>
                {sim.counted === 0 ? (
                  <div className="text-sm p-2.5 rounded-lg" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}`, color: C.ink }}>
                    Belum ada kavling dengan data lengkap di pilihan ini, jadi belum ada yang bisa disimulasikan. Isi dulu Luas Bangunan (Pengaturan), HPP, dan Harga Jual di tabel.
                  </div>
                ) : (
                  <>
                    <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
                      <div className="grid text-xs font-semibold p-2" style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1fr", background: C.paper, color: C.steel, gap: 8 }}>
                        <div></div><div className="text-right">Sebelum</div><div className="text-right">Sesudah</div><div className="text-right">Selisih</div>
                      </div>
                      {rows.map((r) => {
                        const d = r.a - r.b;
                        return (
                          <div key={r.label} className="grid text-xs p-2" style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: 8, borderTop: `1px solid ${C.line}`, alignItems: "center" }}>
                            <div style={{ color: C.ink }}>{r.label}</div>
                            <div className="text-right" style={{ fontFamily: "IBM Plex Mono, monospace", color: C.steel }}>{r.fmt(r.b)}</div>
                            <div className="text-right" style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink, fontWeight: 600 }}>{r.fmt(r.a)}</div>
                            <div className="text-right" style={{ fontFamily: "IBM Plex Mono, monospace", color: r.colored ? diffColor(Math.round(d * 100) / 100) : C.steel }}>{Math.abs(d) < 0.005 ? "—" : signed(d, r.fmt)}</div>
                          </div>
                        );
                      })}
                    </div>
                    {sim.perTipe.length > 1 && (
                      <div className="mt-2.5">
                        <div className="text-xs font-semibold mb-1" style={{ color: C.steel }}>Margin per tipe</div>
                        {sim.perTipe.map((t) => (
                          <div key={t.tipe} className="flex items-center justify-between text-xs py-1" style={{ borderBottom: `1px solid ${C.line}` }}>
                            <span style={{ color: C.ink }}>{t.tipe} <span style={{ color: C.steel }}>({t.n} unit)</span></span>
                            <span style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink }}>{pctFmt(t.before.pct)} → <b>{pctFmt(t.after.pct)}</b></span>
                          </div>
                        ))}
                      </div>
                    )}
                    {!changed && <div className="text-xs mt-2.5" style={{ color: C.steel }}>Isi salah satu kolom perubahan di atas untuk melihat hasil simulasinya.</div>}
                  </>
                )}

                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setSimScope("all"); setSimHargaMode("persen"); setSimHargaValue(""); setSimHppMode("persen"); setSimHppValue(""); }} className="text-sm flex-1 px-2.5 py-1.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Reset</button>
                  <button onClick={() => setShowSimulasi(false)} className="text-sm flex-1 px-2.5 py-1.5 rounded-lg" style={{ background: C.panel, color: C.ink, border: `1px solid ${C.line}` }}>Tutup</button>
                </div>
              </div>
            </div>
          </div>
        );
}
