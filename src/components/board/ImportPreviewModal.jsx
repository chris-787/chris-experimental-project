import { C } from "../../theme";
import { IconChip, btnPrimary, btnSecondary, BTN_PILL } from "../ui";
import { useBoard } from "./BoardContext";

// Pratinjau impor Excel/CSV: tampil dulu apa yang akan berubah. Data baru berubah setelah "Terapkan".
export default function ImportPreviewModal() {
  const { importPreview, applyImportPreview, cancelImportPreview } = useBoard();
  if (!importPreview) return null;
  const { changes, cellCount, skipped, matched, fileName } = importPreview;
  const unchanged = matched - changes.length;
  return (
    <div className="modal-backdrop" onClick={cancelImportPreview} style={{ position: "fixed", inset: 0, background: "rgba(27,42,60,0.45)", zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Pratinjau impor" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", display: "flex", flexDirection: "column", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between" style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
          <div className="text-base font-semibold flex items-center gap-2" style={{ color: C.ink }}>
            <IconChip name="upload" bg={C.chipBlueBg} color={C.accent} size={28} /> Pratinjau Import
          </div>
          <button onClick={cancelImportPreview} aria-label="Tutup" style={{ border: "none", background: "transparent", color: C.steel, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "14px 22px 8px" }}>
          <div className="text-xs mb-2" style={{ color: C.steel, wordBreak: "break-all" }}>File: {fileName || "-"}</div>
          {changes.length > 0 ? (
            <div className="mb-3 p-3 rounded-xl" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}`, color: C.ink }}>
              <div className="text-sm font-semibold">Akan mengubah {changes.length} kavling, {cellCount} sel</div>
              <div className="text-xs mt-1" style={{ color: C.steel }}>Belum ada yang berubah. Data baru tersimpan setelah Anda menekan Terapkan.</div>
            </div>
          ) : (
            <div className="mb-3 p-3 rounded-xl text-sm" style={{ background: C.infoBlueBg, border: `1px solid ${C.line}`, color: C.ink }}>
              Tidak ada perubahan: isi file sama dengan data yang sudah ada.
            </div>
          )}
          <div className="flex gap-2 flex-wrap mb-3 text-xs" style={{ color: C.steel }}>
            <span>{matched} kavling cocok</span>
            <span>· {changes.length} berubah</span>
            <span>· {Math.max(0, unchanged)} tanpa perubahan</span>
            {skipped.length > 0 && <span style={{ color: C.amber }}>· {skipped.length} dilewati</span>}
          </div>

          {changes.length > 0 && (
            <div className="flex flex-col" style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
              {changes.map((c, i) => (
                <div key={c.id} style={{ padding: "8px 12px", borderTop: i ? `1px solid ${C.line}` : "none", background: i % 2 ? "var(--zebra)" : "transparent" }}>
                  <div className="text-xs font-semibold" style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{c.kode}</div>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {c.fields.map((f) => (
                      <div key={f.label} className="text-xs flex flex-wrap items-baseline gap-x-1.5" style={{ color: C.steel }}>
                        <span style={{ minWidth: 110 }}>{f.label}</span>
                        <span style={{ textDecoration: "line-through", opacity: 0.7 }}>{f.from}</span>
                        <span aria-hidden="true">→</span>
                        <b style={{ color: C.ink, fontWeight: 600 }}>{f.to}</b>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {skipped.length > 0 && (
            <div className="text-xs mt-3 p-2 rounded-lg" style={{ background: C.alertAmberBg, border: `1px solid ${C.line}`, color: C.ink }}>
              Dilewati karena tidak ditemukan di cluster ini: {skipped.join(", ")}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2" style={{ padding: "12px 22px 18px", borderTop: `1px solid ${C.line}`, flexShrink: 0 }}>
          <button onClick={cancelImportPreview} className={BTN_PILL} style={btnSecondary}>{changes.length > 0 ? "Batalkan" : "Tutup"}</button>
          {changes.length > 0 && <button onClick={applyImportPreview} className={BTN_PILL} style={btnPrimary}>Terapkan {cellCount} perubahan</button>}
        </div>
      </div>
    </div>
  );
}
