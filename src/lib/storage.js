import { supabase } from "./supabaseClient";
import { emitStorageError } from "./errorBus";

/**
 * Pengganti window.storage (API bawaan Claude.ai Artifacts) yang disimpan ke
 * Supabase. Bentuk pemanggilannya sengaja dibuat sama persis dengan
 * window.storage supaya logika asli aplikasi tidak perlu diubah:
 *   await storage.get(key, false)    -> { value: string, updatedAt: string } | null
 *   await storage.set(key, value, false)
 *   await storage.delete(key, false)
 * Parameter kedua/ketiga (dulu penanda "sync") tidak dipakai lagi karena
 * Supabase memang selalu tersinkron untuk semua yang login.
 *
 * set() menerima expectedUpdatedAt (string timestamp) sebagai pengganti
 * parameter "sync" lama di tempat-tempat yang butuh proteksi dari
 * timpa-menimpa data (lihat saveHouses di BriaStatusBoard.jsx): kalau data
 * di server sudah berubah sejak expectedUpdatedAt, penyimpanan dibatalkan
 * dan melempar error dengan code "CONFLICT" alih-alih menimpa begitu saja.
 * Pemanggilan lama yang mengirim `false`/tidak mengirim apa-apa tetap
 * berjalan seperti biasa (upsert langsung, tanpa cek konflik).
 *
 * Semua kegagalan set()/delete() (selain CONFLICT, yang memang disengaja)
 * diumumkan lewat errorBus supaya UI bisa menampilkan notifikasi ke
 * pengguna — pemanggil tetap menerima error yang sama seperti sebelumnya,
 * jadi try/catch yang sudah ada di banyak tempat tidak perlu diubah.
 */

async function get(key) {
  const { data, error } = await supabase
    .from("kv_store")
    .select("value, updated_at")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { value: data.value, updatedAt: data.updated_at };
}

async function set(key, value, expectedUpdatedAt) {
  try {
    const nowIso = new Date().toISOString();
    if (typeof expectedUpdatedAt === "string" && expectedUpdatedAt) {
      const { data, error } = await supabase
        .from("kv_store")
        .update({ value, updated_at: nowIso })
        .eq("key", key)
        .eq("updated_at", expectedUpdatedAt)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        const conflict = new Error("Data ini sudah diubah oleh pengguna lain sejak terakhir dimuat.");
        conflict.code = "CONFLICT";
        throw conflict;
      }
      return { updatedAt: nowIso };
    }
    const { error } = await supabase.from("kv_store").upsert({ key, value, updated_at: nowIso });
    if (error) throw error;
    return { updatedAt: nowIso };
  } catch (e) {
    if (e.code !== "CONFLICT") emitStorageError("Gagal menyimpan ke server. Periksa koneksi internet Anda.");
    throw e;
  }
}

async function del(key) {
  try {
    const { error } = await supabase.from("kv_store").delete().eq("key", key);
    if (error) throw error;
  } catch (e) {
    emitStorageError("Gagal menghapus data di server. Periksa koneksi internet Anda.");
    throw e;
  }
}

export const storage = { get, set, delete: del };
