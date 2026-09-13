// Papan pengumuman kecil untuk error penyimpanan. storage.js "mengumumkan"
// ke sini setiap kali gagal simpan/hapus ke Supabase, lalu BriaStatusBoard.jsx
// "mendengarkan" untuk menampilkan notifikasi ke pengguna — supaya kegagalan
// diam-diam (misal internet putus) tidak bikin orang kira sudah tersimpan.
const listeners = new Set();

export function onStorageError(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitStorageError(message) {
  listeners.forEach((fn) => {
    try { fn(message); } catch (e) {}
  });
}
