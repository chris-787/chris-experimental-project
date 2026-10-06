import { Ic } from "../ui";
import { C } from "../../theme";
import { rupiah } from "../../lib/helpers";
import { useBoard } from "./BoardContext";

// Empat angka utama cluster (Main Mode dan halaman Dashboard): kartu sama besar,
// tiap kartu punya warna sendiri supaya mudah dikenali sekilas.
const MONO = "'IBM Plex Mono', monospace";
export const KPI_COLORS = { mapped: "#2E8B8B", sold: "#3F7D58", margin: "#3B6FD4", avg: "#8A5BC4" };

export function KpiBox({ color, icon, label, children, className }) {
  return (
    <div
      className={`viz ${className || ""}`}
      style={{
        background: `color-mix(in srgb, ${color} 9%, var(--panel))`,
        boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 24%, var(--line))`,
        borderRadius: 16, padding: "12px 16px", boxSizing: "border-box", height: "100%",
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ width: 26, height: 26, borderRadius: 8, background: `color-mix(in srgb, ${color} 20%, transparent)`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ic name={icon} size={14} />
        </span>
        <span style={{ fontSize: 12, color: C.steel }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

const bar = (pct, color) => (
  <div style={{ height: 6, borderRadius: 6, background: `color-mix(in srgb, ${color} 20%, transparent)`, marginTop: 8 }}>
    <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", borderRadius: 6, background: color }} />
  </div>
);

export default function KpiStrip() {
  const { avgMarginPct, houses, soldUnits, totalMargin, totalTarget } = useBoard();
  const mapped = totalTarget ? (houses.length / totalTarget) * 100 : 0;
  const sold = houses.length ? (soldUnits.length / houses.length) * 100 : 0;
  const ok = avgMarginPct >= 20;
  return (
    <div className="mb-3.5 kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, alignItems: "stretch" }}>
      <KpiBox color={KPI_COLORS.mapped} icon="map" label="Kavling Terpetakan">
        <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 500, marginTop: 6, color: C.ink }}>{houses.length} <span style={{ fontSize: 14, color: C.steel }}>/ {totalTarget}</span></div>
        {bar(mapped, KPI_COLORS.mapped)}
        <div style={{ fontSize: 11, color: C.steel, marginTop: 6 }}>{Math.round(mapped)}% dari target</div>
      </KpiBox>
      <KpiBox color={KPI_COLORS.sold} icon="checkCircle" label="Sudah Terjual">
        <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 500, marginTop: 6, color: C.ink }}>{soldUnits.length} <span style={{ fontSize: 14, color: C.steel }}>/ {houses.length}</span></div>
        {bar(sold, KPI_COLORS.sold)}
        <div style={{ fontSize: 11, color: C.steel, marginTop: 6 }}>{Math.round(sold)}% terjual</div>
      </KpiBox>
      <KpiBox color={KPI_COLORS.margin} icon="wallet" label="Total Margin" className="kpi-wide">
        <div style={{ fontFamily: MONO, fontSize: "clamp(12px, 1.25vw, 17px)", fontWeight: 500, marginTop: 10, color: C.ink, whiteSpace: "nowrap" }}>{rupiah(totalMargin)}</div>
        <div style={{ fontSize: 11, color: C.steel, marginTop: 16 }}>dari {houses.length} kavling terpetakan</div>
      </KpiBox>
      <KpiBox color={KPI_COLORS.avg} icon="percent" label="Rata-rata Margin" className="kpi-wide">
        <div className="flex items-center gap-x-2 gap-y-1 flex-wrap" style={{ marginTop: 6 }}>
          <span style={{ fontFamily: MONO, fontSize: 21, fontWeight: 500, color: C.ink }}>{avgMarginPct.toFixed(2)}%</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", whiteSpace: "nowrap", borderRadius: 999, background: `color-mix(in srgb, ${ok ? "var(--green)" : "var(--red)"} 16%, transparent)`, color: ok ? C.green : C.red }}>{ok ? "di atas target" : "di bawah target"}</span>
        </div>
        <div style={{ fontSize: 11, color: C.steel, marginTop: 14 }}>target minimal 20%</div>
      </KpiBox>
    </div>
  );
}
