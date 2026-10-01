import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Cluster Bintaro Jaya",
        short_name: "Bintaro Jaya",
        description: "Pelacak status tender & penjualan kavling Cluster Bintaro Jaya",
        theme_color: "#162C48",
        background_color: "#FAFAF8",
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
