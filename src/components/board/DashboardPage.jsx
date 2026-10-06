import { useMemo, useState } from "react";
import { BTN_PILL, Ic, MONO, Pill, SectionHead, btnPrimary, btnSecondary, tint } from "../ui";
import { C } from "../../theme";
import { MONTH_LABELS, WEEKDAY_LABELS, buildCalendarGrid, rupiah } from "../../lib/helpers";
import { statusColor } from "../../lib/palette";
import KpiStrip, { KPI_COLORS, KpiBox } from "./KpiStrip";
import { useBoard } from "./BoardContext";

const TABS = [
  { key: "ringkasan", label: "Ringkasan" },
  { key: "kontraktor", label: "Kontraktor" },
  { key: "margin", label: "Margin dan Harga" },
  { key: "tindak", label: "Tindak lanjut" },
];

const pillBtn = { height: 36, padding: "0 18px", borderRadius: 999, fontWeight: 600, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit" };
const card = { background: C.panel, boxShadow: C.cardShadow, borderRadius: 16, padding: 16 };

function Bar({ pct, color, h = 26, i = 0 }) {
  return (
    <div style={{ height: h, borderRadius: 8, background: C.paper, overflow: "hidden" }}>
      <div className="anim-x" style={{ "--i": i, width: `${Math.max(0, Math.min(100, pct))}%`, minWidth: pct > 0 ? 4 : 0, height: "100%", background: color, borderRadius: 8 }} />
    </div>
  );
}

function Ringkasan() {
  const { blockColor, houses, marginPerTipe, progressPerBlok, statusFields, tipeColor, tipePie, totalTarget } = useBoard();
  const rows = statusFields.map((s) => ({ key: s.key, label: s.label, n: houses.filter((h) => h.status[s.key]).length }));
  const firstEmpty = rows.find((r) => r.key !== "terjual" && r.n === 0);
  const margins = marginPerTipe.filter((t) => t.n > 0);
  const mTop = Math.max(30, ...margins.map((t) => t.margin));
  const CH = 150; // tinggi area batang (px)
  const maxBlok = Math.max(1, ...progressPerBlok.map((b) => b.Terpetakan + b.Target));
  const totalPie = tipePie.reduce((sum, d) => sum + d.value, 0) || 1;
  let acc = 0;
  const conic = tipePie.map((d) => { const from = (acc / totalPie) * 100; acc += d.value; return `${tipeColor(d.name)} ${from}% ${(acc / totalPie) * 100}%`; }).join(", ");
  const colTop = (barH) => ({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 5, height: "100%", flex: 1, minWidth: 0 });
  return (
    <>
      <KpiStrip />
      <div className="dash-two mb-3">
        <div style={{ ...card, minWidth: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3.5">
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Alur status kavling</div>
            {firstEmpty && houses.length > 0 && <Pill color={C.data}>{houses.length} kavling menunggu {firstEmpty.label}</Pill>}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="dash-row">
              <span className="text-xs flex items-center gap-1.5" style={{ color: C.ink }}><i style={{ width: 8, height: 8, borderRadius: 3, background: C.data, display: "inline-block" }} />Terpetakan</span>
              <Bar pct={totalTarget ? (houses.length / totalTarget) * 100 : 0} color={C.data} />
              <span className="text-xs" style={{ fontFamily: MONO, textAlign: "right" }}>{houses.length} / {totalTarget}</span>
            </div>
            {rows.map((r, i) => (
              <div key={r.key} className="dash-row">
                <span className="text-xs flex items-center gap-1.5" style={{ color: C.ink }}><i style={{ width: 8, height: 8, borderRadius: 3, background: statusColor(i), display: "inline-block" }} />{r.label}</span>
                <Bar pct={houses.length ? (r.n / houses.length) * 100 : 0} color={statusColor(i)} i={i} />
                <span className="text-xs" style={{ fontFamily: MONO, textAlign: "right", color: r.n ? C.ink : C.steel }}>{r.n} / {houses.length}</span>
              </div>
            ))}
          </div>
          <div className="text-xs mt-3" style={{ color: C.steel }}>Tiap baris menghitung kavling yang sudah mencapai status itu. Status tidak harus berurutan.</div>
        </div>

        <div style={{ ...card, minWidth: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Margin per Tipe</div>
            <span className="text-xs" style={{ color: C.steel }}>garis putus = target 20%</span>
          </div>
          {margins.length === 0 ? (
            <div className="text-xs" style={{ color: C.steel }}>Belum ada kavling dengan Luas Bangunan tipe yang terisi.</div>
          ) : (
            <>
              <div style={{ position: "relative", height: CH + 28, display: "flex", alignItems: "flex-end", gap: 14, padding: "0 6px", borderBottom: `1px solid ${C.line}` }}>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: (20 / mTop) * CH, borderTop: `1.5px dashed ${C.steel}` }} />
                {margins.map((t, mi) => (
                  <div key={t.tipe} style={colTop()}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.margin >= 20 ? C.ink : C.red }}>{t.margin}%</span>
                    <div className="anim-y" style={{ "--i": mi, width: "100%", maxWidth: 44, height: Math.max(3, (Math.max(0, t.margin) / mTop) * CH), borderRadius: "8px 8px 0 0", background: tipeColor(t.tipe), opacity: t.margin > 0 ? 1 : 0.5 }} />
                  </div>
                ))}
              </div>
              <div className="flex" style={{ gap: 14, padding: "6px 6px 0", fontSize: 11, color: C.steel }}>
                {margins.map((t) => <span key={t.tipe} style={{ flex: 1, textAlign: "center", minWidth: 0 }}>{t.tipe}</span>)}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="dash-two">
        <div style={{ ...card, minWidth: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Kavling terpetakan per blok</div>
            <div className="flex items-center gap-3 text-xs" style={{ color: C.steel }}>
              <span className="flex items-center gap-1.5"><i style={{ width: 10, height: 10, borderRadius: 3, background: C.steel, display: "inline-block" }} />Terpetakan (warna blok)</span>
              <span className="flex items-center gap-1.5"><i style={{ width: 10, height: 10, borderRadius: 3, background: tint(C.steel, 22), display: "inline-block" }} />Target (sisa)</span>
            </div>
          </div>
          <div style={{ height: CH + 34, display: "flex", alignItems: "flex-end", gap: 8, borderBottom: `1px solid ${C.line}` }}>
            {progressPerBlok.map((b, bi) => {
              const tgt = b.Terpetakan + b.Target;
              return (
                <div key={b.blok} style={colTop()} title={`${b.blok}: ${b.Terpetakan} terpetakan dari target ${tgt}`}>
                  <span style={{ fontSize: 11, color: C.steel, whiteSpace: "nowrap" }}><b style={{ color: b.Terpetakan ? C.ink : C.steel, fontWeight: 600 }}>{b.Terpetakan}</b>/{tgt}</span>
                  <div className="anim-y" style={{ "--i": bi, width: "100%", maxWidth: 40, height: Math.max(4, (tgt / maxBlok) * CH), borderRadius: "6px 6px 0 0", background: tint(blockColor(b.blok), 18), position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${tgt ? (b.Terpetakan / tgt) * 100 : 0}%`, background: blockColor(b.blok) }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex" style={{ gap: 8, paddingTop: 6, fontSize: 11, color: C.steel }}>
            {progressPerBlok.map((b) => <span key={b.blok} style={{ flex: 1, textAlign: "center", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.blok}</span>)}
          </div>
        </div>

        <div style={{ ...card, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Distribusi tipe kavling</div>
          {tipePie.length === 0 ? <div className="text-xs" style={{ color: C.steel }}>Belum ada kavling.</div> : (
            <div className="flex items-center gap-5 flex-wrap">
              <div role="img" className="anim-sweep" aria-label="Diagram donat distribusi tipe kavling" style={{ width: 150, height: 150, borderRadius: "50%", background: `conic-gradient(${conic})`, position: "relative", flexShrink: 0 }}>
                <div style={{ position: "absolute", inset: 34, borderRadius: "50%", background: C.panel, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: MONO, fontSize: 19, fontWeight: 500, color: C.ink }}>{houses.length}</span>
                  <span style={{ fontSize: 11, color: C.steel }}>kavling</span>
                </div>
              </div>
              <div className="flex flex-col gap-2" style={{ fontSize: 12 }}>
                {tipePie.map((d) => (
                  <span key={d.name} className="flex items-center gap-2" style={{ color: C.ink }}>
                    <i style={{ width: 12, height: 12, borderRadius: 3, background: tipeColor(d.name), display: "inline-block" }} />{d.name} <span style={{ color: C.steel }}>· {d.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Kontraktor() {
  const { houses, hppTotal, kontraktorLegend, statusFields, setShowRekapKontraktor } = useBoard();
  const colorOf = useMemo(() => new Map(kontraktorLegend.map((k) => [k.label, k.color])), [kontraktorLegend]);
  const rows = useMemo(() => {
    const map = {};
    houses.forEach((h) => {
      const nama = (h.kontraktor || "").trim() || "(belum diisi)";
      if (!map[nama]) map[nama] = { nama, unit: 0, hpp: 0, st: {} };
      map[nama].unit += 1;
      map[nama].hpp += hppTotal(h);
      statusFields.forEach((s) => { if (h.status[s.key]) map[nama].st[s.key] = (map[nama].st[s.key] || 0) + 1; });
    });
    return Object.values(map).sort((a, b) => b.unit - a.unit);
  }, [houses, statusFields]);
  const named = rows.filter((r) => r.nama !== "(belum diisi)").length;
  const maxUnit = Math.max(1, ...rows.map((r) => r.unit));
  return (
    <>
      <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <KpiBox color={KPI_COLORS.mapped} icon="hardhat" label="Jumlah kontraktor"><div style={{ fontFamily: MONO, fontSize: 20, marginTop: 8, color: C.ink }}>{named}</div></KpiBox>
        <KpiBox color={KPI_COLORS.sold} icon="checkCircle" label="Kavling punya kontraktor"><div style={{ fontFamily: MONO, fontSize: 20, marginTop: 8, color: C.ink }}>{houses.filter((h) => (h.kontraktor || "").trim()).length} <span style={{ fontSize: 16, color: C.steel }}>/ {houses.length}</span></div></KpiBox>
        <KpiBox color={KPI_COLORS.margin} icon="wallet" label="Total HPP"><div style={{ fontFamily: MONO, fontSize: 17, marginTop: 10, color: C.ink }}>{rupiah(rows.reduce((s, r) => s + r.hpp, 0))}</div></KpiBox>
      </div>
      <div className="dash-two">
        <div style={{ ...card, minWidth: 0 }}>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="text-sm font-semibold" style={{ color: C.ink }}>Rekap Kontraktor</div>
            <button onClick={() => setShowRekapKontraktor(true)} className={BTN_PILL} style={btnSecondary}><Ic name="hardhat" size={14} /> Lihat sebagai pop-up</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.steel, textAlign: "left" }}>
                  <th style={{ padding: "8px 10px", fontWeight: 600 }}>Kontraktor</th>
                  <th style={{ padding: "8px 10px", fontWeight: 600 }}>Unit</th>
                  <th style={{ padding: "8px 10px", fontWeight: 600 }}>Total HPP</th>
                  {statusFields.map((s) => <th key={s.key} style={{ padding: "8px 10px", fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.nama} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td style={{ padding: "9px 10px", fontWeight: 600, whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: colorOf.get(r.nama) || C.faint, marginRight: 8 }} />{r.nama}
                    </td>
                    <td style={{ padding: "9px 10px", fontFamily: MONO }}>{r.unit}</td>
                    <td style={{ padding: "9px 10px", fontFamily: MONO, whiteSpace: "nowrap" }}>{rupiah(r.hpp)}</td>
                    {statusFields.map((s) => {
                      const n = r.st[s.key] || 0;
                      return <td key={s.key} style={{ padding: "9px 10px", fontFamily: MONO, whiteSpace: "nowrap", color: n ? C.green : C.steel, fontWeight: n ? 600 : 400 }}>{n} / {r.unit}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs mt-3" style={{ color: C.steel }}>Dikelompokkan dari teks di kolom Kontraktor. Nama yang ditulis beda sedikit, mis. "PT Jaya" dan "PT. Jaya", muncul sebagai baris terpisah.</div>
        </div>
        <div style={{ ...card, minWidth: 0 }}>
          <div className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Unit per kontraktor</div>
          <div className="flex flex-col gap-2.5">
            {rows.map((r, ri) => (
              <div key={r.nama} className="dash-row-s">
                <span className="text-xs" style={{ color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.nama}>{r.nama}</span>
                <Bar pct={(r.unit / maxUnit) * 100} color={colorOf.get(r.nama) || C.faint} h={22} i={ri} />
                <span className="text-xs" style={{ fontFamily: MONO, textAlign: "right" }}>{r.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MarginHarga() {
  const { avgMarginPct, marginPerTipe, setShowSimulasi, tipeColor, totalMargin } = useBoard();
  const list = marginPerTipe.filter((t) => t.n > 0);
  const top = Math.max(30, ...list.map((t) => t.margin));
  return (
    <>
      <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <KpiBox color={KPI_COLORS.margin} icon="wallet" label="Total Margin">
          <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 500, marginTop: 10, color: C.ink, whiteSpace: "nowrap" }}>{rupiah(totalMargin)}</div>
        </KpiBox>
        <KpiBox color={KPI_COLORS.avg} icon="percent" label="Rata-rata Margin">
          <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 500, marginTop: 6, color: avgMarginPct >= 20 ? C.green : C.red }}>{avgMarginPct.toFixed(2)}%</div>
          <div className="text-xs" style={{ color: C.steel, marginTop: 4 }}>target minimal 20%</div>
        </KpiBox>
        <div style={{ ...card, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10 }}>
          <SectionHead icon="calculator" color={C.accent} title="Simulasi Harga" />
          <div className="text-xs" style={{ color: C.steel, marginTop: -4, lineHeight: 1.5 }}>Coba ubah harga jual atau HPP untuk melihat dampaknya ke margin sebelum diputuskan.</div>
          <button onClick={() => setShowSimulasi(true)} className={BTN_PILL} style={{ ...btnPrimary, justifyContent: "center", height: 34, width: "100%" }}><Ic name="calculator" size={14} /> Buka Simulasi Harga</button>
        </div>
      </div>
      <div style={card}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-sm font-semibold" style={{ color: C.ink }}>Margin per Tipe</div>
          <span className="text-xs" style={{ color: C.steel }}>garis putus = target 20%</span>
        </div>
        {list.length === 0 ? <div className="text-xs" style={{ color: C.steel }}>Belum ada kavling dengan Luas Bangunan tipe yang terisi.</div> : (
          <div className="flex flex-col gap-3">
            {list.map((t, idx) => (
              <div key={t.tipe} className="dash-row">
                <span className="text-xs flex items-center gap-1.5" style={{ color: C.ink }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: tipeColor(t.tipe), display: "inline-block" }} />{t.tipe} <span style={{ color: C.steel }}>· {t.n} unit</span>
                </span>
                <div style={{ position: "relative" }}>
                  <Bar pct={(Math.max(0, t.margin) / top) * 100} color={tipeColor(t.tipe)} i={idx} />
                  <div style={{ position: "absolute", top: -2, bottom: -2, left: `${(20 / top) * 100}%`, borderLeft: `2px dashed ${C.steel}` }} />
                </div>
                <span className="text-xs" style={{ fontFamily: MONO, textAlign: "right", color: t.margin >= 20 ? C.green : C.red, fontWeight: 600 }}>{t.margin}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TindakLanjut() {
  const { goMode, houses, setSelectedId } = useBoard();
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const [cal, setCal] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [picked, setPicked] = useState(null);
  const all = useMemo(() => houses.filter((h) => h.followUpDate).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate)), [houses]);
  const byDate = useMemo(() => { const m = {}; all.forEach((h) => { (m[h.followUpDate] = m[h.followUpDate] || []).push(h); }); return m; }, [all]);
  const cells = buildCalendarGrid(cal.y, cal.m);
  const list = picked ? (byDate[picked] || []) : all;
  const overdueCount = all.filter((h) => h.followUpDate < today).length;
  const open = (h) => { setSelectedId(h.id); goMode("kerja"); };
  const navBtn = { width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.ink, cursor: "pointer", fontSize: 14, lineHeight: 1 };
  return (
    <div className="dash-cal">
      <div style={card}>
        <SectionHead icon="calendar" color={C.amber} title="Kalender follow-up" />
        <div className="flex items-center justify-between mb-2.5">
          <button aria-label="Bulan sebelumnya" onClick={() => setCal((c) => { const d = new Date(c.y, c.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })} style={navBtn}>&lsaquo;</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{MONTH_LABELS[cal.m]} {cal.y}</span>
          <button aria-label="Bulan berikutnya" onClick={() => setCal((c) => { const d = new Date(c.y, c.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })} style={navBtn}>&rsaquo;</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
          {WEEKDAY_LABELS.map((wd) => <div key={wd} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: C.steel, paddingBottom: 3 }}>{wd}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} style={{ height: 38 }} />;
            const items = byDate[d] || [];
            const overdue = items.length > 0 && d < today;
            const isToday = d === today;
            const sel = d === picked;
            const dot = overdue ? C.red : C.amber;
            return (
              <button
                key={d}
                onClick={() => setPicked(sel ? null : d)}
                aria-label={`${d}${items.length ? `, ${items.length} follow-up` : ""}`}
                style={{ height: 38, borderRadius: 10, border: isToday ? `1.5px solid ${C.select}` : "1.5px solid transparent", background: sel ? C.select : items.length ? tint(dot, 14) : "transparent", color: sel ? C.selectInk : C.ink, fontSize: 12, fontWeight: items.length ? 700 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}
              >
                <span>{Number(d.slice(-2))}</span>
                {items.length > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: sel ? C.selectInk : dot }} />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 flex-wrap text-xs mt-3" style={{ color: C.steel }}>
          <span className="flex items-center gap-1.5"><i style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, display: "inline-block" }} />Lewat tenggat</span>
          <span className="flex items-center gap-1.5"><i style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber, display: "inline-block" }} />Akan datang</span>
        </div>
      </div>

      <div style={{ ...card, minWidth: 0 }}>
        <SectionHead
          icon="calendar" color={C.amber} title={picked ? new Date(picked).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Perlu ditindaklanjuti"} count={list.length}
          right={picked ? <button onClick={() => setPicked(null)} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ border: `1px solid ${C.line}`, background: C.panel, color: C.ink }}>Tampilkan semua</button> : (overdueCount > 0 ? <Pill color={C.red}>{overdueCount} lewat tenggat</Pill> : null)}
        />
        {list.length === 0 ? (
          <div className="text-xs" style={{ color: C.steel }}>{picked ? "Tidak ada follow-up di tanggal ini." : "Belum ada follow-up terjadwal. Isi tanggal follow-up di detail kavling, lalu muncul di sini."}</div>
        ) : (
          <div className="flex flex-col">
            {list.map((h) => {
              const od = h.followUpDate < today;
              return (
                <button
                  key={h.id}
                  onClick={() => open(h)}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm w-full"
                  style={{ borderTop: `1px solid ${C.line}`, borderLeft: "none", borderRight: "none", borderBottom: "none", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit", color: C.ink }}
                >
                  <span className="flex items-center gap-2" style={{ minWidth: 0 }}>
                    <i style={{ width: 4, height: 28, borderRadius: 4, background: od ? C.red : C.amber, flexShrink: 0 }} />
                    <span>
                      <span style={{ fontFamily: MONO, fontWeight: 600 }}>{h.blok}-{h.noKavling}</span>
                      <span style={{ display: "block", fontSize: 11, color: C.steel }}>{h.tipe}{h.kontraktor ? ` · ${h.kontraktor}` : ""}</span>
                    </span>
                  </span>
                  <span className="text-xs" style={{ color: od ? C.red : C.steel, fontFamily: MONO, flexShrink: 0 }}>
                    {od ? "Lewat — " : ""}{new Date(h.followUpDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { dashTab, setDashTab, printReportPDF, setShowSimulasi } = useBoard();
  const tab = TABS.some((t) => t.key === dashTab) ? dashTab : "ringkasan";
  return (
    <div className="viz">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="flex-1" style={{ minWidth: 200 }}>
          <div className="text-sm" style={{ color: C.steel }}>Ringkasan semua kavling terpetakan</div>
        </div>
        <button onClick={() => setShowSimulasi(true)} style={{ ...pillBtn, background: C.panel, color: C.ink, border: `1px solid ${C.line}` }}><Ic name="calculator" size={15} /> Simulasi Harga</button>
        <button onClick={printReportPDF} style={{ ...pillBtn, background: C.accent, color: "#fff", border: "1px solid transparent" }}><Ic name="printer" size={15} /> Print Laporan</button>
      </div>
      <div role="tablist" aria-label="Bagian dashboard" className="dash-tabs mb-3" style={{ display: "flex", gap: 4, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 999, padding: 4, width: "fit-content", maxWidth: "100%", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setDashTab(t.key)}
            style={{ height: 32, padding: "0 16px", flexShrink: 0, whiteSpace: "nowrap", borderRadius: 999, border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: tab === t.key ? C.select : "transparent", color: tab === t.key ? C.selectInk : C.steel }}
          >{t.label}</button>
        ))}
      </div>
      {tab === "ringkasan" && <Ringkasan />}
      {tab === "kontraktor" && <Kontraktor />}
      {tab === "margin" && <MarginHarga />}
      {tab === "tindak" && <TindakLanjut />}
    </div>
  );
}
