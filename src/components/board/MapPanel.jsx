import { C } from "../../theme";
import { BTN_PILL, Chip, Field, Ic, btnPrimary, btnSecondary, cellInput, formInput } from "../../components/ui";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { centroid, shortKavlingLabel } from "../../lib/helpers";
import { buildColorGroups } from "../../lib/colorGroups";
import { downloadSitePlanPng } from "../../lib/mapExport";
import { layoutHouseLabels } from "../../lib/labelLayout";
import ColorPills from "./ColorPills";
import PolyShape from "./PolyShape";
import { useBoard } from "./BoardContext";

export default function MapPanel() {
  const { kontraktorLegend, actionMenuId, activeBlock, activeTipe, blockProgress, canEdit, editMap, printSitePlan, setActiveBlock, setActiveTipe, setDrawingPoints, setEditMap, setEditPoints, setEditingShapeId, setOpacity, blockColor, blocks, calibrating, cancelDrawing, cancelEditShape, colorMode, confirmDeleteId, draft, draftCentroid, drawingPoints, editPoints, editingShapeId, finishPolygon, handleImageClick, handleImageUpload, handleTouchEnd, handleTouchMove, handleTouchStart, handleWheelZoom, houses, activeCluster, statusFields, imgUploading, imgWrapRef, mapHeight, opacity, planBoxRef, polyColor, polygonsClickable, removeHouse, saveEditShape, selectFromMap, selectedId, setActionMenuId, setConfirmDeleteId, setDraft, setSelectedId, setZoom, siteImage, startEditShape, startVertexDrag, submitDraft, tipeOptions, undoPoint, updateHouse, zoom } = useBoard();
  // Tinggi gambar yang sedang tampil. Di HP kotak Site Plan dipendekkan
  // sampai setinggi gambar (lihat .plan-box di index.css). Koordinat poligon
  // TIDAK disentuh: lapisan SVG tetap berbentuk persegi seperti semula,
  // karena semua poligon tersimpan di ruang koordinat itu.
  const zoomBtn = { width: 34, height: 30, borderRadius: 10, border: `1px solid ${C.line}`, background: C.panel, color: C.ink, cursor: "pointer", fontSize: 15, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,.08)" };
  const imgRef = useRef(null);
  const [imgH, setImgH] = useState(null);
  // Rincian kavling di bawah legenda (ikut pilihan Warna peta). Buka/tutup
  // diingat per perangkat.
  const [showRincian, setShowRincianState] = useState(() => { try { return localStorage.getItem("bria-rincian") !== "0"; } catch (e) { return true; } });
  const setShowRincian = (v) => { setShowRincianState(v); try { localStorage.setItem("bria-rincian", v ? "1" : "0"); } catch (e) {} };
  const colorGroups = useMemo(
    () => buildColorGroups({ colorMode, houses, blocks, tipeOptions, kontraktorLegend, blockColor }),
    [colorMode, houses, blocks, tipeOptions, kontraktorLegend]
  );
  // Legenda interaktif: klik satu kelompok untuk menyembunyikannya di peta. Dikosongkan saat Warna peta diganti.
  const [hiddenKeys, setHiddenKeys] = useState([]);
  useEffect(() => { setHiddenKeys([]); }, [colorMode]);
  const [showNumbers, setShowNumbers] = useState(() => { try { return localStorage.getItem("bria-map-numbers") !== "0"; } catch (e) { return true; } });
  const toggleNumbers = () => setShowNumbers((v) => { const n = !v; try { localStorage.setItem("bria-map-numbers", n ? "1" : "0"); } catch (e) {} return n; });
  const groupKeyOf = (h) => (
    colorMode === "blok" ? h.blok
      : colorMode === "tipe" ? h.tipe
        : colorMode === "kontraktor" ? ((h.kontraktor || "").trim() || "(belum diisi)")
          : (h.status[colorMode] ? "Sudah" : "Belum")
  );
  const isHidden = (h) => !calibrating && hiddenKeys.includes(groupKeyOf(h));
  const legendItems = colorMode === "blok" ? blocks.map((b) => ({ key: b.name, label: b.name, color: blockColor(b.name) }))
    : colorMode === "tipe" ? tipeOptions.map((t) => ({ key: t.name, label: t.name, color: t.color }))
      : colorMode === "kontraktor" ? kontraktorLegend.map((k) => ({ key: k.label, label: `${k.label} (${k.count})`, color: k.color }))
        : [{ key: "Sudah", label: "Sudah", color: C.green }, { key: "Belum", label: "Belum", color: C.red }];
  const toggleKey = (key) => setHiddenKeys((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
  const modeLabel = colorMode === "blok" ? "Per Blok" : colorMode === "tipe" ? "Per Tipe" : colorMode === "kontraktor" ? "Per Kontraktor" : ((statusFields.find((s) => s.key === colorMode) || {}).label || colorMode);
  const [exporting, setExporting] = useState(false);
  async function exportPng() {
    setExporting(true);
    try {
      const name = ((activeCluster && activeCluster.name) || "cluster").trim() || "cluster";
      await downloadSitePlanPng({
        siteImage, houses, polyColor, opacity, isHidden, showNumbers, labelOf: shortKavlingLabel,
        legend: legendItems.filter((l) => !hiddenKeys.includes(l.key)),
        title: `Site Plan ${name}`,
        subtitle: `Warna: ${modeLabel} · ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
      }, `siteplan-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${modeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`);
    } catch (e) {
      alert("Gambar peta tidak bisa diekspor. " + (e && e.message ? e.message : ""));
    }
    setExporting(false);
  }
  // Poligon dihitung sekali per perubahan datanya (bukan tiap render), dan tiap poligon dibungkus React.memo.
  const ptsCache = useRef(new WeakMap());
  const polyItems = useMemo(() => {
    const blockIdx = new Map(blocks.map((b, i) => [b.name, i]));
    return houses.filter((h) => h.id !== editingShapeId).map((h, hi) => {
      let pts = ptsCache.current.get(h.points);
      if (!pts) { pts = h.points.map((p) => `${p.x},${p.y}`).join(" "); ptsCache.current.set(h.points, pts); }
      return {
        id: h.id, pts, fill: polyColor(h), hidden: isHidden(h),
        delay: `${Math.max(0, blockIdx.get(h.blok) ?? 0) * 110 + (hi % 9) * 30}ms`,
        title: `${h.blok}-${h.noKavling}`,
      };
    });
    // eslint-disable-next-line
  }, [houses, editingShapeId, colorMode, blocks, tipeOptions, kontraktorLegend, hiddenKeys, calibrating, statusFields]);
  // Kode kavling (Show Blok): satu ukuran huruf, anti-bentrok. Dihitung ulang hanya bila data, zoom, atau ukuran peta berubah.
  const labelData = useMemo(() => {
    if (!showNumbers || calibrating || zoom < 150) return null;
    const wrapW = (planBoxRef.current ? planBoxRef.current.clientWidth : 0) * (zoom / 100);
    if (!wrapW) return null;
    const { font, labels } = layoutHouseLabels(houses, { labelOf: shortKavlingLabel, isHidden: (h) => isHidden(h) || h.id === editingShapeId, size: wrapW, min: 6.5, max: 12 });
    return font && labels.length ? { font, labels } : null;
    // eslint-disable-next-line
  }, [showNumbers, calibrating, zoom, houses, editingShapeId, hiddenKeys, colorMode, imgH]);
  const pickRef = useRef(null);
  pickRef.current = (e, id) => {
    e.stopPropagation();
    if (calibrating) { setActionMenuId(id); setSelectedId(id); }
    else selectFromMap(id);
  };
  const onPick = useCallback((e, id) => pickRef.current(e, id), []);
  const selectedHouse = selectedId ? houses.find((h) => h.id === selectedId && h.id !== editingShapeId) : null;
  useEffect(() => {
    const el = imgRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => setImgH(Math.round(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [siteImage]);
  return (
    <>
    <div style={{ marginBottom: 12 }}>
    <div className="rounded-xl p-2.5" style={{ background: C.panel, boxShadow: C.cardShadow, position: "relative" }}>
        <div>
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Site Plan</div>
              <div className="text-xs" style={{ color: C.steel }}>Cubit layar atau tekan Ctrl + scroll untuk zoom cepat</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {calibrating && drawingPoints.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: C.ink }}>{drawingPoints.length} titik</span>
                  <button onClick={undoPoint} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Undo</button>
                  <button onClick={finishPolygon} disabled={drawingPoints.length < 3} className="text-xs px-2 py-1 rounded-lg" style={{ background: drawingPoints.length < 3 ? C.faint : C.green, color: "#fff" }}>Selesai Poligon</button>
                  <button onClick={cancelDrawing} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Batal</button>
                </div>
              )}
              {canEdit && (
                <button
                  onClick={() => { setEditMap((v) => !v); setDraft(null); setDrawingPoints([]); setEditingShapeId(null); setEditPoints(null); setActionMenuId(null); setConfirmDeleteId(null); }}
                  className={BTN_PILL}
                  style={editMap ? { border: `1px solid ${C.amber}`, background: C.alertAmberBg, color: C.amber } : btnSecondary}
                >
                  <Ic name="pencil" size={14} /> {editMap ? "Edit Site Plan aktif — klik untuk selesai" : "Edit Site Plan"}
                </button>
              )}
              {siteImage && !calibrating && <button onClick={exportPng} disabled={exporting} className={BTN_PILL} style={btnSecondary} title="Simpan peta berwarna sebagai gambar PNG"><Ic name="download" size={14} /> {exporting ? "Menyiapkan…" : "PNG"}</button>}
              {siteImage && <button onClick={printSitePlan} className={BTN_PILL} style={btnPrimary}><Ic name="printer" size={14} /> Cetak</button>}
            </div>
          </div>

          {siteImage && (
            <div className="flex items-center justify-between gap-2.5 flex-wrap mb-2.5">
              {!calibrating ? <ColorPills /> : <span />}
              <div className="flex items-center gap-3 flex-wrap">
                {!calibrating && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: C.steel }}>Opacity</span>
                    <input type="range" min="10" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} aria-label="Opacity warna peta" style={{ width: 90 }} />
                    <span className="text-xs" style={{ color: C.steel, fontFamily: "IBM Plex Mono, monospace", minWidth: 30 }}>{opacity}%</span>
                  </div>
                )}
              <div className="flex items-center gap-1.5">
                <button onClick={() => setZoom((z) => Math.max(50, z - 20))} aria-label="Perkecil peta" style={zoomBtn}>−</button>
                <button onClick={() => setZoom((z) => Math.min(400, z + 20))} aria-label="Perbesar peta" style={zoomBtn}>+</button>
                <button onClick={() => setZoom(100)} title="Kembali ke 100%" aria-label="Setel ulang zoom" style={{ ...zoomBtn, width: "auto", padding: "0 10px", fontSize: 11, fontWeight: 600 }}>{Math.round(zoom)}%</button>
                <button onClick={toggleNumbers} aria-pressed={showNumbers} title="Kode kavling (mis. B-01) muncul di peta saat di-zoom, hanya bila cukup muat" style={{ ...zoomBtn, width: "auto", padding: "0 10px", fontSize: 11, fontWeight: 600, background: showNumbers ? C.selectSoft : C.panel }}>Show Blok</button>
                {selectedId && (
                  <button onClick={() => setSelectedId(null)} title="Hapus highlight kavling terpilih" className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Clear</button>
                )}
              </div>
              </div>
            </div>
          )}

          {calibrating && (
            <div className="flex flex-col gap-2 mb-2.5 p-2.5 rounded-xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              {(blocks.length === 0 || tipeOptions.length === 0) ? (
                <p className="text-xs" style={{ color: C.amber }}>
                  Cluster ini belum punya {blocks.length === 0 && tipeOptions.length === 0 ? "Blok maupun Tipe" : blocks.length === 0 ? "Blok" : "Tipe"}. Tambahkan dulu lewat menu "Settings" sebelum bisa menggambar kavling.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs" style={{ color: C.steel }}>Blok aktif:</span>
                    {blocks.map((b) => (
                      <Chip key={b.id} active={activeBlock === b.name} onClick={() => setActiveBlock(b.name)}>
                        {b.name} ({blockProgress.find((p) => p.name === b.name)?.placed || 0}/{b.target})
                      </Chip>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs" style={{ color: C.steel }}>Tipe aktif:</span>
                    {tipeOptions.map((t) => (
                      <Chip key={t.id} active={activeTipe === t.name} onClick={() => setActiveTipe(t.name)}>{t.name}</Chip>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: C.steel }}>Pilih Blok &amp; Tipe aktif di atas, lalu klik tiap sudut kavling mengikuti bentuknya (min. 3 titik), lalu "Selesai Poligon" dan isi nomor kavlingnya. Klik bentuk yang sudah ada untuk menghapusnya.</p>
                </>
              )}
            </div>
          )}

          {!siteImage ? (
            <div className="flex flex-col items-center justify-center gap-2.5 py-16" style={{ border: `1px dashed ${C.line}`, borderRadius: 8, background: C.paper }}>
              <div className="text-sm" style={{ color: C.steel }}>Cluster ini belum punya gambar site plan.</div>
              <label className="text-xs px-2.5 py-1 rounded-lg cursor-pointer" style={{ background: C.accent, color: "#fff" }}>
                {imgUploading ? "Mengunggah..." : "Unggah Gambar Site Plan"}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={imgUploading} />
              </label>
            </div>
          ) : (
          <div style={{ position: "relative" }}>
          <div
            ref={planBoxRef}
            className="plan-box"
            style={{ "--img-h": imgH ? `${imgH + 2}px` : "auto", overflow: "auto", ...(mapHeight ? { height: mapHeight } : { maxHeight: 640 }), border: `1px solid ${C.line}`, borderRadius: 8, touchAction: "pan-x pan-y" }}
            onWheel={handleWheelZoom}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div ref={imgWrapRef} style={{ position: "relative", display: "grid", width: `${zoom}%`, cursor: calibrating ? "crosshair" : "default" }} onClick={handleImageClick}>
              <img ref={imgRef} src={siteImage} alt="Site plan" style={{ gridArea: "1 / 1", width: "100%", display: "block", userSelect: "none" }} draggable={false} />
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ gridArea: "1 / 1", width: "100%", height: "100%" }}>
                {polyItems.map((it) => (
                  <PolyShape key={it.id} id={it.id} pts={it.pts} fill={it.fill} opacity={opacity} clickable={polygonsClickable} hidden={it.hidden} delay={it.delay} title={it.title} onPick={onPick} />
                ))}
                {selectedHouse && (() => {
                  // Tebal bingkai mengikuti ukuran poligon di layar (zoom dan perangkat): tipis saat peta kecil atau di HP,
                  // lebih tebal saat di-zoom besar.
                  const h = selectedHouse;
                  const wrapW = (planBoxRef.current ? planBoxRef.current.clientWidth : 0) * (zoom / 100);
                  const xs = h.points.map((p) => p.x), ys = h.points.map((p) => p.y);
                  const d = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 100 * wrapW;
                  const inner = Math.max(1, Math.min(3, d * 0.1));
                  const outer = inner + 2 * Math.max(0.7, Math.min(1.4, inner * 0.5));
                  const pts = h.points.map((p) => `${p.x},${p.y}`).join(" ");
                  return (
                    <>
                      {/* Penanda kavling terpilih: garis dalam merah terang di atas garis luar gelap, dengan isi merah terang yang berkedip pelan; garis gelapnya yang memisahkannya dari poligon merah di sekitarnya */}
                      <polygon className="sel-pulse" points={pts} stroke="none" style={{ pointerEvents: "none" }} />
                      <polygon points={pts} fill="none" stroke="#0B1220" strokeWidth={outer} strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }} />
                      <polygon points={pts} fill="none" stroke="#FF1744" strokeWidth={inner} strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }} />
                    </>
                  );
                })()}
                {editingShapeId && editPoints && (
                  <polygon points={editPoints.map((p) => `${p.x},${p.y}`).join(" ")} fill={C.accent} fillOpacity="0.3" stroke={C.accent} strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                )}
                {editingShapeId && editPoints && editPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="0.35" fill="#fff" stroke={C.accent} strokeWidth="0.2" vectorEffect="non-scaling-stroke"
                    style={{ cursor: "grab" }} onMouseDown={(e) => startVertexDrag(i, e)} />
                ))}
                {drawingPoints.length > 0 && (
                  <polyline points={drawingPoints.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={C.red} strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                )}
                {drawingPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="0.18" fill={C.red} stroke="#fff" strokeWidth="0.08" vectorEffect="non-scaling-stroke" />)}
                {draft && (
                  <polygon points={draft.points.map((p) => `${p.x},${p.y}`).join(" ")} fill={C.red} fillOpacity="0.35" stroke={C.red} strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
                )}
              </svg>
              {labelData && (
                <div aria-hidden="true" style={{ gridArea: "1 / 1", position: "relative", pointerEvents: "none" }}>
                  {labelData.labels.map(({ house: h, text, vertical, cx, cy }) => (
                    <span key={h.id} style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, transform: "translate(-50%, -50%)", fontSize: labelData.font, fontWeight: 700, letterSpacing: "-0.2px", color: "#141A24", background: "rgba(255,255,255,0.88)", borderRadius: 3, padding: "1px 1.5px", lineHeight: 1, whiteSpace: "nowrap", writingMode: vertical ? "vertical-rl" : undefined }}>{text}</span>
                  ))}
                </div>
              )}
              {actionMenuId && calibrating && (() => {
                const target = houses.find((h) => h.id === actionMenuId);
                if (!target) return null;
                const { cx, cy } = centroid(target.points);
                return (
                  <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, transform: "translate(10px, 10px)", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 11, width: 210 }}>
                    <button onClick={() => setActionMenuId(null)} aria-label="Tutup" style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, lineHeight: "20px", textAlign: "center", border: "none", background: "transparent", color: C.steel, cursor: "pointer", fontSize: 14 }}>×</button>
                    <div className="text-xs font-semibold mb-2" style={{ color: C.ink, paddingRight: 18 }}>{target.blok}-{target.noKavling}</div>
                    <div className="flex flex-col gap-1.5 mb-2">
                      <div className="flex gap-1.5">
                        <select value={target.blok} onChange={(e) => updateHouse(target.id, { blok: e.target.value })} style={{ ...cellInput, flex: 1, padding: "3px 4px" }}>
                          {blocks.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                        <input value={target.noKavling} onChange={(e) => updateHouse(target.id, { noKavling: e.target.value })} style={{ ...cellInput, width: 60, padding: "3px 4px" }} placeholder="No." />
                      </div>
                      <select value={target.tipe} onChange={(e) => updateHouse(target.id, { tipe: e.target.value })} style={{ ...cellInput, padding: "3px 4px" }}>
                        {tipeOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => startEditShape(target.id)} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: C.accent, color: "#fff" }}>Edit Bentuk</button>
                        <button onClick={() => { setConfirmDeleteId(target.id); setActionMenuId(null); }} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ border: `1px solid ${C.red}`, color: C.red }}>Hapus</button>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => setActionMenuId(null)} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: C.green, color: "#fff" }}>OK</button>
                        <button onClick={() => setActionMenuId(null)} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {confirmDeleteId && calibrating && (() => {
                const target = houses.find((h) => h.id === confirmDeleteId);
                if (!target) return null;
                const { cx, cy } = centroid(target.points);
                return (
                  <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, transform: "translate(10px, 10px)", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 11, width: 200 }}>
                    <div className="text-xs mb-2" style={{ color: C.ink }}>Hapus kavling <b>{target.blok}-{target.noKavling}</b>?</div>
                    <div className="flex gap-2">
                      <button onClick={() => { removeHouse(confirmDeleteId); setConfirmDeleteId(null); }} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </div>
                  </div>
                );
              })()}
              {draft && draftCentroid && (
                <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: `${draftCentroid.cx}%`, top: `${draftCentroid.cy}%`, transform: "translate(12px, 12px)", width: 220, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 10 }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: C.ink }}>Kavling baru — {activeBlock} · {draft.tipe}</div>
                  <Field label="Nomor Kavling"><input autoFocus style={formInput} value={draft.noKavling} onChange={(e) => setDraft({ ...draft, noKavling: e.target.value })} placeholder="mis. 01" /></Field>
                  <div className="text-xs mt-1" style={{ color: C.steel }}>
                    Luas Bangunan: <b style={{ color: C.ink }}>{tipeOptions.find((t) => t.name === draft.tipe)?.luasBangunan || 0} m²</b> (ikut Tipe aktif, atur di Pengaturan)
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={submitDraft} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: C.accent, color: "#fff" }}>Tambahkan</button>
                    <button onClick={() => setDraft(null)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 items-center" style={{ borderTop: `1px solid ${C.line}` }}>
            {calibrating ? (
              tipeOptions.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: t.color }} /> {t.name}
                </div>
              ))
            ) : legendItems.length === 0 ? (
              <div className="text-xs" style={{ color: C.steel }}>Belum ada kavling.</div>
            ) : (
              <>
                {legendItems.map((it) => {
                  const off = hiddenKeys.includes(it.key);
                  return (
                    <button
                      key={it.key}
                      type="button"
                      onClick={() => toggleKey(it.key)}
                      aria-pressed={!off}
                      title={off ? "Klik untuk menampilkan lagi di peta" : "Klik untuk menyembunyikan di peta"}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: off ? C.faint : C.steel, background: "transparent", border: `1px solid ${off ? "transparent" : C.line}`, borderRadius: 999, padding: "2px 9px 2px 7px", cursor: "pointer", textDecoration: off ? "line-through" : "none", fontFamily: "inherit" }}
                    >
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: off ? "transparent" : it.color, border: off ? `1.5px solid ${C.faint}` : "none" }} /> {it.label}
                    </button>
                  );
                })}
                {hiddenKeys.length > 0 && (
                  <button type="button" onClick={() => setHiddenKeys([])} className="text-xs" style={{ color: C.accent, background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}>Tampilkan semua</button>
                )}
              </>
            )}
          </div>
          {!calibrating && houses.length > 0 && (
            <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: C.ink }}>Rincian kavling · Total unit : {houses.length}</span>
                <button onClick={() => setShowRincian(!showRincian)} className="text-xs px-2 py-0.5 rounded-full" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }} aria-expanded={showRincian}>
                  {showRincian ? "Sembunyikan ▴" : "Tampilkan ▾"}
                </button>
              </div>
              {showRincian && (
                <div className="rincian-grid mt-2">
                  {colorGroups.map((g) => (
                    <div key={g.key} style={{ breakInside: "avoid" }}>
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.ink }}>
                        <span className="w-3 h-3 rounded-sm inline-block shrink-0" style={{ background: g.color }} />
                        {g.key} <span style={{ fontWeight: 400, color: C.steel }}>({g.total} unit)</span>
                      </div>
                      {g.perTipe.length === 0 ? (
                        <div className="text-xs" style={{ color: C.steel, paddingLeft: 18 }}>Tidak ada kavling</div>
                      ) : g.perTipe.map((x) => (
                        <div key={x.tipe} className="text-xs" style={{ color: C.steel, paddingLeft: 18, lineHeight: 1.55 }}>
                          <b style={{ color: C.ink, fontWeight: 500 }}>Tipe {x.tipe}</b> ({x.names.length} unit) : {x.names.join(", ")}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {editingShapeId && (
          <div style={{ position: "absolute", top: 56, right: 24, background: C.panel, border: `1px solid ${C.accent}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 20 }}>
            <div className="text-xs mb-1.5" style={{ color: C.ink }}>Geser titik sudutnya di peta, lalu:</div>
            <div className="flex gap-2">
              <button onClick={saveEditShape} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.green, color: "#fff" }}>Selesai</button>
              <button onClick={cancelEditShape} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
            </div>
          </div>
        )}
    </div>
    </div>
    </>
  );
}
