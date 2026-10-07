import React, { useEffect, useRef, useState } from "react";

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

// Panel lipat dengan animasi buka/tutup halus (tinggi 0 -> penuh). Isi baru dipasang saat dibuka dan dilepas
// setelah animasi tutup selesai, jadi daftar panjang yang tertutup tidak membebani halaman.
export function Collapse({ open, children, duration = 300 }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  useEffect(() => {
    if (reduceMotion()) { setMounted(open); setShown(open); return undefined; }
    if (open) {
      setMounted(true);
      const t = setTimeout(() => setShown(true), 30);
      return () => clearTimeout(t);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), duration + 30);
    return () => clearTimeout(t);
  }, [open, duration]);
  if (!mounted) return null;
  return (
    <div style={{ display: "grid", gridTemplateRows: shown ? "1fr" : "0fr", opacity: shown ? 1 : 0, transition: reduceMotion() ? "none" : `grid-template-rows ${duration}ms cubic-bezier(.3,.8,.2,1), opacity ${duration}ms ease` }}>
      <div style={{ overflow: "hidden", minHeight: 0 }}>{children}</div>
    </div>
  );
}

// Panah kecil yang berputar halus saat panel dibuka (arah bawah = tertutup, atas = terbuka).
export function Chevron({ open, turn = 180, glyph = "▾" }) {
  return <span aria-hidden="true" style={{ display: "inline-block", transition: reduceMotion() ? "none" : "transform .3s cubic-bezier(.3,.8,.2,1)", transform: `rotate(${open ? turn : 0}deg)` }}>{glyph}</span>;
}

// Pop up kecil di dalam peta: muncul dengan animasi dan, saat ditutup, keluar dengan animasi sebelum dilepas.
// Isi terakhir disimpan supaya tetap tampil selama animasi keluar.
export function PopPresence({ show, children }) {
  const last = useRef(null);
  if (show && children) last.current = children;
  const [mounted, setMounted] = useState(!!show);
  useEffect(() => {
    if (show) { setMounted(true); return undefined; }
    if (reduceMotion()) { setMounted(false); return undefined; }
    const t = setTimeout(() => setMounted(false), 170);
    return () => clearTimeout(t);
  }, [show]);
  if (!last.current || (!show && !mounted)) return null;
  const el = last.current;
  return React.cloneElement(el, { className: `${el.props.className || ""} ${show ? "pop-in" : "pop-out"}`.trim() });
}
