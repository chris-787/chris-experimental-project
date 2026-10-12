import { useEffect, useRef, useState } from "react";
import { C } from "../../theme";
import { BrandMark, Ic, tint } from "../ui";
import { timeAgo } from "../../lib/calc";
import { JAKARTA_TZ, timeFormatter, useJakartaClock } from "../../lib/jakartaClock";
import { SlideInd, useSlideIndicator } from "../slide";
import { Collapse } from "../anim";
import { useBoard } from "./BoardContext";

// Menu kiri (desktop) / bar menu bawah (HP). Bisa dilipat jadi ikon saja.
const ITEMS = [
  { key: "home", label: "Home", icon: "home" },
  { key: "kerja", label: "Main Mode", icon: "map" },
  { key: "data", label: "Data Mode", icon: "table" },
  { key: "dashboard", label: "Dashboard", icon: "chart" },
  { key: "pengaturan", label: "Settings", icon: "sliders" },
];

const sideDate = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: JAKARTA_TZ });

// Jam WIB di sidebar. Komponen sendiri supaya detak tiap detik tidak me-render ulang halaman.
function SideClock({ collapsed }) {
  const now = useJakartaClock();
  const time = timeFormatter.format(now);
  if (collapsed) {
    return <div title={`${sideDate.format(now)} ${time} WIB`} style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.steel, textAlign: "center", lineHeight: 1.15 }}>
      <div style={{ fontSize: 11 }}>{time.slice(0, 5)}</div>
      <div style={{ fontSize: 9, color: C.faint }}>{time.slice(5)}</div>
    </div>;
  }
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "9px 12px" }}>
      <div className="flex items-baseline gap-1.5">
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 17, fontWeight: 500, color: C.ink, letterSpacing: "-0.3px" }}>{time}</span>
        <span style={{ fontSize: 11, color: C.steel, fontWeight: 600 }}>WIB</span>
      </div>
      <div style={{ fontSize: 11, color: C.steel, marginTop: 1 }}>{sideDate.format(now)}</div>
    </div>
  );
}

