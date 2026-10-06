const STORAGE_KEY = "bria-theme";

export function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (e) {}
}

// Ganti tema memakai View Transitions API (crossfade satu gambar penuh, ringan di
// browser). Browser yang belum mendukung tetap berpindah tema, hanya tanpa animasi.
export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reduce) document.startViewTransition(() => setTheme(next));
  else setTheme(next);
  return next;
}
