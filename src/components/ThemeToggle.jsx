import { useState } from "react";
import { C } from "../theme";
import { tint } from "./ui";
import { getTheme, toggleTheme } from "../lib/themeMode";

// Statenya cuma untuk ikon tombol ini sendiri -- perubahan warna di
// seluruh halaman ditangani CSS (custom property di index.css), jadi
// tidak perlu re-render komponen lain saat tema diganti.
export default function ThemeToggle() {
  const [mode, setMode] = useState(() => getTheme());
  return (
    <button
      type="button"
      onClick={() => setMode(toggleTheme())}
      title={mode === "dark" ? "Pakai mode terang" : "Pakai mode gelap"}
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${tint(mode === "dark" ? C.amber : C.accent, 40)}`, background: tint(mode === "dark" ? C.amber : C.accent, 16), color: mode === "dark" ? C.amber : C.accent, cursor: "pointer" }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {mode === "dark" ? (
          <circle cx="12" cy="12" r="4" />
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
        )}
        {mode === "dark" && <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />}
      </svg>
    </button>
  );
}
