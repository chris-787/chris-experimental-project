import { MONO, Pill, SectionHead, tint } from "../ui";
import { C } from "../../theme";
import { statusColor } from "../../lib/palette";
import { useState } from "react";
import Donut from "./Donut";
import { useBoard } from "./BoardContext";

// Panel samping peta (Main Mode): ringkasan cepat yang berwarna. Grafik besar
// dan rekap lengkap ada di halaman Dashboard.
const card = { background: C.panel, boxShadow: C.cardShadow, borderRadius: 16, padding: 14 };
const title = { fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 10 };

function Bar({ pct, color, i = 0 }) {
  return (
    <div style={{ height: 6, borderRadius: 6, background: tint(color, 16), overflow: "hidden", marginTop: 5 }}>
      <div className="anim-x" style={{ "--i": i, width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", borderRadius: 6, background: color }} />
    </div>
  );
}

export default function SidePanel() {
  const { followUpList, houses, kontraktorLegend, marginPerTipe, setFollowUpFilterActive, setSelectedId, statusFields, tipeColor, tipePie } = useBoard();
  const [hotTipe, setHotTipe] = useState(null);
  const maxK = Math.max(1, ...kontraktorLegend.map((k) => k.count));
  return (
    <div className="flex flex-col gap-3 viz">
      {followUpList.length > 0 && (
        <div style={{ ...card, background: C.alertAmberBg }}>
          <SectionHead
            icon="calendar" color={C.amber} title="Perlu Ditindaklanjuti" count={followUpList.length}
            right={<button onClick={() => { setFollowUpFilterActive(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: C.amber, color: "#fff", border: "none" }}>Lihat di tabel →</button>}
          />
          <div className="flex flex-col gap-1">
            {followUpList.slice(0, 6).map((h) => (
              <div key={h.id} className="flex items-center justify-between text-xs">
                <span onClick={() => setSelectedId(h.id)} style={{ color: C.ink, cursor: "pointer", textDecoration: "underline" }}>{h.blok}-{h.noKavling}</span>
                <span style={{ color: h.overdue ? C.red : C.steel, fontFamily: "IBM Plex Mono, monospace" }}>
                  {h.overdue ? "Lewat tenggat — " : ""}{new Date(h.followUpDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
            {followUpList.length > 6 && <div className="text-xs" style={{ color: C.steel }}>+{followUpList.length - 6} lainnya</div>}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
      <div style={card}>
          <div style={title}>Distribusi tipe</div>
          <div className="flex flex-col items-center gap-3">
            <Donut data={tipePie.map((d) => ({ name: d.name, value: d.value, color: tipeColor(d.name) }))} total={houses.length} size={132} thickness={19} hot={hotTipe} setHot={setHotTipe} valueSize={20} labelSize={10} />
            <div className="flex flex-col gap-1.5 hl-group" style={{ fontSize: 12, minWidth: 0, alignSelf: "stretch" }}>
              {tipePie.map((d, di) => (
                <span key={d.name} data-tip={`${d.name}|${d.value} unit`} className={`flex items-center gap-1.5 hl-row${hotTipe === di ? " hl-on" : ""}`} onMouseEnter={() => setHotTipe(di)} onMouseLeave={() => setHotTipe(null)} style={{ color: C.ink }}>
                  <i style={{ width: 9, height: 9, borderRadius: 3, background: tipeColor(d.name), display: "inline-block", flexShrink: 0 }} />{d.name} <span style={{ color: C.steel }}>· {d.value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>


      <div style={card}>
        <div style={title}>Progres Status</div>
        <div className="flex flex-col gap-2.5">
          {statusFields.filter((s) => s.key !== "terjual").map((s) => {
            const n = houses.filter((h) => h.status[s.key]).length;
            const col = statusColor(statusFields.findIndex((x) => x.key === s.key));
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                  <span className="flex items-center gap-1.5" style={{ color: C.ink }}><i style={{ width: 8, height: 8, borderRadius: 3, background: col, display: "inline-block" }} />{s.label}</span>
                  <span style={{ color: C.steel, fontFamily: MONO }}>{n} / {houses.length}</span>
                </div>
                <Bar pct={houses.length ? (n / houses.length) * 100 : 0} color={col} i={statusFields.findIndex((x) => x.key === s.key)} />
              </div>
            );
          })}
        </div>
      </div>

      </div>

      {marginPerTipe.some((t) => t.n > 0) && (
        <div style={card}>
          <div style={title}>Margin per Tipe</div>
          <div className="flex flex-col">
            {marginPerTipe.filter((t) => t.n > 0).map((t) => (
              <div key={t.tipe} className="flex items-center justify-between py-1.5" style={{ fontSize: 12, borderTop: `1px solid ${C.line}` }}>
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

      {kontraktorLegend.length > 0 && (
        <div style={card}>
          <div style={title}>Kontraktor</div>
          <div className="flex flex-col gap-2.5">
            {kontraktorLegend.map((k, ki) => (
              <div key={k.label}>
                <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                  <span className="flex items-center gap-1.5" style={{ color: C.ink, minWidth: 0 }}>
                    <i style={{ width: 9, height: 9, borderRadius: 3, background: k.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={k.label}>{k.label}</span>
                  </span>
                  <span style={{ color: C.steel, fontFamily: MONO, flexShrink: 0, marginLeft: 8 }}>{k.count} unit</span>
                </div>
                <Bar pct={(k.count / maxK) * 100} color={k.color} i={ki} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
