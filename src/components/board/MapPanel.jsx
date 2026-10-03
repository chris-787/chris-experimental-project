import { C } from "../../theme";
import { Field, cellInput, formInput } from "../../components/ui";
import React from "react";
import { centroid } from "../../lib/helpers";
import { useBoard } from "./BoardContext";

export default function MapPanel() {
  const { actionMenuId, activeBlock, blockColor, blocks, calibrating, cancelDrawing, cancelEditShape, colorMode, confirmDeleteId, draft, draftCentroid, drawingPoints, editPoints, editingShapeId, finishPolygon, handleImageClick, handleImageUpload, handleTouchEnd, handleTouchMove, handleTouchStart, handleWheelZoom, houses, imgUploading, imgWrapRef, mapHeight, opacity, planBoxRef, polyColor, polygonsClickable, removeHouse, saveEditShape, selectFromMap, selectedId, setActionMenuId, setConfirmDeleteId, setDraft, setMapHeight, setSelectedId, setZoom, siteImage, startEditShape, startHeightDrag, startVertexDrag, submitDraft, tipeOptions, undoPoint, updateHouse, zoom } = useBoard();
  return (
    <>
    <div style={{ marginBottom: 12 }}>
    <div className="rounded-xl p-2.5" style={{ background: C.panel, boxShadow: C.cardShadow, position: "relative" }}>
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div>
              <div className="text-sm font-medium" style={{ color: C.ink }}>Site Plan</div>
              <div className="text-xs" style={{ color: C.steel }}>Cubit layar atau tekan Ctrl + scroll untuk zoom cepat</div>
            </div>
            {siteImage && (
            <div className="flex items-center gap-2 flex-wrap">
              {calibrating && drawingPoints.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: C.ink }}>{drawingPoints.length} titik</span>
                  <button onClick={undoPoint} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Undo</button>
                  <button onClick={finishPolygon} disabled={drawingPoints.length < 3} className="text-xs px-2 py-1 rounded-lg" style={{ background: drawingPoints.length < 3 ? C.faint : C.green, color: "#fff" }}>Selesai Poligon</button>
                  <button onClick={cancelDrawing} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Batal</button>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <button onClick={() => setZoom((z) => Math.max(50, z - 20))} className="w-7 h-7 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink, background: C.panel }}>−</button>
                <div className="flex items-center h-7 rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.panel }}>
                  <input
                    type="number"
                    value={zoom}
                    onChange={(e) => setZoom(Math.min(400, Math.max(50, Number(e.target.value) || 100)))}
                    onDoubleClick={() => setZoom(100)}
                    title="Klik 2x untuk kembali ke 100%"
                    style={{ width: 42, textAlign: "right", border: "none", outline: "none", fontSize: 12, color: C.steel, padding: "0 2px 0 6px" }}
                  />
                  <span className="text-xs pr-2" style={{ color: C.steel }}>%</span>
                </div>
                <button onClick={() => setZoom((z) => Math.min(400, z + 20))} className="w-7 h-7 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink, background: C.panel }}>+</button>
                {selectedId && (
                  <button onClick={() => setSelectedId(null)} title="Hapus highlight kavling terpilih" className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: C.panel }}>Clear</button>
                )}
              </div>
            </div>
            )}
          </div>

          {!siteImage ? (
            <div className="flex flex-col items-center justify-center gap-2.5 py-16" style={{ border: `1px dashed ${C.line}`, borderRadius: 8, background: C.paper }}>
              <div className="text-sm" style={{ color: C.steel }}>Cluster ini belum punya gambar site plan.</div>
              <label className="text-xs px-2.5 py-1 rounded-lg cursor-pointer" style={{ background: C.accent, color: "#fff" }}>
                {imgUploading ? "Mengunggah..." : "Unggah Gambar Site Plan"}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={imgUploading} />
              </label>
            </div>
          ) : (
          <div
            ref={planBoxRef}
            style={{ overflow: "auto", ...(mapHeight ? { height: mapHeight } : { maxHeight: 640 }), border: `1px solid ${C.line}`, borderRadius: 8, touchAction: "pan-x pan-y" }}
            onWheel={handleWheelZoom}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div ref={imgWrapRef} style={{ position: "relative", display: "grid", width: `${zoom}%`, cursor: calibrating ? "crosshair" : "default" }} onClick={handleImageClick}>
              <img src={siteImage} alt="Site plan" style={{ gridArea: "1 / 1", width: "100%", display: "block", userSelect: "none" }} draggable={false} />
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ gridArea: "1 / 1", width: "100%", height: "100%" }}>
                {houses.filter((h) => h.id !== editingShapeId).map((h) => (
                  <React.Fragment key={h.id}>
                    {selectedId === h.id && (
                      <polygon
                        points={h.points.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none" stroke={C.gold} strokeWidth="3.5" strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }}
                      />
                    )}
                    <polygon points={h.points.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill={polyColor(h)} fillOpacity={opacity / 100}
                      stroke="#00000066" strokeWidth="0.2"
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: polygonsClickable ? "auto" : "none", cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (calibrating) { setActionMenuId(h.id); setSelectedId(h.id); }
                        else selectFromMap(h.id);
                      }}>
                      <title>{`${h.blok}-${h.noKavling}`}</title>
                    </polygon>
                  </React.Fragment>
                ))}
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
          )}

          <div className="flex flex-wrap gap-2.5 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${C.line}` }}>
            {calibrating ? (
              tipeOptions.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: t.color }} /> {t.name}
                </div>
              ))
            ) : colorMode === "blok" ? (
              blocks.map((b) => (
                <div key={b.id} className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: blockColor(b.name) }} /> {b.name}
                </div>
              ))
            ) : colorMode === "tipe" ? (
              tipeOptions.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: t.color }} /> {t.name}
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}><span className="w-3 h-3 rounded-sm inline-block" style={{ background: C.green }} /> Sudah</div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}><span className="w-3 h-3 rounded-sm inline-block" style={{ background: C.red }} /> Belum</div>
              </>
            )}
          </div>
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
    {siteImage && (
      <div
        onMouseDown={startHeightDrag}
        onDoubleClick={() => setMapHeight(null)}
        title="Tarik ke atas/bawah untuk mengubah tinggi Site Plan (klik 2x untuk kembali ke awal)"
        className="panel-height-handle"
        style={{ height: 8, margin: "6px 4px 0", borderRadius: 8, background: C.faint, cursor: "row-resize", userSelect: "none" }}
      />
    )}
    </div>
    </>
  );
}
