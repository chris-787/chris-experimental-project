import { C } from "../../theme";
import { IconChip } from "../ui";
import { rupiah } from "../../lib/helpers";
import { useBoard } from "./BoardContext";

export default function RekapKontraktorModal() {
  const { rekapKontraktor, setShowRekapKontraktor } = useBoard();
  return (
    <>
        <div className="modal-backdrop" onClick={() => setShowRekapKontraktor(false)} style={{ position: "fixed", inset: 0, background: "rgba(27,42,60,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, maxHeight: "85vh", display: "flex", flexDirection: "column", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            <div className="flex items-center justify-between" style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
              <div className="text-lg font-semibold flex items-center gap-2" style={{ color: C.ink }}><IconChip name="hardhat" bg={C.chipBlueBg} color={C.accent} size={28} /> Rekap Kontraktor</div>
              <button onClick={() => setShowRekapKontraktor(false)} aria-label="Tutup" style={{ border: "none", background: "transparent", color: C.steel, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "16px 24px 24px" }}>
              <p className="text-xs mb-3" style={{ color: C.steel }}>
                Dikelompokkan berdasarkan teks yang diketik di kolom Kontraktor — kalau nama yang sama ditulis beda-beda (mis. "PT Jaya" vs "PT. Jaya"), akan muncul sebagai baris terpisah di bawah ini.
              </p>
              <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
                <div className="grid text-xs font-semibold p-2" style={{ gridTemplateColumns: "1.6fr 0.7fr 1fr 1fr", background: C.paper, color: C.steel, gap: 8 }}>
                  <div>Kontraktor</div><div className="text-right">Unit</div><div className="text-right">Total HPP</div><div className="text-right">Order SPK</div>
                </div>
                {rekapKontraktor.map((r) => (
                  <div key={r.nama} className="grid text-xs p-2" style={{ gridTemplateColumns: "1.6fr 0.7fr 1fr 1fr", gap: 8, borderTop: `1px solid ${C.line}`, alignItems: "center" }}>
                    <div style={{ color: r.nama === "(belum diisi)" ? C.faint : C.ink, fontStyle: r.nama === "(belum diisi)" ? "italic" : "normal" }}>{r.nama}</div>
                    <div className="text-right" style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink }}>{r.unit}</div>
                    <div className="text-right" style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink }}>{rupiah(r.sumHpp)}</div>
                    <div className="text-right" style={{ fontFamily: "IBM Plex Mono, monospace", color: C.steel }}>{r.spkDone} / {r.unit}</div>
                  </div>
                ))}
                {rekapKontraktor.length === 0 && (
                  <div className="text-xs p-2.5" style={{ color: C.steel }}>Belum ada kavling di cluster ini.</div>
                )}
              </div>
              <button onClick={() => setShowRekapKontraktor(false)} className="text-sm w-full px-2.5 py-1.5 rounded-lg mt-3" style={{ background: C.panel, color: C.ink, border: `1px solid ${C.line}` }}>Tutup</button>
            </div>
          </div>
        </div>
    </>
  );
}
