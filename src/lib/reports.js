// Laporan cetak (PDF), ekspor/impor Excel, dan backup/restore JSON.
// Dipisah dari BriaStatusBoard; data yang dibutuhkan dikirim lewat parameter ctx.
import { C } from "../theme";
import { DEFAULT_BLOCKS, DEFAULT_KATEGORI, DEFAULT_STATUS, DEFAULT_TIPE, LAST_BACKUP_KEY, LEGACY_CLUSTER_ID, MONTHS, SITE_IMAGE_DEFAULT, configKeyFor, housesKeyFor, imageKeyFor } from "../lib/constants";
import { rupiah } from "../lib/helpers";
import { storage } from "../lib/storage";

export function makeReports(ctx) {
  const { activeCluster, avgMarginPct, blockColor, blockProgress, blocks, canEdit, clusters, colorMode, getDetail, hargaJualTotal, houses, hppTotal, kategoriOptions, loadHomeStats, luasBangunanOf, marginOf, marginPct, marginPerTipe, newBlockId, opacity, pendingRestoreAll, polyColor, saveClustersIndex, saveConfig, saveHouses, setBlocks, setClusters, setExportingBackupAll, setExportingExcelAll, setHouses, setImportMsg, setKategoriOptions, setLastBackupAt, setPendingRestoreAll, setRestoreAllError, setRestoreAllResult, setRestoringAll, setSettingsMsg, setStatusFields, setTableBlocks, setTipeOptions, siteImage, soldUnits, statusFields, tableRows, tipeOptions, tipePie, totalMargin, totalTarget } = ctx;
  function importExcel(e) {
    if (!canEdit) return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        const updatedList = [];
        const skippedList = [];
        const next = [...houses];
        rows.forEach((row) => {
          const kavlingStr = String(row["Kavling"] || "").trim();
          const idx = kavlingStr.lastIndexOf("-");
          if (idx < 0) { skippedList.push(kavlingStr || "(kosong)"); return; }
          const blok = kavlingStr.slice(0, idx);
          const noKavling = kavlingStr.slice(idx + 1);
          const hi = next.findIndex((h) => h.blok === blok && h.noKavling === noKavling);
          if (hi === -1) { skippedList.push(kavlingStr); return; }
          const h = { ...next[hi] };
          if (row["Kategori"] !== undefined && row["Kategori"] !== "") h.kategori = String(row["Kategori"]);
          if (row["Kontraktor"] !== undefined) h.kontraktor = String(row["Kontraktor"]);
          if (row["No. SPK"] !== undefined) h.spkNo = String(row["No. SPK"]);
          if (row["Th. SPK"] !== undefined && row["Th. SPK"] !== "") h.spkTahun = Number(row["Th. SPK"]) || null;
          if (row["Bln. SPK"] !== undefined && row["Bln. SPK"] !== "") {
            const mi = MONTHS.findIndex((m) => m.toLowerCase() === String(row["Bln. SPK"]).toLowerCase().slice(0, 3));
            if (mi >= 0) h.spkBulan = mi + 1;
          }
          if (row["HPP/m2 (Rp)"] !== undefined && row["HPP/m2 (Rp)"] !== "") h.hppPerM2 = Number(row["HPP/m2 (Rp)"]) || 0;
          if (row["Harga Jual/m2 (Rp)"] !== undefined && row["Harga Jual/m2 (Rp)"] !== "") h.hargaJualPerM2 = Number(row["Harga Jual/m2 (Rp)"]) || 0;
          if (row["Adendum (Rp)"] !== undefined && row["Adendum (Rp)"] !== "") {
            const amt = Number(row["Adendum (Rp)"]) || 0;
            h.adendum = amt !== 0; h.adendumAmount = amt;
          }
          statusFields.forEach((s) => {
            if (row[s.label] !== undefined) h.status = { ...h.status, [s.key]: String(row[s.label]).trim().toLowerCase().startsWith("s") };
            if (s.hasDetail && row[`${s.label} - Detail`] !== undefined) {
              h.details = { ...(h.details || {}), [s.key]: String(row[`${s.label} - Detail`]) };
            }
          });
          next[hi] = h;
          updatedList.push(kavlingStr);
        });
        setHouses(next); saveHouses(next);
        setImportMsg({ updated: updatedList, skipped: skippedList });
      } catch (err) {
        setImportMsg("Gagal membaca file. Pastikan formatnya .xlsx atau .csv, kolom \"Kavling\" berisi kode seperti \"RB/A-01\".");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }
  function buildReportHtml() {
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const statusRows = statusFields.map((s) => {
      const done = houses.filter((h) => h.status[s.key]).length;
      return `<tr><td>${s.label}</td><td>${done}</td><td>${houses.length - done}</td></tr>`;
    }).join("");
    const tipeRows = marginPerTipe.filter((t) => t.n > 0).map((t) => `<tr><td>${t.tipe}</td><td>${t.n}</td><td>${t.margin}%</td></tr>`).join("");

    const maxTarget = Math.max(1, ...blockProgress.map((b) => Number(b.target) || 0));
    const blokBars = blockProgress.map((b) => {
      const pct = Math.min(100, (b.placed / maxTarget) * 100);
      const targetPct = Math.min(100, ((Number(b.target) || 0) / maxTarget) * 100);
      return `<div class="barrow"><div class="barlabel">${b.name}</div><div class="bartrack"><div class="bartarget" style="width:${targetPct}%"></div><div class="barfill" style="width:${pct}%"></div></div><div class="barval">${b.placed}/${b.target}</div></div>`;
    }).join("");

    const maxMargin = Math.max(1, ...marginPerTipe.map((t) => Math.abs(t.margin)));
    const marginBars = marginPerTipe.filter((t) => t.n > 0).map((t) => {
      const pct = Math.min(100, (Math.abs(t.margin) / maxMargin) * 100);
      const color = t.margin >= 0 ? "#3F7D58" : "#B8562E";
      return `<div class="barrow"><div class="barlabel">${t.tipe}</div><div class="bartrack"><div class="barfill" style="width:${pct}%;background:${color}"></div></div><div class="barval">${t.margin}%</div></div>`;
    }).join("");

    const statusBars = statusFields.map((s) => {
      const done = houses.filter((h) => h.status[s.key]).length;
      const pct = houses.length ? (done / houses.length) * 100 : 0;
      return `<div class="barrow"><div class="barlabel">${s.label}</div><div class="bartrack"><div class="barfill" style="width:${pct}%;background:#3F7D58"></div></div><div class="barval">${done}/${houses.length}</div></div>`;
    }).join("");

    const maxTipeCount = Math.max(1, ...tipePie.map((t) => t.value));
    const tipeBars = tipePie.map((t) => {
      const pct = Math.min(100, (t.value / maxTipeCount) * 100);
      return `<div class="barrow"><div class="barlabel">${t.name}</div><div class="bartrack"><div class="barfill" style="width:${pct}%"></div></div><div class="barval">${t.value} unit</div></div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>Laporan ${activeCluster.name}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1B2A3C; padding: 32px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 20px; margin-bottom: 2px; }
  .sub { color: #5B6673; font-size: 13px; margin-bottom: 24px; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .card { border: 1px solid #C9C2B2; border-radius: 6px; padding: 12px; }
  .card .label { font-size: 11px; color: #5B6673; margin-bottom: 4px; }
  .card .value { font-size: 16px; font-weight: 700; font-family: 'Courier New', monospace; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13px; }
  th, td { border: 1px solid #C9C2B2; padding: 6px 10px; text-align: left; }
  th { background: #F5F2EA; }
  h2 { font-size: 15px; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #1B2A3C; padding-bottom: 4px; }
  .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 28px; }
  .chartbox { border: 1px solid #C9C2B2; border-radius: 6px; padding: 14px; }
  .chartbox h3 { font-size: 13px; margin: 0 0 10px 0; }
  .barrow { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 11px; }
  .barlabel { width: 70px; flex-shrink: 0; color: #5B6673; }
  .bartrack { flex: 1; background: #DAD4C6; border-radius: 3px; height: 12px; position: relative; overflow: hidden; }
  .bartarget { position: absolute; left: 0; top: 0; bottom: 0; background: #E3DFD3; }
  .barfill { position: relative; height: 100%; background: #24507A; border-radius: 3px 0 0 3px; }
  .barval { width: 55px; flex-shrink: 0; text-align: right; font-family: 'Courier New', monospace; }
  @media print { body { padding: 0; } .charts { grid-template-columns: 1fr 1fr; } }
</style></head>
<body>
  <h1>${activeCluster.name}</h1>
  <div class="sub">${activeCluster.subtitle} · target ${totalTarget} unit, ${blocks.length} blok · dicetak ${tanggal}</div>

  <h2>Ringkasan</h2>
  <div class="cards">
    <div class="card"><div class="label">Kavling Terpetakan</div><div class="value">${houses.length} / ${totalTarget}</div></div>
    <div class="card"><div class="label">Sudah Terjual</div><div class="value">${soldUnits.length} / ${houses.length}</div></div>
    <div class="card"><div class="label">Total Margin</div><div class="value">${rupiah(totalMargin)}</div></div>
    <div class="card"><div class="label">Rata-rata Margin %</div><div class="value">${avgMarginPct.toFixed(2)}%</div></div>
  </div>

  <h2>Grafik</h2>
  <div class="charts">
    <div class="chartbox"><h3>Kalibrasi per Blok (unit)</h3>${blokBars}</div>
    <div class="chartbox"><h3>Margin per Tipe (%)</h3>${marginBars || "Belum ada data"}</div>
    <div class="chartbox"><h3>Kelengkapan Status</h3>${statusBars}</div>
    <div class="chartbox"><h3>Distribusi Tipe Kavling</h3>${tipeBars || "Belum ada data"}</div>
  </div>

  <h2>Margin per Tipe</h2>
  <table><thead><tr><th>Tipe</th><th>Jumlah Unit</th><th>Margin</th></tr></thead><tbody>${tipeRows || '<tr><td colspan="3">Belum ada data</td></tr>'}</tbody></table>

  <h2>Kelengkapan Status</h2>
  <table><thead><tr><th>Status</th><th>Sudah</th><th>Belum</th></tr></thead><tbody>${statusRows}</tbody></table>

  <p style="font-size:11px;color:#9CA6AE;">Dibuat otomatis dari Papan Status Tender.</p>
</body></html>`;
    return html;
  }
  function printReportPDF() {
    const w = window.open("", "_blank");
    if (!w) { alert("Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi."); return; }
    w.document.write(buildReportHtml());
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  }
  function printSitePlan() {
    const legendItems = colorMode === "blok"
      ? blocks.map((b) => ({ label: b.name, color: blockColor(b.name) }))
      : colorMode === "tipe"
      ? tipeOptions.map((t) => ({ label: t.name, color: t.color }))
      : [{ label: "Sudah", color: C.green }, { label: "Belum", color: C.red }];
    const colorModeLabel = colorMode === "blok" ? "Per Blok" : colorMode === "tipe" ? "Per Tipe" : (statusFields.find((s) => s.key === colorMode)?.label || colorMode);
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const imgSrc = new URL(siteImage, window.location.href).href;
    const shapesSvg = houses.map((h) => {
      const pts = h.points.map((p) => `${p.x},${p.y}`).join(" ");
      return `<polygon points="${pts}" fill="${polyColor(h)}" fill-opacity="${opacity / 100}" stroke="#00000066" stroke-width="0.2" vector-effect="non-scaling-stroke" />`;
    }).join("");
    const legendHtml = legendItems.map((l) => `<div class="legend-item"><span class="swatch" style="background-color:${l.color}"></span>${l.label}</div>`).join("");
    const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>Site Plan ${activeCluster.name}</title>
<style>
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1B2A3C; padding: 24px; margin: 0; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { color: #5B6673; font-size: 12px; margin-bottom: 16px; }
  .plan-wrap { position: relative; width: 100%; border: 1px solid #C9C2B2; }
  .plan-wrap img { width: 100%; display: block; }
  .plan-wrap svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  .legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; font-size: 12px; }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .swatch { width: 14px; height: 14px; border-radius: 2px; display: inline-block; border: 1px solid #00000033; flex-shrink: 0; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <h1>${activeCluster.name} — Site Plan</h1>
  <div class="sub">${activeCluster.subtitle} · Warna: ${colorModeLabel} · dicetak ${tanggal}</div>
  <div class="plan-wrap">
    <img src="${imgSrc}" />
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">${shapesSvg}</svg>
  </div>
  <div class="legend">${legendHtml}</div>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi."); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  }
  function printKavlingSummary(h) {
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const lb = luasBangunanOf(h);
    const statusRows = statusFields.map((s) => {
      const detail = s.hasDetail ? getDetail(h, s.key) : "";
      return `<tr><td>${s.label}</td><td>${h.status[s.key] ? "Sudah" : "Belum"}${detail ? ` — ${detail}` : ""}</td></tr>`;
    }).join("");
    const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>Ringkasan ${h.blok}-${h.noKavling}</title>
<style>
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1B2A3C; padding: 32px; margin: 0; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  .sub { color: #5B6673; font-size: 12px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  td { padding: 6px 8px; border-bottom: 1px solid #C9C2B2; font-size: 13px; vertical-align: top; }
  td:first-child { color: #5B6673; width: 42%; }
  .section-title { font-size: 13px; font-weight: bold; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.5px; color: #5B6673; }
  .margin-box { border: 1px solid #C9C2B2; border-radius: 8px; padding: 14px; display: flex; justify-content: space-between; align-items: baseline; }
  .margin-pct { font-size: 24px; font-weight: bold; }
  .footer { margin-top: 24px; font-size: 11px; color: #5B6673; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <h1>${h.blok}-${h.noKavling}</h1>
  <div class="sub">${activeCluster.name}${activeCluster.subtitle ? ` · ${activeCluster.subtitle}` : ""} · dicetak ${tanggal}</div>

  <div class="section-title">Data Kavling</div>
  <table>
    <tr><td>Tipe / Ukuran</td><td>${h.tipe || "-"}</td></tr>
    <tr><td>Kategori</td><td>${h.kategori || "-"}</td></tr>
    <tr><td>Luas Bangunan</td><td>${lb ? `${lb} m²` : "-"}</td></tr>
    <tr><td>Kontraktor</td><td>${h.kontraktor || "-"}</td></tr>
    <tr><td>No. SPK</td><td>${h.spkNo || "-"}</td></tr>
    <tr><td>Tahun / Bulan SPK</td><td>${h.spkTahun ? `${MONTHS[(h.spkBulan || 1) - 1]} ${h.spkTahun}` : "-"}</td></tr>
  </table>

  <div class="section-title">Status</div>
  <table>${statusRows}</table>

  <div class="section-title">Harga &amp; Margin</div>
  <table>
    <tr><td>HPP per m²</td><td>${rupiah(h.hppPerM2)}${lb ? ` → Total ${rupiah(hppTotal(h))}` : ""}</td></tr>
    ${h.adendum && h.adendumAmount ? `<tr><td>Adendum</td><td>${rupiah(h.adendumAmount)}</td></tr>` : ""}
    <tr><td>Harga Jual per m²</td><td>${rupiah(h.hargaJualPerM2)}${lb ? ` → Total ${rupiah(hargaJualTotal(h))}` : ""}</td></tr>
  </table>
  ${lb ? `<div class="margin-box"><span>Margin</span><span class="margin-pct" style="color:${marginPct(h) >= 20 ? "#3F7D58" : "#BD3B2E"}">${marginPct(h).toFixed(2)}% <span style="font-size:13px; font-weight:normal; color:#5B6673">(${rupiah(marginOf(h))})</span></span></div>` : ""}

  ${h.catatan ? `<div class="section-title" style="margin-top:18px">Catatan</div><div style="font-size:13px">${h.catatan}</div>` : ""}
  ${h.followUpDate ? `<div class="footer">Follow-up: ${new Date(h.followUpDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>` : ""}
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi."); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  }
  async function exportExcel() {
    const XLSX = await import("xlsx");
    const rows = tableRows.map((h) => {
      const row = {
        Kavling: `${h.blok}-${h.noKavling}`, Blok: h.blok, Tipe: h.tipe, Kategori: h.kategori,
      };
      statusFields.forEach((s) => {
        row[s.label] = h.status[s.key] ? "Sudah" : "Belum";
        if (s.hasDetail) row[`${s.label} - Detail`] = getDetail(h, s.key);
      });
      row["Kontraktor"] = h.kontraktor || "";
      row["No. SPK"] = h.spkNo || "";
      row["Th. SPK"] = h.spkTahun || "";
      row["Bln. SPK"] = h.spkBulan ? MONTHS[h.spkBulan - 1] : "";
      row["Luas Bangunan (m2)"] = luasBangunanOf(h);
      row["HPP/m2 (Rp)"] = h.hppPerM2 || 0;
      row["HPP Total (Rp)"] = hppTotal(h);
      row["Adendum (Rp)"] = h.adendum ? (h.adendumAmount || 0) : 0;
      row["Harga Jual/m2 (Rp)"] = h.hargaJualPerM2 || 0;
      row["Harga Jual Total (Rp)"] = hargaJualTotal(h);
      row["Margin (%)"] = luasBangunanOf(h) ? Number(marginPct(h).toFixed(2)) : "";
      row["Margin (Rp)"] = luasBangunanOf(h) ? marginOf(h) : "";
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Blok");
    XLSX.writeFile(wb, `data-blok-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
  async function fetchAllClustersFull() {
    return Promise.all(clusters.map(async (c) => {
      try {
        const [hRes, cfgRes, imgRes] = await Promise.all([
          storage.get(housesKeyFor(c.id), false).catch(() => null),
          storage.get(configKeyFor(c.id), false).catch(() => null),
          storage.get(imageKeyFor(c.id), false).catch(() => null),
        ]);
        const chouses = hRes && hRes.value ? JSON.parse(hRes.value) : [];
        const cfgParsed = cfgRes && cfgRes.value ? JSON.parse(cfgRes.value) : {};
        const image = (imgRes && imgRes.value) || (c.id === LEGACY_CLUSTER_ID ? SITE_IMAGE_DEFAULT : null);
        return {
          id: c.id, name: c.name, subtitle: c.subtitle,
          houses: chouses,
          blocks: cfgParsed.blocks || (c.id === LEGACY_CLUSTER_ID ? DEFAULT_BLOCKS : []),
          tipeOptions: cfgParsed.tipeOptions || (c.id === LEGACY_CLUSTER_ID ? DEFAULT_TIPE : []),
          statusFields: cfgParsed.statusFields || DEFAULT_STATUS,
          kategoriOptions: cfgParsed.kategoriOptions || DEFAULT_KATEGORI,
          image,
        };
      } catch (e) { return { id: c.id, name: c.name, subtitle: c.subtitle, houses: [], blocks: [], tipeOptions: [], statusFields: [], kategoriOptions: [], image: null }; }
    }));
  }
  function handleRestoreAllFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setRestoreAllError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.clusters)) throw new Error("format tidak sesuai");
        setPendingRestoreAll(data.clusters);
      } catch (err) {
        setRestoreAllError("Gagal membaca file cadangan semua cluster — pastikan file JSON hasil \"Unduh Cadangan Semua Cluster\".");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  async function applyRestoreAll() {
    if (!canEdit || !pendingRestoreAll) return;
    setRestoringAll(true);
    const restoredNames = [];
    const failedNames = [];
    try {
      for (const c of pendingRestoreAll) {
        try {
          await storage.set(housesKeyFor(c.id), JSON.stringify(c.houses || []), false);
          await storage.set(configKeyFor(c.id), JSON.stringify({
            blocks: c.blocks || [], tipeOptions: c.tipeOptions || [], statusFields: c.statusFields || DEFAULT_STATUS, kategoriOptions: c.kategoriOptions || DEFAULT_KATEGORI,
          }), false);
          if (c.image) await storage.set(imageKeyFor(c.id), c.image, false);
          restoredNames.push(c.name || c.id);
        } catch (err) { failedNames.push(c.name || c.id); }
      }
      const succeeded = pendingRestoreAll.filter((c) => restoredNames.includes(c.name || c.id));
      setClusters((prev) => {
        const next = [...prev];
        succeeded.forEach((c) => {
          const idx = next.findIndex((x) => x.id === c.id);
          const meta = { id: c.id, name: c.name || "Cluster", subtitle: c.subtitle || "" };
          if (idx >= 0) next[idx] = { ...next[idx], ...meta };
          else next.push(meta);
        });
        saveClustersIndex(next);
        loadHomeStats(next);
        return next;
      });
      setPendingRestoreAll(null);
      setRestoreAllResult({ restored: restoredNames, failed: failedNames });
    } catch (err) {
      setRestoreAllError("Pemulihan gagal di tengah jalan. Coba lagi — cluster yang belum sempat diproses tidak berubah.");
    } finally { setRestoringAll(false); }
  }
  function markBackedUp() {
    const now = Date.now();
    setLastBackupAt(now);
    storage.set(LAST_BACKUP_KEY, String(now), false).catch(() => {});
  }
  async function exportAllBackup() {
    setExportingBackupAll(true);
    try {
      const allData = await fetchAllClustersFull();
      const payload = { exportedAt: new Date().toISOString(), clusters: allData };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-semua-cluster-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      markBackedUp();
    } finally { setExportingBackupAll(false); }
  }
  async function exportAllExcel() {
    setExportingExcelAll(true);
    try {
      const XLSX = await import("xlsx");
      const allData = await fetchAllClustersFull();
      const wb = XLSX.utils.book_new();
      allData.forEach((c) => {
        const lbOf = (h) => (c.tipeOptions.find((t) => t.name === h.tipe)?.luasBangunan) || 0;
        const rows = c.houses.map((h) => {
          const lb = lbOf(h);
          const hargaTotal = (h.hargaJualPerM2 && lb) ? h.hargaJualPerM2 * lb : 0;
          const hppTotalV = (h.hppPerM2 && lb) ? h.hppPerM2 * lb : 0;
          const finalHpp = hppTotalV + (h.adendum ? (h.adendumAmount || 0) : 0);
          const row = { Kavling: `${h.blok}-${h.noKavling}`, Blok: h.blok, Tipe: h.tipe, Kategori: h.kategori };
          (c.statusFields || []).forEach((s) => {
            row[s.label] = h.status && h.status[s.key] ? "Sudah" : "Belum";
            if (s.hasDetail) row[`${s.label} - Detail`] = (h.details && h.details[s.key]) || "";
          });
          row["Kontraktor"] = h.kontraktor || "";
          row["No. SPK"] = h.spkNo || "";
          row["Luas Bangunan (m2)"] = lb;
          row["HPP/m2 (Rp)"] = h.hppPerM2 || 0;
          row["Harga Jual/m2 (Rp)"] = h.hargaJualPerM2 || 0;
          row["Margin (Rp)"] = hargaTotal - finalHpp;
          row["Margin (%)"] = hargaTotal ? Number((((hargaTotal - finalHpp) / hargaTotal) * 100).toFixed(2)) : "";
          row["Catatan"] = h.catatan || "";
          return row;
        });
        const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Kavling: "(belum ada data)" }]);
        const sheetName = (c.name || "Cluster").replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Cluster";
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      XLSX.writeFile(wb, `semua-cluster-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally { setExportingExcelAll(false); }
  }
  function exportBackup() {
    const payload = { exportedAt: new Date().toISOString(), houses, blocks, tipeOptions, statusFields, kategoriOptions };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${(activeCluster.name || "cluster").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    markBackedUp();
  }
  function importBackup(e) {
    if (!canEdit) return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data.houses)) { setHouses(data.houses); saveHouses(data.houses); }
        if (Array.isArray(data.blocks)) {
          const fixedBlocks = data.blocks.map((b) => (b.id ? b : { ...b, id: newBlockId() }));
          setBlocks(fixedBlocks); setTableBlocks(fixedBlocks.map((b) => b.name));
        }
        if (Array.isArray(data.tipeOptions)) setTipeOptions(data.tipeOptions);
        if (Array.isArray(data.statusFields)) setStatusFields(data.statusFields);
        if (Array.isArray(data.kategoriOptions)) setKategoriOptions(data.kategoriOptions);
        saveConfig({ blocks: data.blocks, tipeOptions: data.tipeOptions, statusFields: data.statusFields, kategoriOptions: data.kategoriOptions });
        setSettingsMsg("Data berhasil dipulihkan dari file cadangan.");
      } catch (err) { setSettingsMsg("Gagal membaca file cadangan — pastikan file JSON yang benar."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return { importExcel, buildReportHtml, printReportPDF, printSitePlan, printKavlingSummary, exportExcel, fetchAllClustersFull, handleRestoreAllFile, applyRestoreAll, markBackedUp, exportAllBackup, exportAllExcel, exportBackup, importBackup };
}
