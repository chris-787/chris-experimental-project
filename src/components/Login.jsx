import { useEffect, useState } from "react";
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

// Jam & ucapan selamat selalu memakai zona waktu WIB (Asia/Jakarta),
// tidak peduli zona waktu perangkat pengunjung.
const JAKARTA_TZ = "Asia/Jakarta";
const dayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: JAKARTA_TZ });
const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: JAKARTA_TZ });
// Locale "en-GB" dipakai khusus untuk jam supaya pemisahnya titik dua (:),
// bukan titik (.) seperti default format Indonesia.
const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: JAKARTA_TZ });
const hourFormatter = new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: JAKARTA_TZ });

function greetingFor(date) {
  const hour = parseInt(hourFormatter.format(date), 10);
  if (hour >= 5 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 19) return "Selamat Sore";
  return "Selamat Malam";
}

function useJakartaClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function Login() {
  const now = useJakartaClock();
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
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 2 }}>
            {greetingFor(now)}
          </div>
          <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: C.steel }}>
            {dayFormatter.format(now)}, {dateFormatter.format(now)} {timeFormatter.format(now)} WIB
          </div>
        </div>

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
