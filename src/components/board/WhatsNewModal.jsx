import { C } from "../../theme";
import { IconChip } from "../ui";
import { WHATS_NEW_GROUPS } from "../../lib/constants";
import { useBoard } from "./BoardContext";

export default function WhatsNewModal() {
  const { setShowWhatsNew } = useBoard();
  return (
    <>
        <div onClick={() => setShowWhatsNew(false)} style={{ position: "fixed", inset: 0, background: "rgba(27,42,60,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, maxHeight: "85vh", display: "flex", flexDirection: "column", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            <div className="flex items-center justify-between" style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
              <div className="text-lg font-semibold flex items-center gap-2" style={{ color: C.ink }}><IconChip name="sparkle" bg={C.chipBlueBg} color={C.accent} size={28} /> What's New</div>
              <button onClick={() => setShowWhatsNew(false)} aria-label="Tutup" style={{ border: "none", background: "transparent", color: C.steel, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "16px 24px 24px" }}>
              {WHATS_NEW_GROUPS.map((group, gi) => (
                <div key={gi} className="mb-3">
                  <div className="text-xs font-semibold mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, color: C.gold, textTransform: "uppercase" }}>{group.date}</div>
                  <div className="flex flex-col gap-2.5">
                    {group.items.map((it, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div style={{ fontSize: 20, lineHeight: "26px" }}>{it.icon}</div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: C.ink }}>{it.title}</div>
                          <div className="text-xs" style={{ color: C.steel, lineHeight: 1.5 }}>{it.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setShowWhatsNew(false)} className="text-sm w-full px-2.5 py-1.5 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Oke, Mengerti</button>
            </div>
          </div>
        </div>
    </>
  );
}
