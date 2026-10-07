import { layoutHouseLabels } from "./labelLayout";

// Ekspor Site Plan jadi gambar PNG: gambar dasar + poligon berwarna + (opsional) nomor kavling + legenda.
// Koordinat poligon disimpan dalam persen dari lebar/tinggi gambar (lihat catatan di MapPanel),
// jadi cukup dikalikan lebar/tinggi gambar asli.

const MAX_SIDE = 4000;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gambar site plan tidak bisa dimuat."));
    img.src = src;
  });
}

// "var(--green)" tidak dikenal canvas: ubah ke warna sebenarnya.
function concrete(color) {
  if (typeof color === "string" && color.startsWith("var(")) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(color.slice(4, -1).trim()).trim();
    return v || "#999999";
  }
  return color;
}

export async function renderSitePlanCanvas({ siteImage, houses, polyColor, opacity, isHidden, showNumbers, labelOf, legend, title, subtitle }) {
  const img = await loadImage(siteImage);
  const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.round(img.naturalWidth * k);
  const H = Math.round(img.naturalHeight * k);
  const pad = Math.max(16, Math.round(W / 70));
  const fs = Math.max(13, Math.round(W / 85));

  // Hitung tinggi legenda (item dibungkus ke baris berikutnya bila tidak muat)
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = `${fs}px sans-serif`;
  const items = legend.map((l) => ({ ...l, color: concrete(l.color), w: probe.measureText(l.label).width + fs * 2.4 }));
  const rows = [];
  let row = [], used = 0;
  items.forEach((it) => {
    if (row.length && used + it.w > W - pad * 2) { rows.push(row); row = []; used = 0; }
    row.push(it); used += it.w;
  });
  if (row.length) rows.push(row);
  const headH = pad + fs * 1.5 + fs * 1.2 + pad * 0.6;
  const legendH = rows.length * fs * 1.9 + pad * 1.4;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = Math.round(headH + H + legendH);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Judul
  ctx.fillStyle = "#141A24";
  ctx.font = `bold ${Math.round(fs * 1.4)}px sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(title, pad, pad);
  ctx.fillStyle = "#5A6579";
  ctx.font = `${fs}px sans-serif`;
  ctx.fillText(subtitle, pad, pad + fs * 1.7);

  // Gambar dasar + poligon
  ctx.drawImage(img, 0, headH, W, H);
  const lw = Math.max(1, W / 2500);
  houses.forEach((h) => {
    if (isHidden(h) || !h.points || h.points.length < 3) return;
    ctx.beginPath();
    h.points.forEach((p, i) => {
      // Koordinat poligon memakai ruang persegi (sisi = lebar gambar), jadi sumbu y juga dikalikan lebar, bukan tinggi.
      const x = (p.x / 100) * W, y = headH + (p.y / 100) * W;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.globalAlpha = Math.max(0.1, Math.min(1, opacity / 100));
    ctx.fillStyle = concrete(polyColor(h));
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = lw;
    ctx.stroke();
  });

  // Kode kavling: satu ukuran huruf untuk semua, diatur supaya tidak saling menimpa (sama dengan tampilan di layar)
  if (showNumbers) {
    const { font, labels } = layoutHouseLabels(houses, { labelOf: labelOf || ((h) => String(h.noKavling)), isHidden, size: W, min: Math.max(8, W / 300), max: Math.max(12, W / 150), step: 0.5 });
    if (labels.length) {
      ctx.font = `bold ${font}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      labels.forEach((it) => {
        ctx.save();
        ctx.translate((it.cx / 100) * W, headH + (it.cy / 100) * W);
        if (it.vertical) ctx.rotate(Math.PI / 2);
        ctx.lineWidth = Math.max(2, font / 3);
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.strokeText(it.text, 0, 0);
        ctx.fillStyle = "#141A24";
        ctx.fillText(it.text, 0, 0);
        ctx.restore();
      });
      ctx.textAlign = "start";
    }
  }

  // Legenda
  ctx.textBaseline = "middle";
  ctx.font = `${fs}px sans-serif`;
  let y = headH + H + pad * 0.7 + fs * 0.95;
  rows.forEach((r) => {
    let x = pad;
    r.forEach((it) => {
      ctx.fillStyle = it.color;
      ctx.fillRect(x, y - fs * 0.45, fs * 0.9, fs * 0.9);
      ctx.fillStyle = "#141A24";
      ctx.fillText(it.label, x + fs * 1.3, y);
      x += it.w;
    });
    y += fs * 1.9;
  });
  return canvas;
}

export async function downloadSitePlanPng(opts, filename) {
  const canvas = await renderSitePlanCanvas(opts);
  const blob = await new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal membuat gambar."))), "image/png"));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
