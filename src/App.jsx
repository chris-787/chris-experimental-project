import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import Login from "./components/Login.jsx";
import BriaStatusBoard from "./BriaStatusBoard.jsx";
import { C } from "./theme";

function SetupNeeded() {
  return (
    <div style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 460, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 28 }}>
        <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, color: C.amber, textTransform: "uppercase", marginBottom: 6 }}>
          Setup belum selesai
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: "0 0 10px" }}>Supabase belum dikonfigurasi</h1>
        <p style={{ fontSize: 13, color: C.steel, lineHeight: 1.6, margin: "0 0 10px" }}>
          File <code style={{ background: C.paper, padding: "1px 5px", borderRadius: 4 }}>.env.local</code> belum ada atau belum diisi.
        </p>
        <ol style={{ fontSize: 13, color: C.steel, lineHeight: 1.8, paddingLeft: 18, margin: "0 0 10px" }}>
          <li>Buka README.md di folder proyek ini.</li>
          <li>Ikuti langkah "Siapkan Supabase" untuk dapat URL &amp; anon key.</li>
          <li>Salin <code style={{ background: C.paper, padding: "1px 5px", borderRadius: 4 }}>.env.example</code> jadi <code style={{ background: C.paper, padding: "1px 5px", borderRadius: 4 }}>.env.local</code>, isi dua nilainya.</li>
          <li>Simpan, lalu jalankan ulang <code style={{ background: C.paper, padding: "1px 5px", borderRadius: 4 }}>npm run dev</code>.</li>
        </ol>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = belum dicek, null = belum login

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return <SetupNeeded />;
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, color: C.steel, fontFamily: "Inter, sans-serif" }}>Memuat...</span>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <BriaStatusBoard onLogout={() => supabase.auth.signOut()} />;
}