export default function Sidebar() {
  const { activeCluster, blocks, canEdit, clusterStats, clusters, currentClusterId, displayName, goHome, goMode, houses, switchCluster, handleLogoutClick, lastBackupAt, mode, sidebarCollapsed, toggleSidebar, totalTarget } = useBoard();
  const [clOpen, setClOpen] = useState(false);
  const clRef = useRef(null);
  useEffect(() => {
    if (!clOpen) return undefined;
    const onDown = (e) => { if (clRef.current && !clRef.current.contains(e.target)) setClOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setClOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [clOpen]);
  const otherClusters = (clusters || []).filter((c) => !c.archived || c.id === currentClusterId);
  const initials = (displayName || "?").slice(0, 2).toUpperCase();
  // Latar menu aktif bergeser halus antar menu (lihat slide.jsx).
  const [menuRef, menuBox] = useSlideIndicator([mode, sidebarCollapsed]);
  return (
    <nav className={`app-side ${sidebarCollapsed ? "collapsed" : ""}`} aria-label="Menu utama">
      <div className="side-extra flex items-center gap-2.5" style={{ width: "100%", justifyContent: sidebarCollapsed ? "center" : "flex-start", flexDirection: sidebarCollapsed ? "column" : "row" }}>
        <BrandMark size={34} />
        <div className="side-hide-collapsed" style={{ lineHeight: 1.15, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>Chris Project</div>
          <div style={{ fontSize: 12, color: C.steel }}>Version 2.0</div>
        </div>
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Lebarkan sidebar" : "Lipat sidebar"}
          title={sidebarCollapsed ? "Lebarkan sidebar" : "Lipat sidebar"}
          style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${C.line}`, background: "transparent", color: C.steel, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <Ic name={sidebarCollapsed ? "chevR" : "back"} size={14} />
        </button>
      </div>

      <div className="side-menu slide-host" role="list" ref={menuRef}>
        <SlideInd box={menuBox} radius={10} cls="side-ind" />
        <div className="side-extra side-hide-collapsed" style={{ fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: C.steel, padding: "0 .75rem .35rem" }}>Menu</div>
        {ITEMS.map((it) => {
          const active = it.key === mode;
          return (
            <button
              key={it.key}
              role="listitem"
              className="side-item"
              data-slide-active={active ? "true" : undefined}
              aria-current={active ? "page" : undefined}
              aria-label={it.label}
              title={it.label}
              onClick={() => (it.key === "home" ? goHome() : goMode(it.key))}
            >
              <Ic name={it.icon} size={18} />
              <span className="side-label">{it.label}</span>
            </button>
          );
        })}
      </div>

      <div className="side-extra side-hide-collapsed" style={{ width: "100%" }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: C.steel, padding: "0 .75rem .4rem" }}>Cluster aktif</div>
        <div ref={clRef}>
          <button onClick={() => setClOpen((v) => !v)} aria-expanded={clOpen} aria-haspopup="listbox" title="Ganti cluster" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textAlign: "left", border: `1px solid ${clOpen ? C.data : C.line}`, background: "transparent", color: C.ink, borderRadius: 12, padding: "8px 10px", cursor: "pointer", minHeight: 44, fontFamily: "inherit", transition: "border-color .2s ease" }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeCluster.name || "—"}</span>
              <span style={{ display: "block", fontSize: 11, color: C.steel }}>{totalTarget} unit target · {blocks.length} blok</span>
            </span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color: C.steel, transition: "transform .3s cubic-bezier(.3,.8,.2,1)", transform: clOpen ? "rotate(180deg)" : "none" }}><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <Collapse open={clOpen}>
            <div role="listbox" aria-label="Pilih cluster" style={{ border: `1px solid ${C.line}`, borderRadius: 12, marginTop: 6, overflow: "hidden", background: C.panel }}>
              {otherClusters.map((c, i) => {
                const active = c.id === currentClusterId;
                const st = clusterStats && clusterStats[c.id];
                const sub = active ? `${houses.length} / ${totalTarget || "—"} kavling` : st ? `${st.total} / ${st.target || "—"} kavling` : (c.subtitle || "");
                return (
                  <button key={c.id} role="option" aria-selected={active} onClick={() => { setClOpen(false); switchCluster(c.id); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "none", borderTop: i ? `1px solid ${C.line}` : "none", background: active ? tint(C.data, 14) : "transparent", color: active ? C.data : C.ink, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: c.color || C.steel, flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || "—"}</span>
                      {sub && <span style={{ display: "block", fontSize: 11, color: C.steel }}>{sub}</span>}
                    </span>
                    {active && <Ic name="checkCircle" size={14} />}
                  </button>
                );
              })}
              <button onClick={() => { setClOpen(false); goHome(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "none", borderTop: `1px solid ${C.line}`, background: "transparent", color: C.steel, cursor: "pointer", fontSize: 12, textAlign: "left", fontFamily: "inherit" }}>
                <Ic name="home" size={14} />Semua cluster (Home)
              </button>
            </div>
          </Collapse>
        </div>
      </div>

      <div className="side-extra" style={{ marginTop: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 10, alignItems: sidebarCollapsed ? "center" : "stretch" }}>
        <SideClock collapsed={sidebarCollapsed} />
        <div className="side-hide-collapsed" style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, fontSize: 12, lineHeight: 1.5, color: C.steel }}>
          <span style={{ display: "block", color: C.ink, fontWeight: 600, marginBottom: 2 }}>Backup terakhir</span>
          {lastBackupAt ? timeAgo(lastBackupAt) : "Belum pernah. Backup hanya tersimpan saat Anda menekan tombol di Home."}
        </div>
        <div className="flex items-center gap-2.5" style={{ padding: "2px 4px", flexDirection: sidebarCollapsed ? "column" : "row" }}>
          <div title={canEdit ? "Admin" : "View Mode"} style={{ width: 30, height: 30, borderRadius: "50%", background: C.pillFill, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{initials}</div>
          <div className="side-hide-collapsed" style={{ lineHeight: 1.25, flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: C.ink, fontSize: 13 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: C.steel }}>{canEdit ? "Admin" : "View Mode"}</div>
          </div>
          <button onClick={handleLogoutClick} aria-label="Log out" data-tip="Log out|Keluar dari akun ini" style={{ border: `1px solid ${tint(C.red, 38)}`, background: tint(C.red, 12), color: C.red, cursor: "pointer", padding: 8, minWidth: 36, minHeight: 36, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Ic name="logout" size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
