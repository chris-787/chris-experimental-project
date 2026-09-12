import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { C } from "../theme";

// Supabase Auth aslinya butuh "email", tapi supaya Anda cukup ingat satu
// username sederhana, kita tempelkan domain palsu ini di belakang layar.
// Domain ini tidak pernah benar-benar dikirimi email (Auto Confirm User
// aktif di Supabase), jadi aman dipakai walau tidak nyata.
const USERNAME_DOMAIN = "cluster-bintaro-jaya.local";
function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    setLoading(false);
    if (error) setError("Username atau password salah. Coba lagi.");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: C.panel,
          border: `1px solid ${C.line}`,
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: 1,
            color: C.steel,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Masuk
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.ink, margin: "0 0 4px" }}>
          Cluster Bintaro Jaya [Experimental Project]
        </h1>
        <p style={{ fontSize: 13, color: C.steel, margin: "0 0 4px" }}>
          Masukkan username dan password Anda untuk melanjutkan.
        </p>
        <p style={{ fontSize: 11, color: C.faint, margin: "0 0 20px" }}>
          Created by Aditya Christiandi Sinulingga
        </p>

        <label style={{ display: "block", fontSize: 12, color: C.steel, marginBottom: 4 }}>Username</label>
        <input
          type="text"
          required
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="mis. admin"
          style={{
            width: "100%",
            padding: "9px 10px",
            fontSize: 14,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            marginBottom: 14,
            color: C.ink,
            background: "#fff",
          }}
        />

        <label style={{ display: "block", fontSize: 12, color: C.steel, marginBottom: 4 }}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{
            width: "100%",
            padding: "9px 10px",
            fontSize: 14,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            marginBottom: 16,
            color: C.ink,
            background: "#fff",
          }}
        />

        {error && (
          <div
            style={{
              fontSize: 12,
              color: C.red,
              background: "#FBEAE6",
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
            padding: "10px 12px",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 8,
            border: "none",
            background: C.accent,
            color: "#fff",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Memeriksa..." : "Masuk"}
        </button>

        <p style={{ fontSize: 11, color: C.faint, marginTop: 16, marginBottom: 0 }}>
          Belum punya akun? Buat lewat Supabase Dashboard → Authentication → Users
          (isi Email address dengan <code>username-anda@{USERNAME_DOMAIN}</code>).
        </p>
      </form>
    </div>
  );
}
