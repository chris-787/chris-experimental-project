import { Suspense, lazy } from "react";
import { BTN_PILL, Ic, IconChip, KpiCard, MONO, Pill, ProgressBar, btnPrimary, btnSecondary } from "../ui";
import { C } from "../../theme";
import { rupiah } from "../../lib/helpers";
import { useBoard } from "./BoardContext";

// Grafik (recharts) baru diunduh saat dashboard benar-benar ditampilkan.
const DashboardCharts = lazy(() => import("../../DashboardCharts"));

export default function DashboardPanel() {
  const { avgMarginPct, followUpList, houses, marginPerTipe, printReportPDF, progressPerBlok, setFollowUpFilterActive, setSelectedId, setShowCharts, setShowRekapKontraktor, setShowSimulasi, showCharts, soldUnits, statusBreakdown, statusFields, tipeColor, tipePie, totalMargin, totalTarget } = useBoard();
  return (
    <>
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <div className="text-sm font-semibold" style={{ color: C.ink }}>Dashboard</div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowSimulasi(true)} className={BTN_PILL} style={btnSecondary}><Ic name="calculator" size={14} /> Simulasi Harga</button>
              <button onClick={() => setShowRekapKontraktor(true)} className={BTN_PILL} style={btnSecondary}><Ic name="hardhat" size={14} /> Rekap Kontraktor</button>
              <button onClick={printReportPDF} className={BTN_PILL} style={btnPrimary}><Ic name="printer" size={14} /> Print</button>
            </div>
          </div>

          {followUpList.length > 0 && (
            <div className="mb-2.5 p-2.5 rounded-2xl" style={{ background: C.alertAmberBg, boxShadow: C.cardShadow }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <IconChip name="clock" bg={C.chipAmberBg} color={C.amber} size={30} />
                  <div className="text-sm font-semibold" style={{ color: C.ink }}>Perlu Ditindaklanjuti ({followUpList.length})</div>
                </div>
                <button
                  onClick={() => { setFollowUpFilterActive(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: C.amber, color: "#fff" }}
                >Lihat di tabel →</button>
              </div>
              <div className="flex flex-col gap-1" style={{ paddingLeft: 42 }}>
                {followUpList.slice(0, 8).map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs">
                    <span onClick={() => setSelectedId(h.id)} style={{ color: C.ink, cursor: "pointer", textDecoration: "underline" }}>{h.blok}-{h.noKavling}</span>
                    <span style={{ color: h.overdue ? C.red : C.steel, fontFamily: "IBM Plex Mono, monospace" }}>
                      {h.overdue ? "Lewat tenggat — " : ""}{new Date(h.followUpDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
                {followUpList.length > 8 && <div className="text-xs" style={{ color: C.steel }}>+{followUpList.length - 8} lainnya</div>}
              </div>
            </div>
          )}
          <div className="mb-2.5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
            <KpiCard label="Kavling Terpetakan" value={`${houses.length} / ${totalTarget}`} pct={totalTarget ? (houses.length / totalTarget) * 100 : 0} color={C.accent} sub={totalTarget ? `${Math.round((houses.length / totalTarget) * 100)}% dari target` : null} />
            <KpiCard label="Sudah Terjual" value={`${soldUnits.length} / ${houses.length}`} pct={houses.length ? (soldUnits.length / houses.length) * 100 : 0} color={C.green} sub={houses.length ? `${Math.round((soldUnits.length / houses.length) * 100)}% terjual` : null} />
            <KpiCard label="Total Margin" value={rupiah(totalMargin)} color={avgMarginPct >= 20 ? C.green : C.red} />
            <KpiCard label="Rata-rata Margin" value={`${avgMarginPct.toFixed(2)}%`} color={avgMarginPct >= 20 ? C.green : C.red} sub="target minimal 20%" />
          </div>

          <div className="mb-2.5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 8 }}>
            <div className="p-2.5 rounded-xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
              <div className="text-xs font-semibold mb-2" style={{ color: C.ink }}>Progres Status</div>
              <div className="flex flex-col gap-2">
                {statusFields.filter((s) => s.key !== "terjual").map((s) => {
                  const n = houses.filter((h) => h.status[s.key]).length;
                  return (
                    <div key={s.key}>
                      <div className="flex items-center justify-between" style={{ fontSize: 11 }}>
                        <span style={{ color: C.steel }}>{s.label}</span>
                        <span style={{ color: C.ink, fontFamily: MONO }}>{n} / {houses.length}</span>
                      </div>
                      <ProgressBar pct={houses.length ? (n / houses.length) * 100 : 0} color={C.accent2} />
                    </div>
                  );
                })}
              </div>
            </div>
            {marginPerTipe.some((t) => t.n > 0) && (
              <div className="p-2.5 rounded-xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
                <div className="text-xs font-semibold mb-2" style={{ color: C.ink }}>Margin per Tipe</div>
                <div className="flex flex-col gap-1.5">
                  {marginPerTipe.filter((t) => t.n > 0).map((t) => (
                    <div key={t.tipe} className="flex items-center justify-between" style={{ fontSize: 12 }}>
                      <span className="flex items-center gap-1.5" style={{ color: C.ink }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: tipeColor(t.tipe), display: "inline-block" }} />
                        {t.tipe} <span style={{ color: C.steel, fontSize: 11 }}>· {t.n} unit</span>
                      </span>
                      <Pill color={t.margin >= 20 ? C.green : C.red}>{t.margin}%</Pill>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setShowCharts((v) => !v)} className="text-xs flex items-center gap-1.5 mb-2 font-medium" style={{ color: C.steel, background: "transparent", border: "none", padding: 0 }}>
            <Ic name="chart" size={14} /> Grafik {showCharts ? "▾" : "▸"}
          </button>
          {showCharts && (
            <Suspense fallback={<div style={{ minHeight: 150 }} />}>
              <DashboardCharts
                C={C}
                progressPerBlok={progressPerBlok}
                marginPerTipe={marginPerTipe}
                statusBreakdown={statusBreakdown}
                tipePie={tipePie}
                tipeColor={tipeColor}
              />
            </Suspense>
          )}
        </div>
    </>
  );
}
