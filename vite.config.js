import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Pisahkan library pihak ketiga (jarang berubah) dari kode aplikasi
        // sendiri (sering berubah tiap deploy) -- supaya browser pengguna
        // yang sudah pernah buka situsnya tidak perlu unduh ulang React dkk
        // tiap kali ada update kecil, cuma potongan kode aplikasi yang baru.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
            if (id.includes("@supabase")) return "vendor-supabase";
          }
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Chris Project",
        short_name: "Chris Project",
        description: "Pelacak status tender & penjualan kavling Cluster Bintaro Jaya",
        theme_color: "#C94A1C",
        background_color: "#F3F1EC",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Data cluster datang dari Supabase (butuh internet); yang di-cache
        // di sini cuma "cangkang" aplikasi (HTML/JS/CSS/ikon) supaya
        // bukaan berikutnya instan dan tetap bisa tampil walau offline.
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
});
