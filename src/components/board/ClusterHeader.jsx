import { useMemo } from "react";
import { C } from "../../theme";
import { Ic } from "../ui";
import { measureTextWidth } from "../../lib/helpers";
import ThemeToggle from "../ThemeToggle";
import { useBoard } from "./BoardContext";

// Kepala halaman (tidak menempel saat di-scroll): judul mode, nama cluster,
// kotak cari, status simpan, dan tombol tema.
const TITLES = { kerja: "Main Mode", data: "Data Mode", dashboard: "Dashboard", pengaturan: "Settings" };

export default function ClusterHeader() {
  const { SmallSpinner, activeCluster, calibrating, canEdit, currentClusterId, dirty, goMode, houses, mode, setSelectedId, reloadAfterRemoteUpdate, remoteUpdateAvailable, saveConflict, saveHouses, savedToast, saving, setClusters, setTableSearchQuery, tableSearchQuery, updateClusterMeta } = useBoard();
  const textW = (t, ph) => Math.ceil(measureTextWidth(t || ph || "", "13px 'Plus Jakarta Sans', sans-serif")) + 8;
  const q = tableSearchQuery.trim().toLowerCase();
  const results = useMemo(
    () => (q ? houses.filter((h) => `${h.blok}-${h.noKavling}`.toLowerCase().includes(q)).slice(0, 8) : []),
    [houses, q]
  );
  const pick = (id) => { setSelectedId(id); setTableSearchQuery(""); if (mode !== "kerja") goMode("kerja"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const ghost = { background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", padding: 0, fontFamily: "inherit", fontSize: 13, color: C.steel };
  return (
    <>
      <div className="flex items-center gap-3 flex-wrap mb-3.5">
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", color: C.ink, lineHeight: 1.2 }}>
            {TITLES[mode]}{calibrating ? " · Edit Site Plan" : ""}
          </h1>
          <div className="flex items-center flex-wrap" style={{ marginTop: 2 }}>
            <input
              value={activeCluster.name}
              
              readOnly={!canEdit}
              onChange={(e) => setClusters((prev) => prev.map((c) => (c.id === currentClusterId ? { ...c, name: e.target.value } : c)))}
              onBlur={(e) => updateClusterMeta(currentClusterId, { name: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
              className="editable-heading"
              aria-label="Nama cluster"
              title={canEdit ? "Klik untuk edit nama cluster" : undefined}
              style={{ ...ghost, width: textW(activeCluster.name) }}
            />
            <span style={{ color: C.steel, fontSize: 13, margin: "0 6px" }}>·</span>
            <input
              value={activeCluster.subtitle}
              
              readOnly={!canEdit}
              placeholder="Lokasi / catatan"
              onChange={(e) => setClusters((prev) => prev.map((c) => (c.id === currentClusterId ? { ...c, subtitle: e.target.value } : c)))}
              onBlur={(e) => updateClusterMeta(currentClusterId, { subtitle: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
              className="editable-heading"
              aria-label="Lokasi cluster"
              title={canEdit ? "Klik untuk edit lokasi" : undefined}
              style={{ ...ghost, width: textW(activeCluster.subtitle, "Lokasi / catatan") }}
            />
          </div>
        </div>

        <div style={{ position: "relative", flex: "0 1 300px", minWidth: 180 }}>
          <label className="flex items-center gap-2 search-pill" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 999, padding: "0 14px", height: 40, color: C.steel }}>
            <Ic name="search" size={16} />
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Cari kavling</span>
            <input
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && mode !== "data" && results[0]) pick(results[0].id); if (e.key === "Escape") setTableSearchQuery(""); }}
              placeholder="Cari kavling, mis. RB/D-06"
              style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: C.ink, width: "100%", minWidth: 0 }}
            />
          </label>
          {q && mode !== "data" && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 40, marginTop: 6, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden" }}>
              {results.length === 0 ? (
                <div className="text-xs p-2.5" style={{ color: C.steel }}>Tidak ditemukan.</div>
              ) : results.map((h) => (
                <button key={h.id} onClick={() => pick(h.id)} className="flex items-center justify-between w-full text-xs" style={{ padding: "8px 12px", border: "none", borderBottom: `1px solid ${C.line}`, background: "transparent", cursor: "pointer", textAlign: "left", color: C.ink }}>
                  <span style={{ fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{h.blok}-{h.noKavling}</span>
                  <span style={{ color: C.steel }}>{h.tipe}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2" style={{ position: "relative" }}>
          <div className="text-xs flex items-center gap-1.5" style={{ position: "absolute", right: 0, top: "100%", marginTop: 5, whiteSpace: "nowrap", color: saving ? C.steel : dirty ? C.amber : C.green }} role="status">
            {saving && <><SmallSpinner /> Menyimpan...</>}
            {!saving && dirty && "Ada perubahan belum disimpan"}
            {!saving && !dirty && savedToast && "Tersimpan ✓"}
          </div>
          {canEdit ? (
            <button
              onClick={() => saveHouses()}
              style={{ height: 40, padding: "0 16px", borderRadius: 999, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", ...(dirty ? { background: C.amber, color: "#fff", border: `1px solid ${C.amber}` } : { background: C.panel, color: C.steel, border: `1px solid ${C.line}` }) }}
              title={dirty ? "Ada perubahan yang belum tersimpan" : "Tidak ada perubahan"}
            >
              Simpan Perubahan
            </button>
          ) : (
            <span style={{ height: 40, padding: "0 16px", borderRadius: 999, display: "inline-flex", alignItems: "center", fontWeight: 600, fontSize: 13, background: C.pillFill, color: C.steel }}>View Mode</span>
          )}
          <ThemeToggle />
        </div>
      </div>

      {saveConflict && (
        <div className="flex items-center justify-between mb-2.5 p-2 rounded-lg" style={{ background: C.alertRedBg, border: `1px solid ${C.red}` }}>
          <span className="text-xs" style={{ color: C.red }}>Gagal menyimpan — data ini sudah diubah oleh pengguna lain. Perubahan Anda masih ada di layar, tapi belum tersimpan.</span>
          <button onClick={reloadAfterRemoteUpdate} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.red, color: "#fff" }}>Muat Ulang</button>
        </div>
      )}
      {!saveConflict && remoteUpdateAvailable && (
        <div className="flex items-center justify-between mb-2.5 p-2 rounded-lg" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}` }}>
          <span className="text-xs" style={{ color: C.amber }}>Ada pembaruan baru dari pengguna lain. Muat ulang untuk melihatnya (perubahan Anda yang belum disimpan akan hilang).</span>
          <button onClick={reloadAfterRemoteUpdate} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.amber}`, color: C.amber, background: C.panel }}>Muat Ulang</button>
        </div>
      )}
    </>
  );
}
