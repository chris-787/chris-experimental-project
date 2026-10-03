import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { storage } from "./lib/storage";
import { supabase } from "./lib/supabaseClient";
import { onStorageError } from "./lib/errorBus";

import { BoardContext } from "./components/board/BoardContext";
import WhatsNewModal from "./components/board/WhatsNewModal";
import SimulasiModal from "./components/board/SimulasiModal";
import RekapKontraktorModal from "./components/board/RekapKontraktorModal";

import DataTable from "./components/board/DataTable";
import MainLayout from "./components/board/MainLayout";
import SettingsPanel from "./components/board/SettingsPanel";
import ClusterHeader from "./components/board/ClusterHeader";
import HomeScreen from "./components/board/HomeScreen";
import { C, PALETTE } from "./theme";
import { SITE_IMAGE_DEFAULT, MAX_IMG_DIM, MONTHS, DEFAULT_BLOCKS, DEFAULT_TIPE, DEFAULT_STATUS, DEFAULT_KATEGORI, CONFIG_KEY_BASE, TABLE_LAYOUT_KEY, tableFilterKeyFor, CLUSTERS_INDEX_KEY, APP_TITLE_KEY, LAST_CLUSTER_KEY, LAST_BACKUP_KEY, LEGACY_CLUSTER_ID, housesKeyFor, configKeyFor, imageKeyFor } from "./lib/constants";
import { makeCalc } from "./lib/calc";
import { rupiah, measureTextWidth, centroid, resizeImageFile } from "./lib/helpers";

// Akun khusus "lihat saja" (investor/atasan) -- tidak pakai sistem role
// di database, cukup dicek dari emailnya karena cuma satu akun ini yang
// perlu dibatasi. Tambah ke daftar ini kalau nanti ada akun viewer lain.
const VIEWER_EMAILS = ["viewer@cluster-bintaro-jaya.local"];

