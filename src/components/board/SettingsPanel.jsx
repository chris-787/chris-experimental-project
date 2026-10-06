import { C } from "../../theme";
import { SITE_IMAGE_DEFAULT } from "../../lib/constants";
import { cellInput, formInput } from "../../components/ui";
import { useBoard } from "./BoardContext";

export default function SettingsPanel() {
  const { addBlock, addKategori, addStatus, addTipe, blockColor, blockProgress, blocks, canEdit, confirmDeleteBlokId, confirmDeleteKategoriName, confirmDeleteStatusKey, confirmDeleteTipeName, exportBackup, handleImageUpload, imgUploading, importBackup, kategoriOptions, moveStatusField, newBlock, newKategori, newStatus, newStatusHasDetail, newTipe, newTipeLuas, refreshTipeColors, removeBlock, removeKategori, removeStatusField, removeTipe, renameBlock, renameKategori, renameStatusLabel, renameTipe, resetImage, setConfirmDeleteBlokId, setConfirmDeleteKategoriName, setConfirmDeleteStatusKey, setConfirmDeleteTipeName, setNewBlock, setNewKategori, setNewStatus, setNewStatusHasDetail, setNewTipe, setNewTipeLuas, settingsMsg, siteImage, statusFields, tipeOptions, toggleStatusDetail, updateBlockTarget, updateTipeLuas } = useBoard();
  return (
    <>
        <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          <div className="rounded-xl p-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            <div className="text-sm font-medium mb-1" style={{ color: C.ink }}>Blok</div>
            <p className="text-xs mb-2.5" style={{ color: C.steel }}>Ganti nama di sini akan otomatis memindahkan semua kavling yang sudah dikalibrasi — tidak perlu gambar ulang di peta.</p>
            {settingsMsg && <div className="text-xs mb-2.5 p-2 rounded-lg" style={{ background: C.alertAmberBg, color: C.amber, border: `1px solid ${C.amber}` }}>{settingsMsg}</div>}
            <div className="flex flex-col gap-2 mb-2.5">
              {blockProgress.map((b) => {
                const isDuplicateName = blocks.some((x) => x.id !== b.id && x.name === b.name);
                const canDelete = isDuplicateName || b.placed === 0;
                return (
                  <div key={b.id} className="flex items-center gap-2 text-sm py-1" style={{ borderBottom: `1px solid ${C.line}` }}>
                    <span className="w-3 h-3 rounded-sm inline-block shrink-0" style={{ background: blockColor(b.name) }} />
                    <input
                      defaultValue={b.name}
                      onBlur={(e) => renameBlock(b.id, e.target.value)}
                      style={{ ...cellInput, minWidth: 90, fontWeight: 600, borderColor: isDuplicateName ? C.red : C.line }}
                    />
                    <input
                      type="number"
                      value={b.target}
                      onChange={(e) => updateBlockTarget(b.id, e.target.value)}
                      style={{ ...cellInput, minWidth: 60, maxWidth: 70 }}
                      title="Target unit"
                    />
                    <span className="text-xs whitespace-nowrap" style={{ color: isDuplicateName ? C.red : C.steel }}>{b.placed} terpetakan{isDuplicateName ? " · nama duplikat" : ""}</span>
                    {confirmDeleteBlokId === b.id ? (
                      <span className="flex items-center gap-1 ml-auto">
                        <button onClick={() => { removeBlock(b.id); setConfirmDeleteBlokId(null); }} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                        <button onClick={() => setConfirmDeleteBlokId(null)} className="text-xs px-2 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteBlokId(b.id)}
                        disabled={!canDelete}
                        title={!canDelete ? `Masih ada ${b.placed} kavling di blok ini` : "Hapus blok"}
                        className="text-xs ml-auto"
                        style={{ color: canDelete ? C.red : C.faint, cursor: canDelete ? "pointer" : "not-allowed" }}
                      >Hapus</button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input placeholder="Nama blok, mis. RB/K" style={formInput} value={newBlock.name} onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })} />
              <input placeholder="Target unit" type="number" style={{ ...formInput, maxWidth: 100 }} value={newBlock.target} onChange={(e) => setNewBlock({ ...newBlock, target: e.target.value })} />
              <button onClick={addBlock} className="text-xs px-2.5 rounded-lg" style={{ background: C.panel, color: C.ink, border: `1px solid ${C.line}` }}>Tambah</button>
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            <div className="text-sm font-medium mb-1" style={{ color: C.ink }}>Gambar Site Plan</div>
            <p className="text-xs mb-2.5" style={{ color: C.steel }}>Ganti dengan revisi terbaru kapan saja. Titik-titik kavling yang sudah dikalibrasi tetap tersimpan (posisinya persentase, jadi sesuaikan lagi kalau layout gambarnya berubah total).</p>
            <img src={siteImage} alt="Preview site plan" loading="lazy" decoding="async" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.line}`, marginBottom: 10 }} />
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs px-2.5 py-1 rounded-lg cursor-pointer" style={{ background: C.panel, color: C.ink, border: `1px solid ${C.line}` }}>
                {imgUploading ? "Memproses..." : "Unggah Gambar Baru"}
                <input type="file" accept="image/*,.pdf" onChange={handleImageUpload} style={{ display: "none" }} disabled={imgUploading} />
              </label>
              {siteImage !== SITE_IMAGE_DEFAULT && (
                <button onClick={resetImage} className="text-xs px-2.5 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Kembalikan Gambar Bawaan</button>
              )}
            </div>
            <p className="text-xs mt-2" style={{ color: C.steel }}>Format gambar (JPG/PNG). Kalau file Anda masih PDF, screenshot atau export halamannya jadi gambar dulu.</p>
          </div>

          <div className="rounded-xl p-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium" style={{ color: C.ink }}>Tipe / Ukuran Kavling</div>
              <button onClick={refreshTipeColors} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.ink, background: C.panel }}>Segarkan Warna</button>
            </div>
            <p className="text-xs mb-2.5" style={{ color: C.steel }}>Luas Bangunan diatur di sini per tipe — kavling yang pakai tipe ini otomatis ikut nilainya, tidak perlu diisi satu-satu.</p>
            <div className="flex flex-col gap-1.5 mb-2.5">
              {tipeOptions.map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-sm py-1" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <span className="w-3 h-3 rounded-sm inline-block shrink-0" style={{ background: t.color }} />
                  <input
                    defaultValue={t.name}
                    onBlur={(e) => renameTipe(t.name, e.target.value)}
                    style={{ ...cellInput, width: "auto", flex: "0 1 140px", fontWeight: 600 }}
                  />
                  <input
                    type="number" min="0"
                    value={t.luasBangunan || ""}
                    onChange={(e) => updateTipeLuas(t.name, e.target.value)}
                    placeholder="Luas Bangunan m²"
                    style={{ ...cellInput, width: "auto", flex: "0 1 130px" }}
                  />
                  <span className="text-xs" style={{ color: C.steel }}>m²</span>
                  {confirmDeleteTipeName === t.name ? (
                    <span className="flex items-center gap-1 ml-auto">
                      <button onClick={() => { removeTipe(t.name); setConfirmDeleteTipeName(null); }} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                      <button onClick={() => setConfirmDeleteTipeName(null)} className="text-xs px-2 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDeleteTipeName(t.name)} className="text-xs ml-auto" style={{ color: C.red }}>Hapus</button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Tipe baru, mis. Standar 8x12" style={formInput} value={newTipe} onChange={(e) => setNewTipe(e.target.value)} />
              <input placeholder="Luas Bangunan m²" type="number" min="0" style={{ ...formInput, maxWidth: 140 }} value={newTipeLuas} onChange={(e) => setNewTipeLuas(e.target.value)} />
              <button onClick={addTipe} className="text-xs px-2.5 rounded-lg" style={{ background: C.panel, color: C.ink, border: `1px solid ${C.line}` }}>Tambah</button>
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            <div className="text-sm font-medium mb-1" style={{ color: C.ink }}>Status yang Dilacak</div>
            <p className="text-xs mb-2.5" style={{ color: C.steel }}>Centang "Detail" kalau status ini butuh keterangan tambahan (kayak "Order AC" — muncul kotak isian begitu dicentang).</p>
            <div className="flex flex-col gap-1.5 mb-2.5">
              {statusFields.map((s, idx) => (
                <div key={s.key} className="flex items-center justify-between gap-2.5 text-sm py-1" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col">
                      <button onClick={() => moveStatusField(s.key, -1)} disabled={idx === 0} className="leading-none" style={{ color: idx === 0 ? C.faint : C.steel, fontSize: 10, cursor: idx === 0 ? "not-allowed" : "pointer" }}>▲</button>
                      <button onClick={() => moveStatusField(s.key, 1)} disabled={idx === statusFields.length - 1} className="leading-none" style={{ color: idx === statusFields.length - 1 ? C.faint : C.steel, fontSize: 10, cursor: idx === statusFields.length - 1 ? "not-allowed" : "pointer" }}>▼</button>
                    </div>
                    <input
                      defaultValue={s.label}
                      onBlur={(e) => renameStatusLabel(s.key, e.target.value)}
                      style={{ ...cellInput, width: "auto", flex: "0 1 180px", fontWeight: 600 }}
                    />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                      <input type="checkbox" checked={!!s.hasDetail} onChange={() => toggleStatusDetail(s.key)} /> Detail
                    </label>
                    {confirmDeleteStatusKey === s.key ? (
                      <span className="flex items-center gap-1">
                        <button onClick={() => { removeStatusField(s.key); setConfirmDeleteStatusKey(null); }} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                        <button onClick={() => setConfirmDeleteStatusKey(null)} className="text-xs px-2 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmDeleteStatusKey(s.key)} className="text-xs" style={{ color: C.red }}>Hapus</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <input placeholder="Status baru, mis. Order Pagar" style={{ ...formInput, flex: 1, minWidth: 160 }} value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: C.steel }}>
                <input type="checkbox" checked={newStatusHasDetail} onChange={(e) => setNewStatusHasDetail(e.target.checked)} /> Punya detail
              </label>
              <button onClick={addStatus} className="text-xs px-2.5 rounded-lg" style={{ background: C.panel, color: C.ink, border: `1px solid ${C.line}` }}>Tambah</button>
            </div>
            <p className="text-xs mt-2" style={{ color: C.steel }}>Kavling yang sudah ada otomatis dapat status baru = "belum", tinggal dicentang di tabel.</p>
          </div>

          <div className="rounded-xl p-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            <div className="text-sm font-medium mb-2.5" style={{ color: C.ink }}>Kategori Rumah</div>
            <div className="flex flex-col gap-1.5 mb-2.5">
              {kategoriOptions.map((k) => (
                <div key={k} className="flex items-center justify-between gap-2.5 text-sm py-1" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <input
                    defaultValue={k}
                    onBlur={(e) => renameKategori(k, e.target.value)}
                    style={{ ...cellInput, width: "auto", flex: "0 1 180px" }}
                  />
                  {confirmDeleteKategoriName === k ? (
                    <span className="flex items-center gap-1">
                      <button onClick={() => { removeKategori(k); setConfirmDeleteKategoriName(null); }} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                      <button onClick={() => setConfirmDeleteKategoriName(null)} className="text-xs px-2 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDeleteKategoriName(k)} className="text-xs" style={{ color: C.red }}>Hapus</button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Kategori baru" style={formInput} value={newKategori} onChange={(e) => setNewKategori(e.target.value)} />
              <button onClick={addKategori} className="text-xs px-2.5 rounded-lg" style={{ background: C.panel, color: C.ink, border: `1px solid ${C.line}` }}>Tambah</button>
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            <div className="text-sm font-medium mb-1" style={{ color: C.ink }}>Cadangkan / Pulihkan Data</div>
            <p className="text-xs mb-2.5" style={{ color: C.steel }}>Simpan salinan semua data (kavling, blok, tipe, status) ke file — supaya aman kalau ada perubahan besar pada aplikasinya. Lakukan ini sesering mungkin selagi masih sering ada pembaruan.</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={exportBackup} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Unduh Cadangan (JSON)</button>
              {canEdit && (
                <label className="text-xs px-2.5 py-1 rounded-lg cursor-pointer" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  Pulihkan dari File
                  <input type="file" accept="application/json" onChange={importBackup} style={{ display: "none" }} />
                </label>
              )}
            </div>
          </div>
        </div>
    </>
  );
}
