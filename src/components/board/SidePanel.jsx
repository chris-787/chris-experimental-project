import { IconChip, MONO, Pill, ProgressBar } from "../ui";
import { C } from "../../theme";
import { useBoard } from "./BoardContext";

// Panel ringkas di samping peta (Main Mode): follow-up, progres status, margin per tipe.
// Grafik lengkap dan rekap ada di halaman Dashboard.
export default function SidePanel() {
  const { followUpList, houses, marginPerTipe, setFollowUpFilterActive, setSelectedId, statusFields, tipeColor } = useBoard();
  return (
    <div className="flex flex-col gap-2.5">
      {followUpList.length > 0 && (
        <div className="p-2.5 rounded-2xl" style={{ background: C.alertAmberBg, boxShadow: C.cardShadow }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <IconChip name="clock" bg={C.chipAmberBg} color={C.amber} size={30} />
              <div className="text-sm font-semibold" style={{ color: C.ink }}>Perlu Ditindaklanjuti ({followUpList.length})</div>
            </div>
            <button
              onClick={() => { setFollowUpFilterActive(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: C.amber, color: "#fff", border: "none" }}
            >Lihat di tabel →</button>
          </div>
          <div className="flex flex-col gap-1" style={{ paddingLeft: 42 }}>
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

      <div className="p-3 rounded-xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
        <div className="text-sm font-semibold mb-2.5" style={{ color: C.ink }}>Progres Status</div>
        <div className="flex flex-col gap-2.5">
          {statusFields.filter((s) => s.key !== "terjual").map((s) => {
            const n = houses.filter((h) => h.status[s.key]).length;
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                  <span style={{ color: C.ink }}>{s.label}</span>
                  <span style={{ color: C.steel, fontFamily: MONO }}>{n} / {houses.length}</span>
                </div>
                <ProgressBar pct={houses.length ? (n / houses.length) * 100 : 0} color={C.green} />
              </div>
            );
          })}
        </div>
      </div>

      {marginPerTipe.some((t) => t.n > 0) && (
        <div className="p-3 rounded-xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
          <div className="text-sm font-semibold mb-2" style={{ color: C.ink }}>Margin per Tipe</div>
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
    </div>
  );
}
