import { C } from "../../theme";
import { useBoard } from "./BoardContext";

// Pilihan "Warna peta" berbentuk tombol bulat di atas peta. Status selain yang
// pertama (mis. Order Marketing, Pancang) masuk ke menu "Status lain".
export default function ColorPills() {
  const { colorMode, setColorMode, statusFields } = useBoard();
  const first = statusFields[0];
  const others = statusFields.slice(1);
  const pill = (active) => ({
    height: 34, padding: "0 14px", flexShrink: 0, whiteSpace: "nowrap", borderRadius: 999, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
    background: active ? C.accent : "transparent", color: active ? "#fff" : C.steel,
  });
  const otherActive = others.some((s) => s.key === colorMode);
  return (
    <div role="group" aria-label="Warna peta" className="flex items-center dash-tabs" style={{ gap: 4, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 999, padding: 4, width: "fit-content", maxWidth: "100%", overflowX: "auto" }}>
      {first && <button aria-pressed={colorMode === first.key} onClick={() => setColorMode(first.key)} style={pill(colorMode === first.key)}>{first.label}</button>}
      <button aria-pressed={colorMode === "kontraktor"} onClick={() => setColorMode("kontraktor")} style={pill(colorMode === "kontraktor")}>Per Kontraktor</button>
      <button aria-pressed={colorMode === "blok"} onClick={() => setColorMode("blok")} style={pill(colorMode === "blok")}>Per Blok</button>
      <button aria-pressed={colorMode === "tipe"} onClick={() => setColorMode("tipe")} style={pill(colorMode === "tipe")}>Per Tipe</button>
      {others.length > 0 && (
        <select
          aria-label="Status lain"
          value={otherActive ? colorMode : ""}
          onChange={(e) => e.target.value && setColorMode(e.target.value)}
          style={{ ...pill(otherActive), appearance: "auto", outline: "none", border: otherActive ? "none" : "none", paddingRight: 8 }}
        >
          <option value="" disabled>Status lain ▾</option>
          {others.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      )}
    </div>
  );
}
