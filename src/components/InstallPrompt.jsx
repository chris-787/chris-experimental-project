import { useEffect, useState } from "react";
import { C } from "../theme";

// Tombol/pesan "install sebagai app" — hanya muncul sekali seumur hidup
// browser pengguna (ditandai di localStorage), dan cuma di halaman Login.
const DISMISS_KEY = "bria-install-dismissed";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState(null); // "android" | "ios"

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch (e) {}
    if (isStandalone()) return;

    if (isIOS()) {
      setPlatform("ios");
      setVisible(true);
      return;
    }

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setVisible(true);
    }
    function handleInstalled() {
      dismiss();
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch (e) {}
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  }

  if (!visible) return null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 360,
        background: C.panel,
        boxShadow: C.cardShadow,
        borderRadius: 16,
        padding: 14,
        marginTop: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ width: 36, height: 36, borderRadius: 10, background: C.chipBlueBg, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent2, flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>Install sebagai App</div>
        <div style={{ fontSize: 12, color: C.steel, lineHeight: 1.4 }}>
          {platform === "ios"
            ? <>Ketuk ikon Share lalu pilih <b>"Add to Home Screen"</b>.</>
            : "Buka lebih cepat, tanpa address bar — seperti app biasa."}
        </div>
      </div>
      {platform === "android" && (
        <button
          onClick={handleInstallClick}
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ border: "none", background: C.accent, color: "#fff", flexShrink: 0 }}
        >
          Install
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Tutup"
        style={{ border: "none", background: "transparent", color: C.steel, fontSize: 16, lineHeight: 1, cursor: "pointer", flexShrink: 0, padding: 4 }}
      >
        ×
      </button>
    </div>
  );
}
