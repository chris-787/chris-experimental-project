import { useMemo, useState } from "react";
import { C } from "../../theme";
import { Ic, Pill, SectionHead, cellInput } from "../ui";
import { checkHealth, healthCount } from "../../lib/healthCheck";
import { useBoard } from "./BoardContext";

const card = { background: C.panel, boxShadow: C.cardShadow, borderRadius: 16, padding: 16 };

// Tab "Cek Data": daftar kavling yang datanya bermasalah, tiap baris punya isian dan tombol Perbaiki.
export default function HealthCheckTab() {
  const { houses, tipeOptions, blocks, canEdit, updateHouse, updateTipeLuas, setSelectedId, goMode } = useBoard();
  const groups = useMemo(() => checkHealth(houses, tipeOptions, blocks), [houses, tipeOptions, blocks]);
  const total = healthCount(groups);
  const [vals, setVals] = useState({});
  const [openIds, setOpenIds] = useState({});
  const isOpen = (g, i) => (openIds[g.id] === undefined ? true : openIds[g.id]);
  const set = (key, v) => setVals((p) => ({ ...p, [key]: v }));

  function openKavling(id) { setSelectedId(id); goMode("kerja"); window.scrollTo({ top: 0, behavior: "smooth" }); }

  function fix(group, item) {
    const key = `${group.id}:${item.id}`;
    const raw = vals[key];
    if (raw === undefined || String(raw).trim() === "") return;
    if (group.kind === "tipe") updateHouse(item.id, { tipe: raw });
    else if (group.kind === "lb") updateTipeLuas(item.id, raw);
    else if (group.kind === "hpp") updateHouse(item.id, { hppPerM2: Number(raw) || 0 });
    else if (group.kind === "harga") updateHouse(item.id, { hargaJualPerM2: Number(raw) || 0 });
    else if (group.kind === "nomor") updateHouse(item.id, { noKavling: String(raw).trim() });
    else if (group.kind === "kontraktor") updateHouse(item.id, { kontraktor: String(raw).trim() });
    setVals((p) => { const n = { ...p }; delete n[key]; return n; });
  }

  function control(group, item) {
    const key = `${group.id}:${item.id}`;
    const common = { disabled: !canEdit, "aria-label": `${group.title}: ${item.kode}` };
    const onKey = (e) => { if (e.key === "Enter") fix(group, item); };
    if (group.kind === "tipe") {
      return (
        <select {...common} value={vals[key] ?? ""} onChange={(e) => set(key, e.target.value)} style={{ ...cellInput, width: 150, minWidth: 0 }}>
          <option value="" disabled>Pilih tipe…</option>
          {tipeOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      );
    }
    if (group.kind === "lb" || group.kind === "hpp" || group.kind === "harga") {
      const ph = group.kind === "lb" ? "m²" : "Rp/m²";
      return <input {...common} type="number" min="0" value={vals[key] ?? ""} onChange={(e) => set(key, e.target.value)} onKeyDown={onKey} placeholder={ph} style={{ ...cellInput, width: 130, minWidth: 0, textAlign: "right" }} />;
    }
    if (group.kind === "nomor") {
      return <input {...common} value={vals[key] ?? item.value} onChange={(e) => set(key, e.target.value)} onKeyDown={onKey} style={{ ...cellInput, width: 90, minWidth: 0 }} />;
    }
    if (group.kind === "kontraktor") {
      return <input {...common} list="kontraktor-options" value={vals[key] ?? ""} onChange={(e) => set(key, e.target.value)} onKeyDown={onKey} placeholder="Nama kontraktor" style={{ ...cellInput, width: 190, minWidth: 0 }} />;
    }
    return null;
  }

  if (total === 0) {
    return (
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in srgb, ${C.green} 16%, transparent)`, color: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic name="checkCircle" size={22} /></span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Data sehat</div>
          <div className="text-xs mt-0.5" style={{ color: C.steel }}>Tidak ada kavling bermasalah: tipe, luas bangunan, HPP, harga jual, nomor, blok, dan kontraktor semuanya terisi dengan benar.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs p-2.5 rounded-xl" style={{ background: C.infoBlueBg, border: `1px solid ${C.line}`, color: C.ink }}>
        {total} hal perlu dicek di {groups.length} kelompok. Isi lalu tekan <b>Perbaiki</b>; kavlingnya otomatis hilang dari daftar. {canEdit ? "Perbaikan masuk ke tabel, tekan Simpan Perubahan di atas untuk menyimpannya (kecuali luas bangunan tipe, yang langsung tersimpan)." : "Akun ini hanya bisa melihat."}
      </div>
      {groups.map((g, gi) => {
        const col = g.severity === "error" ? C.red : C.amber;
        const open = isOpen(g, gi);
        return (
          <div key={g.id} style={card}>
            <button
              type="button"
              onClick={() => setOpenIds((p) => ({ ...p, [g.id]: !open }))}
              aria-expanded={open}
              style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
            >
              <SectionHead
                icon="warning" color={col} title={g.title} count={g.items.length}
                right={<span style={{ color: C.steel, fontSize: 12 }}>{open ? "Tutup ▴" : "Buka ▾"}</span>}
              />
            </button>
            {open && (
              <>
                <div className="text-xs mb-2" style={{ color: C.steel, marginTop: -4 }}>{g.hint}</div>
                <div className="flex flex-col" style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
                  {g.items.map((it, i) => (
                    <div key={it.id} className="flex items-center gap-2 flex-wrap" style={{ padding: "6px 12px", borderTop: i ? `1px solid ${C.line}` : "none", background: i % 2 ? "var(--zebra)" : "transparent" }}>
                      <button type="button" onClick={() => g.kind !== "lb" && openKavling(it.id)} title={g.kind === "lb" ? undefined : "Buka kavling di Main Mode"} style={{ background: "transparent", border: "none", padding: 0, cursor: g.kind === "lb" ? "default" : "pointer", color: C.ink, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, fontWeight: 600, textDecoration: g.kind === "lb" ? "none" : "underline", minWidth: 84, textAlign: "left" }}>{it.kode}</button>
                      {g.kind === "lb" && <span className="text-xs" style={{ color: C.steel }}>dipakai {it.count} kavling</span>}
                      <span style={{ flex: 1 }} />
                      {control(g, it)}
                      {g.kind !== "info" && (
                        <button type="button" disabled={!canEdit || vals[`${g.id}:${it.id}`] === undefined || String(vals[`${g.id}:${it.id}`]).trim() === ""} onClick={() => fix(g, it)} className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: C.accent, color: "#fff", border: "none", cursor: "pointer", opacity: !canEdit || vals[`${g.id}:${it.id}`] === undefined || String(vals[`${g.id}:${it.id}`]).trim() === "" ? 0.45 : 1 }}>Perbaiki</button>
                      )}
                      {g.kind === "info" && <button type="button" onClick={() => openKavling(it.id)} className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "transparent", color: C.ink, border: `1px solid ${C.line}`, cursor: "pointer" }}>Buka</button>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
