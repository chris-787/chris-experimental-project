import { C } from "../../theme";
import { SlideInd, useSlideIndicator } from "../slide";
import { measureTextWidth } from "../../lib/helpers";
import { useBoard } from "./BoardContext";

// Pilihan "Warna peta" berbentuk tombol bulat di atas peta. Status selain yang
// pertama (mis. Order Marketing, Pancang) masuk ke menu "Status lain".
export default function ColorPills() {
  const { colorMode, setColorMode, statusFields } = useBoard();
  const first = statusFields[0];
  const others = statusFields.slice(1);
  const pill = (active) => ({
    height: 30, padding: "0 14px", flexShrink: 0, whiteSpace: "nowrap", borderRadius: 999, border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
    background: "transparent", color: active ? C.selectInk : C.steel,
  });
  const otherActive = others.some((s) => s.key === colorMode);
  // Lebar kotak "Status Lain" mengikuti teks yang tampil (nama status terpilih atau tulisan "Status Lain")
  const shownLabel = otherActive ? (others.find((s) => s.key === colorMode) || {}).label : "Status Lain";
  const selectWidth = Math.ceil(measureTextWidth(shownLabel || "Status Lain", "600 12px 'Plus Jakarta Sans', sans-serif")) + 14 + 30;
  const [slideRef, box] = useSlideIndicator([colorMode, others.length]);
  return (
    <div ref={slideRef} role="group" aria-label="Warna peta" className="flex items-center dash-tabs slide-host" style={{ gap: 4, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 999, padding: 4, width: "fit-content", maxWidth: "100%", overflowX: "auto" }}>
      <SlideInd box={box} />
      <button data-slide-active={colorMode === "tipe"} aria-pressed={colorMode === "tipe"} onClick={() => setColorMode("tipe")} style={pill(colorMode === "tipe")}>Per Tipe</button>
      <button data-slide-active={colorMode === "blok"} aria-pressed={colorMode === "blok"} onClick={() => setColorMode("blok")} style={pill(colorMode === "blok")}>Per Blok</button>
      <button data-slide-active={colorMode === "kontraktor"} aria-pressed={colorMode === "kontraktor"} onClick={() => setColorMode("kontraktor")} style={pill(colorMode === "kontraktor")}>Per Kontraktor</button>
      {first && <button data-slide-active={colorMode === first.key} aria-pressed={colorMode === first.key} onClick={() => setColorMode(first.key)} style={pill(colorMode === first.key)}>{first.label}</button>}
      {others.length > 0 && (
        <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
          <select
            data-slide-active={otherActive}
            aria-label="Status lain"
            value={otherActive ? colorMode : ""}
            onChange={(e) => e.target.value && setColorMode(e.target.value)}
            style={{ ...pill(otherActive), appearance: "none", WebkitAppearance: "none", outline: "none", paddingRight: 28, width: selectWidth }}
          >
            <option value="" disabled>Status Lain</option>
            {others.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <span aria-hidden="true" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 11, color: otherActive ? C.selectInk : C.steel }}>▾</span>
        </span>
      )}
    </div>
  );
}
