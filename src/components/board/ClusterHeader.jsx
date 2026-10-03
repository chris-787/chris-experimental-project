import { BTN_PILL, Chip, ClockText, Ic, btnSecondary } from "../../components/ui";
import { C } from "../../theme";
import ThemeToggle from "../../components/ThemeToggle";
import { useBoard } from "./BoardContext";

export default function ClusterHeader() {
  const { SmallSpinner, activeBlock, activeCluster, activeTipe, blockProgress, blocks, calibrating, canEdit, colorMode, currentClusterId, dashboardPos, dirty, editMap, goHome, goMode, mode, opacity, printSitePlan, reloadAfterRemoteUpdate, remoteUpdateAvailable, saveConflict, saveHouses, savedToast, saving, setActionMenuId, setActiveBlock, setActiveTipe, setClusters, setColorMode, setConfirmDeleteId, setDashboardPos, setDraft, setDrawingPoints, setEditMap, setEditPoints, setEditingShapeId, setOpacity, statusFields, subtitleWidth, tipeOptions, totalTarget, updateClusterMeta } = useBoard();
  return (
    <>
      {/* HEADER (bar atas ini "freeze" / nempel saat di-scroll) */}
      <div className="sticky top-0 z-30 -mx-4 -mt-4 px-4 pt-2.5 pb-2.5 mb-3" style={{ background: C.paper, borderBottom: `2px solid ${C.line}`, willChange: "transform", transform: "translateZ(0)" }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <button onClick={goHome} className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5" style={{ border: "none", color: C.accent, background: C.pillFill }}><Ic name="back" size={13} /> Home</button>
            <div>
              <div className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.steel }}><ClockText /></div>
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, color: C.steel, textTransform: "uppercase" }}>
                {mode === "kerja" ? (calibrating ? "Main Mode · Edit Site Plan" : "Main Mode") : mode === "data" ? "Data Mode" : "Settings"} — {activeCluster.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving && <SmallSpinner />}
            {!saving && dirty && <span className="text-xs" style={{ color: C.amber }}>Ada perubahan belum disimpan</span>}
            {!saving && savedToast && <span className="text-xs" style={{ color: C.green }}>Tersimpan ✓</span>}
            {canEdit ? (
              <button onClick={() => saveHouses()} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: C.accent, color: "#fff" }}>
                Simpan Perubahan
              </button>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: C.pillFill, color: C.steel }}>View Mode</span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <input
          value={activeCluster.name}
          readOnly={!canEdit}
          onChange={(e) => setClusters((prev) => prev.map((c) => (c.id === currentClusterId ? { ...c, name: e.target.value } : c)))}
          onBlur={(e) => updateClusterMeta(currentClusterId, { name: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          className="text-lg font-semibold editable-heading"
          title={canEdit ? "Klik untuk edit judul" : undefined}
          style={{ color: C.ink, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", width: "100%", padding: 0, fontFamily: "Inter, sans-serif" }}
        />
        <div className="flex items-center gap-1">
          <input
            value={activeCluster.subtitle}
            readOnly={!canEdit}
            onChange={(e) => setClusters((prev) => prev.map((c) => (c.id === currentClusterId ? { ...c, subtitle: e.target.value } : c)))}
            onBlur={(e) => updateClusterMeta(currentClusterId, { subtitle: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            className="text-sm editable-heading"
            title={canEdit ? "Klik untuk edit subjudul" : undefined}
            style={{ color: C.steel, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", fontFamily: "Inter, sans-serif", width: subtitleWidth, flex: "0 0 auto" }}
          />
          <span className="text-sm" style={{ color: C.steel }}>· target {totalTarget} unit, {blocks.length} blok</span>
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

      {/* TABS */}
      <div className="rounded-xl p-2.5 mb-3 flex flex-col gap-2.5" style={{ background: C.panel, boxShadow: C.cardShadow }}>
        <div className="flex gap-1.5 flex-wrap">
          <Chip active={mode === "kerja"} onClick={() => goMode("kerja")}>Main Mode</Chip>
          <Chip active={mode === "data"} onClick={() => goMode("data")}>Data Mode</Chip>
          <Chip active={mode === "pengaturan"} onClick={() => goMode("pengaturan")}>Settings</Chip>
          {mode === "kerja" && (
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button
                onClick={() => setDashboardPos((p) => (p === "kanan" ? "bawah" : "kanan"))}
                className={BTN_PILL}
                style={btnSecondary}
              >
                <Ic name={dashboardPos === "kanan" ? "layoutBottom" : "layoutRight"} size={14} /> Move Dashboard {dashboardPos === "kanan" ? "↓" : "→"}
              </button>
              {canEdit && (
                <button
                  onClick={() => { setEditMap((v) => !v); setDraft(null); setDrawingPoints([]); setEditingShapeId(null); setEditPoints(null); setActionMenuId(null); setConfirmDeleteId(null); }}
                  className={BTN_PILL}
                  style={editMap ? { border: `1px solid ${C.amber}`, background: C.alertAmberBg, color: C.amber } : btnSecondary}
                >
                  <Ic name="pencil" size={14} /> {editMap ? "Edit Site Plan aktif — klik untuk selesai" : "Edit Site Plan"}
                </button>
              )}
            </div>
          )}
        </div>
        {calibrating && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: C.steel }}>Blok aktif:</span>
            {blocks.map((b) => (
              <Chip key={b.id} active={activeBlock === b.name} onClick={() => setActiveBlock(b.name)}>
                {b.name} ({blockProgress.find((p) => p.name === b.name)?.placed || 0}/{b.target})
              </Chip>
            ))}
          </div>
        )}
        {calibrating && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: C.steel }}>Tipe aktif:</span>
            {tipeOptions.map((t) => (
              <Chip key={t.id} active={activeTipe === t.name} onClick={() => setActiveTipe(t.name)}>
                {t.name}
              </Chip>
            ))}
          </div>
        )}
        {mode === "kerja" && !calibrating && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: C.steel }}>Warna peta:</span>
              <select value={colorMode} onChange={(e) => setColorMode(e.target.value)} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="blok">Per Blok</option>
                <option value="tipe">Per Tipe</option>
                <option value="kontraktor">Per Kontraktor</option>
                {statusFields.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: C.steel }}>Opacity warna:</span>
              <input type="range" min="10" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} style={{ width: 100 }} />
              <span className="text-xs" style={{ color: C.steel, fontFamily: "IBM Plex Mono, monospace" }}>{opacity}%</span>
            </div>
            <button onClick={printSitePlan} className={BTN_PILL} style={btnSecondary}><Ic name="printer" size={14} /> Cetak Site Plan</button>
          </div>
        )}
      </div>
      {calibrating && (
        (blocks.length === 0 || tipeOptions.length === 0) ? (
          <p className="text-xs mb-2.5 p-2 rounded-lg" style={{ color: C.amber, background: C.alertAmberBg, border: `1px solid ${C.amber}` }}>
            Cluster ini belum punya {blocks.length === 0 && tipeOptions.length === 0 ? "Blok maupun Tipe" : blocks.length === 0 ? "Blok" : "Tipe"}. Tambahkan dulu lewat menu "Settings" sebelum bisa menggambar kavling.
          </p>
        ) : (
          <p className="text-xs mb-2.5" style={{ color: C.steel }}>Pilih Blok & Tipe aktif di atas, lalu klik tiap sudut kavling mengikuti bentuknya (min. 3 titik), lalu "Selesai Poligon" dan isi nomor kavlingnya. Klik bentuk yang sudah ada untuk menghapusnya.</p>
        )
      )}
    </>
  );
}
