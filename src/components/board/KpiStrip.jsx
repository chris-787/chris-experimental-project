import { C } from "../../theme";
import { rupiah } from "../../lib/helpers";
import { useBoard } from "./BoardContext";

// Empat angka utama cluster (Main Mode dan halaman Dashboard): kartu sama besar.
const MONO = "'IBM Plex Mono', monospace";
const box = { background: C.panel, boxShadow: C.cardShadow, borderRadius: 16, padding: "12px 16px", boxSizing: "border-box", height: "100%" };
const bar = (pct, color) => (
  <div style={{ height: 5, borderRadius: 5, background: C.line, marginTop: 8 }}>
    <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", borderRadius: 5, background: color }} />
  </div>
);

export default function KpiStrip() {
  const { avgMarginPct, houses, soldUnits, totalMargin, totalTarget } = useBoard();
  const mapped = totalTarget ? (houses.length / totalTarget) * 100 : 0;
  const sold = houses.length ? (soldUnits.length / houses.length) * 100 : 0;
  const ok = avgMarginPct >= 20;
  return (
    <div className="mb-3.5 kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, alignItems: "stretch" }}>
      <div style={box}>
        <div style={{ fontSize: 11, color: C.steel }}>Kavling Terpetakan</div>
        <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 500, marginTop: 4, color: C.ink }}>{houses.length} <span style={{ fontSize: 13, color: C.steel }}>/ {totalTarget}</span></div>
        {bar(mapped, C.accent)}
        <div style={{ fontSize: 11, color: C.steel, marginTop: 6 }}>{Math.round(mapped)}% dari target</div>
      </div>
      <div style={box}>
        <div style={{ fontSize: 11, color: C.steel }}>Sudah Terjual</div>
        <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 500, marginTop: 4, color: C.ink }}>{soldUnits.length} <span style={{ fontSize: 13, color: C.steel }}>/ {houses.length}</span></div>
        {bar(sold, C.green)}
        <div style={{ fontSize: 11, color: C.steel, marginTop: 6 }}>{Math.round(sold)}% terjual</div>
      </div>
      <div className="kpi-wide" style={box}>
        <div style={{ fontSize: 11, color: C.steel }}>Total Margin</div>
        <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 500, marginTop: 8, color: C.ink, overflowWrap: "anywhere" }}>{rupiah(totalMargin)}</div>
        <div style={{ fontSize: 11, color: C.steel, marginTop: 14 }}>dari {houses.length} kavling terpetakan</div>
      </div>
      <div className="kpi-wide" style={box}>
        <div style={{ fontSize: 11, color: C.steel }}>Rata-rata Margin</div>
        <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
          <span style={{ fontFamily: MONO, fontSize: 19, fontWeight: 500, color: C.ink }}>{avgMarginPct.toFixed(2)}%</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: ok ? C.chipBlueBg : C.chipRedBg, color: ok ? C.green : C.red }}>{ok ? "di atas target" : "di bawah target"}</span>
        </div>
        <div style={{ fontSize: 11, color: C.steel, marginTop: 14 }}>target minimal 20%</div>
      </div>
    </div>
  );
}
