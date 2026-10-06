import { C } from "../../theme";
import { GreetingText, Ic, IconChip, MONO, Pill, ProgressBar } from "../../components/ui";
import { MONTH_LABELS, WEEKDAY_LABELS, buildCalendarGrid } from "../../lib/helpers";
import ThemeToggle from "../../components/ThemeToggle";
import { useBoard } from "./BoardContext";

export default function HomeScreen() {
  const { KAVLING_SEARCH_LIMIT, SmallSpinner, addCluster, appTitle, applyRestoreAll, calendarMonth, calendarSelectedDate, canEdit, clusterSearch, clusterStats, clusters, confirmDeleteClusterId, deleteCluster, displayName, exportAllBackup, exportAllExcel, exportingBackupAll, exportingExcelAll, followUpView, followUpsByDate, globalHousesIndex, handleLogoutClick, handleRestoreAllFile, homeAllFollowUpList, homeDirty, homeDuplicateList, homeFollowUpList, homeSavedToast, homeSaving, kavlingSearch, kavlingSearchAllMatches, kavlingSearchResults, lastBackupAt, newClusterName, newClusterSubtitle, openCluster, openKavlingFromSearch, pendingRestoreAll, recoverLegacyCluster, restoreAllError, restoreAllResult, restoringAll, saveAppTitle, saveHomeChanges, setAppTitle, setCalendarMonth, setCalendarSelectedDate, setClusterSearch, setClusters, setConfirmDeleteClusterId, setFollowUpView, setHomeDirty, setKavlingSearch, setNewClusterName, setNewClusterSubtitle, setPendingRestoreAll, setRestoreAllResult, setShowArchivedClusters, setShowWhatsNew, showArchivedClusters, toggleArchiveCluster, togglePinCluster, updateClusterMeta } = useBoard();
  const todayLabel = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const totalSumHarga = Object.values(clusterStats).reduce((s, x) => s + (x.sumHarga || 0), 0);
  const totalSumHpp = Object.values(clusterStats).reduce((s, x) => s + (x.sumHpp || 0), 0);
  const overallMarginPct = totalSumHarga ? ((totalSumHarga - totalSumHpp) / totalSumHarga) * 100 : 0;
  const activeClusters = clusters.filter((c) => !c.archived);
  const pillBtn = { height: 38, padding: "0 16px", borderRadius: 999, border: `1px solid ${C.line}`, background: C.panel, color: C.ink, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit" };
  return (
    <>
      {/* BAR ATAS (Home tidak memakai sidebar) */}
      <div style={{ margin: "-1rem -1rem 0", background: C.panel, borderBottom: `1px solid ${C.line}`, padding: "12px 24px" }}>
        <div className="flex items-center gap-3 flex-wrap" style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
          <div className="flex items-center gap-2.5" style={{ flex: "1 1 240px", minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>CB</div>
            <div style={{ minWidth: 0 }}>
              <input
                value={appTitle}
                readOnly={!canEdit}
                onChange={(e) => { setAppTitle(e.target.value); setHomeDirty(true); }}
                onBlur={() => saveAppTitle(appTitle)}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                className="editable-heading"
                aria-label="Judul aplikasi"
                title={canEdit ? "Klik untuk edit judul" : undefined}
                size={Math.max(appTitle.length, 10)}
                style={{ color: C.ink, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", padding: 0, fontFamily: "inherit", fontSize: 15, fontWeight: 700, maxWidth: "100%", display: "block" }}
              />
              <div style={{ fontSize: 12, color: C.steel }}>Papan Status Tender</div>
            </div>
          </div>
          <label className="flex items-center gap-2" style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 999, padding: "0 14px", height: 40, flex: "0 1 380px", minWidth: 200, color: C.steel }}>
            <Ic name="search" size={16} />
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Cari kavling di semua cluster</span>
            <input
              value={kavlingSearch}
              onChange={(e) => setKavlingSearch(e.target.value)}
              placeholder="Cari blok atau kavling di semua cluster"
              className="kavling-search-input"
              style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: C.ink, width: "100%", minWidth: 0 }}
            />
          </label>
          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            {homeSaving && <SmallSpinner />}
            {!homeSaving && homeDirty && <span className="text-xs" style={{ color: C.amber }}>Ada perubahan belum disimpan</span>}
            {!homeSaving && homeSavedToast && <span className="text-xs" style={{ color: C.green }}>Tersimpan ✓</span>}
            {canEdit && homeDirty && <button onClick={saveHomeChanges} style={{ ...pillBtn, height: 38, background: C.amber, color: "#fff", border: `1px solid ${C.amber}` }}>Simpan Perubahan</button>}
            {!canEdit && <span style={{ height: 38, padding: "0 14px", borderRadius: 999, display: "inline-flex", alignItems: "center", fontWeight: 600, fontSize: 13, background: C.pillFill, color: C.steel }}>View Mode</span>}
            <ThemeToggle />
            <div title={displayName} style={{ width: 38, height: 38, borderRadius: "50%", background: C.chipBlueBg, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{(displayName || "?").slice(0, 2).toUpperCase()}</div>
            <button onClick={handleLogoutClick} style={pillBtn}>Log Out</button>
          </div>
            {kavlingSearch.trim() && (
              <div className="rounded-lg" style={{ position: "absolute", top: "100%", right: 0, width: "min(460px, 100%)", zIndex: 40, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", marginTop: 6, border: `1px solid ${C.line}`, background: C.panel, overflow: "hidden" }}>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {kavlingSearchResults.length === 0 ? (
                    <div className="text-xs p-2.5" style={{ color: C.steel }}>Tidak ditemukan.</div>
                  ) : (
                    kavlingSearchResults.map((r) => (
                      <div key={`${r.clusterId}-${r.house.id}`} className="flex items-center justify-between text-xs px-2.5 py-1.5" style={{ borderBottom: `1px solid ${C.line}` }}>
                        <div>
                          <div style={{ color: C.ink, fontWeight: 600, fontFamily: "IBM Plex Mono, monospace" }}>{r.kavlingLabel}</div>
                          <div style={{ color: C.steel }}>{r.clusterName}</div>
                        </div>
                        <button onClick={() => openKavlingFromSearch(r.clusterId, r.house.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.accent, color: "#fff", flexShrink: 0 }}>Buka</button>
                      </div>
                    ))
                  )}
                </div>
                {kavlingSearchAllMatches.length > KAVLING_SEARCH_LIMIT && (
                  <div className="text-xs px-2.5 py-1.5" style={{ color: C.steel, background: C.paper, borderTop: `1px solid ${C.line}` }}>
                    Menampilkan {KAVLING_SEARCH_LIMIT} dari {kavlingSearchAllMatches.length} hasil — ketik lebih spesifik untuk mempersempit.
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 8px 0" }}>
        {/* SAPAAN + AKSI */}
        <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
          <div>
            <div style={{ fontSize: 13, color: C.steel }}>{todayLabel}</div>
            <h1 style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", color: C.ink }}><GreetingText name={displayName} /></h1>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Created by Aditya Christiandi Sinulingga. Ver 2.0</div>
          </div>
          {clusters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={exportAllExcel} disabled={exportingExcelAll} style={pillBtn}>{exportingExcelAll ? <SmallSpinner /> : <Ic name="download" size={15} />} Export to Excel</button>
              <button onClick={exportAllBackup} disabled={exportingBackupAll} style={pillBtn}>{exportingBackupAll ? <SmallSpinner /> : <Ic name="download" size={15} />} Backup (JSON)</button>
              {canEdit && (
                <label style={{ ...pillBtn }}>
                  <Ic name="upload" size={15} /> Restore (JSON)
                  <input type="file" accept=".json" onChange={handleRestoreAllFile} style={{ display: "none" }} />
                </label>
              )}
              <button onClick={() => setShowWhatsNew(true)} style={{ ...pillBtn, background: C.accent, color: "#fff", border: `1px solid ${C.accent}` }}><Ic name="sparkle" size={15} /> What's New</button>
            </div>
          )}
        </div>
        {clusters.length === 0 && (
          <div className="mb-3 text-xs">
            <span style={{ color: C.steel }}>Tidak melihat data lama Anda? </span>
            <button onClick={recoverLegacyCluster} style={{ color: C.accent, textDecoration: "underline" }}>Coba pulihkan Cluster Bria</button>
          </div>
        )}
            {restoreAllResult && (
              <div className="mb-3 p-2 rounded-lg text-xs" style={{ background: C.infoBlueBg, border: `1px solid ${C.line}`, color: C.ink, position: "relative" }}>
                <button
                  onClick={() => setRestoreAllResult(null)}
                  title="Tutup"
                  className="flex items-center justify-center"
                  style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 8, color: "#fff", background: C.steel, fontSize: 12, lineHeight: 1 }}
                >✕</button>
                <div style={{ paddingRight: 24 }}>
                  <div style={{ color: C.green }}>✓ {restoreAllResult.restored.length} cluster berhasil dipulihkan{restoreAllResult.restored.length ? `: ${restoreAllResult.restored.join(", ")}` : ""}</div>
                  {restoreAllResult.failed.length > 0 && (
                    <div style={{ color: C.amber, marginTop: 2 }}>✕ {restoreAllResult.failed.length} gagal dipulihkan: {restoreAllResult.failed.join(", ")} — coba ulangi khusus untuk cluster ini.</div>
                  )}
                </div>
              </div>
            )}
            {restoreAllError && (
              <div className="mb-3 text-xs" style={{ color: C.amber }}>{restoreAllError}</div>
            )}
            {pendingRestoreAll && (
              <div className="mb-3 p-2.5 rounded-lg text-xs" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}` }}>
                <div style={{ color: C.ink, marginBottom: 8 }}>
                  File ini berisi <b>{pendingRestoreAll.length} cluster</b>: {pendingRestoreAll.map((c) => c.name).join(", ")}.<br />
                  Cluster yang masih ada sekarang (dicocokkan lewat ID internal, bukan nama) akan <b>ditimpa</b> datanya. Cluster yang sudah tidak ada akan dibuat ulang sebagai cluster baru. Lanjutkan?
                </div>
                <div className="flex gap-2">
                  <button onClick={applyRestoreAll} disabled={restoringAll} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: C.amber, color: "#fff" }}>
                    {restoringAll && <SmallSpinner />} Ya, Pulihkan
                  </button>
                  <button onClick={() => setPendingRestoreAll(null)} disabled={restoringAll} className="text-xs px-2.5 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                </div>
              </div>
            )}

        <div className="home-grid">
          <div style={{ minWidth: 0 }}>
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.ink }}>Cluster Anda</h2>
              <span className="text-xs" style={{ color: C.steel }}>{activeClusters.length} cluster aktif{Object.keys(clusterStats).length > 0 && totalSumHarga > 0 ? ` · margin keseluruhan ${overallMarginPct.toFixed(2)}%` : ""}</span>
            </div>

            {activeClusters.length > 4 && (
              <input
                value={clusterSearch}
                onChange={(e) => setClusterSearch(e.target.value)}
                placeholder="Cari cluster..."
                className="text-sm px-3 py-2 rounded-full border mb-3 w-full"
                style={{ borderColor: C.line, color: C.ink, background: C.panel, maxWidth: 320 }}
              />
            )}

            <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
              {activeClusters
                .filter((c) => !clusterSearch.trim() || `${c.name} ${c.subtitle}`.toLowerCase().includes(clusterSearch.trim().toLowerCase()))
                .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                .map((c) => {
                  const cs = clusterStats[c.id];
                  const hs = globalHousesIndex[c.id] || [];
                  const sold = hs.filter((h) => h.status && h.status.terjual).length;
                  const om = hs.filter((h) => h.status && h.status.marketingOrder).length;
                  const target = cs ? cs.target : 0;
                  const mappedPct = target ? Math.min(100, (hs.length / target) * 100) : 0;
                  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
                  const due = hs.filter((h) => h.followUpDate && h.followUpDate <= in7).length;
                  return (
                    <div key={c.id} className="rounded-2xl" style={{ background: C.panel, boxShadow: c.pinned ? `0 0 0 1.5px ${C.accent}` : C.cardShadow, padding: 18 }}>
                      {confirmDeleteClusterId === c.id ? (
                        <div>
                          <div className="text-xs mb-2" style={{ color: C.red }}>Hapus "{c.name}"? Semua data cluster ini (kavling, blok, tipe, gambar) akan hilang permanen.</div>
                          <div className="flex gap-2">
                            <button onClick={() => { deleteCluster(c.id); setConfirmDeleteClusterId(null); }} className="text-xs px-2 py-1.5 rounded-full flex-1" style={{ background: C.red, color: "#fff", border: "none" }}>Ya, Hapus</button>
                            <button onClick={() => setConfirmDeleteClusterId(null)} className="text-xs px-3 py-1.5 rounded-full" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Batal</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <input
                                value={c.name}
                                readOnly={!canEdit}
                                onChange={(e) => { setClusters((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x))); setHomeDirty(true); }}
                                onBlur={(e) => updateClusterMeta(c.id, { name: e.target.value })}
                                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                                className="editable-heading"
                                aria-label="Nama cluster"
                                style={{ color: C.ink, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", width: "100%", padding: 0, fontFamily: "inherit", fontSize: 17, fontWeight: 700 }}
                              />
                              <input
                                value={c.subtitle}
                                readOnly={!canEdit}
                                onChange={(e) => { setClusters((prev) => prev.map((x) => (x.id === c.id ? { ...x, subtitle: e.target.value } : x))); setHomeDirty(true); }}
                                onBlur={(e) => updateClusterMeta(c.id, { subtitle: e.target.value })}
                                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                                placeholder="Lokasi / catatan..."
                                className="editable-heading"
                                aria-label="Lokasi cluster"
                                style={{ color: C.steel, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", width: "100%", padding: 0, fontFamily: "inherit", fontSize: 13 }}
                              />
                            </div>
                            {canEdit && (
                              <button onClick={() => togglePinCluster(c.id)} title={c.pinned ? "Lepas pin" : "Pin cluster ini"} aria-label={c.pinned ? "Lepas pin" : "Pin cluster ini"} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.panel, color: c.pinned ? C.accent : C.steel, fontSize: 15, cursor: "pointer", flexShrink: 0 }}>★</button>
                            )}
                          </div>
                          {cs && (
                            <>
                              <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 12 }}>
                                <Pill color={C.accent}>{hs.length} / {target || "—"} kavling</Pill>
                                <Pill color={cs.marginPct >= 20 ? C.green : C.red}>Margin {cs.marginPct.toFixed(2)}%</Pill>
                                <Pill color={C.steel}>{cs.blockCount} blok</Pill>
                                {due > 0 && <Pill color={C.amber}>{due} perlu ditindaklanjuti</Pill>}
                              </div>
                              <div style={{ marginTop: 14 }}>
                                <div className="flex items-center justify-between" style={{ fontSize: 12, color: C.steel }}>
                                  <span>Kavling terpetakan</span><span>{target ? `${Math.round(mappedPct)}% dari target` : "target belum diisi"}</span>
                                </div>
                                <ProgressBar pct={mappedPct} color={C.accent} />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                                <div style={{ background: C.paper, borderRadius: 12, padding: "9px 12px" }}>
                                  <div style={{ fontSize: 12, color: C.steel }}>Sudah terjual</div>
                                  <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 500, marginTop: 2, color: C.ink }}>{sold} <span style={{ fontSize: 12, color: C.steel }}>/ {hs.length}</span></div>
                                </div>
                                <div style={{ background: C.paper, borderRadius: 12, padding: "9px 12px" }}>
                                  <div style={{ fontSize: 12, color: C.steel }}>Order Marketing</div>
                                  <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 500, marginTop: 2, color: C.ink }}>{om} <span style={{ fontSize: 12, color: C.steel }}>/ {hs.length}</span></div>
                                </div>
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
                            <button onClick={() => openCluster(c.id)} style={{ flex: 1, height: 40, borderRadius: 999, border: "none", background: C.accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Buka Cluster</button>
                            {canEdit && <button onClick={() => toggleArchiveCluster(c.id)} title="Arsipkan (sembunyikan tanpa menghapus)" style={{ ...pillBtn, height: 40, color: C.steel }}>Arsip</button>}
                            {canEdit && <button onClick={() => setConfirmDeleteClusterId(c.id)} style={{ ...pillBtn, height: 40, color: C.red }}>Hapus</button>}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

              {canEdit && (
                <div className="rounded-2xl flex flex-col items-center justify-center gap-2.5" style={{ border: `2px dashed ${C.line}`, padding: 18, minHeight: 200 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.panel, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: C.accent }}>+</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.steel }}>Tambah Cluster Baru</div>
                  <input value={newClusterName} onChange={(e) => setNewClusterName(e.target.value)} placeholder="Nama cluster baru..." aria-label="Nama cluster baru" className="text-sm px-3 py-2 rounded-full border w-full" style={{ borderColor: C.line, color: C.ink, background: C.panel }} />
                  <input value={newClusterSubtitle} onChange={(e) => setNewClusterSubtitle(e.target.value)} placeholder="Lokasi / catatan (opsional)..." aria-label="Lokasi cluster baru" className="text-xs px-3 py-2 rounded-full border w-full" style={{ borderColor: C.line, color: C.ink, background: C.panel }} />
                  <button
                    onClick={() => { if (!newClusterName.trim()) return; addCluster(newClusterName.trim(), newClusterSubtitle.trim()); setNewClusterName(""); setNewClusterSubtitle(""); }}
                    className="text-xs px-3 py-2 rounded-full w-full font-semibold"
                    style={{ background: C.accent, color: "#fff", border: "none" }}
                  >+ Tambah Cluster</button>
                </div>
              )}
            </div>

          {clusters.some((c) => c.archived) && (
            <div className="mt-2">
              <button onClick={() => setShowArchivedClusters((v) => !v)} className="text-xs" style={{ color: C.steel }}>
                {showArchivedClusters ? "▾" : "▸"} Cluster diarsipkan ({clusters.filter((c) => c.archived).length})
              </button>
              {showArchivedClusters && (
                <div className="mt-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                  {clusters.filter((c) => c.archived).map((c) => (
                    <div key={c.id} className="rounded-xl p-2.5 flex items-center justify-between gap-2" style={{ background: C.paper, border: `1px dashed ${C.line}` }}>
                      <div>
                        <div className="text-sm" style={{ color: C.steel }}>{c.name}</div>
                        <div className="text-xs" style={{ color: C.faint }}>{c.subtitle}</div>
                      </div>
                      <button onClick={() => toggleArchiveCluster(c.id)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.accent, background: C.panel, flexShrink: 0 }}>Buka Kembali</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
          <aside className="flex flex-col gap-3" style={{ minWidth: 0 }}>
          {(
            <div className="p-2.5 rounded-2xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
              <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <IconChip name="clock" bg={C.chipAmberBg} color={C.amber} size={34} />
                  <div className="text-sm font-semibold" style={{ color: C.ink }}>Perlu Ditindaklanjuti ({homeFollowUpList.length})</div>
                </div>
                {homeAllFollowUpList.length > 0 && <div className="flex" style={{ background: C.pillFill, borderRadius: 10, padding: 3 }}>
                  <button onClick={() => setFollowUpView("list")} className="text-xs font-semibold px-2.5 py-1" style={{ borderRadius: 8, background: followUpView === "list" ? C.accent : "transparent", color: followUpView === "list" ? "#fff" : C.steel, border: "none" }}>Daftar</button>
                  <button onClick={() => setFollowUpView("kalender")} className="text-xs font-semibold px-2.5 py-1" style={{ borderRadius: 8, background: followUpView === "kalender" ? C.accent : "transparent", color: followUpView === "kalender" ? "#fff" : C.steel, border: "none" }}>Kalender</button>
                </div>}
              </div>

              {followUpView === "list" && homeAllFollowUpList.length > 0 ? (
                homeFollowUpList.length === 0 ? (
                  <div className="text-xs" style={{ color: C.steel, paddingLeft: 46 }}>Tidak ada yang jatuh tempo dalam 7 hari ke depan. Cek "Kalender" untuk melihat semuanya.</div>
                ) : (
                  <div className="flex flex-col gap-1.5" style={{ paddingLeft: 46 }}>
                    {homeFollowUpList.slice(0, 8).map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-xs">
                        <span onClick={() => openKavlingFromSearch(h.clusterId, h.id)} style={{ color: C.ink, cursor: "pointer", textDecoration: "underline" }}>
                          {h.clusterName} · {h.blok}-{h.noKavling}
                        </span>
                        <span style={{ color: h.overdue ? C.red : C.steel, fontFamily: "IBM Plex Mono, monospace" }}>
                          {h.overdue ? "Lewat tenggat — " : ""}{new Date(h.followUpDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    ))}
                    {homeFollowUpList.length > 8 && <div className="text-xs" style={{ color: C.steel }}>+{homeFollowUpList.length - 8} lainnya</div>}
                  </div>
                )
              ) : (() => {
                const { y, m } = calendarMonth;
                const cells = buildCalendarGrid(y, m);
                const todayStr = new Date().toISOString().slice(0, 10);
                const selectedItems = calendarSelectedDate ? (followUpsByDate[calendarSelectedDate] || []) : [];
                return (
                  <div style={{ maxWidth: 300, margin: "0 auto" }}>
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => setCalendarMonth((s) => { const dm = new Date(s.y, s.m - 1, 1); return { y: dm.getFullYear(), m: dm.getMonth() }; })} style={{ width: 22, height: 22, lineHeight: "20px", textAlign: "center", border: `1px solid ${C.line}`, borderRadius: 6, color: C.ink, background: C.panel, fontSize: 12 }}>&lsaquo;</button>
                      <div className="text-xs font-semibold" style={{ color: C.ink }}>{MONTH_LABELS[m]} {y}</div>
                      <button onClick={() => setCalendarMonth((s) => { const dm = new Date(s.y, s.m + 1, 1); return { y: dm.getFullYear(), m: dm.getMonth() }; })} style={{ width: 22, height: 22, lineHeight: "20px", textAlign: "center", border: `1px solid ${C.line}`, borderRadius: 6, color: C.ink, background: C.panel, fontSize: 12 }}>&rsaquo;</button>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                      {WEEKDAY_LABELS.map((wd) => (
                        <div key={wd} className="text-center" style={{ fontSize: 11, color: C.steel, fontWeight: 600, paddingBottom: 2 }}>{wd}</div>
                      ))}
                      {cells.map((dateStr, i) => {
                        if (!dateStr) return <div key={i} style={{ height: 34 }} />;
                        const items = followUpsByDate[dateStr] || [];
                        const hasOverdue = items.some((it) => it.overdue);
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === calendarSelectedDate;
                        return (
                          <div
                            key={i}
                            onClick={() => setCalendarSelectedDate(isSelected ? null : dateStr)}
                            className="flex flex-col items-center justify-center"
                            style={{
                              height: 34, borderRadius: 8, fontSize: 12, cursor: "pointer",
                              color: items.length > 0 ? C.ink : C.steel,
                              background: isSelected ? C.amber : isToday ? C.panel : "transparent",
                              border: isToday ? `1px solid ${C.amber}` : "1px solid transparent",
                              fontWeight: items.length > 0 ? 600 : 400,
                            }}
                          >
                            <span style={{ color: isSelected ? "#fff" : undefined }}>{Number(dateStr.slice(-2))}</span>
                            {items.length > 0 && (
                              <span style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 1, background: isSelected ? "#fff" : hasOverdue ? C.red : C.amber }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {calendarSelectedDate && (
                      <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${C.amber}` }}>
                        <div className="text-xs font-semibold mb-1" style={{ color: C.ink }}>
                          {new Date(calendarSelectedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        {selectedItems.length === 0 ? (
                          <div className="text-xs" style={{ color: C.steel }}>Tidak ada follow-up di tanggal ini.</div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {selectedItems.map((h) => (
                              <div key={h.id} onClick={() => openKavlingFromSearch(h.clusterId, h.id)} className="text-xs" style={{ color: h.overdue ? C.red : C.ink, cursor: "pointer", textDecoration: "underline" }}>
                                {h.clusterName} · {h.blok}-{h.noKavling}{h.overdue ? " (lewat tenggat)" : ""}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {homeDuplicateList.length > 0 && (
            <div className="p-2.5 rounded-2xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <IconChip name="warning" bg={C.chipRedBg} color={C.red} size={34} />
                <div className="text-sm font-semibold" style={{ color: C.ink }}>Nomor Kavling Duplikat ({homeDuplicateList.length})</div>
              </div>
              <div className="flex flex-col gap-1.5" style={{ paddingLeft: 46 }}>
                {homeDuplicateList.slice(0, 8).map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs">
                    <span onClick={() => openKavlingFromSearch(h.clusterId, h.id)} style={{ color: C.ink, cursor: "pointer", textDecoration: "underline" }}>
                      {h.clusterName} · {h.blok}-{h.noKavling}
                    </span>
                  </div>
                ))}
                {homeDuplicateList.length > 8 && <div className="text-xs" style={{ color: C.steel }}>+{homeDuplicateList.length - 8} lainnya</div>}
              </div>
            </div>
          )}

            <div className="p-3 rounded-2xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
              <div className="text-sm font-semibold mb-1.5" style={{ color: C.ink }}>Keamanan data</div>
              {(() => {
                const daysSince = lastBackupAt ? Math.floor((Date.now() - lastBackupAt) / 86400000) : null;
                const shouldRemind = daysSince === null || daysSince >= 3;
                return (
                  <div className="text-xs" style={{ color: shouldRemind ? C.amber : C.steel, lineHeight: 1.5 }}>
                    {daysSince === null ? "Belum pernah backup. Yuk unduh cadangan biar aman." : shouldRemind ? `Sudah ${daysSince} hari tidak backup. Yuk unduh cadangan biar aman.` : `Terakhir backup: ${daysSince === 0 ? "hari ini" : `${daysSince} hari lalu`}.`}
                  </div>
                );
              })()}
              {clusters.length > 0 && (
                <button onClick={exportAllBackup} disabled={exportingBackupAll} className="text-xs px-3 py-2 rounded-full font-semibold mt-2.5 w-full flex items-center justify-center gap-1.5" style={{ background: C.accent, color: "#fff", border: "none" }}>
                  {exportingBackupAll ? <SmallSpinner /> : <Ic name="download" size={14} />} Backup sekarang
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
