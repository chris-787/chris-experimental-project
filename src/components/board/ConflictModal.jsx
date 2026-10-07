import { C } from "../../theme";
import { IconChip, btnPrimary, btnSecondary, BTN_PILL } from "../ui";
import { useBoard } from "./BoardContext";

const when = (ts) => (ts ? new Date(ts).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null);

// Bentrok edit: dua orang mengubah data yang sama. Tampilkan siapa dan apa yang bentrok, lalu biarkan memilih.
export default function ConflictModal() {
  const { conflictView, setConflictChoice, applyConflict, closeConflict, reloadAfterRemoteUpdate } = useBoard();
  if (!conflictView) return null;
  const { result, choices } = conflictView;
  const { conflicts, fromTheirs } = result;
  const names = [...new Set([...conflicts.map((c) => c.by), ...fromTheirs.map((f) => f.by)].filter(Boolean))];
  const byText = names.length ? names.join(", ") : "pengguna lain";
  const pick = (c) => choices[`${c.id}|${c.slot}`] || "mine";
  const optStyle = (active) => ({ flex: 1, minWidth: 140, textAlign: "left", padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${active ? C.accent : C.line}`, background: active ? C.chipBlueBg : C.panel, color: C.ink, cursor: "pointer", fontFamily: "inherit" });

  return (
    <div className="modal-backdrop" onClick={closeConflict} style={{ position: "fixed", inset: 0, background: "rgba(27,42,60,0.45)", zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Bentrok edit" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between" style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
          <div className="text-base font-semibold flex items-center gap-2" style={{ color: C.ink }}>
            <IconChip name="warning" bg={C.alertAmberBg} color={C.amber} size={28} /> Data diubah bersamaan
          </div>
          <button onClick={closeConflict} aria-label="Tutup" style={{ border: "none", background: "transparent", color: C.steel, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "14px 22px 8px" }}>
          <div className="mb-3 p-3 rounded-xl text-sm" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}`, color: C.ink }}>
            Sejak Anda membuka data ini, <b>{byText}</b> sudah menyimpan perubahan.{" "}
            {conflicts.length > 0 ? <>Ada <b>{conflicts.length} bentrok</b> yang perlu Anda pilih, sisanya bisa digabung otomatis.</> : <>Tidak ada bentrok: semua perubahan bisa digabung.</>}
          </div>

          {conflicts.length > 0 && (
            <>
              <div className="text-sm font-semibold mb-2" style={{ color: C.ink }}>Bentrok: pilih salah satu</div>
              <div className="flex flex-col gap-2 mb-4">
                {conflicts.map((c) => (
                  <div key={`${c.id}|${c.slot}`} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 10 }}>
                    <div className="text-xs mb-1.5" style={{ color: C.steel }}>
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink, fontWeight: 600 }}>{c.kode}</span> · {c.label} <span style={{ opacity: 0.8 }}>(awalnya: {c.base})</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" aria-pressed={pick(c) === "mine"} onClick={() => setConflictChoice(c.id, c.slot, "mine")} style={optStyle(pick(c) === "mine")}>
                        <div className="text-xs" style={{ color: C.steel }}>Punya Anda</div>
                        <div className="text-sm font-semibold">{c.mine}</div>
                      </button>
                      <button type="button" aria-pressed={pick(c) === "theirs"} onClick={() => setConflictChoice(c.id, c.slot, "theirs")} style={optStyle(pick(c) === "theirs")}>
                        <div className="text-xs" style={{ color: C.steel }}>Punya {c.by || "pengguna lain"}{when(c.at) ? ` · ${when(c.at)}` : ""}</div>
                        <div className="text-sm font-semibold">{c.theirs}</div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {fromTheirs.length > 0 && (
            <>
              <div className="text-sm font-semibold mb-2" style={{ color: C.ink }}>Perubahan orang lain yang ikut masuk otomatis ({fromTheirs.length} kavling)</div>
              <div className="flex flex-col mb-3" style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
                {fromTheirs.map((f, i) => (
                  <div key={f.id} style={{ padding: "7px 12px", borderTop: i ? `1px solid ${C.line}` : "none", background: i % 2 ? "var(--zebra)" : "transparent" }}>
                    <div className="text-xs flex flex-wrap gap-x-2" style={{ color: C.steel }}>
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink, fontWeight: 600 }}>{f.kode}</span>
                      {f.by && <span>oleh {f.by}{when(f.at) ? ` · ${when(f.at)}` : ""}</span>}
                    </div>
                    {f.fields.map((x) => (
                      <div key={x.label} className="text-xs" style={{ color: C.steel }}>
                        {x.label}: <span style={{ textDecoration: "line-through", opacity: 0.7 }}>{x.from}</span> → <b style={{ color: C.ink, fontWeight: 600 }}>{x.to}</b>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap" style={{ padding: "12px 22px 18px", borderTop: `1px solid ${C.line}`, flexShrink: 0 }}>
          <button onClick={() => { closeConflict(); reloadAfterRemoteUpdate(); }} className={BTN_PILL} style={{ ...btnSecondary, color: C.red, borderColor: C.red }} title="Perubahan Anda yang belum tersimpan akan hilang">Buang perubahan saya dan muat ulang</button>
          <div className="flex items-center gap-2">
            <button onClick={closeConflict} className={BTN_PILL} style={btnSecondary}>Batalkan</button>
            <button onClick={applyConflict} className={BTN_PILL} style={btnPrimary}>Gabungkan dan simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
