import { C } from "../../theme";
import { BrandMark, Ic } from "../ui";

// Layar "kerangka" saat data masih diunduh: bentuk halaman (sidebar, header,
// kartu angka, site plan, panel kanan, tabel) langsung tampil sebagai kotak
// abu-abu berdenyut, jadi tidak ada layar kosong lalu tiba-tiba muncul semua.
// Bagian yang tidak bergantung pada data (logo, nama menu) tampil asli.
const Box = ({ h, w = "100%", style }) => <div className="sk" style={{ height: h, width: w, flexShrink: typeof w === "number" ? 0 : 1, minWidth: 0, ...style }} />;
const Card = ({ children, style, pad = 14 }) => (
  <div style={{ background: C.panel, boxShadow: C.cardShadow, borderRadius: 16, padding: pad, ...style }}>{children}</div>
);
const Circle = ({ s }) => <Box h={s} w={s} style={{ borderRadius: "50%" }} />;
const Pill = ({ w, h = 36 }) => <Box h={h} w={w} style={{ borderRadius: 999 }} />;

const MENU = [
  { label: "Home", icon: "home" },
  { label: "Main Mode", icon: "map" },
  { label: "Data Mode", icon: "table" },
  { label: "Dashboard", icon: "chart" },
  { label: "Settings", icon: "sliders" },
];

function collapsedPref() {
  try { return localStorage.getItem("bria-sidebar") === "1"; } catch (e) { return false; }
}

