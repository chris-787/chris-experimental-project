import { useEffect, useRef, useState } from "react";

// Keterangan kecil yang mengikuti kursor untuk elemen mana pun yang punya atribut data-tip="Judul|detail".
// Satu komponen dipasang sekali untuk seluruh aplikasi; posisi digeser lewat DOM langsung supaya tidak render ulang.
export default function ChartTooltip() {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  useEffect(() => {
    const place = (e) => {
      const el = ref.current;
      if (!el) return;
      const w = el.offsetWidth, h = el.offsetHeight;
      let x = e.clientX + 14, y = e.clientY + 16;
      if (x + w > window.innerWidth - 8) x = e.clientX - w - 14;
      if (y + h > window.innerHeight - 8) y = e.clientY - h - 12;
      el.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`;
    };
    const over = (e) => {
      const t = e.target.closest ? e.target.closest("[data-tip]") : null;
      setTip(t ? t.getAttribute("data-tip") : null);
      if (t) requestAnimationFrame(() => place(e));
    };
    const move = (e) => { if (ref.current && ref.current.dataset.on === "1") place(e); };
    const out = (e) => { if (!e.relatedTarget) setTip(null); };
    document.addEventListener("mouseover", over);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseout", out);
    return () => { document.removeEventListener("mouseover", over); document.removeEventListener("mousemove", move); document.removeEventListener("mouseout", out); };
  }, []);
  const [title, detail] = tip ? tip.split("|") : ["", ""];
  return (
    <div ref={ref} data-on={tip ? "1" : "0"} role="tooltip" aria-hidden={!tip} style={{ position: "fixed", left: 0, top: 0, zIndex: 400, pointerEvents: "none", opacity: tip ? 1 : 0, transition: "opacity .12s ease", background: "var(--select)", color: "var(--select-ink)", borderRadius: 8, padding: "6px 10px", fontSize: 12, lineHeight: 1.35, boxShadow: "0 6px 18px rgba(0,0,0,.28)", maxWidth: 240, whiteSpace: "nowrap" }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {detail && <div style={{ opacity: 0.85 }}>{detail}</div>}
    </div>
  );
}
