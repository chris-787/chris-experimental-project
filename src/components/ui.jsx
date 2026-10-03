import { useJakartaClock, formatJakartaDateTime, greetingFor } from "../lib/jakartaClock";
import { C } from "../theme";

// Komponen dan gaya kecil yang dipakai bersama di banyak tempat.

// Komponen terpisah supaya detak jam tiap detik cuma me-render ulang
// teks jam ini saja, bukan seluruh halaman (tabel & site plan bisa
// sangat besar, jadi render ulang tiap detik bikin scroll patah-patah).
export function ClockText() {
  const now = useJakartaClock();
  return formatJakartaDateTime(now);
}
// Sama alasannya seperti ClockText — supaya ganti sapaan tiap jam tidak
// ikut me-render ulang seluruh halaman.
export function GreetingText({ name }) {
  const now = useJakartaClock();
  return `${greetingFor(now)}${name ? `, ${name}` : ""}`;
}

export function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors"
      style={{ borderColor: active ? C.accent : C.line, background: active ? C.accent : C.panel, color: active ? "#fff" : C.steel }}>
      {children}
    </button>
  );
}
export const ICON_PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  chart: <><path d="M4 20V10" /><path d="M12 20V4" /><path d="M20 20v-7" /></>,
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  sparkle: <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" />,
  printer: <><path d="M6 9V3h12v6" /><rect x="4" y="9" width="16" height="8" rx="1.5" /><path d="M6 17h12v4H6z" /></>,
  calculator: <><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M8 7h8" /><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" /></>,
  hardhat: <><path d="M4 15a8 8 0 0 1 16 0" /><path d="M2 15h20" /><path d="M9 15V9" /></>,
  back: <><path d="M15 6l-6 6 6 6" /></>,
  clock: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2" /></>,
  warning: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><path d="M12 17h.01" /></>,
  download: <><path d="M12 3v13" /><path d="m7 11 5 5 5-5" /><path d="M4 21h16" /></>,
  upload: <><path d="M12 21V8" /><path d="m7 12 5-5 5 5" /><path d="M4 21h16" /></>,
  pencil: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
  layoutBottom: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 14h18" /></>,
  layoutRight: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></>,
  arrowsH: <><path d="M4 12h16" /><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /></>,
  arrowsV: <><path d="M12 4v16" /><path d="m8 8 4-4 4 4" /><path d="m8 16 4 4 4-4" /></>,
};
export function Ic({ name, size = 16, color }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {ICON_PATHS[name]}
    </svg>
  );
}
export function IconChip({ name, bg, color, size = 34 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size >= 30 ? 10 : 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
      <Ic name={name} size={Math.round(size * 0.5)} />
    </span>
  );
}
export function Field({ label, children }) {
  return (<div className="mb-2"><div className="text-xs mb-1" style={{ color: C.steel }}>{label}</div>{children}</div>);
}
export function StatusRow({ label, value, onToggle }) {
  return (
    <label className="flex items-center justify-between py-1 cursor-pointer select-none">
      <span className="text-sm" style={{ color: C.ink }}>{label}</span>
      <span onClick={onToggle} className="w-9 h-5 rounded-full relative transition-colors" style={{ background: value ? C.green : C.faint }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: value ? 18 : 2 }} />
      </span>
    </label>
  );
}
export const MONO = "'IBM Plex Mono', monospace";
// Gaya tombol bersama: secondary (berbingkai) dan primary (terisi).
export const BTN_PILL = "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 whitespace-nowrap";
export const btnSecondary = { border: `1px solid ${C.line}`, background: C.panel, color: C.ink };
export const btnPrimary = { border: "1px solid transparent", background: C.accent, color: "#fff" };
export const tint = (color, pct = 16) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
export function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 4, borderRadius: 4, background: C.line, overflow: "hidden", marginTop: 6 }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct || 0))}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}
export function KpiCard({ label, value, sub, pct, color }) {
  return (
    <div className="p-2.5 rounded-xl" style={{ background: C.panel, boxShadow: `inset 0 3px 0 ${color}, ${C.cardShadow}` }}>
      <div style={{ fontSize: 11, color: C.steel }}>{label}</div>
      <div className="font-semibold" style={{ fontSize: 16, lineHeight: 1.25, color: C.ink, fontFamily: MONO, overflowWrap: "anywhere" }}>{value}</div>
      {pct != null && <ProgressBar pct={pct} color={color} />}
      {sub && <div style={{ fontSize: 11, color: C.steel, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
export function Pill({ children, color }) {
  return <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 999, background: tint(color), color, fontWeight: 500, whiteSpace: "nowrap" }}>{children}</span>;
}
export const cellInput = { width: "100%", minWidth: 80, padding: "2px 6px", fontSize: 12, border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: "'IBM Plex Mono', monospace", color: C.ink, background: C.panel };
export const formInput = { width: "100%", padding: "5px 8px", fontSize: 12, border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: "'IBM Plex Mono', monospace", color: C.ink, background: C.panel };
