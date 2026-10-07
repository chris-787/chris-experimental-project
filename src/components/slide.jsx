import { useLayoutEffect, useRef, useState } from "react";

// Penanda "geser": latar tombol terpilih berpindah halus ke tombol yang baru
// dipilih (seperti kontrol segmen di iOS). Pakai: pasang `ref` + class
// "slide-host" di pembungkus, beri atribut data-slide-active="true" pada tombol
// yang aktif, lalu render <SlideInd box={box} /> sebagai anak pertama.
export function useSlideIndicator(deps) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return undefined;
    const measure = () => {
      const a = host.querySelector('[data-slide-active="true"]');
      if (!a) { setBox(null); return; }
      // Posisi dihitung relatif ke pembungkus (bukan offsetLeft), karena tombol aktif bisa berada di dalam elemen lain
      // (mis. select di dalam span) yang punya acuan posisi sendiri.
      const hr = host.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const next = { left: Math.round(ar.left - hr.left + host.scrollLeft - host.clientLeft), top: Math.round(ar.top - hr.top + host.scrollTop - host.clientTop), width: Math.round(ar.width), height: Math.round(ar.height) };
      setBox((prev) => (prev && prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height ? prev : next));
    };
    measure();
    window.addEventListener("resize", measure);
    // Ukuran/posisi tombol bisa berubah tanpa window berubah (mis. sidebar melipat): ukur ulang saat pembungkus berubah
    // ukuran dan saat transisi anak-anaknya selesai.
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(host);
    host.addEventListener("transitionend", measure);
    return () => { window.removeEventListener("resize", measure); host.removeEventListener("transitionend", measure); if (ro) ro.disconnect(); };
  }, deps);
  return [ref, box];
}

export function SlideInd({ box, radius = 999, cls = "" }) {
  if (!box) return null;
  return <span aria-hidden="true" className={`slide-ind${cls ? ` ${cls}` : ""}`} style={{ left: box.left, top: box.top, width: box.width, height: box.height, borderRadius: radius }} />;
}
