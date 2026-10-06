import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "../../theme";
import { cellInput, focusWhen, tint } from "../ui";
import { statusColor } from "../../lib/palette";
import { useBoard } from "./BoardContext";

// Kolom "Status" gabungan (tampilan Ringkas): status yang aktif tampil sebagai
// label berwarna (detail ikut di dalam label). Tombol "+ status" membuka daftar
// status yang belum aktif. Saat "Isi cepat" menyala, klik sel = nyalakan/matikan
// status yang dipilih.
const pillBase = { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, lineHeight: "16px", padding: "1px 8px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 };

export default function StatusCell({ h, fillKey }) {
  const { statusFields, updateStatus, getDetail, setDetail, canEdit, detailEditingKey, setDetailEditingKey } = useBoard();
  const [menu, setMenu] = useState(null);
  const addRef = useRef(null);

  useEffect(() => {
    if (!menu) return undefined;
    const close = () => setMenu(null);
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const active = statusFields.filter((s) => h.status[s.key]);
  const inactive = statusFields.filter((s) => !h.status[s.key]);
  const colorOf = (s) => statusColor(statusFields.findIndex((x) => x.key === s.key));

  function openMenu(e) {
    e.stopPropagation();
    if (menu) { setMenu(null); return; }
    const r = addRef.current.getBoundingClientRect();
    const height = inactive.length * 28 + 10;
    const top = r.bottom + 4 + height > window.innerHeight ? Math.max(4, r.top - height - 4) : r.bottom + 4;
    setMenu({ x: Math.min(r.left, window.innerWidth - 190), y: top });
  }
  function add(s) {
    updateStatus(h.id, s.key, true);
    if (s.hasDetail) setDetailEditingKey(`${h.id}:${s.key}`);
    setMenu(null);
  }

  const fill = fillKey && canEdit;
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, overflow: "hidden", cursor: fill ? "copy" : undefined }}
      onClick={fill ? (e) => { e.stopPropagation(); updateStatus(h.id, fillKey, !h.status[fillKey]); } : undefined}
    >
      {active.length === 0 && <span style={{ fontSize: 11, color: C.faint, whiteSpace: "nowrap" }}>Belum ada status</span>}
      {active.map((s) => {
        const col = colorOf(s);
        const key = `${h.id}:${s.key}`;
        const detail = getDetail(h, s.key);
        const editing = s.hasDetail && detailEditingKey === key;
        const pill = { ...pillBase, background: tint(col, 16), color: `color-mix(in srgb, ${col} 72%, ${C.ink})` };
        if (editing) {
          return (
            <span key={s.key} style={{ ...pill, padding: "0 4px 0 8px", gap: 4 }} onClick={(e) => e.stopPropagation()}>
              {s.label}:
              <input
                ref={focusWhen(true, "table")}
                value={detail}
                onChange={(e) => setDetail(h.id, s.key, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setDetailEditingKey(null); }}
                onBlur={() => setDetailEditingKey(null)}
                placeholder="keterangan"
                style={{ ...cellInput, width: 110, minWidth: 80, height: 18, padding: "0 6px", fontSize: 11, borderRadius: 999 }}
              />
            </span>
          );
        }
        return (
          <span
            key={s.key}
            style={{ ...pill, cursor: canEdit && s.hasDetail && !fill ? "pointer" : undefined }}
            title={s.hasDetail && canEdit ? "Klik untuk isi keterangan" : s.label}
            onClick={!fill && canEdit && s.hasDetail ? (e) => { e.stopPropagation(); setDetailEditingKey(key); } : undefined}
          >
            {s.label}{s.hasDetail && detail ? `: ${detail}` : ""}
            {canEdit && !fill && (
              <button
                type="button"
                aria-label={`Matikan ${s.label}`}
                title={`Matikan ${s.label}`}
                onClick={(e) => { e.stopPropagation(); updateStatus(h.id, s.key, false); }}
                style={{ border: "none", background: "transparent", color: "inherit", opacity: 0.45, fontSize: 12, lineHeight: 1, padding: 0, cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.45; }}
              >×</button>
            )}
          </span>
        );
      })}
      {canEdit && !fill && inactive.length > 0 && (
        <button
          ref={addRef}
          type="button"
          onClick={openMenu}
          style={{ ...pillBase, border: `1px dashed ${C.faint}`, background: "transparent", color: C.steel, cursor: "pointer" }}
        >+ status</button>
      )}
      {menu && createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: "fixed", left: menu.x, top: menu.y, zIndex: 80, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", minWidth: 170, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {inactive.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={(e) => { e.stopPropagation(); add(s); }}
              className="status-menu-item"
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", fontSize: 12, padding: "5px 10px", borderRadius: 7, border: "none", background: "transparent", color: C.ink, cursor: "pointer" }}
            >
              <i style={{ width: 8, height: 8, borderRadius: 3, background: colorOf(s), display: "inline-block", flexShrink: 0 }} />{s.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
