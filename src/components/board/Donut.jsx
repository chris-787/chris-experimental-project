import { C } from "../../theme";
import { MONO } from "../ui";

// Diagram donat dengan sorotan saat kursor di atas potongan (atau baris legenda yang sama, lewat `hot`/`setHot`).
// Potongan yang disorot menebal, yang lain memudar, dan angka di tengah berganti jadi jumlah + persen potongan itu.
export default function Donut({ data, total, size, thickness, hot, setHot, valueSize = 16, labelSize = 10, label = "kavling" }) {
  const sum = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 47 - thickness / 2;
  let acc = 0;
  const hotItem = hot != null ? data[hot] : null;
  return (
    <div role="img" className="anim-sweep" aria-label="Diagram donat distribusi tipe kavling" style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
        <g transform="rotate(-90 50 50)">
          {data.map((d, i) => {
            const len = (d.value / sum) * 100;
            const start = acc;
            acc += len;
            const on = hot === i;
            return (
              <circle
                key={d.name} data-tip={`${d.name}|${d.value} unit · ${Math.round((d.value / sum) * 100)}%`} cx="50" cy="50" r={r} fill="none" stroke={d.color} pathLength="100"
                strokeWidth={on ? thickness + 4 : thickness} strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-start}
                style={{ opacity: hot != null && !on ? 0.32 : 1, transition: "stroke-width .18s ease, opacity .18s ease", cursor: "pointer" }}
                onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}
              />
            );
          })}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <span style={{ fontFamily: MONO, fontSize: valueSize, fontWeight: 500, color: C.ink, lineHeight: 1 }}>{hotItem ? hotItem.value : total}</span>
        <span style={{ fontSize: labelSize, color: C.steel, marginTop: 2 }}>{hotItem ? `${Math.round((hotItem.value / sum) * 100)}%` : label}</span>
      </div>
    </div>
  );
}
