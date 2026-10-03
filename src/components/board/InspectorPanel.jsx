import { C } from "../../theme";
import { Field, Ic, StatusRow, formInput } from "../../components/ui";
import { MONTHS } from "../../lib/constants";
import React from "react";
import { rupiah } from "../../lib/helpers";
import { timeAgo } from "../../lib/calc";
import { useBoard } from "./BoardContext";

export default function InspectorPanel() {
  const { confirmDeleteId, detailEditingKey, finalHppPerM2, getDetail, hargaJualTotal, houses, hppTotal, kategoriOptions, luasBangunanOf, marginOf, marginPct, monthEditingKey, priceEditingKey, printKavlingSummary, removeHouse, selectFromMap, selectedId, setConfirmDeleteId, setDetail, setDetailEditingKey, setMonthEditingKey, setPriceEditingKey, setSelectedId, setTextEditingKey, statusFields, tableRows, textEditingKey, tipeOptions, updateHouse, updateStatus } = useBoard();
    if (!selectedId) {
      return <div className="text-sm py-2 text-center" style={{ color: C.steel }}>Klik salah satu kavling di peta untuk mengisi datanya.</div>;
    }
    const h = houses.find((x) => x.id === selectedId);
    if (!h) return <div className="text-sm py-2 text-center" style={{ color: C.steel }}>Kavling tidak ditemukan.</div>;
    const idx = tableRows.findIndex((x) => x.id === selectedId);
    const prevRow = tableRows[idx - 1];
    const nextRow = tableRows[idx + 1];
    return (
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div className="text-base font-semibold" style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{h.blok}-{h.noKavling}</div>
            {h.lastEditedAt && <div className="text-xs" style={{ color: C.steel }}>Terakhir diubah: {timeAgo(h.lastEditedAt)}</div>}
            <div className="text-xs" style={{ color: C.faint }}>Tips: ← → untuk pindah, Esc untuk tutup</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1">
              <button disabled={!prevRow} onClick={() => prevRow && selectFromMap(prevRow.id)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: prevRow ? C.ink : C.faint }}>&lsaquo; Prev</button>
              <button disabled={!nextRow} onClick={() => nextRow && selectFromMap(nextRow.id)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: nextRow ? C.ink : C.faint }}>Next &rsaquo;</button>
              <button onClick={() => setSelectedId(null)} title="Tutup / hapus highlight" className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>✕</button>
            </div>
            <button onClick={() => printKavlingSummary(h)} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: C.accent, color: "#fff" }}><Ic name="printer" size={13} /> Ringkasan</button>
          </div>
        </div>

        <div className="inspector-cols">
        <div>
        <Field label="Tipe / Ukuran">
          <select style={formInput} value={h.tipe} onChange={(e) => updateHouse(h.id, { tipe: e.target.value })}>
            {tipeOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </Field>

        <Field label="Kategori">
          <select style={formInput} value={h.kategori} onChange={(e) => updateHouse(h.id, { kategori: e.target.value })}>
            {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>

        <div className="my-2 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          {statusFields.map((s) => (
            <React.Fragment key={s.key}>
              <StatusRow label={s.label} value={!!h.status[s.key]} onToggle={() => { const next = !h.status[s.key]; updateStatus(h.id, s.key, next); if (s.hasDetail && next) setDetailEditingKey(`${h.id}:${s.key}`); }} />
              {s.hasDetail && h.status[s.key] && (
                <div className="mb-2 mt-1 p-2 rounded-lg" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                  <div className="text-xs mb-1" style={{ color: C.steel }}>Detail {s.label}</div>
                  {detailEditingKey === `${h.id}:${s.key}` ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        style={{ ...formInput, fontFamily: "Inter, sans-serif" }}
                        value={getDetail(h, s.key)}
                        onChange={(e) => setDetail(h.id, s.key, e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") setDetailEditingKey(null); }}
                        placeholder={`mis. keterangan ${s.label.toLowerCase()}`}
                      />
                      <button onClick={() => setDetailEditingKey(null)} className="text-xs px-2 py-1 rounded-lg shrink-0" style={{ background: C.accent, color: "#fff" }}>Selesai</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setDetailEditingKey(`${h.id}:${s.key}`)}
                      style={{ fontSize: 12, color: getDetail(h, s.key) ? C.ink : C.steel, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}
                    >
                      {getDetail(h, s.key) || `Klik untuk isi detail ${s.label.toLowerCase()}`}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          <Field label="Tanggal Follow-up (opsional)">
            <input
              type="date"
              value={h.followUpDate || ""}
              onChange={(e) => updateHouse(h.id, { followUpDate: e.target.value || null })}
              style={formInput}
            />
          </Field>
        </div>
        </div>
        <div>
        <div>
          {textEditingKey === `${h.id}:kontraktor` || !h.kontraktor ? (
            <Field label="Kontraktor">
              <input autoFocus={textEditingKey === `${h.id}:kontraktor`} list="kontraktor-options" style={formInput} value={h.kontraktor || ""} onChange={(e) => { setTextEditingKey(`${h.id}:kontraktor`); updateHouse(h.id, { kontraktor: e.target.value }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Kontraktor</div>
              <div onClick={() => setTextEditingKey(`${h.id}:kontraktor`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}>{h.kontraktor}</div>
            </div>
          )}
          {textEditingKey === `${h.id}:spkNo` || !h.spkNo ? (
            <Field label="No. SPK">
              <input autoFocus={textEditingKey === `${h.id}:spkNo`} style={formInput} value={h.spkNo || ""} onChange={(e) => { setTextEditingKey(`${h.id}:spkNo`); updateHouse(h.id, { spkNo: e.target.value }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>No. SPK</div>
              <div onClick={() => setTextEditingKey(`${h.id}:spkNo`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}>{h.spkNo}</div>
            </div>
          )}
          {textEditingKey === `${h.id}:spkTahun` || !h.spkTahun ? (
            <Field label="Tahun SPK">
              <input autoFocus={textEditingKey === `${h.id}:spkTahun`} type="number" style={formInput} value={h.spkTahun || ""} onChange={(e) => { setTextEditingKey(`${h.id}:spkTahun`); const v = e.target.value; updateHouse(h.id, { spkTahun: v === "" ? null : Number(v) }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Tahun SPK</div>
              <div onClick={() => setTextEditingKey(`${h.id}:spkTahun`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel, fontFamily: "IBM Plex Mono, monospace" }}>{h.spkTahun}</div>
            </div>
          )}
          {monthEditingKey === h.id || !h.spkBulan ? (
            <Field label="Bulan SPK (1-12)">
              <input autoFocus={monthEditingKey === h.id} type="number" min="1" max="12" style={formInput} value={h.spkBulan || ""} onChange={(e) => { setMonthEditingKey(h.id); const v = e.target.value; updateHouse(h.id, { spkBulan: v === "" ? null : Math.min(12, Math.max(1, Number(v))) }); }} onKeyDown={(e) => { if (e.key === "Enter") setMonthEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Bulan SPK</div>
              <div onClick={() => setMonthEditingKey(h.id)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}>
                {MONTHS[h.spkBulan - 1]}
              </div>
            </div>
          )}
        </div>
        <div className="pt-2 mt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          <Field label="Catatan">
            <textarea
              value={h.catatan || ""}
              onChange={(e) => updateHouse(h.id, { catatan: e.target.value })}
              placeholder="Kondisi khusus, kendala lapangan, dll..."
              rows={2}
              style={{ ...formInput, resize: "vertical", fontFamily: "Inter, sans-serif" }}
            />
          </Field>
        </div>
        </div>
        <div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-xs mb-2" style={{ color: C.steel }}>
              Luas Bangunan: <b style={{ color: C.ink }}>{luasBangunanOf(h)} m²</b> <span style={{ color: C.steel }}>(ikut Tipe "{h.tipe}", atur di Pengaturan)</span>
            </div>
          </div>
          {priceEditingKey === `${h.id}:hpp` || !h.hppPerM2 ? (
            <Field label="HPP per m² (Rp)">
              <input autoFocus={priceEditingKey === `${h.id}:hpp`} type="number" min="0" style={formInput} value={h.hppPerM2 || ""} onChange={(e) => { setPriceEditingKey(`${h.id}:hpp`); updateHouse(h.id, { hppPerM2: Number(e.target.value) || 0 }); }} onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2.5">
              <div className="text-xs mb-1" style={{ color: C.steel }}>HPP per m² (Rp)</div>
              <div onClick={() => setPriceEditingKey(`${h.id}:hpp`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}>
                {rupiah(h.hppPerM2)}{luasBangunanOf(h) ? <> → Total: <b>{rupiah(hppTotal(h))}</b></> : <span style={{ color: C.amber }}> — atur LB Tipe ini dulu di Pengaturan</span>}
              </div>
            </div>
          )}
          <StatusRow label="Ada Adendum" value={h.adendum} onToggle={() => updateHouse(h.id, { adendum: !h.adendum })} />
          {h.adendum && (
            <Field label="Jumlah Adendum (+/- Rp)">
              <input type="number" style={formInput} value={h.adendumAmount || ""} onChange={(e) => updateHouse(h.id, { adendumAmount: Number(e.target.value) || 0 })} />
              <div className="text-xs mt-1" style={{ color: h.adendumAmount < 0 ? C.red : C.steel }}>{h.adendumAmount ? rupiah(h.adendumAmount) : "Rp 0"}</div>
            </Field>
          )}
          {priceEditingKey === `${h.id}:harga` || !h.hargaJualPerM2 ? (
            <Field label="Harga Jual per m² (Rp)">
              <input autoFocus={priceEditingKey === `${h.id}:harga`} type="number" min="0" style={formInput} value={h.hargaJualPerM2 || ""} onChange={(e) => { setPriceEditingKey(`${h.id}:harga`); updateHouse(h.id, { hargaJualPerM2: Number(e.target.value) || 0 }); }} onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2.5">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Harga Jual per m² (Rp)</div>
              <div onClick={() => setPriceEditingKey(`${h.id}:harga`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}>
                {rupiah(h.hargaJualPerM2)}{luasBangunanOf(h) ? <> → Total: <b>{rupiah(hargaJualTotal(h))}</b></> : <span style={{ color: C.amber }}> — atur LB Tipe ini dulu di Pengaturan</span>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${C.line}` }}>
          {luasBangunanOf(h) > 0 && (
            <div className="flex justify-between text-xs mb-2" style={{ color: C.steel }}>
              <span>HPP/m² efektif {h.adendum && h.adendumAmount ? "(termasuk adendum)" : ""}</span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink }}>{rupiah(Math.round(finalHppPerM2(h)))}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold" style={{ color: C.ink }}>Margin</span>
            {!luasBangunanOf(h) ? (
              <span className="text-xs" style={{ color: C.steel }}>atur Luas Bangunan Tipe</span>
            ) : (
              <span style={{ textAlign: "right" }}>
                <div className="text-base font-semibold" style={{ fontFamily: "IBM Plex Mono, monospace", color: marginPct(h) >= 20 ? C.green : C.red }}>{marginPct(h).toFixed(2)}%</div>
                <div className="text-xs" style={{ color: C.steel }}>{rupiah(marginOf(h))}</div>
              </span>
            )}
          </div>
        </div>

        </div>
        </div>

        <div className="mt-3 pt-2.5" style={{ borderTop: `1px solid ${C.line}` }}>
          {confirmDeleteId === h.id ? (
            <div className="flex gap-2">
              <button onClick={() => { removeHouse(h.id); setConfirmDeleteId(null); }} className="text-xs px-2.5 py-1 rounded-lg flex-1" style={{ background: C.red, color: "#fff" }}>Ya, Hapus Kavling Ini</button>
              <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2.5 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDeleteId(h.id)} className="text-xs" style={{ color: C.red }}>Hapus Kavling Ini</button>
          )}
        </div>
      </div>
    );
}
