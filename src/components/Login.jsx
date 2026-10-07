import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { C } from "../theme";
import { dayFormatter, dateFormatter, timeFormatter, useJakartaClock, greetingFor } from "../lib/jakartaClock";
import ThemeToggle from "./ThemeToggle";
import InstallPrompt from "./InstallPrompt";

// Supabase Auth aslinya butuh "email", tapi supaya Anda cukup ingat satu
// username sederhana, kita tempelkan domain palsu ini di belakang layar.
// Domain ini tidak pernah benar-benar dikirimi email (Auto Confirm User
// aktif di Supabase), jadi aman dipakai walau tidak nyata.
const USERNAME_DOMAIN = "cluster-bintaro-jaya.local";
function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

// Pesan kegagalan login dibedakan menurut penyebabnya, supaya "password salah" tidak
// dipakai untuk masalah koneksi atau terlalu banyak percobaan.
function loginErrorMessage(err) {
  const status = err && err.status;
  const code = (err && err.code) || "";
  const msg = (err && err.message) || "";
  if (code === "invalid_credentials" || status === 400) return "Username atau password salah. Coba lagi.";
  if (status === 429 || code.includes("rate_limit")) return "Terlalu banyak percobaan. Tunggu beberapa menit, lalu coba lagi.";
  if (status === 0 || (err && err.name === "AuthRetryableFetchError") || /fetch|network|failed to/i.test(msg)) return "Tidak bisa terhubung ke server. Periksa koneksi internet, lalu coba lagi.";
  return `Gagal masuk (${msg || "penyebab tidak diketahui"}). Coba lagi.`;
}

export default function Login() {
  const now = useJakartaClock();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      });
      if (error) setError(loginErrorMessage(error));
    } catch (err) {
      setError(loginErrorMessage(err));
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.paper,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: C.panel,
          boxShadow: C.cardShadow,
          borderRadius: 20,
          padding: 28,
        }}
      >
        <div className="flex items-start justify-between gap-3" style={{ marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 2 }}>
              {greetingFor(now)}
            </div>
            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: C.steel }}>
              {dayFormatter.format(now)}, {dateFormatter.format(now)} {timeFormatter.format(now)} WIB
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div style={{ borderTop: `1px solid ${C.line}`, marginBottom: 14 }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.ink, margin: "0 0 4px" }}>
          Chris Project<br />[Experimental Project]
        </h1>
        <p style={{ fontSize: 13, color: C.steel, margin: "0 0 20px" }}>
          Masukkan username dan password Anda untuk melanjutkan.
        </p>

        <label style={{ display: "block", fontSize: 12, color: C.steel, marginBottom: 4 }}>Username</label>
        <input
          type="text"
          required
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="username"
          placeholder="mis. admin"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            border: "none",
            borderRadius: 10,
            marginBottom: 14,
            color: C.ink,
            background: C.pillFill,
          }}
        />

        <label style={{ display: "block", fontSize: 12, color: C.steel, marginBottom: 4 }}>Password</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="current-password"
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "10px 64px 10px 12px",
              fontSize: 14,
              border: "none",
              borderRadius: 10,
              color: C.ink,
              background: C.pillFill,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={showPw}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: C.steel, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 6px", fontFamily: "inherit" }}
          >{showPw ? "Sembunyi" : "Lihat"}</button>
        </div>

        {error && (
          <div
            style={{
              fontSize: 12,
              color: C.red,
              background: C.alertRedBg,
              border: `1px solid ${C.red}`,
              borderRadius: 8,
              padding: "8px 10px",
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px 12px",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 999,
            border: "none",
            background: C.accent,
            color: "#fff",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Memeriksa..." : "Log In"}
        </button>

        <p style={{ fontSize: 11, color: C.steel, marginTop: 16, marginBottom: 0 }}>
          Created by Aditya Christiandi Sinulingga. Ver 2.0
        </p>
        <p style={{ fontSize: 11, color: C.faint, marginTop: 6, marginBottom: 0 }}>
          Belum punya akun? Hubungi Admin untuk dibuatkan akses.
        </p>
      </form>
      <InstallPrompt />
    </div>
  );
}