function HomeSkeleton() {
  return (
    <div style={{ background: C.paper, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="p-4" role="status" aria-label="Memuat data">
      <div style={{ margin: "-1rem -1rem 0", background: C.panel, borderBottom: `1px solid ${C.line}`, padding: "12px 24px" }}>
        <div className="flex items-center gap-3 flex-wrap" style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="flex items-center gap-2.5" style={{ flex: "1 1 240px", minWidth: 0 }}>
            <BrandMark size={36} />
            <div>
              <Box h={14} w={210} />
              <Box h={11} w={260} style={{ marginTop: 6 }} />
            </div>
          </div>
          <div style={{ flex: "0 1 380px", minWidth: 200 }}><Pill w="100%" /></div>
          <div className="flex items-center gap-2">
            <Circle s={36} /><Circle s={36} /><Pill w={84} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 8px 0" }}>
        <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
          <div>
            <Box h={12} w={190} />
            <Box h={26} w={260} style={{ marginTop: 8 }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Pill w={140} /><Pill w={130} /><Pill w={120} /><Pill w={110} />
          </div>
        </div>

        <div className="home-grid">
          <div style={{ minWidth: 0 }}>
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.ink }}>Cluster Anda</h2>
              <Box h={12} w={150} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
              <Card pad={18}>
                <Box h={18} w="55%" />
                <Box h={12} w="40%" style={{ marginTop: 8 }} />
                <div className="flex gap-1.5" style={{ marginTop: 12 }}><Pill w={70} h={22} /><Pill w={90} h={22} /><Pill w={60} h={22} /></div>
                <Box h={8} w="100%" style={{ marginTop: 16, borderRadius: 999 }} />
                <div className="flex gap-2.5" style={{ marginTop: 14 }}><Box h={52} /><Box h={52} /></div>
                <div className="flex gap-2" style={{ marginTop: 14 }}><Pill w="100%" /><Pill w={70} /></div>
              </Card>
              <Card pad={18} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 200 }}>
                <Circle s={40} />
                <Box h={12} w={120} />
                <Pill w="80%" h={32} />
              </Card>
            </div>
          </div>
          <aside className="flex flex-col gap-3" style={{ minWidth: 0 }}>
            <Card>
              <div className="flex items-center justify-center gap-2.5" style={{ marginBottom: 12 }}>
                <Box h={28} w={28} style={{ borderRadius: 8 }} />
                <Box h={14} w={150} />
              </div>
              <Box h={14} w={110} style={{ margin: "0 auto 12px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
                {Array.from({ length: 35 }).map((_, i) => <Box key={i} h={22} style={{ borderRadius: 8 }} />)}
              </div>
            </Card>
            <Card>
              <Box h={14} w={110} />
              <Box h={11} w="90%" style={{ marginTop: 10 }} />
              <Pill w="100%" h={34} />
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ClusterSkeleton({ title }) {
  const collapsed = collapsedPref();
  return (
    <div className="app-shell" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} role="status" aria-label="Memuat data">
      <nav className={`app-side${collapsed ? " collapsed" : ""}`} aria-hidden="true">
        <div className="side-extra flex items-center gap-2.5" style={{ width: "100%", justifyContent: collapsed ? "center" : "flex-start" }}>
          <BrandMark size={34} />
          <div className="side-hide-collapsed" style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>Chris Project</div>
            <div style={{ fontSize: 11, color: C.steel }}>Version 2.0</div>
          </div>
        </div>
        <div className="side-menu">
          {MENU.map((it) => (
            <div key={it.label} className="side-item" style={{ color: C.steel }}>
              <Ic name={it.icon} size={18} />
              <span className="side-label">{it.label}</span>
            </div>
          ))}
        </div>
        <div className="side-extra side-hide-collapsed" style={{ width: "100%" }}><Box h={52} style={{ borderRadius: 12 }} /></div>
        <div className="side-extra" style={{ marginTop: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <Box h={44} style={{ borderRadius: 12 }} />
          <div className="flex items-center justify-center gap-2.5"><Circle s={30} /><div className="side-hide-collapsed" style={{ flex: 1 }}><Box h={26} /></div></div>
        </div>
      </nav>

      <div className="app-main">
        <div className="flex items-start justify-between gap-3 flex-wrap" style={{ marginBottom: 16 }}>
          <div>
            <Box h={26} w={150} />
            <div style={{ marginTop: 8, fontSize: 13, color: C.steel, minHeight: 16 }}>{title || <Box h={13} w={230} />}</div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Pill w={300} /><Pill w={150} /><Circle s={36} />
          </div>
        </div>

        <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} pad={16}>
              <div className="flex items-center gap-2"><Box h={28} w={28} style={{ borderRadius: 8 }} /><Box h={12} w="50%" /></div>
              <Box h={24} w="45%" style={{ marginTop: 12 }} />
              <Box h={6} w="100%" style={{ marginTop: 12, borderRadius: 999 }} />
            </Card>
          ))}
        </div>

        <div className="sk-map-row" style={{ display: "flex", flexWrap: "nowrap", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
          <div className="sk-map-main" style={{ flexBasis: "65%", flexGrow: 0, flexShrink: 0, minWidth: 320 }}>
            <Card pad={16}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div><Box h={16} w={90} /><Box h={11} w={230} style={{ marginTop: 8 }} /></div>
                <div className="flex gap-2"><Pill w={120} h={30} /><Pill w={80} h={30} /></div>
              </div>
              <div className="flex gap-2 flex-wrap" style={{ margin: "14px 0" }}>
                <Pill w={290} h={36} /><Pill w={170} h={30} />
              </div>
              <Box h={380} style={{ borderRadius: 12 }} />
            </Card>
          </div>
          <div className="sk-map-side" style={{ flex: "1 1 300px", minWidth: 300 }}>
            <div className="flex flex-col gap-3">
              <Card><Box h={14} w={110} /><div className="flex items-center gap-4" style={{ marginTop: 14 }}><Circle s={96} /><div style={{ flex: 1 }}><Box h={10} style={{ marginBottom: 8 }} /><Box h={10} style={{ marginBottom: 8 }} /><Box h={10} w="70%" /></div></div></Card>
              <Card><Box h={14} w={110} />{[0, 1, 2, 3].map((i) => <Box key={i} h={8} style={{ marginTop: 14, borderRadius: 999 }} />)}</Card>
              <Card><Box h={14} w={120} />{[0, 1, 2].map((i) => <Box key={i} h={16} style={{ marginTop: 12 }} />)}</Card>
            </div>
          </div>
        </div>

        <Card pad={16}>
          <Box h={16} w={220} />
          <div className="flex gap-2 flex-wrap" style={{ margin: "14px 0" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => <Pill key={i} w={78} h={26} />)}
          </div>
          <Box h={30} style={{ borderRadius: 10, marginBottom: 6 }} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <Box key={i} h={18} w={`${100 - (i % 3) * 3}%`} style={{ marginTop: 8, borderRadius: 6 }} />)}
        </Card>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ kind, title }) {
  return kind === "cluster" ? <ClusterSkeleton title={title} /> : <HomeSkeleton />;
}
