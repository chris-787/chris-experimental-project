import { C } from "../../theme";
import { Field, Ic, StatusRow, focusWhen, formInput, tint } from "../../components/ui";
import { MONTHS } from "../../lib/constants";
import React from "react";
import { rupiah } from "../../lib/helpers";
import { timeAgo } from "../../lib/calc";
import { statusColor } from "../../lib/palette";
import { useBoard } from "./BoardContext";

// Judul kolom: ikon berlatar warna sendiri + teks, supaya tiap kolom punya identitas warna.
function ColHead({ icon, color, children }) {
  return (
    <div className="col-head" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 22, height: 22, borderRadius: 7, background: tint(color, 18), color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic name={icon} size={14} /></span>
      {children}
    </div>
  );
}

// Arah geser terakhir dari tombol Prev/Next: isi Detail Kavling masuk dari sisi yang sesuai; dari klik peta, memudar naik saja.
const KONTRAKTOR_COLOR = "#8B6FD6";
let navDir = { id: null, dir: "" };

export default function InspectorPanel() {
  const { kontraktorColorOf, tipeColor, canEdit, confirmDeleteId, detailEditingKey, finalHppPerM2, getDetail, hargaJualTotal, houses, hppTotal, kategoriOptions, luasBangunanOf, marginOf, marginPct, monthEditingKey, priceEditingKey, printKavlingSummary, removeHouse, selectFromMap, selectedId, setConfirmDeleteId, setDetail, setDetailEditingKey, setMonthEditingKey, setPriceEditingKey, setSelectedId, setTextEditingKey, statusFields, tableRows, textEditingKey, tipeOptions, updateHouse, updateStatus } = useBoard();
    if (!selectedId) {
      return <div className="text-sm py-2 text-center" style={{ color: C.steel }}>Klik salah satu kavling di peta untuk mengisi datanya.</div>;
    }
    const h = houses.find((x) => x.id === selectedId);
    if (!h) return <div className="text-sm py-2 text-center" style={{ color: C.steel }}>Kavling tidak ditemukan.</div>;
    const idx = tableRows.findIndex((x) => x.id === selectedId);
    const kColor = kontraktorColorOf(h.kontraktor);
    const prevRow = tableRows[idx - 1];
    const nextRow = tableRows[idx + 1];
    return (
      <div data-inspector>
        <div className="flex items-center gap-2.5 flex-wrap mb-3.5">
          <div key={`n-${h.id}`} className="insp-fade" style={{ fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{h.blok}-{h.noKavling}</div>
          <span key={`t-${h.id}`} className="insp-fade" style={{ background: tint(tipeColor(h.tipe), 18), color: C.ink, fontWeight: 600, fontSize: 11, padding: "3px 10px 3px 8px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: 3, background: tipeColor(h.tipe), display: "inline-block" }} />{h.tipe}</span>
          <span key={`s-${h.id}`} className="insp-fade" style={{ background: h.status.terjual ? tint(C.green, 18) : C.pillFill, color: h.status.terjual ? C.green : C.steel, fontWeight: 600, fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>{h.status.terjual ? "Sudah terjual" : "Belum terjual"}</span>
          {/* Status lain yang sedang aktif (Marketing, Pancang, SPK, AC, dan status baru yang ditambahkan di Settings) ikut tampil di header */}
          {statusFields.map((s, i) => {
            if (s.key === "terjual" || !h.status[s.key]) return null;
            const col = statusColor(i);
            const detail = s.hasDetail ? getDetail(h, s.key) : "";
            return (
              <span key={`${h.id}-${s.key}`} className="insp-fade" title={s.label} style={{ background: tint(col, 16), color: `color-mix(in srgb, ${col} var(--pill-mix), ${C.ink})`, fontWeight: 600, fontSize: 11, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
                {s.label}{detail ? `: ${detail}` : ""}
              </span>
            );
          })}
          {h.lastEditedAt && <span key={`e-${h.id}`} className="text-xs insp-fade" style={{ color: C.steel }}>Terakhir diubah: {timeAgo(h.lastEditedAt)}{h.lastEditedBy ? ` oleh ${h.lastEditedBy}` : ""}</span>}
          <span style={{ flex: 1 }} />
          <button disabled={!prevRow} onClick={() => { if (prevRow) { navDir = { id: prevRow.id, dir: "prev" }; selectFromMap(prevRow.id); } }} style={{ height: 32, padding: "0 16px", borderRadius: 999, border: `1px solid ${C.line}`, background: C.panel, color: prevRow ? C.ink : C.faint, fontWeight: 600, fontSize: 12, cursor: prevRow ? "pointer" : "default" }} title="Kavling sebelumnya (←)">&lsaquo; Prev</button>
          <button disabled={!nextRow} onClick={() => { if (nextRow) { navDir = { id: nextRow.id, dir: "next" }; selectFromMap(nextRow.id); } }} style={{ height: 32, padding: "0 16px", borderRadius: 999, border: `1px solid ${C.line}`, background: C.panel, color: nextRow ? C.ink : C.faint, fontWeight: 600, fontSize: 12, cursor: nextRow ? "pointer" : "default" }} title="Kavling berikutnya (→)">Next &rsaquo;</button>
          <button onClick={() => printKavlingSummary(h)} style={{ height: 32, padding: "0 16px", borderRadius: 999, border: "1px solid transparent", background: C.accent, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}><Ic name="printer" size={14} /> Print</button>
          <button onClick={() => setSelectedId(null)} aria-label="Tutup detail" title="Tutup / hapus highlight (Esc)" style={{ width: 36, height: 32, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.panel, color: C.steel, cursor: "pointer" }}>✕</button>
        </div>

        <div key={h.id} className={`insp-in${navDir.id === h.id && navDir.dir ? ` insp-${navDir.dir}` : ""}`}>
        <div className="inspector-cols">
        <div>
        <ColHead icon="sliders" color={C.accent}>Data dan status</ColHead>
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
          {statusFields.map((s, si) => (
            <React.Fragment key={s.key}>
              <StatusRow color={s.key === "terjual" ? C.green : statusColor(si)} label={s.label} value={!!h.status[s.key]} onToggle={() => { const next = !h.status[s.key]; updateStatus(h.id, s.key, next); if (s.hasDetail && next) setDetailEditingKey(`${h.id}:${s.key}`); }} />
              {s.hasDetail && h.status[s.key] && (
                <div className="mb-2 mt-1 p-2 rounded-lg" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                  <div className="text-xs mb-1" style={{ color: C.steel }}>Detail {s.label}</div>
                  {detailEditingKey === `${h.id}:${s.key}` ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={focusWhen(true, "inspector")}
                        style={formInput}
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
        <ColHead icon="hardhat" color={KONTRAKTOR_COLOR}>Kontraktor dan SPK</ColHead>
          {textEditingKey === `${h.id}:kontraktor` || !h.kontraktor ? (
            <Field label="Kontraktor">
              <input ref={focusWhen(textEditingKey === `${h.id}:kontraktor`, "inspector")} list="kontraktor-options" style={formInput} value={h.kontraktor || ""} onChange={(e) => { setTextEditingKey(`${h.id}:kontraktor`); updateHouse(h.id, { kontraktor: e.target.value }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Kontraktor</div>
              <div onClick={() => setTextEditingKey(`${h.id}:kontraktor`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${kColor ? tint(kColor, 55) : C.line}`, borderRadius: 8, background: kColor ? tint(kColor, 12) : C.panel, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>{kColor && <i style={{ width: 10, height: 10, borderRadius: 3, background: kColor, flexShrink: 0 }} />}{h.kontraktor}</div>
            </div>
          )}
          {textEditingKey === `${h.id}:spkNo` || !h.spkNo ? (
            <Field label="No. SPK">
              <input ref={focusWhen(textEditingKey === `${h.id}:spkNo`, "inspector")} style={formInput} value={h.spkNo || ""} onChange={(e) => { setTextEditingKey(`${h.id}:spkNo`); updateHouse(h.id, { spkNo: e.target.value }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>No. SPK</div>
              <div onClick={() => setTextEditingKey(`${h.id}:spkNo`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}>{h.spkNo}</div>
            </div>
          )}
          {textEditingKey === `${h.id}:spkTahun` || !h.spkTahun ? (
            <Field label="Tahun SPK">
              <input ref={focusWhen(textEditingKey === `${h.id}:spkTahun`, "inspector")} type="number" style={formInput} value={h.spkTahun || ""} onChange={(e) => { setTextEditingKey(`${h.id}:spkTahun`); const v = e.target.value; updateHouse(h.id, { spkTahun: v === "" ? null : Number(v) }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Tahun SPK</div>
              <div onClick={() => setTextEditingKey(`${h.id}:spkTahun`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel, fontFamily: "IBM Plex Mono, monospace" }}>{h.spkTahun}</div>
            </div>
          )}
          {monthEditingKey === h.id || !h.spkBulan ? (
            <Field label="Bulan SPK (1-12)">
              <input ref={focusWhen(monthEditingKey === h.id, "inspector")} type="number" min="1" max="12" style={formInput} value={h.spkBulan || ""} onChange={(e) => { setMonthEditingKey(h.id); const v = e.target.value; updateHouse(h.id, { spkBulan: v === "" ? null : Math.min(12, Math.max(1, Number(v))) }); }} onKeyDown={(e) => { if (e.key === "Enter") setMonthEditingKey(null); }} />
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
              style={{ ...formInput, height: "auto", padding: "8px 12px", resize: "vertical" }}
            />
          </Field>
        </div>
        </div>
        <div>
        <div>
        <ColHead icon="wallet" color={C.green}>Harga dan HPP</ColHead>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-xs mb-2" style={{ color: C.steel }}>
              Luas Bangunan: <b style={{ color: C.ink }}>{luasBangunanOf(h)} m²</b> <span style={{ color: C.steel }}>(ikut Tipe "{h.tipe}", atur di Pengaturan)</span>
            </div>
          </div>
          {priceEditingKey === `${h.id}:hpp` || !h.hppPerM2 ? (
            <Field label="HPP per m² (Rp)">
              <input ref={focusWhen(priceEditingKey === `${h.id}:hpp`, "inspector")} type="number" min="0" style={formInput} value={h.hppPerM2 || ""} onChange={(e) => { setPriceEditingKey(`${h.id}:hpp`); updateHouse(h.id, { hppPerM2: Number(e.target.value) || 0 }); }} onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2.5">
              <div className="text-xs mb-1" style={{ color: C.steel }}>HPP per m² (Rp)</div>
              <div onClick={() => setPriceEditingKey(`${h.id}:hpp`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}>
                {rupiah(h.hppPerM2)}{luasBangunanOf(h) ? <> → Total: <b style={{ background: tint(C.data, 16), padding: "1px 8px", borderRadius: 999, fontFamily: "IBM Plex Mono, monospace" }}>{rupiah(hppTotal(h))}</b></> : <span style={{ color: C.amber }}> — atur LB Tipe ini dulu di Pengaturan</span>}
              </div>
            </div>
          )}
          <StatusRow color={C.amber} label="Ada Adendum" value={h.adendum} onToggle={() => updateHouse(h.id, { adendum: !h.adendum })} />
          {h.adendum && (
            <Field label="Jumlah Adendum (+/- Rp)">
              <input type="number" style={formInput} value={h.adendumAmount || ""} onChange={(e) => updateHouse(h.id, { adendumAmount: Number(e.target.value) || 0 })} />
              <div className="text-xs mt-1" style={{ color: h.adendumAmount < 0 ? C.red : C.steel }}>{h.adendumAmount ? rupiah(h.adendumAmount) : "Rp 0"}</div>
            </Field>
          )}
          {priceEditingKey === `${h.id}:harga` || !h.hargaJualPerM2 ? (
            <Field label="Harga Jual per m² (Rp)">
              <input ref={focusWhen(priceEditingKey === `${h.id}:harga`, "inspector")} type="number" min="0" style={formInput} value={h.hargaJualPerM2 || ""} onChange={(e) => { setPriceEditingKey(`${h.id}:harga`); updateHouse(h.id, { hargaJualPerM2: Number(e.target.value) || 0 }); }} onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2.5">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Harga Jual per m² (Rp)</div>
              <div onClick={() => setPriceEditingKey(`${h.id}:harga`)} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: C.panel }}>
                {rupiah(h.hargaJualPerM2)}{luasBangunanOf(h) ? <> → Total: <b style={{ background: tint(C.green, 16), padding: "1px 8px", borderRadius: 999, fontFamily: "IBM Plex Mono, monospace" }}>{rupiah(hargaJualTotal(h))}</b></> : <span style={{ color: C.amber }}> — atur LB Tipe ini dulu di Pengaturan</span>}
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
          {!luasBangunanOf(h) ? (
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold" style={{ color: C.ink }}>Margin</span>
              <span className="text-xs" style={{ color: C.steel }}>atur Luas Bangunan Tipe</span>
            </div>
          ) : (
            <div style={{ borderRadius: 12, padding: "10px 12px", textAlign: "center", background: tint(marginPct(h) >= 20 ? C.green : C.red, 14), border: `1px solid ${tint(marginPct(h) >= 20 ? C.green : C.red, 35)}` }}>
              <div className="text-xs" style={{ color: marginPct(h) >= 20 ? C.green : C.red, fontWeight: 600 }}>Margin</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: 24, lineHeight: 1.2, color: marginPct(h) >= 20 ? C.green : C.red }}>{marginPct(h).toFixed(2)}%</div>
              <div className="text-xs" style={{ color: C.steel }}>{rupiah(marginOf(h))}</div>
            </div>
          )}
        </div>

        </div>
        </div>

        {canEdit && <div className="mt-3 pt-2.5" style={{ borderTop: `1px solid ${C.line}` }}>
          {confirmDeleteId === h.id ? (
            <div className="flex gap-2">
              <button onClick={() => { removeHouse(h.id); setConfirmDeleteId(null); }} className="text-xs px-2.5 py-1 rounded-lg flex-1" style={{ background: C.red, color: "#fff" }}>Ya, Hapus Kavling Ini</button>
              <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2.5 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDeleteId(h.id)} className="text-xs" style={{ color: C.red }}>Hapus Kavling Ini</button>
          )}
        </div>}
        </div>
      </div>
    );
}
