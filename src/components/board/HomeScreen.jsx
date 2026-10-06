import { C } from "../../theme";
import { ClockText, GreetingText, Ic, IconChip, MONO, Pill, ProgressBar } from "../../components/ui";
import { MONTH_LABELS, WEEKDAY_LABELS, buildCalendarGrid } from "../../lib/helpers";
import ThemeToggle from "../../components/ThemeToggle";
import { useBoard } from "./BoardContext";

export default function HomeScreen() {
  const { KAVLING_SEARCH_LIMIT, SmallSpinner, addCluster, appTitle, applyRestoreAll, calendarMonth, calendarSelectedDate, canEdit, clusterImages, clusterSearch, clusterStats, clusters, confirmDeleteClusterId, deleteCluster, displayName, exportAllBackup, exportAllExcel, exportingBackupAll, exportingExcelAll, followUpView, followUpsByDate, globalHousesIndex, handleLogoutClick, handleRestoreAllFile, homeAllFollowUpList, homeDirty, homeDuplicateList, homeFollowUpList, homeSavedToast, homeSaving, kavlingSearch, kavlingSearchAllMatches, kavlingSearchResults, lastBackupAt, newClusterName, newClusterSubtitle, openCluster, openKavlingFromSearch, pendingRestoreAll, recoverLegacyCluster, restoreAllError, restoreAllResult, restoringAll, saveAppTitle, saveHomeChanges, setAppTitle, setCalendarMonth, setCalendarSelectedDate, setClusterSearch, setClusters, setConfirmDeleteClusterId, setFollowUpView, setHomeDirty, setKavlingSearch, setNewClusterName, setNewClusterSubtitle, setPendingRestoreAll, setRestoreAllResult, setShowArchivedClusters, setShowWhatsNew, showArchivedClusters, toggleArchiveCluster, togglePinCluster, updateClusterMeta } = useBoard();
  return (
    <>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="mb-4">
            <div className="rounded-2xl p-3 mb-1" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            <div className="flex items-center justify-between gap-2.5 flex-wrap">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>CB</div>
              <input
                value={appTitle}
                readOnly={!canEdit}
                onChange={(e) => { setAppTitle(e.target.value); setHomeDirty(true); }}
                onBlur={() => saveAppTitle(appTitle)}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                className="text-lg font-semibold editable-heading"
                title={canEdit ? "Klik untuk edit judul" : undefined}
                style={{ color: C.ink, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", flex: 1, minWidth: 200, padding: 0, fontFamily: "Inter, sans-serif" }}
              />
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                {homeSaving && <SmallSpinner />}
                {!homeSaving && homeDirty && <span className="text-xs" style={{ color: C.amber }}>Ada perubahan belum disimpan</span>}
                {!homeSaving && homeSavedToast && <span className="text-xs" style={{ color: C.green }}>Tersimpan ✓</span>}
                {canEdit && <button onClick={saveHomeChanges} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: C.accent, color: "#fff" }}>Simpan Perubahan</button>}
                {!canEdit && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: C.pillFill, color: C.steel }}>View Mode</span>}
                <button onClick={handleLogoutClick} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ border: "none", color: C.red, background: C.chipRedBg }}>Log Out</button>
                <ThemeToggle />
              </div>
            </div>
            </div>
            <div className="mt-3" style={{ color: C.ink, fontSize: 26, fontWeight: 700, letterSpacing: "-0.3px" }}><GreetingText name={displayName} /></div>
            <div className="text-xs mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.steel }}><ClockText /></div>
            <div className="text-xs mt-0.5" style={{ color: C.faint }}>Created by Aditya Christiandi Sinulingga. Ver 2.0</div>
            {clusters.length === 0 && (
              <div className="mt-2 text-xs">
                <span style={{ color: C.steel }}>Tidak melihat data lama Anda? </span>
                <button onClick={recoverLegacyCluster} style={{ color: C.accent, textDecoration: "underline" }}>Coba pulihkan Cluster Bria</button>
              </div>
            )}
            {clusters.length > 0 && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button onClick={exportAllExcel} disabled={exportingExcelAll} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ border: "none", color: C.green, background: C.pillFill }}>
                  {exportingExcelAll ? <SmallSpinner /> : <Ic name="download" size={14} />} Export to Excel
                </button>
                <button onClick={exportAllBackup} disabled={exportingBackupAll} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ border: "none", color: C.accent, background: C.pillFill }}>
                  {exportingBackupAll ? <SmallSpinner /> : <Ic name="download" size={14} />} Backup (JSON)
                </button>
                {canEdit && (
                  <label className="text-xs px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1.5" style={{ border: "none", color: C.steel, background: C.pillFill }}>
                    <Ic name="upload" size={14} /> Restore (JSON)
                    <input type="file" accept=".json" onChange={handleRestoreAllFile} style={{ display: "none" }} />
                  </label>
                )}
                <button onClick={() => setShowWhatsNew(true)} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ border: "none", color: C.steel, background: C.pillFill }}>
                  <Ic name="sparkle" size={14} /> What's New
                </button>
              </div>
            )}
            {restoreAllResult && (
              <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: C.infoBlueBg, border: `1px solid ${C.line}`, color: C.ink, position: "relative" }}>
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
              <div className="mt-2 text-xs" style={{ color: C.amber }}>{restoreAllError}</div>
            )}
            {pendingRestoreAll && (
              <div className="mt-2 p-2.5 rounded-lg text-xs" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}` }}>
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
          </div>


          <div className="home-grid">
            <div style={{ minWidth: 0 }}>
          <div className="mb-3">
            <div className="text-base font-semibold mb-2 flex items-center gap-2" style={{ color: C.ink }}><Ic name="search" size={17} color={C.steel} /> Pencarian Blok</div>
            <input
              value={kavlingSearch}
              onChange={(e) => setKavlingSearch(e.target.value)}
              placeholder="Cari nomor kavling di semua cluster... (mis. RB/A-11)"
              className="text-sm px-3 py-2.5 rounded-full w-full kavling-search-input"
              style={{ border: `1px solid ${C.line}`, color: C.ink, background: C.panel }}
            />
            {kavlingSearch.trim() && (
              <div className="mt-2 rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.panel, overflow: "hidden" }}>
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

          {clusters.length > 0 && Object.keys(clusterStats).length > 0 && (
            <div className="text-base font-semibold mb-2 flex items-center gap-2" style={{ color: C.ink }}><Ic name="chart" size={17} color={C.steel} /> Dashboard</div>
          )}
          {clusters.length > 0 && Object.keys(clusterStats).length > 0 && (() => {
            const totalSumHarga = Object.values(clusterStats).reduce((s, x) => s + (x.sumHarga || 0), 0);
            const totalSumHpp = Object.values(clusterStats).reduce((s, x) => s + (x.sumHpp || 0), 0);
            const overallMarginPct = totalSumHarga ? ((totalSumHarga - totalSumHpp) / totalSumHarga) * 100 : 0;
            return (
              <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                {[
                  { label: "Total Cluster", value: `${clusters.length}` },
                  { label: "Margin Keseluruhan", value: `${overallMarginPct.toFixed(2)}%` },
                ].map((s) => (
                  <div key={s.label} className="p-2.5 rounded-xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
                    <div style={{ fontSize: 11, color: C.steel, marginBottom: 3 }}>{s.label}</div>
                    <div className="text-base font-semibold" style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace", overflowWrap: "anywhere" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {clusters.length > 0 && Object.keys(clusterStats).length > 0 && (
            <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {clusters
                .filter((c) => !c.archived && clusterStats[c.id] && clusterStats[c.id].marginByTipe.length > 0)
                .map((c) => {
                  const cs = clusterStats[c.id];
                  return (
                    <div key={c.id} className="p-2.5 rounded-xl" style={{ background: C.panel, boxShadow: C.cardShadow }}>
                      <div className="text-sm font-medium mb-2" style={{ color: C.ink }}>
                        Margin {c.name} — <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>{cs.marginPct.toFixed(1)}%</span>
                        <span className="text-xs" style={{ color: C.steel, fontFamily: "Inter, sans-serif", fontWeight: 400 }}> · total {cs.total} unit</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {cs.marginByTipe.map((t) => (
                          <div key={t.tipe} className="flex items-center justify-between text-xs">
                            <span style={{ color: C.ink }}>{t.tipe} <span style={{ color: C.steel }}>· {t.n} unit</span></span>
                            <span style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{t.marginPct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="text-base font-semibold mb-2 flex items-center gap-2" style={{ color: C.ink }}><Ic name="home" size={17} color={C.steel} /> Cluster</div>

          {clusters.filter((c) => !c.archived).length > 4 && (
            <input
              value={clusterSearch}
              onChange={(e) => setClusterSearch(e.target.value)}
              placeholder="Cari cluster..."
              className="text-sm px-2.5 py-1.5 rounded-lg border mb-2.5 w-full"
              style={{ borderColor: C.line, color: C.ink, maxWidth: 320 }}
            />
          )}

          <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {clusters
              .filter((c) => !c.archived)
              .filter((c) => !clusterSearch.trim() || `${c.name} ${c.subtitle}`.toLowerCase().includes(clusterSearch.trim().toLowerCase()))
              .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
              .map((c) => (
              <div key={c.id} className="rounded-2xl p-4" style={{ background: C.panel, boxShadow: C.cardShadow, border: c.pinned ? `1px solid ${C.accent}` : "none" }}>
                {clusterImages[c.id] ? (
                  <img src={clusterImages[c.id]} alt={c.name} loading="lazy" decoding="async" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 10, border: `1px solid ${C.line}` }} />
                ) : (
                  <div className="flex items-center justify-center" style={{ width: "100%", height: 100, borderRadius: 8, marginBottom: 10, border: `1px dashed ${C.line}`, background: C.paper }}>
                    <span className="text-xs" style={{ color: C.faint }}>Belum ada site plan</span>
                  </div>
                )}
                {confirmDeleteClusterId === c.id ? (
                  <div>
                    <div className="text-xs mb-2" style={{ color: C.red }}>Hapus "{c.name}"? Semua data cluster ini (kavling, blok, tipe, gambar) akan hilang permanen.</div>
                    <div className="flex gap-2">
                      <button onClick={() => { deleteCluster(c.id); setConfirmDeleteClusterId(null); }} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                      <button onClick={() => setConfirmDeleteClusterId(null)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-1">
                      <input
                        value={c.name}
                        readOnly={!canEdit}
                        onChange={(e) => { setClusters((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x))); setHomeDirty(true); }}
                        onBlur={(e) => updateClusterMeta(c.id, { name: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-base font-semibold editable-heading"
                        style={{ color: C.ink, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", width: "100%", padding: 0, marginBottom: 2, fontFamily: "Inter, sans-serif" }}
                      />
                      {canEdit && <button onClick={() => togglePinCluster(c.id)} title={c.pinned ? "Lepas pin" : "Pin cluster ini"} style={{ color: c.pinned ? C.accent : C.faint, fontSize: 16, lineHeight: 1, flexShrink: 0 }}>★</button>}
                    </div>
                    <input
                      value={c.subtitle}
                      readOnly={!canEdit}
                      onChange={(e) => { setClusters((prev) => prev.map((x) => (x.id === c.id ? { ...x, subtitle: e.target.value } : x))); setHomeDirty(true); }}
                      onBlur={(e) => updateClusterMeta(c.id, { subtitle: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Lokasi / catatan..."
                      className="text-xs editable-heading"
                      style={{ color: C.steel, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", width: "100%", padding: 0, marginBottom: 12, fontFamily: "Inter, sans-serif" }}
                    />
                    {clusterStats[c.id] && (() => {
                      const hs = globalHousesIndex[c.id] || [];
                      const sold = hs.filter((h) => h.status && h.status.terjual).length;
                      const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
                      const due = hs.filter((h) => h.followUpDate && h.followUpDate <= in7).length;
                      const mp = clusterStats[c.id].marginPct;
                      return (
                        <div className="mb-2.5">
                          <div className="flex items-center justify-between" style={{ fontSize: 11, color: C.steel }}>
                            <span>Terjual</span>
                            <span style={{ color: C.ink, fontFamily: MONO }}>{sold} / {hs.length}{hs.length ? ` (${Math.round((sold / hs.length) * 100)}%)` : ""}</span>
                          </div>
                          <ProgressBar pct={hs.length ? (sold / hs.length) * 100 : 0} color={C.green} />
                          <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 8 }}>
                            <Pill color={C.steel}>{clusterStats[c.id].blockCount} blok</Pill>
                            <Pill color={mp >= 20 ? C.green : C.red}>Margin {mp.toFixed(1)}%</Pill>
                            {due > 0 && <Pill color={C.amber}>{due} perlu ditindaklanjuti</Pill>}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex items-center gap-2">
                      <button onClick={() => openCluster(c.id)} className="text-xs px-2.5 py-2 rounded-full flex-1 font-semibold" style={{ background: C.accent, color: "#fff", border: "none" }}>Buka Cluster</button>
                      {canEdit && <button onClick={() => toggleArchiveCluster(c.id)} title="Arsipkan (sembunyikan tanpa menghapus)" className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Arsip</button>}
                      {canEdit && <button onClick={() => setConfirmDeleteClusterId(c.id)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.red, background: C.panel }}>Hapus</button>}
                    </div>
                  </>
                )}
              </div>
            ))}

            {canEdit && (
              <div className="rounded-xl p-3 flex flex-col items-center justify-center gap-2" style={{ border: `1px dashed ${C.line}`, minHeight: 120 }}>
                <input
                  value={newClusterName}
                  onChange={(e) => setNewClusterName(e.target.value)}
                  placeholder="Nama cluster baru..."
                  className="text-sm px-2 py-1 rounded-lg border w-full"
                  style={{ borderColor: C.line, color: C.ink }}
                />
                <input
                  value={newClusterSubtitle}
                  onChange={(e) => setNewClusterSubtitle(e.target.value)}
                  placeholder="Lokasi / catatan (opsional)..."
                  className="text-xs px-2 py-1 rounded-lg border w-full"
                  style={{ borderColor: C.line, color: C.ink }}
                />
                <button
                  onClick={() => { if (!newClusterName.trim()) return; addCluster(newClusterName.trim(), newClusterSubtitle.trim()); setNewClusterName(""); setNewClusterSubtitle(""); }}
                  className="text-xs px-2.5 py-1 rounded-lg w-full"
                  style={{ background: C.green, color: "#fff" }}
                >+ Tambah Cluster Baru</button>
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
