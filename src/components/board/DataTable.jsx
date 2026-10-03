import { C } from "../../theme";
import { Chip, Ic, cellInput } from "../../components/ui";
import { MONTHS } from "../../lib/constants";
import React from "react";
import { rupiah } from "../../lib/helpers";
import { useBoard } from "./BoardContext";

export default function DataTable() {
  const { FROZEN_KEYS, blocks, canEdit, bulkDelete, bulkDeleteArmed, bulkSetFollowUp, bulkSetKategori, bulkSetStatus, bulkSetTipe, calibrating, clusterDuplicateCount, colWidth, columns, confirmDeleteId, currentPage, detailEditingKey, duplicateFilterActive, duplicateHouse, exportExcel, finalHppPerM2, followUpFilterActive, frozenLeft, getDetail, hargaJualTotal, hiddenCols, houses, hppTotal, importExcel, importMsg, isDuplicateKavling, isIncomplete, kategoriOptions, lastDeleted, lastDeletedBulk, luasBangunanOf, marginOf, marginPct, mode, monthEditingKey, pageRows, pageSize, priceEditingKey, rangeEnd, rangeStart, removeHouse, resetColWidths, rowBg, rowRefs, selectedId, selectedRows, setBulkDeleteArmed, setConfirmDeleteId, setCurrentPage, setDetail, setDetailEditingKey, setDuplicateFilterActive, setFollowUpFilterActive, setImportMsg, setMonthEditingKey, setPageSize, setPriceEditingKey, setSelectedId, setSelectedRows, setShowColMenu, setTableBlocks, setTableSearchQuery, setTableStatusFilter, setTableTipes, setTableZoom, setTextEditingKey, showColMenu, sortDir, sortKey, startColResize, statusFields, tableBlocks, tableRows, tableSearchQuery, tableStatusFilter, tableTipes, tableZoom, textEditingKey, tipeOptions, toggleColHidden, toggleRowSelect, toggleSort, toggleTableBlock, toggleTableTipe, totalPages, totalRows, undoBulkDelete, undoDelete, updateHouse, updateStatus } = useBoard();
  return (
    <>
        <div className="rounded-xl p-2.5 mb-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
          {followUpFilterActive && (
            <div className="flex items-center justify-between mb-2.5 p-2 rounded-lg" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}` }}>
              <span className="text-xs" style={{ color: C.amber }}>Menampilkan hanya kavling yang perlu ditindaklanjuti.</span>
              <button onClick={() => setFollowUpFilterActive(false)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.amber}`, color: C.amber, background: C.panel }}>Tampilkan Semua</button>
            </div>
          )}
          {duplicateFilterActive ? (
            <div className="flex items-center justify-between mb-2.5 p-2 rounded-lg" style={{ background: C.alertRedBg, border: `1px solid ${C.red}` }}>
              <span className="text-xs" style={{ color: C.red }}>Menampilkan hanya kavling dengan nomor duplikat.</span>
              <button onClick={() => setDuplicateFilterActive(false)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.red}`, color: C.red, background: C.panel }}>Tampilkan Semua</button>
            </div>
          ) : clusterDuplicateCount > 0 && (
            <div className="flex items-center justify-between mb-2.5 p-2 rounded-lg" style={{ background: C.alertRedBg, border: `1px solid ${C.red}` }}>
              <span className="text-xs flex items-center gap-1.5" style={{ color: C.red }}><Ic name="warning" size={14} /> Ada {clusterDuplicateCount} kavling dengan nomor duplikat di cluster ini.</span>
              <button onClick={() => setDuplicateFilterActive(true)} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.red, color: "#fff" }}>Lihat</button>
            </div>
          )}
          {lastDeleted && (
            <div className="flex items-center justify-between mb-2.5 p-2 rounded-lg" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}` }}>
              <span className="text-xs" style={{ color: C.amber }}>Kavling {lastDeleted.blok}-{lastDeleted.noKavling} dihapus.</span>
              <button onClick={undoDelete} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.amber, color: "#fff" }}>Undo</button>
            </div>
          )}
          {lastDeletedBulk && (
            <div className="flex items-center justify-between mb-2.5 p-2 rounded-lg" style={{ background: C.alertAmberBg, border: `1px solid ${C.amber}` }}>
              <span className="text-xs" style={{ color: C.amber }}>{lastDeletedBulk.length} kavling dihapus.</span>
              <button onClick={undoBulkDelete} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.amber, color: "#fff" }}>Undo</button>
            </div>
          )}
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap mb-2.5 p-2 rounded-lg" style={{ background: C.rowSelectedBg, border: `1px solid ${C.accent}` }}>
              <span className="text-xs font-semibold" style={{ color: C.ink }}>{selectedRows.length} kavling dipilih</span>
              <select onChange={(e) => { bulkSetKategori(e.target.value); e.target.value = ""; }} defaultValue="" className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="" disabled>Set Kategori...</option>
                {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <select onChange={(e) => { bulkSetTipe(e.target.value); e.target.value = ""; }} defaultValue="" className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="" disabled>Set Tipe...</option>
                {tipeOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
              <select onChange={(e) => { const [key, val] = e.target.value.split(":"); if (key) bulkSetStatus(key, val === "true"); e.target.value = ""; }} defaultValue="" className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="" disabled>Set Status...</option>
                {statusFields.map((s) => (
                  <React.Fragment key={s.key}>
                    <option value={`${s.key}:true`}>{s.label}: Sudah</option>
                    <option value={`${s.key}:false`}>{s.label}: Belum</option>
                  </React.Fragment>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: C.steel }}>Follow-up:</span>
                <input type="date" onChange={(e) => { if (e.target.value) { bulkSetFollowUp(e.target.value); e.target.value = ""; } }} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }} />
              </div>
              {bulkDeleteArmed ? (
                <button onClick={() => { bulkDelete(); setBulkDeleteArmed(false); }} className="text-xs px-2 py-1 rounded-lg" style={{ color: "#fff", background: C.red }}>Yakin? Klik lagi untuk hapus {selectedRows.length} kavling</button>
              ) : (
                <button onClick={() => setBulkDeleteArmed(true)} className="text-xs px-2 py-1 rounded-lg" style={{ color: C.red, border: `1px solid ${C.red}`, background: C.panel }}>Hapus Terpilih</button>
              )}
              <button onClick={() => { setSelectedRows([]); setBulkDeleteArmed(false); }} className="text-xs ml-auto" style={{ color: C.steel }}>Batal pilih</button>
            </div>
          )}
          <div className="mb-2">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs" style={{ color: C.steel, minWidth: 40 }}>Blok:</span>
              <button onClick={() => setTableBlocks(blocks.map((b) => b.name))} className="text-xs" style={{ color: C.accent }}>Select All</button>
              <span className="text-xs" style={{ color: C.line }}>|</span>
              <button onClick={() => setTableBlocks([])} className="text-xs" style={{ color: C.steel }}>Clear All</button>
              <div className="flex items-center gap-1.5 flex-wrap">
                {blocks.map((b) => (
                  <Chip key={b.id} active={tableBlocks.includes(b.name)} onClick={() => toggleTableBlock(b.name)}>{b.name}</Chip>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: C.steel, minWidth: 40 }}>Tipe:</span>
              <button onClick={() => setTableTipes(tipeOptions.map((t) => t.name))} className="text-xs" style={{ color: C.accent }}>Select All</button>
              <span className="text-xs" style={{ color: C.line }}>|</span>
              <button onClick={() => setTableTipes([])} className="text-xs" style={{ color: C.steel }}>Clear All</button>
              <div className="flex items-center gap-1.5 flex-wrap">
                {tipeOptions.map((t) => (
                  <Chip key={t.id} active={tableTipes.includes(t.name)} onClick={() => toggleTableTipe(t.name)}>{t.name}</Chip>
                ))}
              </div>
            </div>
          </div>
          {importMsg && (
            <div className="mb-2 p-2 rounded-lg text-xs" style={{ background: C.infoBlueBg, border: `1px solid ${C.line}`, color: C.ink, position: "relative" }}>
              <button
                onClick={() => setImportMsg("")}
                title="Tutup"
                className="flex items-center justify-center"
                style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 8, color: "#fff", background: C.steel, fontSize: 12, lineHeight: 1 }}
              >✕</button>
              <div style={{ paddingRight: 24 }}>
                {typeof importMsg === "string" ? (
                  <div>{importMsg}</div>
                ) : (
                  <div>
                    <div style={{ color: C.green }}>✓ {importMsg.updated.length} diperbarui: {importMsg.updated.length ? importMsg.updated.join(", ") : "-"}</div>
                    {importMsg.skipped.length > 0 && (
                      <div style={{ color: C.amber, marginTop: 2 }}>✕ {importMsg.skipped.length} dilewati (tidak ditemukan di cluster ini): {importMsg.skipped.join(", ")}</div>
                    )}
                  </div>
                )}
                <div style={{ color: C.steel, marginTop: 4 }}>Tips: gunakan file hasil "Export Excel" sebagai template, edit kolomnya, lalu import lagi — kavling dicocokkan lewat kolom "Kavling".</div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="text-sm font-medium" style={{ color: C.ink }}>Data Blok ({tableRows.length})</div>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 text-xs" style={{ color: C.steel }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, display: "inline-block" }} /> No. duplikat</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: C.steel }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, display: "inline-block" }} /> Data belum lengkap</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <input
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Cari nomor blok"
                className="text-xs px-2 py-1 rounded-lg border"
                style={{ borderColor: C.line, color: C.ink, minWidth: 180 }}
              />
              <select value={tableStatusFilter} onChange={(e) => setTableStatusFilter(e.target.value)} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="semua">Semua Status</option>
                {statusFields.map((s) => (
                  <React.Fragment key={s.key}>
                    <option value={`${s.key}:true`}>{s.label}: Sudah</option>
                    <option value={`${s.key}:false`}>{s.label}: Belum</option>
                  </React.Fragment>
                ))}
              </select>
              <button onClick={exportExcel} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.green, background: C.panel }}>Export Excel</button>
              <label className="text-xs px-2 py-1 rounded-lg border cursor-pointer" style={{ borderColor: C.line, color: C.accent, background: C.panel }}>
                Import Excel/CSV
                <input type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} style={{ display: "none" }} />
              </label>
              <button onClick={resetColWidths} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.steel, background: C.panel }}>Reset</button>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setTableZoom((z) => Math.max(50, z - 10))} className="w-7 h-7 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink, background: C.panel }}>−</button>
                <div className="flex items-center h-7 rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.panel }}>
                  <input
                    type="number"
                    value={tableZoom}
                    onChange={(e) => setTableZoom(Math.min(150, Math.max(50, Number(e.target.value) || 100)))}
                    onDoubleClick={() => setTableZoom(100)}
                    title="Zoom tabel. Klik 2x untuk kembali ke 100%"
                    style={{ width: 46, textAlign: "right", border: "none", outline: "none", fontSize: 12, color: C.steel, padding: "0 2px 0 6px" }}
                  />
                  <span className="text-xs pr-2" style={{ color: C.steel }}>%</span>
                </div>
                <button onClick={() => setTableZoom((z) => Math.min(150, z + 10))} className="w-7 h-7 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink, background: C.panel }}>+</button>
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowColMenu((v) => !v)} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink, background: C.panel }}>Kolom</button>
                {showColMenu && (
                  <div style={{ position: "absolute", right: 0, top: "110%", zIndex: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 180, maxHeight: 260, overflowY: "auto" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: C.ink }}>Tampilkan kolom</div>
                    {columns.filter((c) => c.key !== "no" && c.key !== "kavling" && c.key !== "aksi" && c.key !== "select").map((c) => (
                      <label key={c.key} className="flex items-center gap-2 text-xs py-1" style={{ color: C.ink }}>
                        <input type="checkbox" checked={!hiddenCols.includes(c.key)} onChange={() => toggleColHidden(c.key)} />
                        {c.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto", maxHeight: mode === "data" ? "calc(100vh - 130px)" : 480, overflowY: "auto", zoom: tableZoom / 100 }}>
            <table className="dataTbl w-full" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                {columns.map((c) => (
                  <col key={c.key} style={{ width: colWidth(c.key), visibility: hiddenCols.includes(c.key) ? "collapse" : "visible" }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className={FROZEN_KEYS.includes(c.key) ? "frz" : undefined} style={{ position: "sticky", top: 0, ...(FROZEN_KEYS.includes(c.key) ? { left: frozenLeft[c.key], boxShadow: c.key === "kavling" ? `inset -1px 0 0 ${C.line}` : undefined } : {}), borderRight: (c.key !== "aksi" && c.key !== "select") ? `1px solid ${C.line}` : "none" }}>
                      {c.key === "no" || c.key === "aksi" ? c.label : c.key === "select" ? (
                        <input
                          type="checkbox"
                          checked={pageRows.length > 0 && pageRows.every((h) => selectedRows.includes(h.id))}
                          onChange={(e) => setSelectedRows(e.target.checked ? pageRows.map((h) => h.id) : [])}
                          title="Pilih semua di halaman ini"
                        />
                      ) : (
                        <span onClick={() => toggleSort(c.key)} style={{ cursor: "pointer" }} title="Klik untuk urutkan">
                          {c.label}{sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                        </span>
                      )}
                      {c.key !== "aksi" && c.key !== "select" && (
                        <span
                          onMouseDown={(e) => startColResize(c.key, e)}
                          title="Geser untuk ubah lebar kolom"
                          className="col-resize-handle"
                          style={{ position: "absolute", right: -3, top: 0, bottom: 0, width: 7, cursor: "col-resize" }}
                        >
                          <span style={{ display: "block", marginLeft: 3, width: 1, height: "100%", background: "transparent" }} />
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr><td colSpan={16 + statusFields.length} className="text-center py-3" style={{ color: C.steel }}>
                    {houses.length === 0
                      ? "Belum ada data. Tambahkan lewat tombol Edit Site Plan di Main Mode."
                      : totalRows === 0
                        ? "Tidak ada kavling yang cocok dengan filter Blok/Tipe/Status yang aktif. Coba klik \"Select All\" di atas."
                        : "Tidak ada data di halaman ini."}
                  </td></tr>
                )}
                {pageRows.map((h, i) => (
                  <tr key={h.id} ref={(el) => (rowRefs.current[h.id] = el)} style={{ background: selectedRows.includes(h.id) ? C.alertAmberBg : selectedId === h.id ? C.rowSelectedBg : "transparent", cursor: "pointer" }} onClick={() => setSelectedId(h.id)}>
                    <td className="text-center frz" style={{ color: C.steel, fontFamily: "IBM Plex Mono, monospace", left: frozenLeft.no, background: rowBg(h) }} onClick={(e) => e.stopPropagation()}>
                      {(pageSize === "all" ? 0 : (currentPage - 1) * pageSize) + i + 1}
                    </td>
                    <td className="text-center frz" style={{ left: frozenLeft.select, background: rowBg(h) }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedRows.includes(h.id)} onChange={() => toggleRowSelect(h.id)} />
                    </td>
                    <td className="frz" style={{ fontFamily: "IBM Plex Mono, monospace", overflow: "hidden", left: frozenLeft.kavling, background: rowBg(h), boxShadow: `inset -1px 0 0 ${C.line}` }} onClick={(e) => { if (calibrating) { e.stopPropagation(); setSelectedId(h.id); } }}>
                      <div className="flex items-center gap-1">
                        {isDuplicateKavling(h) && <span title="Nomor kavling ini duplikat di bloknya" style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, flexShrink: 0 }} />}
                        {!isDuplicateKavling(h) && isIncomplete(h) && <span title="Data harga/luas bangunan belum lengkap" style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />}
                        {calibrating ? (
                          <div className="flex items-center gap-1" style={{ minWidth: 0 }}>
                            <span style={{ color: C.steel, flexShrink: 0, fontSize: 11 }}>{h.blok}-</span>
                            <input
                              defaultValue={h.noKavling}
                              onBlur={(e) => updateHouse(h.id, { noKavling: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                              style={{ ...cellInput, minWidth: 0, flex: 1, padding: "3px 4px" }}
                            />
                          </div>
                        ) : (
                          <span style={{ color: C.ink, fontWeight: 600, textDecoration: "underline", textDecorationColor: "transparent" }} className="kavling-link">{h.blok}-{h.noKavling}</span>
                        )}
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select style={cellInput} value={h.tipe} onChange={(e) => updateHouse(h.id, { tipe: e.target.value })}>
                        {tipeOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select style={cellInput} value={h.kategori} onChange={(e) => updateHouse(h.id, { kategori: e.target.value })}>
                        {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </td>
                    {statusFields.map((s) => (
                      <td key={s.key} className={s.hasDetail ? "" : "text-center"} style={s.hasDetail ? { minWidth: 170 } : undefined}>
                        <div className="text-center">
                          <input type="checkbox" checked={!!h.status[s.key]} onChange={(e) => { updateStatus(h.id, s.key, e.target.checked); if (s.hasDetail && e.target.checked) setDetailEditingKey(`${h.id}:${s.key}`); }} />
                        </div>
                        {s.hasDetail && h.status[s.key] && (
                          detailEditingKey === `${h.id}:${s.key}` ? (
                            <div className="flex items-center gap-1" style={{ marginTop: 4 }} onClick={(e) => e.stopPropagation()}>
                              <input
                                autoFocus
                                style={{ ...cellInput, fontFamily: "Inter, sans-serif" }}
                                value={getDetail(h, s.key)}
                                onChange={(e) => setDetail(h.id, s.key, e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") setDetailEditingKey(null); }}
                                placeholder="mis. keterangan"
                              />
                              <button onClick={() => setDetailEditingKey(null)} style={{ fontSize: 11, color: "#fff", background: C.accent, borderRadius: 8, padding: "2px 6px", flexShrink: 0 }}>✓</button>
                            </div>
                          ) : (
                            <div
                              onClick={(e) => { e.stopPropagation(); setDetailEditingKey(`${h.id}:${s.key}`); }}
                              style={{ marginTop: 4, fontSize: 10, color: getDetail(h, s.key) ? C.ink : C.steel, cursor: "pointer", padding: "3px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, minHeight: 14 }}
                            >
                              {getDetail(h, s.key) || "Klik untuk isi"}
                            </div>
                          )
                        )}
                      </td>
                    ))}
                    <td>
                      {textEditingKey === `${h.id}:kontraktor` || !h.kontraktor ? (
                        <input
                          autoFocus={textEditingKey === `${h.id}:kontraktor`}
                          list="kontraktor-options"
                          style={{ ...cellInput, minWidth: 110 }}
                          value={h.kontraktor || ""}
                          onChange={(e) => { setTextEditingKey(`${h.id}:kontraktor`); updateHouse(h.id, { kontraktor: e.target.value }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }}
                        />
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); setTextEditingKey(`${h.id}:kontraktor`); }} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "2px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {h.kontraktor}
                        </div>
                      )}
                    </td>
                    <td>
                      {textEditingKey === `${h.id}:spkNo` || !h.spkNo ? (
                        <input
                          autoFocus={textEditingKey === `${h.id}:spkNo`}
                          style={{ ...cellInput, minWidth: 110 }}
                          value={h.spkNo || ""}
                          onChange={(e) => { setTextEditingKey(`${h.id}:spkNo`); updateHouse(h.id, { spkNo: e.target.value }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }}
                        />
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); setTextEditingKey(`${h.id}:spkNo`); }} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "2px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {h.spkNo}
                        </div>
                      )}
                    </td>
                    <td>
                      {textEditingKey === `${h.id}:spkTahun` || !h.spkTahun ? (
                        <input
                          autoFocus={textEditingKey === `${h.id}:spkTahun`}
                          type="number" style={{ ...cellInput, minWidth: 64 }}
                          value={h.spkTahun || ""}
                          onChange={(e) => { setTextEditingKey(`${h.id}:spkTahun`); const v = e.target.value; updateHouse(h.id, { spkTahun: v === "" ? null : Number(v) }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }}
                        />
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); setTextEditingKey(`${h.id}:spkTahun`); }} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "2px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, fontFamily: "IBM Plex Mono, monospace", width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {h.spkTahun}
                        </div>
                      )}
                    </td>
                    <td>
                      {monthEditingKey === h.id || !h.spkBulan ? (
                        <input
                          autoFocus={monthEditingKey === h.id}
                          type="number" min="1" max="12" style={{ ...cellInput, minWidth: 50 }}
                          value={h.spkBulan || ""}
                          onChange={(e) => { setMonthEditingKey(h.id); const v = e.target.value; updateHouse(h.id, { spkBulan: v === "" ? null : Math.min(12, Math.max(1, Number(v))) }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setMonthEditingKey(null); }}
                        />
                      ) : (
                        <div
                          onClick={(e) => { e.stopPropagation(); setMonthEditingKey(h.id); }}
                          style={{ fontSize: 11, color: C.ink, cursor: "pointer", padding: "2px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, textAlign: "center" }}
                        >
                          {MONTHS[h.spkBulan - 1]}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: "IBM Plex Mono, monospace", color: C.steel, textAlign: "center" }}>{luasBangunanOf(h)} m²</td>
                    <td>
                      {priceEditingKey === `${h.id}:hpp` || !h.hppPerM2 ? (
                        <input
                          autoFocus={priceEditingKey === `${h.id}:hpp`}
                          type="number" min="0" style={{ ...cellInput, minWidth: 100 }}
                          value={h.hppPerM2 || ""}
                          onChange={(e) => { setPriceEditingKey(`${h.id}:hpp`); updateHouse(h.id, { hppPerM2: Number(e.target.value) || 0 }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }}
                          placeholder="Rp/m²"
                        />
                      ) : (
                        <div
                          onClick={(e) => { e.stopPropagation(); setPriceEditingKey(`${h.id}:hpp`); }}
                          style={{ fontSize: 11, color: C.ink, cursor: "pointer", padding: "2px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, whiteSpace: "nowrap" }}
                        >
                          {rupiah(h.hppPerM2)}
                          {luasBangunanOf(h) ? <> → <b>{rupiah(hppTotal(h))}</b></> : <span style={{ color: C.amber }}> (atur LB Tipe)</span>}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <input type="checkbox" checked={h.adendum} onChange={(e) => updateHouse(h.id, { adendum: e.target.checked })} />
                        {h.adendum && <input type="number" style={{ ...cellInput, minWidth: 90 }} value={h.adendumAmount || ""} onChange={(e) => updateHouse(h.id, { adendumAmount: Number(e.target.value) || 0 })} />}
                      </div>
                      {h.adendum && h.adendumAmount ? (
                        <div style={{ fontSize: 10, color: h.adendumAmount < 0 ? C.red : C.steel, marginTop: 2, whiteSpace: "normal", wordBreak: "break-word" }}>{rupiah(h.adendumAmount)}</div>
                      ) : null}
                    </td>
                    <td>
                      {priceEditingKey === `${h.id}:harga` || !h.hargaJualPerM2 ? (
                        <input
                          autoFocus={priceEditingKey === `${h.id}:harga`}
                          type="number" min="0" style={{ ...cellInput, minWidth: 100 }}
                          value={h.hargaJualPerM2 || ""}
                          onChange={(e) => { setPriceEditingKey(`${h.id}:harga`); updateHouse(h.id, { hargaJualPerM2: Number(e.target.value) || 0 }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }}
                          placeholder="Rp/m²"
                        />
                      ) : (
                        <div
                          onClick={(e) => { e.stopPropagation(); setPriceEditingKey(`${h.id}:harga`); }}
                          style={{ fontSize: 11, color: C.ink, cursor: "pointer", padding: "2px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, whiteSpace: "nowrap" }}
                        >
                          {rupiah(h.hargaJualPerM2)}
                          {luasBangunanOf(h) ? <> → <b>{rupiah(hargaJualTotal(h))}</b></> : <span style={{ color: C.amber }}> (atur LB Tipe)</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: "IBM Plex Mono, monospace", color: marginPct(h) >= 20 ? C.green : C.red, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {!luasBangunanOf(h) ? <span style={{ color: C.steel, fontWeight: 400, fontSize: 11 }}>atur LB Tipe</span> : (
                        <>
                          {marginPct(h).toFixed(2)}%
                          <span style={{ fontSize: 10, fontWeight: 400, color: C.steel, marginLeft: 6 }}>{rupiah(marginOf(h))}</span>
                          {h.adendum && h.adendumAmount ? <div style={{ fontSize: 9, fontWeight: 400, color: C.steel }}>HPP/m² efektif: {rupiah(Math.round(finalHppPerM2(h)))}</div> : null}
                        </>
                      )}
                    </td>
                    <td>
                      {textEditingKey === `${h.id}:catatan` || !h.catatan ? (
                        <input
                          autoFocus={textEditingKey === `${h.id}:catatan`}
                          style={{ ...cellInput, minWidth: 110 }}
                          value={h.catatan || ""}
                          onChange={(e) => { setTextEditingKey(`${h.id}:catatan`); updateHouse(h.id, { catatan: e.target.value }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }}
                          placeholder="..."
                        />
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); setTextEditingKey(`${h.id}:catatan`); }} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "2px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {h.catatan}
                        </div>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {!canEdit ? null : confirmDeleteId === h.id ? (
                        <div className="flex items-center gap-1" style={{ whiteSpace: "nowrap" }}>
                          <button onClick={() => { removeHouse(h.id); setConfirmDeleteId(null); }} className="text-xs px-1.5 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff", whiteSpace: "nowrap" }}>Ya</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-1.5 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, whiteSpace: "nowrap" }}>Batal</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2" style={{ whiteSpace: "nowrap" }}>
                          <button onClick={() => duplicateHouse(h.id)} className="text-xs" style={{ color: C.accent }} title="Salin data kavling ini jadi kavling baru">Duplikat</button>
                          <button onClick={() => setConfirmDeleteId(h.id)} className="text-xs" style={{ color: C.red }}>Hapus</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, (typeof pageSize === "number" ? pageSize : 10) - pageRows.length) }).map((_, i) => (
                  <tr key={`fill-${i}`} style={{ height: 33 }}>
                    <td colSpan={16 + statusFields.length}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2.5 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: C.steel }}>
              <span>Show</span>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value === "all" ? "all" : Number(e.target.value))} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              <span>entries</span>
            </div>
            <div className="text-xs" style={{ color: C.steel }}>Menampilkan {rangeStart}–{rangeEnd} dari {totalRows} data</div>
            <div className="flex items-center gap-1.5">
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: currentPage <= 1 ? C.faint : C.ink, background: C.panel }}>‹ Prev</button>
              <span className="text-xs" style={{ color: C.steel }}>{currentPage} / {totalPages}</span>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: currentPage >= totalPages ? C.faint : C.ink, background: C.panel }}>Next ›</button>
            </div>
          </div>
        </div>
    </>
  );
}
