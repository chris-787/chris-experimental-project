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

let animTimer = null;
export function toggleTheme() {
  // Pasang kelas animasi sebentar supaya perpindahan warna terang/gelap mulus.
  const root = document.documentElement;
  root.classList.add("theme-anim");
  clearTimeout(animTimer);
  animTimer = setTimeout(() => root.classList.remove("theme-anim"), 450);
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
