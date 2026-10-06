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
      const next = { left: a.offsetLeft, top: a.offsetTop, width: a.offsetWidth, height: a.offsetHeight };
      setBox((prev) => (prev && prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height ? prev : next));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, deps);
  return [ref, box];
}

export function SlideInd({ box, radius = 999 }) {
  if (!box) return null;
  return <span aria-hidden="true" className="slide-ind" style={{ left: box.left, top: box.top, width: box.width, height: box.height, borderRadius: radius }} />;
}
