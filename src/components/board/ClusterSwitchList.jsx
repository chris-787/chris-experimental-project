import { C } from "../../theme";
import { Ic, tint } from "../ui";
import { useBoard } from "./BoardContext";

// Daftar semua cluster untuk pindah cluster langsung (dipakai di sidebar desktop dan di judul halaman versi HP).
export default function ClusterSwitchList({ onClose, style }) {
  const { clusterStats, clusters, currentClusterId, goHome, houses, switchCluster, totalTarget } = useBoard();
  const list = (clusters || []).filter((c) => !c.archived || c.id === currentClusterId);
  return (
    <div role="listbox" aria-label="Pilih cluster" style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", background: C.panel, ...style }}>
      {list.map((c, i) => {
        const active = c.id === currentClusterId;
        const st = clusterStats && clusterStats[c.id];
        const sub = active ? `${houses.length} / ${totalTarget || "—"} kavling` : st ? `${st.total} / ${st.target || "—"} kavling` : (c.subtitle || "");
        return (
          <button key={c.id} role="option" aria-selected={active} onClick={() => { onClose(); switchCluster(c.id); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", minHeight: 44, border: "none", borderTop: i ? `1px solid ${C.line}` : "none", background: active ? tint(C.data, 14) : "transparent", color: active ? C.data : C.ink, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: c.color || C.steel, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || "—"}</span>
              {sub && <span style={{ display: "block", fontSize: 11, color: C.steel }}>{sub}</span>}
            </span>
            {active && <Ic name="checkCircle" size={14} />}
          </button>
        );
      })}
      <button onClick={() => { onClose(); goHome(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", minHeight: 44, border: "none", borderTop: `1px solid ${C.line}`, background: "transparent", color: C.steel, cursor: "pointer", fontSize: 12, textAlign: "left", fontFamily: "inherit" }}>
        <Ic name="home" size={14} />Semua cluster (Home)
      </button>
    </div>
  );
}
