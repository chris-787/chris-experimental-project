import { C } from "../../theme";
import { BrandMark, Ic } from "../ui";
import { timeAgo } from "../../lib/calc";
import { JAKARTA_TZ, timeFormatter, useJakartaClock } from "../../lib/jakartaClock";
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
    return <div title={`${sideDate.format(now)} ${time} WIB`} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.steel, textAlign: "center", lineHeight: 1.2 }}>{time.slice(0, 5)}</div>;
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
  const { activeCluster, blocks, canEdit, displayName, goHome, goMode, handleLogoutClick, lastBackupAt, mode, sidebarCollapsed, toggleSidebar, totalTarget } = useBoard();
  const initials = (displayName || "?").slice(0, 2).toUpperCase();
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

      <div className="side-menu" role="list">
        <div className="side-extra side-hide-collapsed" style={{ fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: C.steel, padding: "0 .75rem .35rem" }}>Menu</div>
        {ITEMS.map((it) => {
          const active = it.key === mode;
          return (
            <button
              key={it.key}
              role="listitem"
              className="side-item"
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
        <button onClick={goHome} title="Kembali ke Home untuk ganti cluster" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textAlign: "left", border: `1px solid ${C.line}`, background: "transparent", color: C.ink, borderRadius: 12, padding: "8px 10px", cursor: "pointer", minHeight: 44, fontFamily: "inherit" }}>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeCluster.name || "—"}</span>
            <span style={{ display: "block", fontSize: 11, color: C.steel }}>{totalTarget} unit target · {blocks.length} blok</span>
          </span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color: C.steel }}><path d="M6 9l6 6 6-6" /></svg>
        </button>
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
          <button onClick={handleLogoutClick} aria-label="Log out" title="Log out" style={{ border: "none", background: "transparent", color: C.steel, cursor: "pointer", padding: 8, minWidth: 36, minHeight: 36 }}>
            <Ic name="logout" size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
