import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Kalau .env.local belum diisi, pakai URL bohongan supaya createClient tidak
// error duluan — App.jsx akan menampilkan layar panduan setup sebelum client
// ini sempat dipakai untuk memanggil apa pun.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      // Simpan sesi login di sessionStorage (bukan localStorage) supaya
      // otomatis logout begitu tab/browser ditutup, tapi tetap login kalau
      // cuma refresh halaman di tab yang sama.
      storage: window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
