import { useEffect, useState } from "react";

// Jam & tanggal yang dipakai bersama oleh Login.jsx dan BriaStatusBoard.jsx,
// selalu memakai zona waktu WIB (Asia/Jakarta) tidak peduli zona waktu
// perangkat pengunjung.
export const JAKARTA_TZ = "Asia/Jakarta";
export const dayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: JAKARTA_TZ });
export const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: JAKARTA_TZ });
// Locale "en-GB" dipakai khusus untuk jam supaya pemisahnya titik dua (:),
// bukan titik (.) seperti default format Indonesia.
export const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: JAKARTA_TZ });

export function formatJakartaDateTime(date) {
  return `${dayFormatter.format(date)}, ${dateFormatter.format(date)} ${timeFormatter.format(date)} WIB`;
}

export function useJakartaClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