export default function BriaStatusBoard({ onLogout, session }) {
  const displayName = (() => {
    const email = session?.user?.email || "";
    const local = email.split("@")[0] || "";
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : "";
  })();
  const canEdit = !VIEWER_EMAILS.includes(session?.user?.email || "");
  const [showWhatsNew, setShowWhatsNew] = useState(true);
  const [showSimulasi, setShowSimulasi] = useState(false);
  const [simScope, setSimScope] = useState("all");
  const [simHargaMode, setSimHargaMode] = useState("persen");
  const [simHargaValue, setSimHargaValue] = useState("");
  const [simHppMode, setSimHppMode] = useState("persen");
  const [simHppValue, setSimHppValue] = useState("");
  const [followUpView, setFollowUpView] = useState("list");
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(null);
  const [showRekapKontraktor, setShowRekapKontraktor] = useState(false);
  const [houses, setHouses] = useState([]);
  const [siteImage, setSiteImage] = useState(SITE_IMAGE_DEFAULT);
  const [imgUploading, setImgUploading] = useState(false);
  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [tipeOptions, setTipeOptions] = useState(DEFAULT_TIPE);
  const [statusFields, setStatusFields] = useState(DEFAULT_STATUS);
  const [kategoriOptions, setKategoriOptions] = useState(DEFAULT_KATEGORI);
  const [appTitle, setAppTitle] = useState("Cluster Bintaro Jaya [Experimental Project]");
  const [clusters, setClusters] = useState([]);
  const [currentClusterId, setCurrentClusterId] = useState(null);
  const [homeLoaded, setHomeLoaded] = useState(false);
  const [clusterLoaded, setClusterLoaded] = useState(false);
  const [newClusterName, setNewClusterName] = useState("");
  const [newClusterSubtitle, setNewClusterSubtitle] = useState("");
  const [confirmDeleteClusterId, setConfirmDeleteClusterId] = useState(null);
  const [clusterSearch, setClusterSearch] = useState("");
  const [showArchivedClusters, setShowArchivedClusters] = useState(false);
  const [clusterStats, setClusterStats] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [housesUpdatedAt, setHousesUpdatedAt] = useState(null);
  const [saveConflict, setSaveConflict] = useState(false);
  const [remoteUpdateAvailable, setRemoteUpdateAvailable] = useState(false);
  const dirtyRef = useRef(dirty);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  const [storageError, setStorageError] = useState(null);
  const storageErrorTimerRef = useRef(null);
  useEffect(() => {
    const unsubscribe = onStorageError((message) => {
      setStorageError(message);
      clearTimeout(storageErrorTimerRef.current);
      storageErrorTimerRef.current = setTimeout(() => setStorageError(null), 6000);
    });
    return unsubscribe;
  }, []);
  // Deteksi proaktif kalau koneksi internet Anda sendiri putus, supaya tahu
  // dari awal — tidak perlu menunggu sampai ada aksi yang gagal disimpan dulu.
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  useEffect(() => {
    function handleOnline() { setIsOffline(false); }
    function handleOffline() { setIsOffline(true); }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  // Peringatkan sebelum tab/browser ditutup atau di-reload kalau masih ada
  // perubahan kavling yang belum tersimpan (pelengkap dari perbaikan goHome).
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  const [homeDirty, setHomeDirty] = useState(false);
  const [homeSavedToast, setHomeSavedToast] = useState(false);
  const [homeSaving, setHomeSaving] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [lastDeletedBulk, setLastDeletedBulk] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkDeleteArmed, setBulkDeleteArmed] = useState(false);
  const undoTimerRef = useRef(null);
  const bulkUndoTimerRef = useRef(null);
  const [confirmDeleteBlokId, setConfirmDeleteBlokId] = useState(null);
  const [confirmDeleteTipeName, setConfirmDeleteTipeName] = useState(null);
  const [confirmDeleteStatusKey, setConfirmDeleteStatusKey] = useState(null);
  const [confirmDeleteKategoriName, setConfirmDeleteKategoriName] = useState(null);

  const [mode, setMode] = useState("kerja"); // kerja (Main Mode) | data | pengaturan (Settings)
  const [editMap, setEditMap] = useState(false);
  const [dashboardPos, setDashboardPos] = useState("kanan"); // "kanan" | "bawah"
  const [showCharts, setShowCharts] = useState(() => { try { return localStorage.getItem("bria-show-charts") !== "0"; } catch (e) { return true; } });
  useEffect(() => { try { localStorage.setItem("bria-show-charts", showCharts ? "1" : "0"); } catch (e) {} }, [showCharts]);
  const calibrating = mode === "kerja" && editMap && canEdit;
  const [activeBlock, setActiveBlock] = useState(DEFAULT_BLOCKS[0].name);
  const [activeTipe, setActiveTipe] = useState(DEFAULT_TIPE[0].name);
  const [colorMode, setColorMode] = useState("terjual");
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [subtitleWidth, setSubtitleWidth] = useState(20);
  useEffect(() => {
    const subtitle = (clusters.find((c) => c.id === currentClusterId) || {}).subtitle || "";
    const width = measureTextWidth(subtitle, "14px Inter, sans-serif");
    setSubtitleWidth(Math.max(Math.ceil(width) + 4, 20));
  }, [clusters, currentClusterId]);
  const [editingShapeId, setEditingShapeId] = useState(null);
  const [editPoints, setEditPoints] = useState(null);
  const draggingVertexRef = useRef(null);
  const [detailEditingKey, setDetailEditingKey] = useState(null);
  const [priceEditingKey, setPriceEditingKey] = useState(null);
  const [monthEditingKey, setMonthEditingKey] = useState(null);
  const [textEditingKey, setTextEditingKey] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [zoom, setZoom] = useState(100);
  const [opacity, setOpacity] = useState(55);
  const imgWrapRef = useRef(null);
  const planBoxRef = useRef(null);
  const pinchStateRef = useRef(null);
  function handleWheelZoom(e) {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom((z) => Math.min(400, Math.max(50, z - e.deltaY * 0.6)));
    }
  }
  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStateRef.current = { startDist: Math.sqrt(dx * dx + dy * dy), startZoom: zoom };
    }
  }
  function handleTouchMove(e) {
    if (e.touches.length === 2 && pinchStateRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / pinchStateRef.current.startDist;
      setZoom(Math.min(400, Math.max(50, pinchStateRef.current.startZoom * ratio)));
    }
  }
  function handleTouchEnd(e) {
    if (e.touches.length < 2) pinchStateRef.current = null;
  }
  const rowRefs = useRef({});

  const [drawingPoints, setDrawingPoints] = useState([]);
  const [draft, setDraft] = useState(null);

  const [tableBlocks, setTableBlocks] = useState(DEFAULT_BLOCKS.map((b) => b.name));
  const [tableTipes, setTableTipes] = useState(DEFAULT_TIPE.map((t) => t.name));
  const [tableStatusFilter, setTableStatusFilter] = useState("semua");
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [tableZoom, setTableZoom] = useState(100);
  const [followUpFilterActive, setFollowUpFilterActive] = useState(false);
  const [duplicateFilterActive, setDuplicateFilterActive] = useState(false);
  const [pageSize, setPageSize] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenCols, setHiddenCols] = useState([]);
  const [colWidths, setColWidths] = useState({});
  const [showColMenu, setShowColMenu] = useState(false);

  const DEFAULT_COL_WIDTH = { no: 44, select: 34, kavling: 90, tipe: 120, kategori: 140, kontraktor: 150, noSpk: 150, thSpk: 75, blnSpk: 75, luasBangunan: 90, hpp: 215, adendum: 110, hargaJual: 215, margin: 195, catatan: 160, aksi: 170 };
  // Kolom harga & margin isinya angka panjang; lebar minimum ini menjaga
  // isinya tetap satu baris supaya tinggi baris tabel tetap pendek.
  const MIN_COL_WIDTH = { hpp: 215, hargaJual: 215, margin: 195 };
  function colWidth(key) {
    const w = colWidths[key] || DEFAULT_COL_WIDTH[key] || (key === "acOrder" ? 170 : 90);
    if (key === "select") return w;
    return Math.max(MIN_COL_WIDTH[key] || 60, w);
  }
  function resetColWidths() {
    setColWidths({});
    saveTableLayout({ colWidths: {} });
    setTableBlocks(blocks.map((b) => b.name));
    setTableTipes(tipeOptions.map((t) => t.name));
    setTableStatusFilter("semua");
    setTableSearchQuery("");
    setSortKey(null);
    setSortDir("asc");
    setTableZoom(100);
  }
  async function saveTableLayout(next) {
    try {
      await storage.set(TABLE_LAYOUT_KEY, JSON.stringify({
        colWidths: next.colWidths ?? colWidths, hiddenCols: next.hiddenCols ?? hiddenCols,
      }), false);
    } catch (e) {}
  }
  function toggleColHidden(key) {
    setHiddenCols((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      saveTableLayout({ hiddenCols: next });
      return next;
    });
  }
  function startColResize(key, e) {
    const startX = e.clientX;
    const startWidth = colWidth(key);
    let finalWidth = startWidth;
    function onMove(ev) {
      const w = Math.max(50, startWidth + (ev.clientX - startX));
      finalWidth = w;
      setColWidths((prev) => ({ ...prev, [key]: w }));
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      saveTableLayout({ colWidths: { ...colWidths, [key]: finalWidth } });
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    e.preventDefault();
    e.stopPropagation();
  }
  // Ukuran panel site plan (lebar % dan tinggi px; tinggi null = otomatis),
  // diingat per perangkat lewat localStorage.
  const [mapPct, setMapPct] = useState(() => { try { return Number(JSON.parse(localStorage.getItem("bria-map-size")).w) || 62; } catch (e) { return 62; } });
  const [mapHeight, setMapHeight] = useState(() => { try { return Number(JSON.parse(localStorage.getItem("bria-map-size")).h) || null; } catch (e) { return null; } });
  useEffect(() => {
    try { localStorage.setItem("bria-map-size", JSON.stringify({ w: Math.round(mapPct), h: mapHeight })); } catch (e) {}
  }, [mapPct, mapHeight]);
  const rowRef = useRef(null);
  const draggingRef = useRef(false);

  const onDrag = useCallback((e) => {
    if (!draggingRef.current || !rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    let pct = ((e.clientX - rect.left) / rect.width) * 100;
    pct = Math.min(78, Math.max(30, pct));
    setMapPct(pct);
  }, []);
  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  }, [onDrag]);
  const startDrag = useCallback((e) => {
    draggingRef.current = true;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
    e.preventDefault();
  }, [onDrag, stopDrag]);

  // form state for settings tab
  const [newBlock, setNewBlock] = useState({ name: "", target: "" });
  const [newTipe, setNewTipe] = useState("");
  const [newTipeLuas, setNewTipeLuas] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newStatusHasDetail, setNewStatusHasDetail] = useState(false);
  const [newKategori, setNewKategori] = useState("");

  useEffect(() => {
    (async () => {
      // Empat key ini saling lepas (tidak ada yang butuh hasil yang lain),
      // jadi di-fetch paralel -- sebelumnya berurutan, total menunggu
      // ~2.4 detik tiap kali login/buka app padahal cuma perlu ~0.7 detik
      // (durasi yang paling lambat) kalau digabung jadi satu permintaan.
      const [layoutRes, atRes, idxRes, lbRes] = await Promise.all([
        storage.get(TABLE_LAYOUT_KEY, false).catch(() => null),
        storage.get(APP_TITLE_KEY, false).catch(() => null),
        storage.get(CLUSTERS_INDEX_KEY, false).catch(() => null),
        storage.get(LAST_BACKUP_KEY, false).catch(() => null),
      ]);
      try {
        if (layoutRes && layoutRes.value) {
          const parsedLayout = JSON.parse(layoutRes.value);
          if (parsedLayout.colWidths) setColWidths(parsedLayout.colWidths);
          if (parsedLayout.hiddenCols) setHiddenCols(parsedLayout.hiddenCols);
        }
      } catch (e) {}
      try {
        if (atRes && atRes.value) setAppTitle(atRes.value);
      } catch (e) {}
      const idxRaw = idxRes && idxRes.value;

      let finalClusters = [];
      if (idxRaw) {
        try { finalClusters = JSON.parse(idxRaw); } catch (e) { finalClusters = []; }
        setClusters(finalClusters);
      } else {
        // First time on the multi-cluster system: migrate any existing single-cluster data into "Cluster Bria".
        let name = "Cluster Bria", subtitle = "Discovery Riviera, Bintaro Jaya";
        try {
          const cfg = await storage.get(CONFIG_KEY_BASE, false);
          if (cfg && cfg.value) {
            const parsed = JSON.parse(cfg.value);
            if (parsed.boardTitle) name = parsed.boardTitle;
            if (parsed.boardSubtitle) subtitle = parsed.boardSubtitle;
          }
        } catch (e) {}
        finalClusters = [{ id: LEGACY_CLUSTER_ID, name, subtitle }];
        setClusters(finalClusters);
        try { await storage.set(CLUSTERS_INDEX_KEY, JSON.stringify(finalClusters), false); } catch (e) {}
      }
      // Sengaja tidak lagi otomatis membuka cluster terakhir di sini —
      // setiap kali login/buka aplikasi baru, selalu mulai dari Home dulu.
      try {
        if (lbRes && lbRes.value) setLastBackupAt(Number(lbRes.value));
      } catch (e) {}
      setHomeLoaded(true);
    })();
  }, []);

  async function loadCluster(id) {
    setClusterLoaded(false);
    setHouses([]);
    setBlocks(id === LEGACY_CLUSTER_ID ? DEFAULT_BLOCKS : []);
    setTipeOptions(id === LEGACY_CLUSTER_ID ? DEFAULT_TIPE : []);
    setStatusFields(DEFAULT_STATUS);
    setKategoriOptions(id === LEGACY_CLUSTER_ID ? DEFAULT_KATEGORI : []);
    setSiteImage(id === LEGACY_CLUSTER_ID ? SITE_IMAGE_DEFAULT : null);
    setTableBlocks(id === LEGACY_CLUSTER_ID ? DEFAULT_BLOCKS.map((b) => b.name) : []);
    setTableTipes(id === LEGACY_CLUSTER_ID ? DEFAULT_TIPE.map((t) => t.name) : []);
    setTableStatusFilter("semua");
    setSelectedId(null); setConfirmDeleteId(null); setActionMenuId(null);
    setEditingShapeId(null); setEditPoints(null); setSelectedRows([]);
    setDraft(null); setDrawingPoints([]); setMode("kerja"); setEditMap(false); setFollowUpFilterActive(false);
    setHousesUpdatedAt(null); setSaveConflict(false); setRemoteUpdateAvailable(false);
    // Tiga fetch independen (houses, gambar, config) dijalankan paralel --
    // sebelumnya berurutan (tiap fetch nunggu yang sebelumnya selesai dulu),
    // bikin buka cluster kerasa lambat padahal ketiganya tidak saling butuh.
    const [h, img, cfg] = await Promise.all([
      storage.get(housesKeyFor(id), false).catch(() => null),
      storage.get(imageKeyFor(id), false).catch(() => null),
      storage.get(configKeyFor(id), false).catch(() => null),
    ]);
    try {
      if (h && h.value) setHouses(JSON.parse(h.value));
      setHousesUpdatedAt(h ? h.updatedAt : null);
    } catch (e) {}
    try {
      if (img && img.value) setSiteImage(img.value);
    } catch (e) {}
    try {
      if (cfg && cfg.value) {
        const parsed = JSON.parse(cfg.value);
        let migratedBlocks = parsed.blocks;
        let blocksMigrated = false;
        if (migratedBlocks && migratedBlocks.some((b) => !b.id)) {
          migratedBlocks = migratedBlocks.map((b) => (b.id ? b : { ...b, id: newBlockId() }));
          blocksMigrated = true;
        }
        if (migratedBlocks) setBlocks(migratedBlocks);
        let migratedTipe = parsed.tipeOptions;
        let tipeMigrated = false;
        if (migratedTipe && migratedTipe.some((t) => !t.id)) {
          migratedTipe = migratedTipe.map((t) => (t.id ? t : { ...t, id: `tp-${Date.now().toString(36)}${Math.random().toString(36).slice(-4)}` }));
          tipeMigrated = true;
        }
        if (migratedTipe) setTipeOptions(migratedTipe);
        if (parsed.statusFields) setStatusFields(parsed.statusFields);
        if (parsed.kategoriOptions) setKategoriOptions(parsed.kategoriOptions);
        if (migratedBlocks) setTableBlocks(migratedBlocks.map((b) => b.name));
        if (migratedTipe) setTableTipes(migratedTipe.map((t) => t.name));
        if (blocksMigrated || tipeMigrated) {
          try {
            await storage.set(configKeyFor(id), JSON.stringify({ ...parsed, blocks: migratedBlocks, tipeOptions: migratedTipe }), false);
          } catch (e) {}
        }
        try {
          const savedFilter = await storage.get(tableFilterKeyFor(id), false);
          if (savedFilter && savedFilter.value) {
            const pf = JSON.parse(savedFilter.value);
            const validBlockNames = (migratedBlocks || []).map((b) => b.name);
            const validTipeNames = (migratedTipe || []).map((t) => t.name);
            if (Array.isArray(pf.tableBlocks)) setTableBlocks(pf.tableBlocks.filter((n) => validBlockNames.includes(n)));
            if (Array.isArray(pf.tableTipes)) setTableTipes(pf.tableTipes.filter((n) => validTipeNames.includes(n)));
            if (typeof pf.tableStatusFilter === "string") setTableStatusFilter(pf.tableStatusFilter);
          }
        } catch (e) {}
      }
    } catch (e) {}
    setClusterLoaded(true);
  }
  useEffect(() => { if (currentClusterId) loadCluster(currentClusterId); }, [currentClusterId]);

  useEffect(() => {
    if (!currentClusterId || !clusterLoaded) return;
    storage.set(tableFilterKeyFor(currentClusterId), JSON.stringify({ tableBlocks, tableTipes, tableStatusFilter }), false).catch(() => {});
  }, [tableBlocks, tableTipes, tableStatusFilter, currentClusterId, clusterLoaded]);

  // Dengarkan perubahan kavling, pengaturan, dan gambar site plan cluster
  // ini lewat SATU koneksi real-time (bukan 3 koneksi terpisah seperti
  // sebelumnya) -- cuma penataan ulang struktur, perilakunya identik:
  // - Kavling: langsung dipakai kalau tidak ada perubahan lokal belum
  //   tersimpan, atau cuma dikasih tahu (tanpa menimpa layar) kalau ada.
  // - Pengaturan & gambar: selalu tersimpan langsung tiap ada aksi (tidak
  //   ada draft yang bisa ketimpa), jadi pembaruan langsung dipakai.
  useEffect(() => {
    if (!currentClusterId) return;
    const housesKey = housesKeyFor(currentClusterId);
    const configKey = configKeyFor(currentClusterId);
    const imgKey = imageKeyFor(currentClusterId);
    const channel = supabase
      .channel(`kv_store:cluster:${currentClusterId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "kv_store", filter: `key=eq.${housesKey}` },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          if (dirtyRef.current) {
            setRemoteUpdateAvailable(true);
          } else {
            try {
              setHouses(JSON.parse(row.value));
              setHousesUpdatedAt(row.updated_at);
              setSaveConflict(false);
              setRemoteUpdateAvailable(false);
            } catch (e) {}
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "kv_store", filter: `key=eq.${configKey}` },
        (payload) => {
          const row = payload.new;
          if (!row || !row.value) return;
          try {
            const parsed = JSON.parse(row.value);
            if (parsed.blocks) setBlocks(parsed.blocks);
            if (parsed.tipeOptions) setTipeOptions(parsed.tipeOptions);
            if (parsed.statusFields) setStatusFields(parsed.statusFields);
            if (parsed.kategoriOptions) setKategoriOptions(parsed.kategoriOptions);
          } catch (e) {}
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kv_store", filter: `key=eq.${imgKey}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setSiteImage(currentClusterId === LEGACY_CLUSTER_ID ? SITE_IMAGE_DEFAULT : null);
            return;
          }
          const row = payload.new;
          if (row && row.value) setSiteImage(row.value);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentClusterId]);

  function reloadAfterRemoteUpdate() {
    setRemoteUpdateAvailable(false);
    setSaveConflict(false);
    loadCluster(currentClusterId);
  }

  // Dengarkan perubahan daftar cluster (tambah/hapus/rename/arsip) di Home,
  // aktif terus selama aplikasi terbuka (bukan cuma waktu di layar Home) —
  // karena judul & subjudul cluster yang sedang dibuka juga diambil dari sini.
  useEffect(() => {
    const channel = supabase
      .channel(`kv_store:${CLUSTERS_INDEX_KEY}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "kv_store", filter: `key=eq.${CLUSTERS_INDEX_KEY}` },
        (payload) => {
          const row = payload.new;
          if (!row || !row.value) return;
          try { setClusters(JSON.parse(row.value)); } catch (e) {}
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const [clusterImages, setClusterImages] = useState({});
  const [globalHousesIndex, setGlobalHousesIndex] = useState({});
  async function loadHomeStats(list) {
    const results = {};
    const images = {};
    const housesIndex = {};
    await Promise.all(list.map(async (c) => {
      try {
        const [hRes, cfgRes, imgRes] = await Promise.all([
          storage.get(housesKeyFor(c.id), false).catch(() => null),
          storage.get(configKeyFor(c.id), false).catch(() => null),
          storage.get(imageKeyFor(c.id), false).catch(() => null),
        ]);
        images[c.id] = (imgRes && imgRes.value) || (c.id === LEGACY_CLUSTER_ID ? SITE_IMAGE_DEFAULT : null);
        const chouses = hRes && hRes.value ? JSON.parse(hRes.value) : [];
        housesIndex[c.id] = chouses;
        const cfgParsed = cfgRes && cfgRes.value ? JSON.parse(cfgRes.value) : null;
        const ctipe = (cfgParsed && cfgParsed.tipeOptions) || (c.id === LEGACY_CLUSTER_ID ? DEFAULT_TIPE : []);
        const cblocks = (cfgParsed && cfgParsed.blocks) || (c.id === LEGACY_CLUSTER_ID ? DEFAULT_BLOCKS : []);
        const lbOf = (h) => (ctipe.find((t) => t.name === h.tipe)?.luasBangunan) || 0;
        let sumHarga = 0, sumHpp = 0;
        const byTipe = {};
        chouses.forEach((h) => {
          const lb = lbOf(h);
          const hargaTotal = (h.hargaJualPerM2 && lb) ? h.hargaJualPerM2 * lb : 0;
          const hppTotalV = (h.hppPerM2 && lb) ? h.hppPerM2 * lb : 0;
          const finalHpp = hppTotalV + (h.adendum ? (h.adendumAmount || 0) : 0);
          sumHarga += hargaTotal; sumHpp += finalHpp;
          if (lb && hargaTotal) {
            if (!byTipe[h.tipe]) byTipe[h.tipe] = { harga: 0, hpp: 0, n: 0 };
            byTipe[h.tipe].harga += hargaTotal; byTipe[h.tipe].hpp += finalHpp; byTipe[h.tipe].n++;
          }
        });
        const marginByTipe = Object.entries(byTipe).map(([tipe, v]) => ({
          tipe, n: v.n, harga: v.harga, hpp: v.hpp, marginPct: v.harga ? Number((((v.harga - v.hpp) / v.harga) * 100).toFixed(1)) : 0,
        }));
        results[c.id] = {
          total: chouses.length,
          blockCount: cblocks.length,
          margin: sumHarga - sumHpp,
          marginPct: sumHarga ? ((sumHarga - sumHpp) / sumHarga) * 100 : 0,
          sumHarga, sumHpp,
          marginByTipe,
        };
      } catch (e) { results[c.id] = { total: 0, blockCount: 0, margin: 0, marginPct: 0, sumHarga: 0, sumHpp: 0, marginByTipe: [] }; }
    }));
    setClusterStats(results);
    setClusterImages(images);
    setGlobalHousesIndex(housesIndex);
  }
  useEffect(() => {
    if (currentClusterId || !homeLoaded) return;
    if (clusters.length === 0) return;
    loadHomeStats(clusters);
  }, [currentClusterId, homeLoaded, clusters.length]);

  // ---- pencarian kavling lintas-cluster (di Home) ----
  const [kavlingSearch, setKavlingSearch] = useState("");
  const KAVLING_SEARCH_LIMIT = 30;
  const kavlingSearchAllMatches = useMemo(() => {
    const q = kavlingSearch.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    Object.entries(globalHousesIndex).forEach(([clusterId, chouses]) => {
      const cluster = clusters.find((c) => c.id === clusterId);
      if (!cluster) return;
      (chouses || []).forEach((h) => {
        const kavlingLabel = `${h.blok}-${h.noKavling}`;
        if (kavlingLabel.toLowerCase().includes(q)) {
          results.push({ house: h, clusterId, clusterName: cluster.name, kavlingLabel });
        }
      });
    });
    return results;
  }, [kavlingSearch, globalHousesIndex, clusters]);
  const kavlingSearchResults = useMemo(
    () => kavlingSearchAllMatches.slice(0, KAVLING_SEARCH_LIMIT),
    [kavlingSearchAllMatches]
  );

  const [pendingHighlight, setPendingHighlight] = useState(null);
  useEffect(() => {
    if (!pendingHighlight || !clusterLoaded) return;
    if (pendingHighlight.clusterId !== currentClusterId) return;
    setMode("kerja");
    setSelectedId(pendingHighlight.houseId);
    setPendingHighlight(null);
  }, [pendingHighlight, clusterLoaded, currentClusterId]);

  function openKavlingFromSearch(clusterId, houseId) {
    setPendingHighlight({ clusterId, houseId });
    setKavlingSearch("");
    openCluster(clusterId);
  }

  function newClusterId() { return `cl-${Date.now().toString(36)}${Math.random().toString(36).slice(-4)}`; }
  function saveClustersIndex(next) {
    storage.set(CLUSTERS_INDEX_KEY, JSON.stringify(next), false).catch((e) => console.error(e));
  }
  async function recoverLegacyCluster() {
    if (clusters.some((c) => c.id === LEGACY_CLUSTER_ID)) return;
    let name = "Cluster Bria", subtitle = "Discovery Riviera, Bintaro Jaya";
    try {
      const cfg = await storage.get(CONFIG_KEY_BASE, false);
      if (cfg && cfg.value) {
        const parsed = JSON.parse(cfg.value);
        if (parsed.boardTitle) name = parsed.boardTitle;
        if (parsed.boardSubtitle) subtitle = parsed.boardSubtitle;
      }
    } catch (e) {}
    setClusters((prev) => { const next = [...prev, { id: LEGACY_CLUSTER_ID, name, subtitle }]; saveClustersIndex(next); return next; });
  }
  function openCluster(id) {
    setCurrentClusterId(id);
    storage.set(LAST_CLUSTER_KEY, id, false).catch(() => {});
  }
  async function goHome() {
    if (dirty) {
      await saveHouses();
    }
    setCurrentClusterId(null);
    storage.delete(LAST_CLUSTER_KEY, false).catch(() => {});
  }
  async function handleLogoutClick() {
    if (homeDirty) {
      await saveHomeChanges();
    }
    onLogout();
  }
  function addCluster(name, subtitle) {
    if (!canEdit) return;
    const id = newClusterId();
    const entry = { id, name: name || "Cluster Baru", subtitle: subtitle || "" };
    setClusters((prev) => { const next = [...prev, entry]; saveClustersIndex(next); return next; });
    openCluster(id);
  }
  function updateClusterMeta(id, patch) {
    if (!canEdit) return;
    setClusters((prev) => { const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c)); saveClustersIndex(next); return next; });
  }
  function togglePinCluster(id) {
    const c = clusters.find((x) => x.id === id);
    updateClusterMeta(id, { pinned: !(c && c.pinned) });
  }
  function toggleArchiveCluster(id) {
    const c = clusters.find((x) => x.id === id);
    updateClusterMeta(id, { archived: !(c && c.archived) });
  }
  function deleteCluster(id) {
    if (!canEdit) return;
    setClusters((prev) => { const next = prev.filter((c) => c.id !== id); saveClustersIndex(next); return next; });
    storage.delete(housesKeyFor(id), false).catch(() => {});
    storage.delete(configKeyFor(id), false).catch(() => {});
    storage.delete(imageKeyFor(id), false).catch(() => {});
    if (currentClusterId === id) goHome();
  }
  function saveAppTitle(next) {
    if (!canEdit) return;
    storage.set(APP_TITLE_KEY, next, false).catch((e) => console.error(e));
  }
  async function saveHomeChanges() {
    if (!canEdit) return;
    setHomeSaving(true);
    try {
      await storage.set(APP_TITLE_KEY, appTitle, false);
      await storage.set(CLUSTERS_INDEX_KEY, JSON.stringify(clusters), false);
      setHomeDirty(false);
      setHomeSavedToast(true);
      setTimeout(() => setHomeSavedToast(false), 2200);
    } catch (e) { console.error(e); }
    finally { setHomeSaving(false); }
  }

  async function saveHouses(next) {
    if (!canEdit) return;
    setSaving(true);
    try {
      const result = await storage.set(housesKeyFor(currentClusterId), JSON.stringify(next ?? houses), housesUpdatedAt);
      setHousesUpdatedAt(result.updatedAt);
      setSaveConflict(false);
      setDirty(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2200);
    }
    catch (e) {
      if (e && e.code === "CONFLICT") setSaveConflict(true);
      else console.error(e);
    }
    finally { setSaving(false); }
  }
  async function saveConfig(next) {
    if (!canEdit) return;
    try {
      await storage.set(configKeyFor(currentClusterId), JSON.stringify({
        blocks: next.blocks ?? blocks, tipeOptions: next.tipeOptions ?? tipeOptions,
        statusFields: next.statusFields ?? statusFields, kategoriOptions: next.kategoriOptions ?? kategoriOptions,
      }), false);
    } catch (e) { console.error(e); }
  }

  function addHouse(record) { if (!canEdit) return; setHouses((prev) => { const next = [...prev, record]; saveHouses(next); return next; }); }
  function removeHouse(id) {
    if (!canEdit) return;
    setHouses((prev) => {
      const removed = prev.find((h) => h.id === id);
      const next = prev.filter((h) => h.id !== id);
      saveHouses(next);
      if (removed) {
        setLastDeleted(removed);
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = setTimeout(() => setLastDeleted(null), 8000);
      }
      return next;
    });
    if (selectedId === id) setSelectedId(null);
  }
  function undoDelete() {
    if (!canEdit || !lastDeleted) return;
    setHouses((prev) => { const next = [...prev, lastDeleted]; saveHouses(next); return next; });
    setLastDeleted(null);
    clearTimeout(undoTimerRef.current);
  }
  function startEditShape(id) {
    if (!canEdit) return;
    const target = houses.find((h) => h.id === id);
    if (!target) return;
    setEditingShapeId(id);
    setEditPoints(target.points.map((p) => ({ ...p })));
    setActionMenuId(null);
  }
  function saveEditShape() {
    if (!editingShapeId || !editPoints) return;
    setHouses((prev) => {
      const next = prev.map((h) => (h.id === editingShapeId ? { ...h, points: editPoints } : h));
      saveHouses(next);
      return next;
    });
    setEditingShapeId(null);
    setEditPoints(null);
  }
  function cancelEditShape() {
    setEditingShapeId(null);
    setEditPoints(null);
  }
  function startVertexDrag(idx, e) {
    e.stopPropagation();
    draggingVertexRef.current = idx;
    function onMove(ev) {
      if (draggingVertexRef.current === null || !imgWrapRef.current) return;
      const rect = imgWrapRef.current.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100));
      setEditPoints((prev) => prev.map((p, i) => (i === draggingVertexRef.current ? { x, y } : p)));
    }
    function onUp() {
      draggingVertexRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }
  function updateHouse(id, patch) {
    if (!canEdit) return;
    setHouses((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch, lastEditedAt: Date.now() } : h)));
    setDirty(true);
  }
  function updateStatus(id, key, value) {
    if (!canEdit) return;
    setHouses((prev) => prev.map((h) => (h.id === id ? { ...h, status: { ...h.status, [key]: value }, lastEditedAt: Date.now() } : h)));
    setDirty(true);
  }

  // ---- config management ----
  function toggleRowSelect(id) {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function bulkSetKategori(kategori) {
    if (!canEdit || !kategori) return;
    setHouses((prev) => { const next = prev.map((h) => (selectedRows.includes(h.id) ? { ...h, kategori } : h)); saveHouses(next); return next; });
  }
  function bulkSetTipe(tipe) {
    if (!canEdit || !tipe) return;
    setHouses((prev) => { const next = prev.map((h) => (selectedRows.includes(h.id) ? { ...h, tipe } : h)); saveHouses(next); return next; });
  }
  function bulkSetStatus(key, value) {
    if (!canEdit) return;
    setHouses((prev) => { const next = prev.map((h) => (selectedRows.includes(h.id) ? { ...h, status: { ...h.status, [key]: value } } : h)); saveHouses(next); return next; });
  }
  function bulkSetFollowUp(date) {
    if (!canEdit) return;
    setHouses((prev) => { const next = prev.map((h) => (selectedRows.includes(h.id) ? { ...h, followUpDate: date || null } : h)); saveHouses(next); return next; });
  }
  function bulkDelete() {
    if (!canEdit) return;
    setHouses((prev) => {
      const removed = prev.filter((h) => selectedRows.includes(h.id));
      const next = prev.filter((h) => !selectedRows.includes(h.id));
      saveHouses(next);
      if (removed.length) {
        setLastDeletedBulk(removed);
        clearTimeout(bulkUndoTimerRef.current);
        bulkUndoTimerRef.current = setTimeout(() => setLastDeletedBulk(null), 8000);
      }
      return next;
    });
    setSelectedRows([]);
  }
  function undoBulkDelete() {
    if (!canEdit || !lastDeletedBulk) return;
    setHouses((prev) => { const next = [...prev, ...lastDeletedBulk]; saveHouses(next); return next; });
    setLastDeletedBulk(null);
    clearTimeout(bulkUndoTimerRef.current);
  }
  function duplicateHouse(id) {
    if (!canEdit) return;
    const src = houses.find((h) => h.id === id);
    if (!src) return;
    const copy = {
      ...src,
      id: `${src.blok}-copy-${Date.now().toString(36)}`,
      noKavling: `${src.noKavling}-copy`,
      points: src.points.map((p) => ({ x: Math.min(99, p.x + 2), y: Math.min(99, p.y + 2) })),
      status: { ...src.status },
      details: { ...(src.details || {}) },
    };
    setHouses((prev) => { const next = [...prev, copy]; saveHouses(next); return next; });
    setSelectedId(copy.id);
  }
  function newBlockId() { return `blk-${Date.now().toString(36)}${Math.random().toString(36).slice(-4)}`; }
  function addBlock() {
    if (!canEdit || !newBlock.name) return;
    if (blocks.some((b) => b.name === newBlock.name)) { setSettingsMsg(`Nama blok "${newBlock.name}" sudah dipakai.`); return; }
    const next = [...blocks, { id: newBlockId(), name: newBlock.name, target: Number(newBlock.target) || 0 }];
    setBlocks(next); saveConfig({ blocks: next }); setNewBlock({ name: "", target: "" });
    setTableBlocks((prev) => [...prev, newBlock.name]);
  }
  const [settingsMsg, setSettingsMsg] = useState("");
  function removeBlock(id) {
    if (!canEdit) return;
    const target = blocks.find((b) => b.id === id);
    if (!target) return;
    const duplicateExists = blocks.some((b) => b.id !== id && b.name === target.name);
    const inUse = houses.filter((h) => h.blok === target.name).length;
    if (!duplicateExists && inUse > 0) {
      setSettingsMsg(`Blok ${target.name} masih punya ${inUse} kavling. Ganti nama atau hapus kavlingnya dulu di tabel sebelum menghapus blok ini.`);
      return;
    }
    const next = blocks.filter((b) => b.id !== id);
    setBlocks(next); saveConfig({ blocks: next });
    const stillHasName = next.some((b) => b.name === target.name);
    if (!stillHasName) setTableBlocks((prev) => prev.filter((n) => n !== target.name));
    setSettingsMsg("");
  }
  function renameBlock(id, newName) {
    if (!canEdit) return;
    newName = newName.trim();
    const target = blocks.find((b) => b.id === id);
    if (!target || !newName || newName === target.name) return;
    if (blocks.some((b) => b.id !== id && b.name === newName)) { setSettingsMsg(`Nama blok "${newName}" sudah dipakai.`); return; }
    const oldName = target.name;
    const nextBlocks = blocks.map((b) => (b.id === id ? { ...b, name: newName } : b));
    setBlocks(nextBlocks); saveConfig({ blocks: nextBlocks });
    setHouses((prev) => { const next = prev.map((h) => (h.blok === oldName ? { ...h, blok: newName } : h)); saveHouses(next); return next; });
    setTableBlocks((prev) => prev.map((b) => (b === oldName ? newName : b)));
    if (activeBlock === oldName) setActiveBlock(newName);
    setSettingsMsg("");
  }
  function updateBlockTarget(id, target) {
    if (!canEdit) return;
    const next = blocks.map((b) => (b.id === id ? { ...b, target: Number(target) || 0 } : b));
    setBlocks(next); saveConfig({ blocks: next });
  }
  function addTipe() {
    if (!canEdit || !newTipe) return;
    if (tipeOptions.some((t) => t.name === newTipe)) { setSettingsMsg(`Nama tipe "${newTipe}" sudah dipakai.`); return; }
    const color = PALETTE[tipeOptions.length % PALETTE.length];
    const next = [...tipeOptions, { id: `tp-${Date.now().toString(36)}${Math.random().toString(36).slice(-4)}`, name: newTipe, color, luasBangunan: Number(newTipeLuas) || 0 }];
    setTipeOptions(next); saveConfig({ tipeOptions: next }); setNewTipe(""); setNewTipeLuas("");
    setTableTipes((prev) => [...prev, newTipe]);
  }
  function updateTipeLuas(name, luas) {
    if (!canEdit) return;
    const next = tipeOptions.map((t) => (t.name === name ? { ...t, luasBangunan: Number(luas) || 0 } : t));
    setTipeOptions(next); saveConfig({ tipeOptions: next });
  }
  function renameTipe(oldName, newName) {
    if (!canEdit) return;
    newName = newName.trim();
    if (!newName || newName === oldName) return;
    if (tipeOptions.some((t) => t.name === newName)) { setSettingsMsg(`Nama tipe "${newName}" sudah dipakai.`); return; }
    const next = tipeOptions.map((t) => (t.name === oldName ? { ...t, name: newName } : t));
    setTipeOptions(next); saveConfig({ tipeOptions: next });
    setHouses((prev) => { const nextHouses = prev.map((h) => (h.tipe === oldName ? { ...h, tipe: newName } : h)); saveHouses(nextHouses); return nextHouses; });
    setTableTipes((prev) => prev.map((t) => (t === oldName ? newName : t)));
    if (activeTipe === oldName) setActiveTipe(newName);
    setSettingsMsg("");
  }
  function removeTipe(name) {
    if (!canEdit) return;
    const target = tipeOptions.find((t) => t.name === name);
    if (!target) return;
    const inUse = houses.filter((h) => h.tipe === name).length;
    if (inUse > 0) {
      setSettingsMsg(`Tipe ${name} masih dipakai ${inUse} kavling. Ganti tipe kavling itu dulu di tabel sebelum menghapus tipe ini.`);
      return;
    }
    const next = tipeOptions.filter((t) => t.name !== name);
    setTipeOptions(next); saveConfig({ tipeOptions: next });
    setTableTipes((prev) => prev.filter((n) => n !== name));
    setSettingsMsg("");
  }
  function refreshTipeColors() {
    if (!canEdit) return;
    const next = tipeOptions.map((t, i) => ({ ...t, color: PALETTE[i % PALETTE.length] }));
    setTipeOptions(next); saveConfig({ tipeOptions: next });
  }
  function addStatus() {
    if (!canEdit || !newStatus) return;
    const key = newStatus.trim().replace(/\s+/g, "_").toLowerCase() + "_" + Date.now().toString(36).slice(-4);
    const next = [...statusFields, { key, label: newStatus, hasDetail: newStatusHasDetail }];
    setStatusFields(next); saveConfig({ statusFields: next }); setNewStatus(""); setNewStatusHasDetail(false);
  }
  function removeStatusField(key) {
    if (!canEdit) return;
    const next = statusFields.filter((s) => s.key !== key);
    setStatusFields(next); saveConfig({ statusFields: next });
  }
  function toggleStatusDetail(key) {
    if (!canEdit) return;
    const next = statusFields.map((s) => (s.key === key ? { ...s, hasDetail: !s.hasDetail } : s));
    setStatusFields(next); saveConfig({ statusFields: next });
  }
  function renameStatusLabel(key, newLabel) {
    if (!canEdit) return;
    newLabel = newLabel.trim();
    if (!newLabel) return;
    const next = statusFields.map((s) => (s.key === key ? { ...s, label: newLabel } : s));
    setStatusFields(next); saveConfig({ statusFields: next });
  }
  function moveStatusField(key, dir) {
    if (!canEdit) return;
    const idx = statusFields.findIndex((s) => s.key === key);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= statusFields.length) return;
    const next = [...statusFields];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setStatusFields(next); saveConfig({ statusFields: next });
  }
  function getDetail(h, key) { return (h.details && h.details[key]) || ""; }
  function setDetail(houseId, key, value) {
    if (!canEdit) return;
    setHouses((prev) => prev.map((h) => (h.id === houseId ? { ...h, details: { ...(h.details || {}), [key]: value } } : h)));
    setDirty(true);
  }
  function addKategori() {
    if (!canEdit || !newKategori) return;
    if (kategoriOptions.includes(newKategori)) { setSettingsMsg(`Kategori "${newKategori}" sudah ada.`); return; }
    const next = [...kategoriOptions, newKategori];
    setKategoriOptions(next); saveConfig({ kategoriOptions: next }); setNewKategori("");
  }
  function renameKategori(oldName, newName) {
    if (!canEdit) return;
    newName = newName.trim();
    if (!newName || newName === oldName) return;
    if (kategoriOptions.includes(newName)) { setSettingsMsg(`Kategori "${newName}" sudah ada.`); return; }
    const next = kategoriOptions.map((k) => (k === oldName ? newName : k));
    setKategoriOptions(next); saveConfig({ kategoriOptions: next });
    setHouses((prev) => { const nextHouses = prev.map((h) => (h.kategori === oldName ? { ...h, kategori: newName } : h)); saveHouses(nextHouses); return nextHouses; });
    setSettingsMsg("");
  }
  function removeKategori(name) {
    if (!canEdit) return;
    const next = kategoriOptions.filter((k) => k !== name);
    setKategoriOptions(next); saveConfig({ kategoriOptions: next });
  }

  // ---- drawing ----
  // Tarik bar di tepi bawah kartu Site Plan untuk menaik-turunkan tingginya.
  function startHeightDrag(e) {
    const box = planBoxRef.current;
    if (!box) return;
    e.preventDefault();
    const startY = e.clientY;
    const startH = box.getBoundingClientRect().height;
    function onMove(ev) { setMapHeight(Math.round(Math.min(1400, Math.max(240, startH + (ev.clientY - startY))))); }
    function onUp() { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }
  function goMode(m) {
    setMode(m); setEditMap(false);
    setDraft(null); setDrawingPoints([]); setEditingShapeId(null); setEditPoints(null); setActionMenuId(null); setConfirmDeleteId(null);
  }
  function handleImageClick(e) {
    if (!calibrating || draft || editingShapeId || actionMenuId) return;
    const hasValidBlock = blocks.some((b) => b.name === activeBlock);
    const hasValidTipe = tipeOptions.some((t) => t.name === activeTipe);
    if (!hasValidBlock || !hasValidTipe) return;
    const rect = imgWrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawingPoints((prev) => [...prev, { x, y }]);
  }
  function undoPoint() { setDrawingPoints((prev) => prev.slice(0, -1)); }
  function cancelDrawing() { setDrawingPoints([]); }
  function finishPolygon() {
    if (drawingPoints.length < 3) return;
    setDraft({ points: drawingPoints, noKavling: "", tipe: activeTipe || tipeOptions[0]?.name || "" });
    setDrawingPoints([]);
  }
  function submitDraft() {
    if (!draft || !draft.noKavling) return;
    addHouse({
      id: `${activeBlock}-${draft.noKavling}-${Date.now()}`,
      blok: activeBlock, noKavling: draft.noKavling, tipe: draft.tipe,
      points: draft.points,
      kategori: kategoriOptions[0] || "",
      status: Object.fromEntries(statusFields.map((s) => [s.key, false])),
      adendum: false, adendumAmount: 0, hppPerM2: 0, hargaJualPerM2: 0, kontraktor: "", spkNo: "", spkTahun: null, spkBulan: null, details: {}, catatan: "", lastEditedAt: null, followUpDate: null,
    });
    setDraft(null);
  }

  async function handleImageUpload(e) {
    if (!canEdit) return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const dataUrl = await resizeImageFile(file, MAX_IMG_DIM);
      setSiteImage(dataUrl);
      await storage.set(imageKeyFor(currentClusterId), dataUrl, false);
    } catch (err) { console.error("Gagal memproses gambar", err); }
    finally { setImgUploading(false); e.target.value = ""; }
  }
  async function resetImage() {
    if (!canEdit) return;
    setSiteImage(currentClusterId === LEGACY_CLUSTER_ID ? SITE_IMAGE_DEFAULT : null);
    try { await storage.delete(imageKeyFor(currentClusterId), false); } catch (e) {}
  }

  const [importMsg, setImportMsg] = useState("");
  function importExcel(e) {
    if (!canEdit) return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        const updatedList = [];
        const skippedList = [];
        const next = [...houses];
        rows.forEach((row) => {
          const kavlingStr = String(row["Kavling"] || "").trim();
          const idx = kavlingStr.lastIndexOf("-");
          if (idx < 0) { skippedList.push(kavlingStr || "(kosong)"); return; }
          const blok = kavlingStr.slice(0, idx);
          const noKavling = kavlingStr.slice(idx + 1);
          const hi = next.findIndex((h) => h.blok === blok && h.noKavling === noKavling);
          if (hi === -1) { skippedList.push(kavlingStr); return; }
          const h = { ...next[hi] };
          if (row["Kategori"] !== undefined && row["Kategori"] !== "") h.kategori = String(row["Kategori"]);
          if (row["Kontraktor"] !== undefined) h.kontraktor = String(row["Kontraktor"]);
          if (row["No. SPK"] !== undefined) h.spkNo = String(row["No. SPK"]);
          if (row["Th. SPK"] !== undefined && row["Th. SPK"] !== "") h.spkTahun = Number(row["Th. SPK"]) || null;
          if (row["Bln. SPK"] !== undefined && row["Bln. SPK"] !== "") {
            const mi = MONTHS.findIndex((m) => m.toLowerCase() === String(row["Bln. SPK"]).toLowerCase().slice(0, 3));
            if (mi >= 0) h.spkBulan = mi + 1;
          }
          if (row["HPP/m2 (Rp)"] !== undefined && row["HPP/m2 (Rp)"] !== "") h.hppPerM2 = Number(row["HPP/m2 (Rp)"]) || 0;
          if (row["Harga Jual/m2 (Rp)"] !== undefined && row["Harga Jual/m2 (Rp)"] !== "") h.hargaJualPerM2 = Number(row["Harga Jual/m2 (Rp)"]) || 0;
          if (row["Adendum (Rp)"] !== undefined && row["Adendum (Rp)"] !== "") {
            const amt = Number(row["Adendum (Rp)"]) || 0;
            h.adendum = amt !== 0; h.adendumAmount = amt;
          }
          statusFields.forEach((s) => {
            if (row[s.label] !== undefined) h.status = { ...h.status, [s.key]: String(row[s.label]).trim().toLowerCase().startsWith("s") };
            if (s.hasDetail && row[`${s.label} - Detail`] !== undefined) {
              h.details = { ...(h.details || {}), [s.key]: String(row[`${s.label} - Detail`]) };
            }
          });
          next[hi] = h;
          updatedList.push(kavlingStr);
        });
        setHouses(next); saveHouses(next);
        setImportMsg({ updated: updatedList, skipped: skippedList });
      } catch (err) {
        setImportMsg("Gagal membaca file. Pastikan formatnya .xlsx atau .csv, kolom \"Kavling\" berisi kode seperti \"RB/A-01\".");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }
  function buildReportHtml() {
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const statusRows = statusFields.map((s) => {
      const done = houses.filter((h) => h.status[s.key]).length;
      return `<tr><td>${s.label}</td><td>${done}</td><td>${houses.length - done}</td></tr>`;
    }).join("");
    const tipeRows = marginPerTipe.filter((t) => t.n > 0).map((t) => `<tr><td>${t.tipe}</td><td>${t.n}</td><td>${t.margin}%</td></tr>`).join("");

    const maxTarget = Math.max(1, ...blockProgress.map((b) => Number(b.target) || 0));
    const blokBars = blockProgress.map((b) => {
      const pct = Math.min(100, (b.placed / maxTarget) * 100);
      const targetPct = Math.min(100, ((Number(b.target) || 0) / maxTarget) * 100);
      return `<div class="barrow"><div class="barlabel">${b.name}</div><div class="bartrack"><div class="bartarget" style="width:${targetPct}%"></div><div class="barfill" style="width:${pct}%"></div></div><div class="barval">${b.placed}/${b.target}</div></div>`;
    }).join("");

    const maxMargin = Math.max(1, ...marginPerTipe.map((t) => Math.abs(t.margin)));
    const marginBars = marginPerTipe.filter((t) => t.n > 0).map((t) => {
      const pct = Math.min(100, (Math.abs(t.margin) / maxMargin) * 100);
      const color = t.margin >= 0 ? "#3F7D58" : "#B8562E";
      return `<div class="barrow"><div class="barlabel">${t.tipe}</div><div class="bartrack"><div class="barfill" style="width:${pct}%;background:${color}"></div></div><div class="barval">${t.margin}%</div></div>`;
    }).join("");

    const statusBars = statusFields.map((s) => {
      const done = houses.filter((h) => h.status[s.key]).length;
      const pct = houses.length ? (done / houses.length) * 100 : 0;
      return `<div class="barrow"><div class="barlabel">${s.label}</div><div class="bartrack"><div class="barfill" style="width:${pct}%;background:#3F7D58"></div></div><div class="barval">${done}/${houses.length}</div></div>`;
    }).join("");

    const maxTipeCount = Math.max(1, ...tipePie.map((t) => t.value));
    const tipeBars = tipePie.map((t) => {
      const pct = Math.min(100, (t.value / maxTipeCount) * 100);
      return `<div class="barrow"><div class="barlabel">${t.name}</div><div class="bartrack"><div class="barfill" style="width:${pct}%"></div></div><div class="barval">${t.value} unit</div></div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>Laporan ${activeCluster.name}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1B2A3C; padding: 32px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 20px; margin-bottom: 2px; }
  .sub { color: #5B6673; font-size: 13px; margin-bottom: 24px; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .card { border: 1px solid #C9C2B2; border-radius: 6px; padding: 12px; }
  .card .label { font-size: 11px; color: #5B6673; margin-bottom: 4px; }
  .card .value { font-size: 16px; font-weight: 700; font-family: 'Courier New', monospace; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13px; }
  th, td { border: 1px solid #C9C2B2; padding: 6px 10px; text-align: left; }
  th { background: #F5F2EA; }
  h2 { font-size: 15px; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #1B2A3C; padding-bottom: 4px; }
  .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 28px; }
  .chartbox { border: 1px solid #C9C2B2; border-radius: 6px; padding: 14px; }
  .chartbox h3 { font-size: 13px; margin: 0 0 10px 0; }
  .barrow { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 11px; }
  .barlabel { width: 70px; flex-shrink: 0; color: #5B6673; }
  .bartrack { flex: 1; background: #DAD4C6; border-radius: 3px; height: 12px; position: relative; overflow: hidden; }
  .bartarget { position: absolute; left: 0; top: 0; bottom: 0; background: #E3DFD3; }
  .barfill { position: relative; height: 100%; background: #24507A; border-radius: 3px 0 0 3px; }
  .barval { width: 55px; flex-shrink: 0; text-align: right; font-family: 'Courier New', monospace; }
  @media print { body { padding: 0; } .charts { grid-template-columns: 1fr 1fr; } }
</style></head>
<body>
  <h1>${activeCluster.name}</h1>
  <div class="sub">${activeCluster.subtitle} · target ${totalTarget} unit, ${blocks.length} blok · dicetak ${tanggal}</div>

  <h2>Ringkasan</h2>
  <div class="cards">
    <div class="card"><div class="label">Kavling Terpetakan</div><div class="value">${houses.length} / ${totalTarget}</div></div>
    <div class="card"><div class="label">Sudah Terjual</div><div class="value">${soldUnits.length} / ${houses.length}</div></div>
    <div class="card"><div class="label">Total Margin</div><div class="value">${rupiah(totalMargin)}</div></div>
    <div class="card"><div class="label">Rata-rata Margin %</div><div class="value">${avgMarginPct.toFixed(2)}%</div></div>
  </div>

  <h2>Grafik</h2>
  <div class="charts">
    <div class="chartbox"><h3>Kalibrasi per Blok (unit)</h3>${blokBars}</div>
    <div class="chartbox"><h3>Margin per Tipe (%)</h3>${marginBars || "Belum ada data"}</div>
    <div class="chartbox"><h3>Kelengkapan Status</h3>${statusBars}</div>
    <div class="chartbox"><h3>Distribusi Tipe Kavling</h3>${tipeBars || "Belum ada data"}</div>
  </div>

  <h2>Margin per Tipe</h2>
  <table><thead><tr><th>Tipe</th><th>Jumlah Unit</th><th>Margin</th></tr></thead><tbody>${tipeRows || '<tr><td colspan="3">Belum ada data</td></tr>'}</tbody></table>

  <h2>Kelengkapan Status</h2>
  <table><thead><tr><th>Status</th><th>Sudah</th><th>Belum</th></tr></thead><tbody>${statusRows}</tbody></table>

  <p style="font-size:11px;color:#9CA6AE;">Dibuat otomatis dari Papan Status Tender.</p>
</body></html>`;
    return html;
  }
  function printReportPDF() {
    const w = window.open("", "_blank");
    if (!w) { alert("Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi."); return; }
    w.document.write(buildReportHtml());
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  }
  function printSitePlan() {
    const legendItems = colorMode === "blok"
      ? blocks.map((b) => ({ label: b.name, color: blockColor(b.name) }))
      : colorMode === "tipe"
      ? tipeOptions.map((t) => ({ label: t.name, color: t.color }))
      : [{ label: "Sudah", color: C.green }, { label: "Belum", color: C.red }];
    const colorModeLabel = colorMode === "blok" ? "Per Blok" : colorMode === "tipe" ? "Per Tipe" : (statusFields.find((s) => s.key === colorMode)?.label || colorMode);
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const imgSrc = new URL(siteImage, window.location.href).href;
    const shapesSvg = houses.map((h) => {
      const pts = h.points.map((p) => `${p.x},${p.y}`).join(" ");
      return `<polygon points="${pts}" fill="${polyColor(h)}" fill-opacity="${opacity / 100}" stroke="#00000066" stroke-width="0.2" vector-effect="non-scaling-stroke" />`;
    }).join("");
    const legendHtml = legendItems.map((l) => `<div class="legend-item"><span class="swatch" style="background-color:${l.color}"></span>${l.label}</div>`).join("");
    const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>Site Plan ${activeCluster.name}</title>
<style>
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1B2A3C; padding: 24px; margin: 0; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { color: #5B6673; font-size: 12px; margin-bottom: 16px; }
  .plan-wrap { position: relative; width: 100%; border: 1px solid #C9C2B2; }
  .plan-wrap img { width: 100%; display: block; }
  .plan-wrap svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  .legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; font-size: 12px; }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .swatch { width: 14px; height: 14px; border-radius: 2px; display: inline-block; border: 1px solid #00000033; flex-shrink: 0; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <h1>${activeCluster.name} — Site Plan</h1>
  <div class="sub">${activeCluster.subtitle} · Warna: ${colorModeLabel} · dicetak ${tanggal}</div>
  <div class="plan-wrap">
    <img src="${imgSrc}" />
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">${shapesSvg}</svg>
  </div>
  <div class="legend">${legendHtml}</div>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi."); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  }
  function printKavlingSummary(h) {
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const lb = luasBangunanOf(h);
    const statusRows = statusFields.map((s) => {
      const detail = s.hasDetail ? getDetail(h, s.key) : "";
      return `<tr><td>${s.label}</td><td>${h.status[s.key] ? "Sudah" : "Belum"}${detail ? ` — ${detail}` : ""}</td></tr>`;
    }).join("");
    const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>Ringkasan ${h.blok}-${h.noKavling}</title>
<style>
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1B2A3C; padding: 32px; margin: 0; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  .sub { color: #5B6673; font-size: 12px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  td { padding: 6px 8px; border-bottom: 1px solid #C9C2B2; font-size: 13px; vertical-align: top; }
  td:first-child { color: #5B6673; width: 42%; }
  .section-title { font-size: 13px; font-weight: bold; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.5px; color: #5B6673; }
  .margin-box { border: 1px solid #C9C2B2; border-radius: 8px; padding: 14px; display: flex; justify-content: space-between; align-items: baseline; }
  .margin-pct { font-size: 24px; font-weight: bold; }
  .footer { margin-top: 24px; font-size: 11px; color: #5B6673; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <h1>${h.blok}-${h.noKavling}</h1>
  <div class="sub">${activeCluster.name}${activeCluster.subtitle ? ` · ${activeCluster.subtitle}` : ""} · dicetak ${tanggal}</div>

  <div class="section-title">Data Kavling</div>
  <table>
    <tr><td>Tipe / Ukuran</td><td>${h.tipe || "-"}</td></tr>
    <tr><td>Kategori</td><td>${h.kategori || "-"}</td></tr>
    <tr><td>Luas Bangunan</td><td>${lb ? `${lb} m²` : "-"}</td></tr>
    <tr><td>Kontraktor</td><td>${h.kontraktor || "-"}</td></tr>
    <tr><td>No. SPK</td><td>${h.spkNo || "-"}</td></tr>
    <tr><td>Tahun / Bulan SPK</td><td>${h.spkTahun ? `${MONTHS[(h.spkBulan || 1) - 1]} ${h.spkTahun}` : "-"}</td></tr>
  </table>

  <div class="section-title">Status</div>
  <table>${statusRows}</table>

  <div class="section-title">Harga &amp; Margin</div>
  <table>
    <tr><td>HPP per m²</td><td>${rupiah(h.hppPerM2)}${lb ? ` → Total ${rupiah(hppTotal(h))}` : ""}</td></tr>
    ${h.adendum && h.adendumAmount ? `<tr><td>Adendum</td><td>${rupiah(h.adendumAmount)}</td></tr>` : ""}
    <tr><td>Harga Jual per m²</td><td>${rupiah(h.hargaJualPerM2)}${lb ? ` → Total ${rupiah(hargaJualTotal(h))}` : ""}</td></tr>
  </table>
  ${lb ? `<div class="margin-box"><span>Margin</span><span class="margin-pct" style="color:${marginPct(h) >= 20 ? "#3F7D58" : "#BD3B2E"}">${marginPct(h).toFixed(2)}% <span style="font-size:13px; font-weight:normal; color:#5B6673">(${rupiah(marginOf(h))})</span></span></div>` : ""}

  ${h.catatan ? `<div class="section-title" style="margin-top:18px">Catatan</div><div style="font-size:13px">${h.catatan}</div>` : ""}
  ${h.followUpDate ? `<div class="footer">Follow-up: ${new Date(h.followUpDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>` : ""}
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi."); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  }
  async function exportExcel() {
    const XLSX = await import("xlsx");
    const rows = tableRows.map((h) => {
      const row = {
        Kavling: `${h.blok}-${h.noKavling}`, Blok: h.blok, Tipe: h.tipe, Kategori: h.kategori,
      };
      statusFields.forEach((s) => {
        row[s.label] = h.status[s.key] ? "Sudah" : "Belum";
        if (s.hasDetail) row[`${s.label} - Detail`] = getDetail(h, s.key);
      });
      row["Kontraktor"] = h.kontraktor || "";
      row["No. SPK"] = h.spkNo || "";
      row["Th. SPK"] = h.spkTahun || "";
      row["Bln. SPK"] = h.spkBulan ? MONTHS[h.spkBulan - 1] : "";
      row["Luas Bangunan (m2)"] = luasBangunanOf(h);
      row["HPP/m2 (Rp)"] = h.hppPerM2 || 0;
      row["HPP Total (Rp)"] = hppTotal(h);
      row["Adendum (Rp)"] = h.adendum ? (h.adendumAmount || 0) : 0;
      row["Harga Jual/m2 (Rp)"] = h.hargaJualPerM2 || 0;
      row["Harga Jual Total (Rp)"] = hargaJualTotal(h);
      row["Margin (%)"] = luasBangunanOf(h) ? Number(marginPct(h).toFixed(2)) : "";
      row["Margin (Rp)"] = luasBangunanOf(h) ? marginOf(h) : "";
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Blok");
    XLSX.writeFile(wb, `data-blok-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
  const [exportingExcelAll, setExportingExcelAll] = useState(false);
  const [exportingBackupAll, setExportingBackupAll] = useState(false);
  const [lastBackupAt, setLastBackupAt] = useState(null);
  async function fetchAllClustersFull() {
    return Promise.all(clusters.map(async (c) => {
      try {
        const [hRes, cfgRes, imgRes] = await Promise.all([
          storage.get(housesKeyFor(c.id), false).catch(() => null),
          storage.get(configKeyFor(c.id), false).catch(() => null),
          storage.get(imageKeyFor(c.id), false).catch(() => null),
        ]);
        const chouses = hRes && hRes.value ? JSON.parse(hRes.value) : [];
        const cfgParsed = cfgRes && cfgRes.value ? JSON.parse(cfgRes.value) : {};
        const image = (imgRes && imgRes.value) || (c.id === LEGACY_CLUSTER_ID ? SITE_IMAGE_DEFAULT : null);
        return {
          id: c.id, name: c.name, subtitle: c.subtitle,
          houses: chouses,
          blocks: cfgParsed.blocks || (c.id === LEGACY_CLUSTER_ID ? DEFAULT_BLOCKS : []),
          tipeOptions: cfgParsed.tipeOptions || (c.id === LEGACY_CLUSTER_ID ? DEFAULT_TIPE : []),
          statusFields: cfgParsed.statusFields || DEFAULT_STATUS,
          kategoriOptions: cfgParsed.kategoriOptions || DEFAULT_KATEGORI,
          image,
        };
      } catch (e) { return { id: c.id, name: c.name, subtitle: c.subtitle, houses: [], blocks: [], tipeOptions: [], statusFields: [], kategoriOptions: [], image: null }; }
    }));
  }
  const [pendingRestoreAll, setPendingRestoreAll] = useState(null);
  const [restoringAll, setRestoringAll] = useState(false);
  const [restoreAllError, setRestoreAllError] = useState("");
  const [restoreAllResult, setRestoreAllResult] = useState(null);
  function handleRestoreAllFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setRestoreAllError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.clusters)) throw new Error("format tidak sesuai");
        setPendingRestoreAll(data.clusters);
      } catch (err) {
        setRestoreAllError("Gagal membaca file cadangan semua cluster — pastikan file JSON hasil \"Unduh Cadangan Semua Cluster\".");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  async function applyRestoreAll() {
    if (!canEdit || !pendingRestoreAll) return;
    setRestoringAll(true);
    const restoredNames = [];
    const failedNames = [];
    try {
      for (const c of pendingRestoreAll) {
        try {
          await storage.set(housesKeyFor(c.id), JSON.stringify(c.houses || []), false);
          await storage.set(configKeyFor(c.id), JSON.stringify({
            blocks: c.blocks || [], tipeOptions: c.tipeOptions || [], statusFields: c.statusFields || DEFAULT_STATUS, kategoriOptions: c.kategoriOptions || DEFAULT_KATEGORI,
          }), false);
          if (c.image) await storage.set(imageKeyFor(c.id), c.image, false);
          restoredNames.push(c.name || c.id);
        } catch (err) { failedNames.push(c.name || c.id); }
      }
      const succeeded = pendingRestoreAll.filter((c) => restoredNames.includes(c.name || c.id));
      setClusters((prev) => {
        const next = [...prev];
        succeeded.forEach((c) => {
          const idx = next.findIndex((x) => x.id === c.id);
          const meta = { id: c.id, name: c.name || "Cluster", subtitle: c.subtitle || "" };
          if (idx >= 0) next[idx] = { ...next[idx], ...meta };
          else next.push(meta);
        });
        saveClustersIndex(next);
        loadHomeStats(next);
        return next;
      });
      setPendingRestoreAll(null);
      setRestoreAllResult({ restored: restoredNames, failed: failedNames });
    } catch (err) {
      setRestoreAllError("Pemulihan gagal di tengah jalan. Coba lagi — cluster yang belum sempat diproses tidak berubah.");
    } finally { setRestoringAll(false); }
  }
  function markBackedUp() {
    const now = Date.now();
    setLastBackupAt(now);
    storage.set(LAST_BACKUP_KEY, String(now), false).catch(() => {});
  }
  async function exportAllBackup() {
    setExportingBackupAll(true);
    try {
      const allData = await fetchAllClustersFull();
      const payload = { exportedAt: new Date().toISOString(), clusters: allData };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-semua-cluster-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      markBackedUp();
    } finally { setExportingBackupAll(false); }
  }
  async function exportAllExcel() {
    setExportingExcelAll(true);
    try {
      const XLSX = await import("xlsx");
      const allData = await fetchAllClustersFull();
      const wb = XLSX.utils.book_new();
      allData.forEach((c) => {
        const lbOf = (h) => (c.tipeOptions.find((t) => t.name === h.tipe)?.luasBangunan) || 0;
        const rows = c.houses.map((h) => {
          const lb = lbOf(h);
          const hargaTotal = (h.hargaJualPerM2 && lb) ? h.hargaJualPerM2 * lb : 0;
          const hppTotalV = (h.hppPerM2 && lb) ? h.hppPerM2 * lb : 0;
          const finalHpp = hppTotalV + (h.adendum ? (h.adendumAmount || 0) : 0);
          const row = { Kavling: `${h.blok}-${h.noKavling}`, Blok: h.blok, Tipe: h.tipe, Kategori: h.kategori };
          (c.statusFields || []).forEach((s) => {
            row[s.label] = h.status && h.status[s.key] ? "Sudah" : "Belum";
            if (s.hasDetail) row[`${s.label} - Detail`] = (h.details && h.details[s.key]) || "";
          });
          row["Kontraktor"] = h.kontraktor || "";
          row["No. SPK"] = h.spkNo || "";
          row["Luas Bangunan (m2)"] = lb;
          row["HPP/m2 (Rp)"] = h.hppPerM2 || 0;
          row["Harga Jual/m2 (Rp)"] = h.hargaJualPerM2 || 0;
          row["Margin (Rp)"] = hargaTotal - finalHpp;
          row["Margin (%)"] = hargaTotal ? Number((((hargaTotal - finalHpp) / hargaTotal) * 100).toFixed(2)) : "";
          row["Catatan"] = h.catatan || "";
          return row;
        });
        const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Kavling: "(belum ada data)" }]);
        const sheetName = (c.name || "Cluster").replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Cluster";
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      XLSX.writeFile(wb, `semua-cluster-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally { setExportingExcelAll(false); }
  }
  function exportBackup() {
    const payload = { exportedAt: new Date().toISOString(), houses, blocks, tipeOptions, statusFields, kategoriOptions };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${(activeCluster.name || "cluster").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    markBackedUp();
  }
  function importBackup(e) {
    if (!canEdit) return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data.houses)) { setHouses(data.houses); saveHouses(data.houses); }
        if (Array.isArray(data.blocks)) {
          const fixedBlocks = data.blocks.map((b) => (b.id ? b : { ...b, id: newBlockId() }));
          setBlocks(fixedBlocks); setTableBlocks(fixedBlocks.map((b) => b.name));
        }
        if (Array.isArray(data.tipeOptions)) setTipeOptions(data.tipeOptions);
        if (Array.isArray(data.statusFields)) setStatusFields(data.statusFields);
        if (Array.isArray(data.kategoriOptions)) setKategoriOptions(data.kategoriOptions);
        saveConfig({ blocks: data.blocks, tipeOptions: data.tipeOptions, statusFields: data.statusFields, kategoriOptions: data.kategoriOptions });
        setSettingsMsg("Data berhasil dipulihkan dari file cadangan.");
      } catch (err) { setSettingsMsg("Gagal membaca file cadangan — pastikan file JSON yang benar."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const { blockColor, tipeColor, luasBangunanOf, isDuplicateKavling, isIncomplete, hppTotal, hargaJualTotal, finalHppPerM2, marginOf, marginPct, aggregateMarginPct, getSortValue } =
    useMemo(() => makeCalc({ tipeOptions, blocks, houses, statusFields }), [tipeOptions, blocks, houses, statusFields]);
  function toggleSort(key) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortKey(null); setSortDir("asc"); }
    } else { setSortKey(key); setSortDir("asc"); }
  }
  function polyColor(h) {
    if (calibrating) return tipeColor(h.tipe);
    if (colorMode === "blok") return blockColor(h.blok);
    if (colorMode === "tipe") return tipeColor(h.tipe);
    return h.status[colorMode] ? C.green : C.red;
  }
  function selectFromMap(id) {
    setSelectedId(id);
  }
  function toggleTableBlock(name) {
    setTableBlocks((prev) => (prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]));
  }
  function toggleTableTipe(name) {
    setTableTipes((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]));
  }

  const blockProgress = useMemo(() => blocks.map((b) => ({ ...b, placed: houses.filter((h) => h.blok === b.name).length })), [houses, blocks]);
  const polygonsClickable = !calibrating || (drawingPoints.length === 0 && !draft && !editingShapeId);

  const columns = useMemo(() => ([
    { key: "no", label: "No" },
    { key: "select", label: "" },
    { key: "kavling", label: "Kavling" },
    { key: "tipe", label: "Tipe" },
    { key: "kategori", label: "Kategori" },
    ...statusFields.map((s) => ({ key: s.key, label: s.label })),
    { key: "kontraktor", label: "Kontraktor" },
    { key: "noSpk", label: "No. SPK" },
    { key: "thSpk", label: "Th. SPK" },
    { key: "blnSpk", label: "Bln. SPK" },
    { key: "luasBangunan", label: "LB" },
    { key: "hpp", label: "HPP/m²" },
    { key: "adendum", label: "Adendum" },
    { key: "hargaJual", label: "Harga Jual/m²" },
    { key: "margin", label: "Margin" },
    { key: "catatan", label: "Catatan" },
    { key: "aksi", label: "" },
  ]), [statusFields]);

  const tableRows = useMemo(() => {
    const in7Str = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    return houses
      .filter((h) => tableBlocks.includes(h.blok))
      .filter((h) => tableTipes.includes(h.tipe))
      .filter((h) => {
        if (tableStatusFilter === "semua") return true;
        const [key, val] = tableStatusFilter.split(":");
        return !!h.status[key] === (val === "true");
      })
      .filter((h) => !followUpFilterActive || (h.followUpDate && h.followUpDate <= in7Str))
      .filter((h) => !duplicateFilterActive || isDuplicateKavling(h))
      .filter((h) => !tableSearchQuery.trim() || `${h.blok}-${h.noKavling}`.toLowerCase().includes(tableSearchQuery.trim().toLowerCase()))
      .sort((a, b) => {
        if (sortKey) {
          const va = getSortValue(a, sortKey), vb = getSortValue(b, sortKey);
          let cmp;
          if (typeof va === "string" || typeof vb === "string") cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
          else cmp = va - vb;
          return sortDir === "asc" ? cmp : -cmp;
        }
        return a.blok === b.blok ? String(a.noKavling).localeCompare(String(b.noKavling), undefined, { numeric: true }) : a.blok.localeCompare(b.blok);
      });
  }, [houses, tableBlocks, tableTipes, tableStatusFilter, tableSearchQuery, followUpFilterActive, duplicateFilterActive, sortKey, sortDir]);

  useEffect(() => { setCurrentPage(1); }, [tableBlocks, tableTipes, tableStatusFilter, tableSearchQuery, duplicateFilterActive, pageSize]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && actionMenuId) {
        setActionMenuId(null);
        return;
      }
      if (e.key === "Escape" && showWhatsNew) {
        setShowWhatsNew(false);
        return;
      }
      if (e.key === "Escape" && showSimulasi) {
        setShowSimulasi(false);
        return;
      }
      if (e.key === "Escape" && showRekapKontraktor) {
        setShowRekapKontraktor(false);
        return;
      }
      if (mode !== "kerja" || calibrating || !selectedId) return;
      const tag = (e.target.tagName || "").toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select";
      if (e.key === "Escape") {
        if (isTyping) e.target.blur();
        setSelectedId(null);
        return;
      }
      if (isTyping) return;
      if (e.key === "ArrowRight") {
        const idx = tableRows.findIndex((x) => x.id === selectedId);
        const next = tableRows[idx + 1];
        if (next) { e.preventDefault(); selectFromMap(next.id); }
      } else if (e.key === "ArrowLeft") {
        const idx = tableRows.findIndex((x) => x.id === selectedId);
        const prev = tableRows[idx - 1];
        if (prev) { e.preventDefault(); selectFromMap(prev.id); }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mode, calibrating, selectedId, tableRows, actionMenuId, showWhatsNew, showSimulasi, showRekapKontraktor]);
  const totalRows = tableRows.length;
  const effectivePageSize = pageSize === "all" ? Math.max(totalRows, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalRows / effectivePageSize));
  const pageRows = pageSize === "all" ? tableRows : tableRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = totalRows === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const rangeEnd = Math.min(currentPage * effectivePageSize, totalRows);

  const soldUnits = houses.filter((h) => h.status.terjual);
  const totalMargin = houses.reduce((s, h) => s + marginOf(h), 0);
  const avgMarginPct = aggregateMarginPct(houses);
  const totalTarget = blocks.reduce((s, b) => s + (Number(b.target) || 0), 0);

  const kontraktorNames = useMemo(() => {
    const set = new Set();
    houses.forEach((h) => { if (h.kontraktor && h.kontraktor.trim()) set.add(h.kontraktor.trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [houses]);

  const rekapKontraktor = useMemo(() => {
    const map = {};
    houses.forEach((h) => {
      const nama = (h.kontraktor || "").trim() || "(belum diisi)";
      if (!map[nama]) map[nama] = { nama, unit: 0, sumHpp: 0, spkDone: 0 };
      map[nama].unit += 1;
      map[nama].sumHpp += hppTotal(h);
      if (h.status.spkOrder) map[nama].spkDone += 1;
    });
    return Object.values(map).sort((a, b) => b.unit - a.unit);
  }, [houses]);

  const marginPerTipe = useMemo(() => tipeOptions.map((t) => {
    const units = houses.filter((h) => h.tipe === t.name && luasBangunanOf(h) > 0);
    const pct = aggregateMarginPct(units);
    return { tipe: t.name, margin: Number(pct.toFixed(2)), n: units.length };
  }), [houses, tipeOptions]);
  const tipePie = useMemo(() => tipeOptions.map((t) => ({ name: t.name, value: houses.filter((h) => h.tipe === t.name).length })).filter((d) => d.value > 0), [houses, tipeOptions]);
  const progressPerBlok = useMemo(() => blocks.map((b) => {
    const units = houses.filter((h) => h.blok === b.name);
    return { blok: b.name, Terpetakan: units.length, Target: Math.max(0, (Number(b.target) || 0) - units.length) };
  }), [houses, blocks]);
  const statusBreakdown = useMemo(() => statusFields.map((s) => ({
    label: s.label,
    Selesai: houses.filter((h) => h.status[s.key]).length,
    Belum: houses.length - houses.filter((h) => h.status[s.key]).length,
  })), [houses, statusFields]);

  const clusterDuplicateCount = useMemo(() => houses.filter((h) => isDuplicateKavling(h)).length, [houses]);

  const followUpList = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const in7Str = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    return houses
      .filter((h) => h.followUpDate && h.followUpDate <= in7Str)
      .map((h) => ({ ...h, overdue: h.followUpDate < todayStr }))
      .sort((a, b) => (a.followUpDate < b.followUpDate ? -1 : 1));
  }, [houses]);

  // Peringatan lintas-cluster di Home: follow-up jatuh tempo & nomor
  // kavling duplikat, dipakaikan dari globalHousesIndex yang sudah
  // dimuat untuk pencarian blok (tidak ada panggilan jaringan baru).
  const homeFollowUpList = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const in7Str = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const list = [];
    clusters.forEach((c) => {
      (globalHousesIndex[c.id] || []).forEach((h) => {
        if (h.followUpDate && h.followUpDate <= in7Str) {
          list.push({ ...h, clusterId: c.id, clusterName: c.name, overdue: h.followUpDate < todayStr });
        }
      });
    });
    return list.sort((a, b) => (a.followUpDate < b.followUpDate ? -1 : 1));
  }, [clusters, globalHousesIndex]);

  // Sama seperti homeFollowUpList tapi tanpa batas 7 hari ke depan —
  // dipakai kalender supaya bulan lain tetap bisa menampilkan follow-up-nya.
  const homeAllFollowUpList = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const list = [];
    clusters.forEach((c) => {
      (globalHousesIndex[c.id] || []).forEach((h) => {
        if (h.followUpDate) list.push({ ...h, clusterId: c.id, clusterName: c.name, overdue: h.followUpDate < todayStr });
      });
    });
    return list;
  }, [clusters, globalHousesIndex]);

  const followUpsByDate = useMemo(() => {
    const map = {};
    homeAllFollowUpList.forEach((h) => {
      if (!map[h.followUpDate]) map[h.followUpDate] = [];
      map[h.followUpDate].push(h);
    });
    return map;
  }, [homeAllFollowUpList]);

  const homeDuplicateList = useMemo(() => {
    const list = [];
    clusters.forEach((c) => {
      const chouses = globalHousesIndex[c.id] || [];
      const counts = {};
      chouses.forEach((h) => { const key = `${h.blok}-${h.noKavling}`; counts[key] = (counts[key] || 0) + 1; });
      chouses.forEach((h) => {
        const key = `${h.blok}-${h.noKavling}`;
        if (counts[key] > 1) list.push({ ...h, clusterId: c.id, clusterName: c.name });
      });
    });
    return list;
  }, [clusters, globalHousesIndex]);

  const SmallSpinner = () => (
    <span style={{
      display: "inline-block", width: 12, height: 12, borderRadius: "50%",
      border: `2px solid ${C.line}`, borderTopColor: C.accent,
      animation: "bria-spin 0.7s linear infinite", verticalAlign: "middle",
    }} />
  );

  const loadingScreen = (label) => (
    <div style={{ minHeight: "100vh", background: C.paper, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <span style={{
        display: "inline-block", width: 22, height: 22, borderRadius: "50%",
        border: `3px solid ${C.line}`, borderTopColor: C.accent,
        animation: "bria-spin 0.7s linear infinite",
      }} />
      <span className="text-sm" style={{ color: C.steel }}>{label}</span>
    </div>
  );
  if (!homeLoaded) return loadingScreen("Memuat data...");
  if (currentClusterId && !clusterLoaded) return loadingScreen("Memuat cluster...");

  const activeCluster = clusters.find((c) => c.id === currentClusterId) || { name: "", subtitle: "" };
  const draftCentroid = draft ? centroid(draft.points) : null;

  // Kolom yang dibekukan (tetap terlihat saat tabel digeser ke samping):
  // No, kotak centang, dan Kavling. Posisi kiri tiap kolom = jumlah lebar
  // kolom beku sebelumnya yang sedang tampil.
  const FROZEN_KEYS = ["no", "select", "kavling"];
  const rowBg = (h) => (selectedRows.includes(h.id) ? C.alertAmberBg : selectedId === h.id ? C.rowSelectedBg : C.panel);
  const frozenLeft = {};
  let frozenAcc = 0;
  FROZEN_KEYS.forEach((k) => { frozenLeft[k] = frozenAcc; if (!hiddenCols.includes(k)) frozenAcc += colWidth(k); });

  const board = {
    FROZEN_KEYS, KAVLING_SEARCH_LIMIT, SmallSpinner, actionMenuId, activeBlock, activeCluster, activeTipe, addBlock, addCluster, addKategori, addStatus, addTipe, appTitle, applyRestoreAll, avgMarginPct, blockColor, blockProgress, blocks, bulkDelete, bulkDeleteArmed, bulkSetFollowUp, bulkSetKategori, bulkSetStatus, bulkSetTipe, calendarMonth, calendarSelectedDate, calibrating, canEdit, cancelDrawing, cancelEditShape, clusterDuplicateCount, clusterImages, clusterSearch, clusterStats, clusters, colWidth, colorMode, columns, confirmDeleteBlokId, confirmDeleteClusterId, confirmDeleteId, confirmDeleteKategoriName, confirmDeleteStatusKey, confirmDeleteTipeName, currentClusterId, currentPage, dashboardPos, deleteCluster, detailEditingKey, dirty, displayName, draft, draftCentroid, drawingPoints, duplicateFilterActive, duplicateHouse, editMap, editPoints, editingShapeId, exportAllBackup, exportAllExcel, exportBackup, exportExcel, exportingBackupAll, exportingExcelAll, finalHppPerM2, finishPolygon, followUpFilterActive, followUpList, followUpView, followUpsByDate, frozenLeft, getDetail, globalHousesIndex, goHome, goMode, handleImageClick, handleImageUpload, handleLogoutClick, handleRestoreAllFile, handleTouchEnd, handleTouchMove, handleTouchStart, handleWheelZoom, hargaJualTotal, hiddenCols, homeAllFollowUpList, homeDirty, homeDuplicateList, homeFollowUpList, homeSavedToast, homeSaving, houses, hppTotal, imgUploading, imgWrapRef, importBackup, importExcel, importMsg, isDuplicateKavling, isIncomplete, kategoriOptions, kavlingSearch, kavlingSearchAllMatches, kavlingSearchResults, lastBackupAt, lastDeleted, lastDeletedBulk, luasBangunanOf, mapHeight, mapPct, marginOf, marginPct, marginPerTipe, mode, monthEditingKey, moveStatusField, newBlock, newClusterName, newClusterSubtitle, newKategori, newStatus, newStatusHasDetail, newTipe, newTipeLuas, opacity, openCluster, openKavlingFromSearch, pageRows, pageSize, pendingRestoreAll, planBoxRef, polyColor, polygonsClickable, priceEditingKey, printKavlingSummary, printReportPDF, printSitePlan, progressPerBlok, rangeEnd, rangeStart, recoverLegacyCluster, refreshTipeColors, rekapKontraktor, reloadAfterRemoteUpdate, remoteUpdateAvailable, removeBlock, removeHouse, removeKategori, removeStatusField, removeTipe, renameBlock, renameKategori, renameStatusLabel, renameTipe, resetColWidths, resetImage, restoreAllError, restoreAllResult, restoringAll, rowBg, rowRef, rowRefs, saveAppTitle, saveConflict, saveEditShape, saveHomeChanges, saveHouses, savedToast, saving, selectFromMap, selectedId, selectedRows, setActionMenuId, setActiveBlock, setActiveTipe, setAppTitle, setBulkDeleteArmed, setCalendarMonth, setCalendarSelectedDate, setClusterSearch, setClusters, setColorMode, setConfirmDeleteBlokId, setConfirmDeleteClusterId, setConfirmDeleteId, setConfirmDeleteKategoriName, setConfirmDeleteStatusKey, setConfirmDeleteTipeName, setCurrentPage, setDashboardPos, setDetail, setDetailEditingKey, setDraft, setDrawingPoints, setDuplicateFilterActive, setEditMap, setEditPoints, setEditingShapeId, setFollowUpFilterActive, setFollowUpView, setHomeDirty, setImportMsg, setKavlingSearch, setMapHeight, setMonthEditingKey, setNewBlock, setNewClusterName, setNewClusterSubtitle, setNewKategori, setNewStatus, setNewStatusHasDetail, setNewTipe, setNewTipeLuas, setOpacity, setPageSize, setPendingRestoreAll, setPriceEditingKey, setRestoreAllResult, setSelectedId, setSelectedRows, setShowArchivedClusters, setShowCharts, setShowColMenu, setShowRekapKontraktor, setShowSimulasi, setShowWhatsNew, setSimHargaMode, setSimHargaValue, setSimHppMode, setSimHppValue, setSimScope, setTableBlocks, setTableSearchQuery, setTableStatusFilter, setTableTipes, setTableZoom, setTextEditingKey, setZoom, settingsMsg, showArchivedClusters, showCharts, showColMenu, simHargaMode, simHargaValue, simHppMode, simHppValue, simScope, siteImage, soldUnits, sortDir, sortKey, startColResize, startDrag, startEditShape, startHeightDrag, startVertexDrag, statusBreakdown, statusFields, submitDraft, subtitleWidth, tableBlocks, tableRows, tableSearchQuery, tableStatusFilter, tableTipes, tableZoom, textEditingKey, tipeColor, tipeOptions, tipePie, toggleArchiveCluster, toggleColHidden, togglePinCluster, toggleRowSelect, toggleSort, toggleStatusDetail, toggleTableBlock, toggleTableTipe, totalMargin, totalPages, totalRows, totalTarget, undoBulkDelete, undoDelete, undoPoint, updateBlockTarget, updateClusterMeta, updateHouse, updateStatus, updateTipeLuas, zoom,
  };

  return (
    <BoardContext.Provider value={board}>
    <div style={{ background: C.paper, minHeight: "100%", fontFamily: "Inter, sans-serif" }} className="p-4">
      <style>{`
        * { box-sizing: border-box; }
        table.dataTbl th, table.dataTbl td { padding: 2px 6px; border-bottom: 1px solid ${C.line}; font-size: 12px; white-space: nowrap; }
        table.dataTbl th { text-align: center; color: ${C.steel}; font-weight: 500; background: ${C.paper}; position: sticky; top: 0; will-change: transform; }
        .inspector-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
        .inspector-cols > div + div { border-left: 1px solid ${C.line}; padding-left: 24px; }
        @media (max-width: 1000px) {
          .inspector-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .inspector-cols > div + div { border-left: none; padding-left: 0; }
        }
        @media (max-width: 680px) {
          .inspector-cols { grid-template-columns: minmax(0, 1fr); gap: 0; }
          .inspector-cols > div + div { border-left: none; padding-left: 0; }
        }
        table.dataTbl tr:hover td { background: ${C.rowSelectedBg} !important; }
        table.dataTbl input[type=checkbox] { accent-color: ${C.green}; width: 14px; height: 14px; }
        table.dataTbl th { z-index: 3; }
        table.dataTbl th.frz { z-index: 4; }
        table.dataTbl td.frz { position: sticky; z-index: 2; }
        table.dataTbl tr:hover .kavling-link { text-decoration-color: currentColor; }
        input[type=range] { accent-color: ${C.accent}; }
        .col-resize-handle:hover { background: ${C.accent}33; }
        .col-resize-handle:active { background: ${C.accent}55; }
        .editable-heading:hover, .editable-heading:focus { border-bottom-color: ${C.line} !important; }
        @media (max-width: 680px) {
          .map-data-row { flex-direction: column; }
          .panel-resize-handle { display: none !important; }
          .map-panel-col { flex-basis: 100% !important; min-width: 0 !important; padding-right: 0 !important; }
          .inspector-panel-col { flex-basis: 100% !important; min-width: 0 !important; padding-left: 0 !important; }
        }
      `}</style>

      <datalist id="kontraktor-options">
        {kontraktorNames.map((n) => <option key={n} value={n} />)}
      </datalist>

      {isOffline && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 101,
            background: C.amber, color: "#fff", padding: "8px 14px",
            fontSize: 12, textAlign: "center", fontWeight: 500,
          }}
        >
          ⚠ Anda sedang offline — perubahan mungkin tidak tersimpan sampai koneksi internet kembali.
        </div>
      )}

      {storageError && (
        <div
          style={{
            position: "fixed", bottom: 16, right: 16, zIndex: 100, maxWidth: 320,
            background: C.red, color: "#fff", padding: "10px 14px", borderRadius: 10,
            fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          }}
        >
          ⚠ {storageError}
        </div>
      )}

      {!currentClusterId && homeLoaded && showWhatsNew && <WhatsNewModal />}

      {currentClusterId && showSimulasi && <SimulasiModal />}

      {currentClusterId && showRekapKontraktor && <RekapKontraktorModal />}

      {!currentClusterId ? <HomeScreen /> : (
      <>
      <ClusterHeader />

      {/* ===================== PENGATURAN ===================== */}
      {mode === "pengaturan" && !canEdit && (
        <div className="mb-3 p-2.5 rounded-xl text-xs" style={{ background: C.infoBlueBg, border: `1px solid ${C.line}`, color: C.steel }}>
          View Mode — pengaturan di halaman ini tidak bisa diubah dari akun ini.
        </div>
      )}
      {mode === "pengaturan" && <SettingsPanel />}

      {/* ===================== MAIN MODE: peta + dashboard sebaris, lalu detail kavling ===================== */}
      {mode === "kerja" && <MainLayout />}

      {/* ===================== TABLE (Main Mode & Data Mode) — full width ===================== */}
      {(mode === "kerja" || mode === "data") && <DataTable />}

      </>
      )}
    </div>
    </BoardContext.Provider>
  );
}
