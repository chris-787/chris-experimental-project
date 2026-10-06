import { KpiCard } from "../ui";
import { C } from "../../theme";
import { rupiah } from "../../lib/helpers";
import { useBoard } from "./BoardContext";

// Empat angka utama cluster (dipakai di Main Mode dan di halaman Dashboard).
export default function KpiStrip() {
  const { avgMarginPct, houses, soldUnits, totalMargin, totalTarget } = useBoard();
  return (
    <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
      <KpiCard label="Kavling Terpetakan" value={`${houses.length} / ${totalTarget}`} pct={totalTarget ? (houses.length / totalTarget) * 100 : 0} color={C.accent} sub={totalTarget ? `${Math.round((houses.length / totalTarget) * 100)}% dari target` : null} />
      <KpiCard label="Sudah Terjual" value={`${soldUnits.length} / ${houses.length}`} pct={houses.length ? (soldUnits.length / houses.length) * 100 : 0} color={C.green} sub={houses.length ? `${Math.round((soldUnits.length / houses.length) * 100)}% terjual` : null} />
      <div className="kpi-wide"><KpiCard label="Total Margin" value={rupiah(totalMargin)} color={avgMarginPct >= 20 ? C.green : C.red} /></div>
      <div className="kpi-wide"><KpiCard label="Rata-rata Margin" value={`${avgMarginPct.toFixed(2)}%`} color={avgMarginPct >= 20 ? C.green : C.red} sub="target minimal 20%" /></div>
    </div>
  );
}
