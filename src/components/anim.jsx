import { useEffect, useRef, useState } from "react";

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Angka yang "menghitung naik" dari nilai sebelumnya (atau 0 saat pertama tampil).
export function CountUp({ value, format = (n) => String(Math.round(n)), duration = 1150 }) {
  const target = Number.isFinite(value) ? value : 0;
  const [shown, setShown] = useState(() => (reduceMotion() ? target : 0));
  const fromRef = useRef(reduceMotion() ? target : 0);
  useEffect(() => {
    if (reduceMotion()) { setShown(target); fromRef.current = target; return undefined; }
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = from + (target - from) * eased;
      fromRef.current = cur;
      setShown(cur);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{format(shown)}</>;
}
