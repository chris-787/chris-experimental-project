// Warna tetap per status (urutan status di Settings), supaya dashboard dan panel
// samping ramai warna tapi konsisten: status yang sama selalu berwarna sama.
export const STATUS_PALETTE = ["#3F7D58", "#3B6FD4", "#D9A441", "#8A5BC4", "#D85A30", "#2E8B8B", "#A84459"];
export const statusColor = (index) => STATUS_PALETTE[index % STATUS_PALETTE.length];
