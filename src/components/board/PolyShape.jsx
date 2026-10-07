import React from "react";

// Satu poligon kavling di peta. Dibungkus React.memo dengan props sederhana (teks/angka), jadi saat ada perubahan
// yang tidak menyangkut poligon ini (memilih baris, mengetik di tabel, dst) poligon tidak digambar ulang.
// Ini penting untuk cluster dengan ratusan kavling.
const PolyShape = React.memo(function PolyShape({ id, pts, fill, opacity, clickable, hidden, delay, tdelay, title, onPick }) {
  return (
    <polygon
      className="poly-in"
      points={pts}
      fill={fill}
      fillOpacity={opacity / 100}
      stroke="#00000066"
      strokeWidth="0.2"
      vectorEffect="non-scaling-stroke"
      style={{ pointerEvents: clickable ? "auto" : "none", cursor: "pointer", display: hidden ? "none" : undefined, animationDelay: delay, "--td": tdelay }}
      onClick={(e) => onPick(e, id)}
    >
      <title>{title}</title>
    </polygon>
  );
});

export default PolyShape;
