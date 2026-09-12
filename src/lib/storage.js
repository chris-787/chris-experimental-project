import { supabase } from "./supabaseClient";

/**
 * Pengganti window.storage (API bawaan Claude.ai Artifacts) yang disimpan ke
 * Supabase. Bentuk pemanggilannya sengaja dibuat sama persis dengan
 * window.storage supaya logika asli aplikasi tidak perlu diubah:
 *   await storage.get(key, false)    -> { value: string } | null
 *   await storage.set(key, value, false)
 *   await storage.delete(key, false)
 * Parameter kedua/ketiga (dulu penanda "sync") tidak dipakai lagi karena
 * Supabase memang selalu tersinkron untuk semua yang login.
 */

async function get(key) {
  const { data, error } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { value: data.value };
}

async function set(key, value) {
  const { error } = await supabase
    .from("kv_store")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

async function del(key) {
  const { error } = await supabase.from("kv_store").delete().eq("key", key);
  if (error) throw error;
}

export const storage = { get, set, delete: del };
