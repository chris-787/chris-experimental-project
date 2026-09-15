import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense, lazy } from "react";
import { storage } from "./lib/storage";
import { supabase } from "./lib/supabaseClient";
import { onStorageError } from "./lib/errorBus";
import { formatJakartaDateTime, useJakartaClock } from "./lib/jakartaClock";
import { C, PALETTE } from "./theme";

// Grafik dashboard (recharts) baru diunduh saat benar-benar ditampilkan,
// bukan di awal buka aplikasi — recharts lumayan besar dan tidak semua
// orang langsung lihat dashboard-nya.
const DashboardCharts = lazy(() => import("./DashboardCharts"));

const SITE_IMAGE_DEFAULT = "/default-site-plan.jpg";
const MAX_IMG_DIM = 1600;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

const DEFAULT_BLOCKS = [
  { id: "blk-a", name: "RB/A", target: 16 }, { id: "blk-b", name: "RB/B", target: 11 }, { id: "blk-c", name: "RB/C", target: 11 },
  { id: "blk-d", name: "RB/D", target: 20 }, { id: "blk-e", name: "RB/E", target: 2 }, { id: "blk-f", name: "RB/F", target: 16 },
  { id: "blk-g", name: "RB/G", target: 13 }, { id: "blk-h", name: "RB/H", target: 18 }, { id: "blk-i", name: "RB/I", target: 10 },
  { id: "blk-j", name: "RB/J", target: 10 },
];
const DEFAULT_TIPE = [
  { id: "tp-5x12", name: "Standar 5x12", color: "#2E6F9E", luasBangunan: 0 },
  { id: "tp-6x12", name: "Standar 6x12", color: "#C1622D", luasBangunan: 0 },
  { id: "tp-sudut", name: "Sudut", color: "#3D8361", luasBangunan: 0 },
  { id: "tp-khusus", name: "Khusus", color: "#8B4F9F", luasBangunan: 0 },
];
const DEFAULT_STATUS = [
  { key: "terjual", label: "Terjual", hasDetail: false }, { key: "marketingOrder", label: "Order Marketing", hasDetail: false },
  { key: "pancang", label: "Pancang", hasDetail: false }, { key: "spkOrder", label: "Order SPK", hasDetail: false },
  { key: "acOrder", label: "Order AC", hasDetail: true },
];
const DEFAULT_KATEGORI = ["Rumah Massal", "Rumah Contoh", "Kavling"];

const HOUSES_KEY_BASE = "bria-houses-v2";
const CONFIG_KEY_BASE = "bria-config-v1";
const IMAGE_KEY_BASE = "bria-siteplan-image";
const TABLE_LAYOUT_KEY = "bria-table-layout-v1";
const TABLE_FILTER_KEY_BASE = "bria-table-filter-v1";
function tableFilterKeyFor(id) { return id === LEGACY_CLUSTER_ID ? TABLE_FILTER_KEY_BASE : `${TABLE_FILTER_KEY_BASE}:${id}`; }
const CLUSTERS_INDEX_KEY = "clusters-index-v1";
const APP_TITLE_KEY = "app-title-v1";
const LAST_CLUSTER_KEY = "last-cluster-v1";
const LAST_BACKUP_KEY = "last-backup-v1";
const LEGACY_CLUSTER_ID = "bria-legacy";
function housesKeyFor(id) { return id === LEGACY_CLUSTER_ID ? HOUSES_KEY_BASE : `${HOUSES_KEY_BASE}:${id}`; }
function configKeyFor(id) { return id === LEGACY_CLUSTER_ID ? CONFIG_KEY_BASE : `${CONFIG_KEY_BASE}:${id}`; }
function imageKeyFor(id) { return id === LEGACY_CLUSTER_ID ? IMAGE_KEY_BASE : `${IMAGE_KEY_BASE}:${id}`; }

const rupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
function centroid(points) {
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
  return { cx, cy };
}
function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
      style={{ borderColor: active ? C.accent : C.line, background: active ? C.accent : "#fff", color: active ? "#fff" : C.steel }}>
      {children}
    </button>
  );
}
function Field({ label, children }) {
  return (<div className="mb-2"><div className="text-xs mb-1" style={{ color: C.steel }}>{label}</div>{children}</div>);
}
function StatusRow({ label, value, onToggle }) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer select-none">
      <span className="text-sm" style={{ color: C.ink }}>{label}</span>
      <span onClick={onToggle} className="w-9 h-5 rounded-full relative transition-colors" style={{ background: value ? C.green : C.faint }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: value ? 18 : 2 }} />
      </span>
    </label>
  );
}
const cellInput = { width: "100%", minWidth: 80, padding: "4px 6px", fontSize: 12, border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: "'IBM Plex Mono', monospace", color: C.ink, background: "#fff" };
const formInput = { width: "100%", padding: "6px 8px", fontSize: 13, border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: "'IBM Plex Mono', monospace", color: C.ink, background: "#fff" };

function resizeImageFile(file, maxDim) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function BriaStatusBoard({ onLogout }) {
  const now = useJakartaClock();
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

  const [mode, setMode] = useState("input"); // input | kerja | dashboard | pengaturan
  const [activeBlock, setActiveBlock] = useState(DEFAULT_BLOCKS[0].name);
  const [activeTipe, setActiveTipe] = useState(DEFAULT_TIPE[0].name);
  const [colorMode, setColorMode] = useState("terjual");
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
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
  const [followUpFilterActive, setFollowUpFilterActive] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenCols, setHiddenCols] = useState([]);
  const [colWidths, setColWidths] = useState({});
  const [showColMenu, setShowColMenu] = useState(false);

  const DEFAULT_COL_WIDTH = { select: 34, kavling: 90, tipe: 120, kategori: 140, kontraktor: 150, noSpk: 150, thSpk: 75, blnSpk: 75, luasBangunan: 90, hpp: 160, adendum: 110, hargaJual: 160, margin: 120, catatan: 160, aksi: 170 };
  function colWidth(key) {
    const w = colWidths[key] || DEFAULT_COL_WIDTH[key] || (key === "acOrder" ? 170 : 90);
    if (key === "select") return w;
    return Math.max(60, w);
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
  const [mapPct, setMapPct] = useState(62);
  const [dashboardPos, setDashboardPos] = useState("bawah"); // "bawah" | "kanan" — hanya berlaku di Mode Kalibrasi
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
      try {
        const layout = await storage.get(TABLE_LAYOUT_KEY, false);
        if (layout && layout.value) {
          const parsedLayout = JSON.parse(layout.value);
          if (parsedLayout.colWidths) setColWidths(parsedLayout.colWidths);
          if (parsedLayout.hiddenCols) setHiddenCols(parsedLayout.hiddenCols);
        }
      } catch (e) {}
      try {
        const at = await storage.get(APP_TITLE_KEY, false);
        if (at && at.value) setAppTitle(at.value);
      } catch (e) {}
      let idxRaw = null;
      try {
        const idx = await storage.get(CLUSTERS_INDEX_KEY, false);
        idxRaw = idx && idx.value;
      } catch (e) { idxRaw = null; }

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
        const lb = await storage.get(LAST_BACKUP_KEY, false);
        if (lb && lb.value) setLastBackupAt(Number(lb.value));
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
    setDraft(null); setDrawingPoints([]); setMode("input"); setFollowUpFilterActive(false);
    setHousesUpdatedAt(null); setSaveConflict(false); setRemoteUpdateAvailable(false);
    try {
      const h = await storage.get(housesKeyFor(id), false);
      if (h && h.value) setHouses(JSON.parse(h.value));
      setHousesUpdatedAt(h ? h.updatedAt : null);
    } catch (e) {}
    try {
      const img = await storage.get(imageKeyFor(id), false);
      if (img && img.value) setSiteImage(img.value);
    } catch (e) {}
    try {
      const cfg = await storage.get(configKeyFor(id), false);
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
    const id = newClusterId();
    const entry = { id, name: name || "Cluster Baru", subtitle: subtitle || "" };
    setClusters((prev) => { const next = [...prev, entry]; saveClustersIndex(next); return next; });
    openCluster(id);
  }
  function updateClusterMeta(id, patch) {
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
    setClusters((prev) => { const next = prev.filter((c) => c.id !== id); saveClustersIndex(next); return next; });
    storage.delete(housesKeyFor(id), false).catch(() => {});
    storage.delete(configKeyFor(id), false).catch(() => {});
    storage.delete(imageKeyFor(id), false).catch(() => {});
    if (currentClusterId === id) goHome();
  }
  function saveAppTitle(next) {
    storage.set(APP_TITLE_KEY, next, false).catch((e) => console.error(e));
  }
  async function saveHomeChanges() {
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
    try {
      await storage.set(configKeyFor(currentClusterId), JSON.stringify({
        blocks: next.blocks ?? blocks, tipeOptions: next.tipeOptions ?? tipeOptions,
        statusFields: next.statusFields ?? statusFields, kategoriOptions: next.kategoriOptions ?? kategoriOptions,
      }), false);
    } catch (e) { console.error(e); }
  }

  function addHouse(record) { setHouses((prev) => { const next = [...prev, record]; saveHouses(next); return next; }); }
  function removeHouse(id) {
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
    if (!lastDeleted) return;
    setHouses((prev) => { const next = [...prev, lastDeleted]; saveHouses(next); return next; });
    setLastDeleted(null);
    clearTimeout(undoTimerRef.current);
  }
  function startEditShape(id) {
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
  function updateHouse(id, patch) { setHouses((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch, lastEditedAt: Date.now() } : h))); setDirty(true); }
  function timeAgo(ts) {
    if (!ts) return null;
    const diffMs = Date.now() - ts;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam lalu`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} hari lalu`;
    return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }
  function updateStatus(id, key, value) {
    setHouses((prev) => prev.map((h) => (h.id === id ? { ...h, status: { ...h.status, [key]: value }, lastEditedAt: Date.now() } : h)));
    setDirty(true);
  }


  // ---- config management ----
  function toggleRowSelect(id) {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function bulkSetKategori(kategori) {
    if (!kategori) return;
    setHouses((prev) => { const next = prev.map((h) => (selectedRows.includes(h.id) ? { ...h, kategori } : h)); saveHouses(next); return next; });
  }
  function bulkSetTipe(tipe) {
    if (!tipe) return;
    setHouses((prev) => { const next = prev.map((h) => (selectedRows.includes(h.id) ? { ...h, tipe } : h)); saveHouses(next); return next; });
  }
  function bulkSetStatus(key, value) {
    setHouses((prev) => { const next = prev.map((h) => (selectedRows.includes(h.id) ? { ...h, status: { ...h.status, [key]: value } } : h)); saveHouses(next); return next; });
  }
  function bulkSetFollowUp(date) {
    setHouses((prev) => { const next = prev.map((h) => (selectedRows.includes(h.id) ? { ...h, followUpDate: date || null } : h)); saveHouses(next); return next; });
  }
  function bulkDelete() {
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
    if (!lastDeletedBulk) return;
    setHouses((prev) => { const next = [...prev, ...lastDeletedBulk]; saveHouses(next); return next; });
    setLastDeletedBulk(null);
    clearTimeout(bulkUndoTimerRef.current);
  }
  function duplicateHouse(id) {
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
    if (!newBlock.name) return;
    if (blocks.some((b) => b.name === newBlock.name)) { setSettingsMsg(`Nama blok "${newBlock.name}" sudah dipakai.`); return; }
    const next = [...blocks, { id: newBlockId(), name: newBlock.name, target: Number(newBlock.target) || 0 }];
    setBlocks(next); saveConfig({ blocks: next }); setNewBlock({ name: "", target: "" });
    setTableBlocks((prev) => [...prev, newBlock.name]);
  }
  const [settingsMsg, setSettingsMsg] = useState("");
  function removeBlock(id) {
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
    const next = blocks.map((b) => (b.id === id ? { ...b, target: Number(target) || 0 } : b));
    setBlocks(next); saveConfig({ blocks: next });
  }
  function addTipe() {
    if (!newTipe) return;
    if (tipeOptions.some((t) => t.name === newTipe)) { setSettingsMsg(`Nama tipe "${newTipe}" sudah dipakai.`); return; }
    const color = PALETTE[tipeOptions.length % PALETTE.length];
    const next = [...tipeOptions, { id: `tp-${Date.now().toString(36)}${Math.random().toString(36).slice(-4)}`, name: newTipe, color, luasBangunan: Number(newTipeLuas) || 0 }];
    setTipeOptions(next); saveConfig({ tipeOptions: next }); setNewTipe(""); setNewTipeLuas("");
    setTableTipes((prev) => [...prev, newTipe]);
  }
  function updateTipeLuas(name, luas) {
    const next = tipeOptions.map((t) => (t.name === name ? { ...t, luasBangunan: Number(luas) || 0 } : t));
    setTipeOptions(next); saveConfig({ tipeOptions: next });
  }
  function renameTipe(oldName, newName) {
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
    const next = tipeOptions.map((t, i) => ({ ...t, color: PALETTE[i % PALETTE.length] }));
    setTipeOptions(next); saveConfig({ tipeOptions: next });
  }
  function addStatus() {
    if (!newStatus) return;
    const key = newStatus.trim().replace(/\s+/g, "_").toLowerCase() + "_" + Date.now().toString(36).slice(-4);
    const next = [...statusFields, { key, label: newStatus, hasDetail: newStatusHasDetail }];
    setStatusFields(next); saveConfig({ statusFields: next }); setNewStatus(""); setNewStatusHasDetail(false);
  }
  function removeStatusField(key) {
    const next = statusFields.filter((s) => s.key !== key);
    setStatusFields(next); saveConfig({ statusFields: next });
  }
  function toggleStatusDetail(key) {
    const next = statusFields.map((s) => (s.key === key ? { ...s, hasDetail: !s.hasDetail } : s));
    setStatusFields(next); saveConfig({ statusFields: next });
  }
  function renameStatusLabel(key, newLabel) {
    newLabel = newLabel.trim();
    if (!newLabel) return;
    const next = statusFields.map((s) => (s.key === key ? { ...s, label: newLabel } : s));
    setStatusFields(next); saveConfig({ statusFields: next });
  }
  function moveStatusField(key, dir) {
    const idx = statusFields.findIndex((s) => s.key === key);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= statusFields.length) return;
    const next = [...statusFields];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setStatusFields(next); saveConfig({ statusFields: next });
  }
  function getDetail(h, key) { return (h.details && h.details[key]) || ""; }
  function setDetail(houseId, key, value) {
    setHouses((prev) => prev.map((h) => (h.id === houseId ? { ...h, details: { ...(h.details || {}), [key]: value } } : h)));
    setDirty(true);
  }
  function addKategori() {
    if (!newKategori) return;
    if (kategoriOptions.includes(newKategori)) { setSettingsMsg(`Kategori "${newKategori}" sudah ada.`); return; }
    const next = [...kategoriOptions, newKategori];
    setKategoriOptions(next); saveConfig({ kategoriOptions: next }); setNewKategori("");
  }
  function renameKategori(oldName, newName) {
    newName = newName.trim();
    if (!newName || newName === oldName) return;
    if (kategoriOptions.includes(newName)) { setSettingsMsg(`Kategori "${newName}" sudah ada.`); return; }
    const next = kategoriOptions.map((k) => (k === oldName ? newName : k));
    setKategoriOptions(next); saveConfig({ kategoriOptions: next });
    setHouses((prev) => { const nextHouses = prev.map((h) => (h.kategori === oldName ? { ...h, kategori: newName } : h)); saveHouses(nextHouses); return nextHouses; });
    setSettingsMsg("");
  }
  function removeKategori(name) {
    const next = kategoriOptions.filter((k) => k !== name);
    setKategoriOptions(next); saveConfig({ kategoriOptions: next });
  }

  // ---- drawing ----
  function handleImageClick(e) {
    if (mode !== "input" || draft || editingShapeId || actionMenuId) return;
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
    setSiteImage(currentClusterId === LEGACY_CLUSTER_ID ? SITE_IMAGE_DEFAULT : null);
    try { await storage.delete(imageKeyFor(currentClusterId), false); } catch (e) {}
  }

  const [importMsg, setImportMsg] = useState("");
  function importExcel(e) {
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
    if (!pendingRestoreAll) return;
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

  function blockColor(name) {
    const idx = blocks.findIndex((b) => b.name === name);
    return PALETTE[(idx < 0 ? 0 : idx) % PALETTE.length];
  }
  function tipeColor(name) { return tipeOptions.find((t) => t.name === name)?.color || C.steel; }
  function luasBangunanOf(h) { return tipeOptions.find((t) => t.name === h.tipe)?.luasBangunan || 0; }
  function isDuplicateKavling(h) { return houses.filter((x) => x.blok === h.blok && x.noKavling === h.noKavling).length > 1; }
  function isIncomplete(h) { return !luasBangunanOf(h) || !h.hppPerM2 || !h.hargaJualPerM2; }
  function getSortValue(h, key) {
    if (statusFields.some((s) => s.key === key)) return h.status[key] ? 1 : 0;
    switch (key) {
      case "kavling": return `${h.blok}-${String(h.noKavling).padStart(4, "0")}`;
      case "tipe": return h.tipe || "";
      case "kategori": return h.kategori || "";
      case "noSpk": return h.spkNo || "";
      case "thSpk": return h.spkTahun || 0;
      case "blnSpk": return h.spkBulan || 0;
      case "luasBangunan": return luasBangunanOf(h);
      case "hpp": return h.hppPerM2 || 0;
      case "adendum": return h.adendumAmount || 0;
      case "hargaJual": return h.hargaJualPerM2 || 0;
      case "margin": return luasBangunanOf(h) ? marginPct(h) : -Infinity;
      default: return "";
    }
  }
  function toggleSort(key) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortKey(null); setSortDir("asc"); }
    } else { setSortKey(key); setSortDir("asc"); }
  }
  function hppTotal(h) { const lb = luasBangunanOf(h); return (h.hppPerM2 && lb) ? h.hppPerM2 * lb : 0; }
  function hargaJualTotal(h) { const lb = luasBangunanOf(h); return (h.hargaJualPerM2 && lb) ? h.hargaJualPerM2 * lb : 0; }
  function finalHpp(h) { return hppTotal(h) + (h.adendum ? (h.adendumAmount || 0) : 0); }
  function finalHppPerM2(h) { const lb = luasBangunanOf(h); return lb ? finalHpp(h) / lb : 0; }
  function marginOf(h) { const hj = hargaJualTotal(h); return hj - finalHpp(h); }
  function marginPct(h) { const hj = hargaJualTotal(h); return hj ? (marginOf(h) / hj) * 100 : 0; }
  function polyColor(h) {
    if (mode === "input") return tipeColor(h.tipe);
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
  const polygonsClickable = mode === "kerja" || (mode === "input" && drawingPoints.length === 0 && !draft && !editingShapeId);

  const columns = useMemo(() => ([
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
  }, [houses, tableBlocks, tableTipes, tableStatusFilter, tableSearchQuery, followUpFilterActive, sortKey, sortDir]);

  useEffect(() => { setCurrentPage(1); }, [tableBlocks, tableTipes, tableStatusFilter, tableSearchQuery, pageSize]);

  useEffect(() => {
    function onKeyDown(e) {
      if (mode !== "kerja" || !selectedId) return;
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
  }, [mode, selectedId, tableRows]);
  const totalRows = tableRows.length;
  const effectivePageSize = pageSize === "all" ? Math.max(totalRows, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalRows / effectivePageSize));
  const pageRows = pageSize === "all" ? tableRows : tableRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = totalRows === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const rangeEnd = Math.min(currentPage * effectivePageSize, totalRows);

  const soldUnits = houses.filter((h) => h.status.terjual);
  const totalMargin = houses.reduce((s, h) => s + marginOf(h), 0);
  function aggregateMarginPct(units) {
    const sumHarga = units.reduce((s, h) => s + hargaJualTotal(h), 0);
    const sumHpp = units.reduce((s, h) => s + finalHpp(h), 0);
    return sumHarga ? ((sumHarga - sumHpp) / sumHarga) * 100 : 0;
  }
  const avgMarginPct = aggregateMarginPct(houses);
  const totalTarget = blocks.reduce((s, b) => s + (Number(b.target) || 0), 0);

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

  const followUpList = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const in7Str = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    return houses
      .filter((h) => h.followUpDate && h.followUpDate <= in7Str)
      .map((h) => ({ ...h, overdue: h.followUpDate < todayStr }))
      .sort((a, b) => (a.followUpDate < b.followUpDate ? -1 : 1));
  }, [houses]);

  const SmallSpinner = () => (
    <span style={{
      display: "inline-block", width: 12, height: 12, borderRadius: "50%",
      border: `2px solid ${C.line}`, borderTopColor: C.accent,
      animation: "bria-spin 0.7s linear infinite", verticalAlign: "middle",
    }} />
  );

  if (!homeLoaded) return <div className="p-8 text-sm" style={{ color: C.steel }}>Memuat data...</div>;
  if (currentClusterId && !clusterLoaded) return <div className="p-8 text-sm" style={{ color: C.steel }}>Memuat cluster...</div>;

  const activeCluster = clusters.find((c) => c.id === currentClusterId) || { name: "", subtitle: "" };
  const draftCentroid = draft ? centroid(draft.points) : null;

  const dashboardJSX = (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold" style={{ color: C.ink }}>Dashboard</div>
            <button onClick={printReportPDF} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: C.accent, color: "#fff" }}>🖨️ Cetak / Simpan sebagai PDF</button>
          </div>

          {followUpList.length > 0 && (
            <div className="mb-3 p-3 rounded-lg" style={{ background: "#FFF7E8", border: `1px solid ${C.amber}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold" style={{ color: C.ink }}>Perlu Ditindaklanjuti ({followUpList.length})</div>
                <button
                  onClick={() => { setFollowUpFilterActive(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: C.amber, color: "#fff" }}
                >Lihat di tabel →</button>
              </div>
              <div className="flex flex-col gap-1">
                {followUpList.slice(0, 8).map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs">
                    <span onClick={() => setSelectedId(h.id)} style={{ color: C.ink, cursor: "pointer", textDecoration: "underline" }}>{h.blok}-{h.noKavling}</span>
                    <span style={{ color: h.overdue ? C.red : C.steel, fontFamily: "IBM Plex Mono, monospace" }}>
                      {h.overdue ? "Lewat tenggat — " : ""}{new Date(h.followUpDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
                {followUpList.length > 8 && <div className="text-xs" style={{ color: C.steel }}>+{followUpList.length - 8} lainnya</div>}
              </div>
            </div>
          )}
          <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {[
              { label: "Kavling Terpetakan", value: `${houses.length} / ${totalTarget}` },
              { label: "Sudah Terjual", value: `${soldUnits.length} / ${houses.length}` },
              ...(statusFields.some((s) => s.key === "spkOrder") ? [{ label: statusFields.find((s) => s.key === "spkOrder").label, value: `${houses.filter((h) => h.status.spkOrder).length} / ${houses.length}` }] : []),
              ...(statusFields.some((s) => s.key === "marketingOrder") ? [{ label: statusFields.find((s) => s.key === "marketingOrder").label, value: `${houses.filter((h) => h.status.marketingOrder).length} / ${houses.length}` }] : []),
              { label: "Total Margin", value: rupiah(totalMargin) },
              { label: "Rata-rata Margin %", value: `${avgMarginPct.toFixed(2)}%` },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 12, color: C.steel, marginBottom: 3 }}>{s.label}</div>
                <div className="text-base font-semibold" style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {marginPerTipe.some((t) => t.n > 0) && (
            <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
              {marginPerTipe.filter((t) => t.n > 0).map((t) => (
                <div key={t.tipe} className="p-3 rounded-xl" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 11, color: C.steel, marginBottom: 3 }}>Margin {t.tipe}</div>
                  <div className="text-base font-semibold" style={{ color: t.margin >= 0 ? C.green : C.red, fontFamily: "IBM Plex Mono, monospace" }}>{t.margin}%</div>
                </div>
              ))}
            </div>
          )}

          <Suspense fallback={<div style={{ minHeight: 150 }} />}>
            <DashboardCharts
              C={C}
              progressPerBlok={progressPerBlok}
              marginPerTipe={marginPerTipe}
              statusBreakdown={statusBreakdown}
              tipePie={tipePie}
              tipeColor={tipeColor}
            />
          </Suspense>
        </div>
  );

  const mapPanelJSX = (
    <div className="rounded-xl p-3 mb-4" style={{ background: C.panel, border: `1px solid ${C.line}`, position: "relative" }}>
        <div className="rounded-xl p-3 mb-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div>
              <div className="text-sm font-medium" style={{ color: C.ink }}>Site Plan</div>
              <div className="text-xs" style={{ color: C.steel }}>Cubit layar atau tekan Ctrl + scroll untuk zoom cepat</div>
            </div>
            {siteImage && (
            <div className="flex items-center gap-2 flex-wrap">
              {mode === "input" && drawingPoints.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: C.ink }}>{drawingPoints.length} titik</span>
                  <button onClick={undoPoint} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: "#fff" }}>Undo</button>
                  <button onClick={finishPolygon} disabled={drawingPoints.length < 3} className="text-xs px-2 py-1 rounded-lg" style={{ background: drawingPoints.length < 3 ? C.faint : C.green, color: "#fff" }}>Selesai Poligon</button>
                  <button onClick={cancelDrawing} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: "#fff" }}>Batal</button>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <button onClick={() => setZoom((z) => Math.max(50, z - 5))} className="w-7 h-7 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}>−</button>
                <div className="flex items-center h-7 rounded-lg" style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
                  <input
                    type="number"
                    value={zoom}
                    onChange={(e) => setZoom(Math.min(400, Math.max(50, Number(e.target.value) || 100)))}
                    onDoubleClick={() => setZoom(100)}
                    title="Klik 2x untuk kembali ke 100%"
                    style={{ width: 42, textAlign: "right", border: "none", outline: "none", fontSize: 12, color: C.steel, padding: "0 2px 0 6px" }}
                  />
                  <span className="text-xs pr-2" style={{ color: C.steel }}>%</span>
                </div>
                <button onClick={() => setZoom((z) => Math.min(400, z + 5))} className="w-7 h-7 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}>+</button>
                {selectedId && (
                  <button onClick={() => setSelectedId(null)} title="Hapus highlight kavling terpilih" className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: "#fff" }}>Clear</button>
                )}
              </div>
            </div>
            )}
          </div>

          {!siteImage ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16" style={{ border: `1px dashed ${C.line}`, borderRadius: 8, background: C.paper }}>
              <div className="text-sm" style={{ color: C.steel }}>Cluster ini belum punya gambar site plan.</div>
              <label className="text-xs px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: C.accent, color: "#fff" }}>
                {imgUploading ? "Mengunggah..." : "Unggah Gambar Site Plan"}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={imgUploading} />
              </label>
            </div>
          ) : (
          <div
            style={{ overflow: "auto", maxHeight: 640, border: `1px solid ${C.line}`, borderRadius: 8, touchAction: "pan-x pan-y" }}
            onWheel={handleWheelZoom}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div ref={imgWrapRef} style={{ position: "relative", display: "grid", width: `${zoom}%`, cursor: mode === "input" ? "crosshair" : "default" }} onClick={handleImageClick}>
              <img src={siteImage} alt="Site plan" style={{ gridArea: "1 / 1", width: "100%", display: "block", userSelect: "none" }} draggable={false} />
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ gridArea: "1 / 1", width: "100%", height: "100%" }}>
                {houses.filter((h) => h.id !== editingShapeId).map((h) => (
                  <React.Fragment key={h.id}>
                    {selectedId === h.id && (
                      <polygon
                        points={h.points.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none" stroke={C.gold} strokeWidth="3.5" strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }}
                      />
                    )}
                    <polygon points={h.points.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill={polyColor(h)} fillOpacity={opacity / 100}
                      stroke="#00000066" strokeWidth="0.2"
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: polygonsClickable ? "auto" : "none", cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mode === "input") { setActionMenuId(h.id); setSelectedId(h.id); }
                        else selectFromMap(h.id);
                      }}>
                      <title>{`${h.blok}-${h.noKavling}`}</title>
                    </polygon>
                  </React.Fragment>
                ))}
                {editingShapeId && editPoints && (
                  <polygon points={editPoints.map((p) => `${p.x},${p.y}`).join(" ")} fill={C.accent} fillOpacity="0.3" stroke={C.accent} strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                )}
                {editingShapeId && editPoints && editPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="0.6" fill="#fff" stroke={C.accent} strokeWidth="0.3" vectorEffect="non-scaling-stroke"
                    style={{ cursor: "grab" }} onMouseDown={(e) => startVertexDrag(i, e)} />
                ))}
                {drawingPoints.length > 0 && (
                  <polyline points={drawingPoints.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={C.red} strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                )}
                {drawingPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="0.3" fill={C.red} stroke="#fff" strokeWidth="0.1" vectorEffect="non-scaling-stroke" />)}
                {draft && (
                  <polygon points={draft.points.map((p) => `${p.x},${p.y}`).join(" ")} fill={C.red} fillOpacity="0.35" stroke={C.red} strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
                )}
              </svg>
              {actionMenuId && mode === "input" && (() => {
                const target = houses.find((h) => h.id === actionMenuId);
                if (!target) return null;
                const { cx, cy } = centroid(target.points);
                return (
                  <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, transform: "translate(10px, 10px)", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 11, width: 190 }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: C.ink }}>{target.blok}-{target.noKavling}</div>
                    <div className="flex flex-col gap-1.5">
                      <button onClick={() => startEditShape(target.id)} className="text-xs px-2 py-1.5 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Edit Bentuk</button>
                      <button onClick={() => { setConfirmDeleteId(target.id); setActionMenuId(null); }} className="text-xs px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${C.red}`, color: C.red }}>Hapus</button>
                      <button onClick={() => setActionMenuId(null)} className="text-xs px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </div>
                  </div>
                );
              })()}
              {confirmDeleteId && mode === "input" && (() => {
                const target = houses.find((h) => h.id === confirmDeleteId);
                if (!target) return null;
                const { cx, cy } = centroid(target.points);
                return (
                  <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, transform: "translate(10px, 10px)", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 11, width: 200 }}>
                    <div className="text-xs mb-2" style={{ color: C.ink }}>Hapus kavling <b>{target.blok}-{target.noKavling}</b>?</div>
                    <div className="flex gap-2">
                      <button onClick={() => { removeHouse(confirmDeleteId); setConfirmDeleteId(null); }} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </div>
                  </div>
                );
              })()}
              {draft && draftCentroid && (
                <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: `${draftCentroid.cx}%`, top: `${draftCentroid.cy}%`, transform: "translate(12px, 12px)", width: 220, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 10 }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: C.ink }}>Kavling baru — {activeBlock} · {draft.tipe}</div>
                  <Field label="Nomor Kavling"><input autoFocus style={formInput} value={draft.noKavling} onChange={(e) => setDraft({ ...draft, noKavling: e.target.value })} placeholder="mis. 01" /></Field>
                  <div className="text-xs mt-1" style={{ color: C.steel }}>
                    Luas Bangunan: <b style={{ color: C.ink }}>{tipeOptions.find((t) => t.name === draft.tipe)?.luasBangunan || 0} m²</b> (ikut Tipe aktif, atur di Pengaturan)
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={submitDraft} className="text-xs px-2 py-1.5 rounded-lg flex-1" style={{ background: C.accent, color: "#fff" }}>Tambahkan</button>
                    <button onClick={() => setDraft(null)} className="text-xs px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
            {mode === "input" ? (
              tipeOptions.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: t.color }} /> {t.name}
                </div>
              ))
            ) : colorMode === "blok" ? (
              blocks.map((b) => (
                <div key={b.id} className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: blockColor(b.name) }} /> {b.name}
                </div>
              ))
            ) : colorMode === "tipe" ? (
              tipeOptions.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: t.color }} /> {t.name}
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}><span className="w-3 h-3 rounded-sm inline-block" style={{ background: C.green }} /> Sudah</div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}><span className="w-3 h-3 rounded-sm inline-block" style={{ background: C.red }} /> Belum</div>
              </>
            )}
          </div>
        </div>
        {editingShapeId && (
          <div style={{ position: "absolute", top: 56, right: 24, background: "#fff", border: `1px solid ${C.accent}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 20 }}>
            <div className="text-xs mb-1.5" style={{ color: C.ink }}>Geser titik sudutnya di peta, lalu:</div>
            <div className="flex gap-2">
              <button onClick={saveEditShape} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.green, color: "#fff" }}>Selesai</button>
              <button onClick={cancelEditShape} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
            </div>
          </div>
        )}
    </div>
  );

  function InspectorPanel() {
    if (mode === "input") {
      return null;
    }
    if (!selectedId) {
      return <div className="text-sm py-8 text-center" style={{ color: C.steel }}>Klik salah satu kavling di peta untuk mengisi datanya.</div>;
    }
    const h = houses.find((x) => x.id === selectedId);
    if (!h) return <div className="text-sm py-8 text-center" style={{ color: C.steel }}>Kavling tidak ditemukan.</div>;
    const idx = tableRows.findIndex((x) => x.id === selectedId);
    const prevRow = tableRows[idx - 1];
    const nextRow = tableRows[idx + 1];
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base font-semibold" style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{h.blok}-{h.noKavling}</div>
            {h.lastEditedAt && <div className="text-xs" style={{ color: C.steel }}>Terakhir diubah: {timeAgo(h.lastEditedAt)}</div>}
            <div className="text-xs" style={{ color: C.faint }}>Tips: ← → untuk pindah, Esc untuk tutup</div>
          </div>
          <div className="flex gap-1">
            <button disabled={!prevRow} onClick={() => prevRow && selectFromMap(prevRow.id)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: prevRow ? C.ink : C.faint }}>&lsaquo; Prev</button>
            <button disabled={!nextRow} onClick={() => nextRow && selectFromMap(nextRow.id)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: nextRow ? C.ink : C.faint }}>Next &rsaquo;</button>
            <button onClick={() => setSelectedId(null)} title="Tutup / hapus highlight" className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>✕</button>
          </div>
        </div>

        <Field label="Tipe / Ukuran">
          <select style={formInput} value={h.tipe} onChange={(e) => updateHouse(h.id, { tipe: e.target.value })}>
            {tipeOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </Field>

        <Field label="Kategori">
          <select style={formInput} value={h.kategori} onChange={(e) => updateHouse(h.id, { kategori: e.target.value })}>
            {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>

        <div className="my-2 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          {statusFields.map((s) => (
            <React.Fragment key={s.key}>
              <StatusRow label={s.label} value={!!h.status[s.key]} onToggle={() => { const next = !h.status[s.key]; updateStatus(h.id, s.key, next); if (s.hasDetail && next) setDetailEditingKey(`${h.id}:${s.key}`); }} />
              {s.hasDetail && h.status[s.key] && (
                <div className="mb-2 mt-1 p-2 rounded-lg" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                  <div className="text-xs mb-1" style={{ color: C.steel }}>Detail {s.label}</div>
                  {detailEditingKey === `${h.id}:${s.key}` ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        style={{ ...formInput, fontFamily: "Inter, sans-serif" }}
                        value={getDetail(h, s.key)}
                        onChange={(e) => setDetail(h.id, s.key, e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") setDetailEditingKey(null); }}
                        placeholder={`mis. keterangan ${s.label.toLowerCase()}`}
                      />
                      <button onClick={() => setDetailEditingKey(null)} className="text-xs px-2 py-1.5 rounded-lg shrink-0" style={{ background: C.accent, color: "#fff" }}>Selesai</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setDetailEditingKey(`${h.id}:${s.key}`)}
                      style={{ fontSize: 13, color: getDetail(h, s.key) ? C.ink : C.steel, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: "#fff" }}
                    >
                      {getDetail(h, s.key) || `Klik untuk isi detail ${s.label.toLowerCase()}`}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          {textEditingKey === `${h.id}:kontraktor` || !h.kontraktor ? (
            <Field label="Kontraktor">
              <input autoFocus={textEditingKey === `${h.id}:kontraktor`} style={formInput} value={h.kontraktor || ""} onChange={(e) => { setTextEditingKey(`${h.id}:kontraktor`); updateHouse(h.id, { kontraktor: e.target.value }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Kontraktor</div>
              <div onClick={() => setTextEditingKey(`${h.id}:kontraktor`)} style={{ fontSize: 13, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: "#fff" }}>{h.kontraktor}</div>
            </div>
          )}
          {textEditingKey === `${h.id}:spkNo` || !h.spkNo ? (
            <Field label="No. SPK">
              <input autoFocus={textEditingKey === `${h.id}:spkNo`} style={formInput} value={h.spkNo || ""} onChange={(e) => { setTextEditingKey(`${h.id}:spkNo`); updateHouse(h.id, { spkNo: e.target.value }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>No. SPK</div>
              <div onClick={() => setTextEditingKey(`${h.id}:spkNo`)} style={{ fontSize: 13, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: "#fff" }}>{h.spkNo}</div>
            </div>
          )}
          {textEditingKey === `${h.id}:spkTahun` || !h.spkTahun ? (
            <Field label="Tahun SPK">
              <input autoFocus={textEditingKey === `${h.id}:spkTahun`} type="number" style={formInput} value={h.spkTahun || ""} onChange={(e) => { setTextEditingKey(`${h.id}:spkTahun`); const v = e.target.value; updateHouse(h.id, { spkTahun: v === "" ? null : Number(v) }); }} onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Tahun SPK</div>
              <div onClick={() => setTextEditingKey(`${h.id}:spkTahun`)} style={{ fontSize: 13, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: "#fff", fontFamily: "IBM Plex Mono, monospace" }}>{h.spkTahun}</div>
            </div>
          )}
          {monthEditingKey === h.id || !h.spkBulan ? (
            <Field label="Bulan SPK (1-12)">
              <input autoFocus={monthEditingKey === h.id} type="number" min="1" max="12" style={formInput} value={h.spkBulan || ""} onChange={(e) => { setMonthEditingKey(h.id); const v = e.target.value; updateHouse(h.id, { spkBulan: v === "" ? null : Math.min(12, Math.max(1, Number(v))) }); }} onKeyDown={(e) => { if (e.key === "Enter") setMonthEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Bulan SPK</div>
              <div onClick={() => setMonthEditingKey(h.id)} style={{ fontSize: 13, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: "#fff" }}>
                {MONTHS[h.spkBulan - 1]}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-xs mb-2" style={{ color: C.steel }}>
              Luas Bangunan: <b style={{ color: C.ink }}>{luasBangunanOf(h)} m²</b> <span style={{ color: C.steel }}>(ikut Tipe "{h.tipe}", atur di Pengaturan)</span>
            </div>
          </div>
          {priceEditingKey === `${h.id}:hpp` || !h.hppPerM2 ? (
            <Field label="HPP per m² (Rp)">
              <input autoFocus={priceEditingKey === `${h.id}:hpp`} type="number" min="0" style={formInput} value={h.hppPerM2 || ""} onChange={(e) => { setPriceEditingKey(`${h.id}:hpp`); updateHouse(h.id, { hppPerM2: Number(e.target.value) || 0 }); }} onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-3">
              <div className="text-xs mb-1" style={{ color: C.steel }}>HPP per m² (Rp)</div>
              <div onClick={() => setPriceEditingKey(`${h.id}:hpp`)} style={{ fontSize: 13, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: "#fff" }}>
                {rupiah(h.hppPerM2)}{luasBangunanOf(h) ? <> → Total: <b>{rupiah(hppTotal(h))}</b></> : <span style={{ color: C.amber }}> — atur LB Tipe ini dulu di Pengaturan</span>}
              </div>
            </div>
          )}
          <StatusRow label="Ada Adendum" value={h.adendum} onToggle={() => updateHouse(h.id, { adendum: !h.adendum })} />
          {h.adendum && (
            <Field label="Jumlah Adendum (+/- Rp)">
              <input type="number" style={formInput} value={h.adendumAmount || ""} onChange={(e) => updateHouse(h.id, { adendumAmount: Number(e.target.value) || 0 })} />
              <div className="text-xs mt-1" style={{ color: h.adendumAmount < 0 ? C.red : C.steel }}>{h.adendumAmount ? rupiah(h.adendumAmount) : "Rp 0"}</div>
            </Field>
          )}
          {priceEditingKey === `${h.id}:harga` || !h.hargaJualPerM2 ? (
            <Field label="Harga Jual per m² (Rp)">
              <input autoFocus={priceEditingKey === `${h.id}:harga`} type="number" min="0" style={formInput} value={h.hargaJualPerM2 || ""} onChange={(e) => { setPriceEditingKey(`${h.id}:harga`); updateHouse(h.id, { hargaJualPerM2: Number(e.target.value) || 0 }); }} onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }} />
            </Field>
          ) : (
            <div className="mb-3">
              <div className="text-xs mb-1" style={{ color: C.steel }}>Harga Jual per m² (Rp)</div>
              <div onClick={() => setPriceEditingKey(`${h.id}:harga`)} style={{ fontSize: 13, color: C.ink, cursor: "pointer", padding: "6px 8px", border: `1px dashed ${C.line}`, borderRadius: 8, background: "#fff" }}>
                {rupiah(h.hargaJualPerM2)}{luasBangunanOf(h) ? <> → Total: <b>{rupiah(hargaJualTotal(h))}</b></> : <span style={{ color: C.amber }}> — atur LB Tipe ini dulu di Pengaturan</span>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
          {luasBangunanOf(h) > 0 && (
            <div className="flex justify-between text-xs mb-2" style={{ color: C.steel }}>
              <span>HPP/m² efektif {h.adendum && h.adendumAmount ? "(termasuk adendum)" : ""}</span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink }}>{rupiah(Math.round(finalHppPerM2(h)))}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold" style={{ color: C.ink }}>Margin</span>
            {!luasBangunanOf(h) ? (
              <span className="text-xs" style={{ color: C.steel }}>atur Luas Bangunan Tipe</span>
            ) : (
              <span style={{ textAlign: "right" }}>
                <div className="text-base font-semibold" style={{ fontFamily: "IBM Plex Mono, monospace", color: marginOf(h) >= 0 ? C.green : C.red }}>{marginPct(h).toFixed(2)}%</div>
                <div className="text-xs" style={{ color: C.steel }}>{rupiah(marginOf(h))}</div>
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 mt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          <Field label="Catatan">
            <textarea
              value={h.catatan || ""}
              onChange={(e) => updateHouse(h.id, { catatan: e.target.value })}
              placeholder="Kondisi khusus, kendala lapangan, dll..."
              rows={2}
              style={{ ...formInput, resize: "vertical", fontFamily: "Inter, sans-serif" }}
            />
          </Field>
          <Field label="Tanggal Follow-up (opsional)">
            <input
              type="date"
              value={h.followUpDate || ""}
              onChange={(e) => updateHouse(h.id, { followUpDate: e.target.value || null })}
              style={formInput}
            />
          </Field>
        </div>

        <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
          {confirmDeleteId === h.id ? (
            <div className="flex gap-2">
              <button onClick={() => { removeHouse(h.id); setConfirmDeleteId(null); }} className="text-xs px-3 py-1.5 rounded-lg flex-1" style={{ background: C.red, color: "#fff" }}>Ya, Hapus Kavling Ini</button>
              <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDeleteId(h.id)} className="text-xs" style={{ color: C.red }}>Hapus Kavling Ini</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.paper, minHeight: "100%", fontFamily: "Inter, sans-serif" }} className="p-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        table.dataTbl th, table.dataTbl td { padding: 6px 8px; border-bottom: 1px solid ${C.line}; font-size: 12px; white-space: nowrap; }
        table.dataTbl th { text-align: center; color: ${C.steel}; font-weight: 500; background: ${C.paper}; position: sticky; top: 0; }
        table.dataTbl tr:hover td { background: #FAF8F2; }
        table.dataTbl tr:hover .kavling-link { text-decoration-color: currentColor; }
        input[type=range] { accent-color: ${C.accent}; }
        .col-resize-handle:hover { background: ${C.accent}33; }
        .col-resize-handle:active { background: ${C.accent}55; }
        .editable-heading:hover, .editable-heading:focus { border-bottom-color: ${C.line} !important; }
        @keyframes bria-spin { to { transform: rotate(360deg); } }
        @media (max-width: 680px) {
          .map-data-row { flex-direction: column; }
          .panel-resize-handle { display: none !important; }
          .map-panel-col { flex-basis: 100% !important; min-width: 0 !important; padding-right: 0 !important; }
          .inspector-panel-col { flex-basis: 100% !important; min-width: 0 !important; padding-left: 0 !important; }
        }
      `}</style>

      {isOffline && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 101,
            background: C.amber, color: "#fff", padding: "8px 14px",
            fontSize: 13, textAlign: "center", fontWeight: 500,
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
            fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          }}
        >
          ⚠ {storageError}
        </div>
      )}

      {!currentClusterId ? (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="mb-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <input
                value={appTitle}
                onChange={(e) => { setAppTitle(e.target.value); setHomeDirty(true); }}
                onBlur={() => saveAppTitle(appTitle)}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                className="text-2xl font-semibold editable-heading"
                title="Klik untuk edit judul"
                style={{ color: C.ink, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", flex: 1, minWidth: 200, padding: 0, fontFamily: "Inter, sans-serif" }}
              />
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                {homeSaving && <SmallSpinner />}
                {!homeSaving && homeDirty && <span className="text-xs" style={{ color: C.amber }}>Ada perubahan belum disimpan</span>}
                {!homeSaving && homeSavedToast && <span className="text-xs" style={{ color: C.green }}>Tersimpan ✓</span>}
                <button onClick={saveHomeChanges} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: C.accent, color: "#fff" }}>Simpan Perubahan</button>
                <button onClick={handleLogoutClick} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ border: `1px solid ${C.red}`, color: C.red, background: "#fff" }}>Log Out</button>
              </div>
            </div>
            <div className="text-sm mt-1" style={{ color: C.steel }}>Pilih cluster untuk mulai bekerja, atau tambah cluster baru.</div>
            <div className="text-xs mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.steel }}>{formatJakartaDateTime(now)}</div>
            {clusters.length === 0 && (
              <div className="mt-2 text-xs">
                <span style={{ color: C.steel }}>Tidak melihat data lama Anda? </span>
                <button onClick={recoverLegacyCluster} style={{ color: C.accent, textDecoration: "underline" }}>Coba pulihkan Cluster Bria</button>
              </div>
            )}
            {clusters.length > 0 && (() => {
              const daysSince = lastBackupAt ? Math.floor((Date.now() - lastBackupAt) / 86400000) : null;
              const shouldRemind = daysSince === null || daysSince >= 3;
              return shouldRemind ? (
                <div className="mt-2 text-xs" style={{ color: C.amber }}>
                  {daysSince === null ? "Belum pernah backup." : `Sudah ${daysSince} hari tidak backup.`} Yuk unduh cadangan biar aman.
                </div>
              ) : (
                <div className="mt-2 text-xs" style={{ color: C.faint }}>Terakhir backup: {daysSince === 0 ? "hari ini" : `${daysSince} hari lalu`}</div>
              );
            })()}
            {clusters.length > 0 && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button onClick={exportAllExcel} disabled={exportingExcelAll} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.green, background: "#fff" }}>
                  {exportingExcelAll && <SmallSpinner />} Export Semua ke Excel
                </button>
                <button onClick={exportAllBackup} disabled={exportingBackupAll} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.accent, background: "#fff" }}>
                  {exportingBackupAll && <SmallSpinner />} Unduh Cadangan Semua Cluster (JSON)
                </button>
                <label className="text-xs px-2 py-1 rounded-lg border cursor-pointer" style={{ borderColor: C.line, color: C.steel, background: "#fff" }}>
                  Pulihkan dari Cadangan (JSON)
                  <input type="file" accept=".json" onChange={handleRestoreAllFile} style={{ display: "none" }} />
                </label>
              </div>
            )}
            {restoreAllResult && (
              <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: "#F0F5FA", border: `1px solid ${C.line}`, color: C.ink, position: "relative" }}>
                <button
                  onClick={() => setRestoreAllResult(null)}
                  title="Tutup"
                  className="flex items-center justify-center"
                  style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 8, color: "#fff", background: C.steel, fontSize: 12, lineHeight: 1 }}
                >✕</button>
                <div style={{ paddingRight: 24 }}>
                  <div style={{ color: C.green }}>✓ {restoreAllResult.restored.length} cluster berhasil dipulihkan{restoreAllResult.restored.length ? `: ${restoreAllResult.restored.join(", ")}` : ""}</div>
                  {restoreAllResult.failed.length > 0 && (
                    <div style={{ color: C.amber, marginTop: 2 }}>✕ {restoreAllResult.failed.length} gagal dipulihkan: {restoreAllResult.failed.join(", ")} — coba ulangi khusus untuk cluster ini.</div>
                  )}
                </div>
              </div>
            )}
            {restoreAllError && (
              <div className="mt-2 text-xs" style={{ color: C.amber }}>{restoreAllError}</div>
            )}
            {pendingRestoreAll && (
              <div className="mt-2 p-3 rounded-lg text-xs" style={{ background: "#FFF7E8", border: `1px solid ${C.amber}` }}>
                <div style={{ color: C.ink, marginBottom: 8 }}>
                  File ini berisi <b>{pendingRestoreAll.length} cluster</b>: {pendingRestoreAll.map((c) => c.name).join(", ")}.<br />
                  Cluster yang masih ada sekarang (dicocokkan lewat ID internal, bukan nama) akan <b>ditimpa</b> datanya. Cluster yang sudah tidak ada akan dibuat ulang sebagai cluster baru. Lanjutkan?
                </div>
                <div className="flex gap-2">
                  <button onClick={applyRestoreAll} disabled={restoringAll} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: C.amber, color: "#fff" }}>
                    {restoringAll && <SmallSpinner />} Ya, Pulihkan
                  </button>
                  <button onClick={() => setPendingRestoreAll(null)} disabled={restoringAll} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="text-base font-semibold mb-2" style={{ color: C.ink }}>🔍 Pencarian Blok</div>
            <input
              value={kavlingSearch}
              onChange={(e) => setKavlingSearch(e.target.value)}
              placeholder="Cari nomor kavling di semua cluster... (mis. RB/A-11)"
              className="text-sm px-3 py-2 rounded-lg border w-full"
              style={{ borderColor: C.line, color: C.ink }}
            />
            {kavlingSearch.trim() && (
              <div className="mt-2 rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.panel, overflow: "hidden" }}>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {kavlingSearchResults.length === 0 ? (
                    <div className="text-xs p-3" style={{ color: C.steel }}>Tidak ditemukan.</div>
                  ) : (
                    kavlingSearchResults.map((r) => (
                      <div key={`${r.clusterId}-${r.house.id}`} className="flex items-center justify-between text-xs px-3 py-2" style={{ borderBottom: `1px solid ${C.line}` }}>
                        <div>
                          <div style={{ color: C.ink, fontWeight: 600, fontFamily: "IBM Plex Mono, monospace" }}>{r.kavlingLabel}</div>
                          <div style={{ color: C.steel }}>{r.clusterName}</div>
                        </div>
                        <button onClick={() => openKavlingFromSearch(r.clusterId, r.house.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.accent, color: "#fff", flexShrink: 0 }}>Buka</button>
                      </div>
                    ))
                  )}
                </div>
                {kavlingSearchAllMatches.length > KAVLING_SEARCH_LIMIT && (
                  <div className="text-xs px-3 py-2" style={{ color: C.steel, background: C.paper, borderTop: `1px solid ${C.line}` }}>
                    Menampilkan {KAVLING_SEARCH_LIMIT} dari {kavlingSearchAllMatches.length} hasil — ketik lebih spesifik untuk mempersempit.
                  </div>
                )}
              </div>
            )}
          </div>

          {clusters.length > 0 && Object.keys(clusterStats).length > 0 && (
            <div className="text-base font-semibold mb-2" style={{ color: C.ink }}>📊 Dashboard</div>
          )}
          {clusters.length > 0 && Object.keys(clusterStats).length > 0 && (() => {
            const totalSumHarga = Object.values(clusterStats).reduce((s, x) => s + (x.sumHarga || 0), 0);
            const totalSumHpp = Object.values(clusterStats).reduce((s, x) => s + (x.sumHpp || 0), 0);
            const overallMarginPct = totalSumHarga ? ((totalSumHarga - totalSumHpp) / totalSumHarga) * 100 : 0;
            return (
              <div className="mb-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                {[
                  { label: "Total Cluster", value: `${clusters.length}` },
                  { label: "Margin Keseluruhan", value: `${overallMarginPct.toFixed(2)}%` },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                    <div style={{ fontSize: 11, color: C.steel, marginBottom: 3 }}>{s.label}</div>
                    <div className="text-base font-semibold" style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {clusters.length > 0 && Object.keys(clusterStats).length > 0 && (
            <div className="mb-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {clusters
                .filter((c) => !c.archived && clusterStats[c.id] && clusterStats[c.id].marginByTipe.length > 0)
                .map((c) => {
                  const cs = clusterStats[c.id];
                  return (
                    <div key={c.id} className="p-3 rounded-xl" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                      <div className="text-sm font-medium mb-2" style={{ color: C.ink }}>
                        Margin {c.name} — <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>{cs.marginPct.toFixed(1)}%</span>
                        <span className="text-xs" style={{ color: C.steel, fontFamily: "Inter, sans-serif", fontWeight: 400 }}> · total {cs.total} unit</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {cs.marginByTipe.map((t) => (
                          <div key={t.tipe} className="flex items-center justify-between text-xs">
                            <span style={{ color: C.ink }}>{t.tipe} <span style={{ color: C.steel }}>· {t.n} unit</span></span>
                            <span style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{t.marginPct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="text-base font-semibold mb-2" style={{ color: C.ink }}>🏘️ Cluster</div>

          {clusters.filter((c) => !c.archived).length > 4 && (
            <input
              value={clusterSearch}
              onChange={(e) => setClusterSearch(e.target.value)}
              placeholder="Cari cluster..."
              className="text-sm px-3 py-2 rounded-lg border mb-3 w-full"
              style={{ borderColor: C.line, color: C.ink, maxWidth: 320 }}
            />
          )}

          <div className="mb-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {clusters
              .filter((c) => !c.archived)
              .filter((c) => !clusterSearch.trim() || `${c.name} ${c.subtitle}`.toLowerCase().includes(clusterSearch.trim().toLowerCase()))
              .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
              .map((c) => (
              <div key={c.id} className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${c.pinned ? C.accent : C.line}` }}>
                {clusterImages[c.id] ? (
                  <img src={clusterImages[c.id]} alt={c.name} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 10, border: `1px solid ${C.line}` }} />
                ) : (
                  <div className="flex items-center justify-center" style={{ width: "100%", height: 100, borderRadius: 8, marginBottom: 10, border: `1px dashed ${C.line}`, background: C.paper }}>
                    <span className="text-xs" style={{ color: C.faint }}>Belum ada site plan</span>
                  </div>
                )}
                {confirmDeleteClusterId === c.id ? (
                  <div>
                    <div className="text-xs mb-2" style={{ color: C.red }}>Hapus "{c.name}"? Semua data cluster ini (kavling, blok, tipe, gambar) akan hilang permanen.</div>
                    <div className="flex gap-2">
                      <button onClick={() => { deleteCluster(c.id); setConfirmDeleteClusterId(null); }} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                      <button onClick={() => setConfirmDeleteClusterId(null)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-1">
                      <input
                        value={c.name}
                        onChange={(e) => { setClusters((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x))); setHomeDirty(true); }}
                        onBlur={(e) => updateClusterMeta(c.id, { name: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-base font-semibold editable-heading"
                        style={{ color: C.ink, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", width: "100%", padding: 0, marginBottom: 2, fontFamily: "Inter, sans-serif" }}
                      />
                      <button onClick={() => togglePinCluster(c.id)} title={c.pinned ? "Lepas pin" : "Pin cluster ini"} style={{ color: c.pinned ? C.accent : C.faint, fontSize: 16, lineHeight: 1, flexShrink: 0 }}>★</button>
                    </div>
                    <input
                      value={c.subtitle}
                      onChange={(e) => { setClusters((prev) => prev.map((x) => (x.id === c.id ? { ...x, subtitle: e.target.value } : x))); setHomeDirty(true); }}
                      onBlur={(e) => updateClusterMeta(c.id, { subtitle: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Lokasi / catatan..."
                      className="text-xs editable-heading"
                      style={{ color: C.steel, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", width: "100%", padding: 0, marginBottom: 12, fontFamily: "Inter, sans-serif" }}
                    />
                    {clusterStats[c.id] && (
                      <div className="text-xs mb-3" style={{ color: C.steel, fontFamily: "IBM Plex Mono, monospace" }}>
                        {clusterStats[c.id].blockCount} blok · {clusterStats[c.id].marginPct.toFixed(1)}% margin
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button onClick={() => openCluster(c.id)} className="text-xs px-3 py-1.5 rounded-lg flex-1" style={{ background: C.accent, color: "#fff" }}>Buka Cluster</button>
                      <button onClick={() => toggleArchiveCluster(c.id)} title="Arsipkan (sembunyikan tanpa menghapus)" className="text-xs px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, background: "#fff" }}>Arsip</button>
                      <button onClick={() => setConfirmDeleteClusterId(c.id)} className="text-xs px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.red, background: "#fff" }}>Hapus</button>
                    </div>
                  </>
                )}
              </div>
            ))}

            <div className="rounded-xl p-4 flex flex-col items-center justify-center gap-2" style={{ border: `1px dashed ${C.line}`, minHeight: 120 }}>
              <input
                value={newClusterName}
                onChange={(e) => setNewClusterName(e.target.value)}
                placeholder="Nama cluster baru..."
                className="text-sm px-2 py-1.5 rounded-lg border w-full"
                style={{ borderColor: C.line, color: C.ink }}
              />
              <input
                value={newClusterSubtitle}
                onChange={(e) => setNewClusterSubtitle(e.target.value)}
                placeholder="Lokasi / catatan (opsional)..."
                className="text-xs px-2 py-1.5 rounded-lg border w-full"
                style={{ borderColor: C.line, color: C.ink }}
              />
              <button
                onClick={() => { if (!newClusterName.trim()) return; addCluster(newClusterName.trim(), newClusterSubtitle.trim()); setNewClusterName(""); setNewClusterSubtitle(""); }}
                className="text-xs px-3 py-1.5 rounded-lg w-full"
                style={{ background: C.green, color: "#fff" }}
              >+ Tambah Cluster Baru</button>
            </div>
          </div>

          {clusters.some((c) => c.archived) && (
            <div className="mt-2">
              <button onClick={() => setShowArchivedClusters((v) => !v)} className="text-xs" style={{ color: C.steel }}>
                {showArchivedClusters ? "▾" : "▸"} Cluster diarsipkan ({clusters.filter((c) => c.archived).length})
              </button>
              {showArchivedClusters && (
                <div className="mt-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                  {clusters.filter((c) => c.archived).map((c) => (
                    <div key={c.id} className="rounded-xl p-3 flex items-center justify-between gap-2" style={{ background: C.paper, border: `1px dashed ${C.line}` }}>
                      <div>
                        <div className="text-sm" style={{ color: C.steel }}>{c.name}</div>
                        <div className="text-xs" style={{ color: C.faint }}>{c.subtitle}</div>
                      </div>
                      <button onClick={() => toggleArchiveCluster(c.id)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.accent, background: "#fff", flexShrink: 0 }}>Buka Kembali</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
      <>
      {/* HEADER (bar atas ini "freeze" / nempel saat di-scroll) */}
      <div className="sticky top-0 z-30 -mx-5 -mt-5 px-5 pt-3 pb-3 mb-4" style={{ background: C.paper, borderBottom: `2px solid ${C.line}` }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors" style={{ borderColor: C.line, color: C.accent, background: "#fff" }}>← 🏠 Home</button>
            <div>
              <div className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.steel }}>{formatJakartaDateTime(now)}</div>
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, color: C.steel, textTransform: "uppercase" }}>
                {mode === "input" ? "Mode Kalibrasi" : mode === "kerja" ? "Mode Kerja" : "Pengaturan"} — {activeCluster.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving && <SmallSpinner />}
            {!saving && dirty && <span className="text-xs" style={{ color: C.amber }}>Ada perubahan belum disimpan</span>}
            {!saving && savedToast && <span className="text-xs" style={{ color: C.green }}>Tersimpan ✓</span>}
            <button onClick={() => saveHouses()} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: C.accent, color: "#fff" }}>
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <input
          value={activeCluster.name}
          onChange={(e) => setClusters((prev) => prev.map((c) => (c.id === currentClusterId ? { ...c, name: e.target.value } : c)))}
          onBlur={(e) => updateClusterMeta(currentClusterId, { name: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          className="text-lg font-semibold editable-heading"
          title="Klik untuk edit judul"
          style={{ color: C.ink, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", width: "100%", padding: 0, fontFamily: "Inter, sans-serif" }}
        />
        <div className="flex items-center gap-1">
          <input
            value={activeCluster.subtitle}
            onChange={(e) => setClusters((prev) => prev.map((c) => (c.id === currentClusterId ? { ...c, subtitle: e.target.value } : c)))}
            onBlur={(e) => updateClusterMeta(currentClusterId, { subtitle: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            className="text-sm editable-heading"
            title="Klik untuk edit subjudul"
            style={{ color: C.steel, background: "transparent", border: "none", borderBottom: "1px dashed transparent", outline: "none", fontFamily: "Inter, sans-serif", width: 220 }}
          />
          <span className="text-sm" style={{ color: C.steel }}>· target {totalTarget} unit, {blocks.length} blok</span>
        </div>
      </div>

      {saveConflict && (
        <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ background: "#FBEAE6", border: `1px solid ${C.red}` }}>
          <span className="text-xs" style={{ color: C.red }}>Gagal menyimpan — data ini sudah diubah oleh pengguna lain. Perubahan Anda masih ada di layar, tapi belum tersimpan.</span>
          <button onClick={reloadAfterRemoteUpdate} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.red, color: "#fff" }}>Muat Ulang</button>
        </div>
      )}
      {!saveConflict && remoteUpdateAvailable && (
        <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ background: "#FFF7E8", border: `1px solid ${C.amber}` }}>
          <span className="text-xs" style={{ color: C.amber }}>Ada pembaruan baru dari pengguna lain. Muat ulang untuk melihatnya (perubahan Anda yang belum disimpan akan hilang).</span>
          <button onClick={reloadAfterRemoteUpdate} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.amber}`, color: C.amber, background: "#fff" }}>Muat Ulang</button>
        </div>
      )}

      {/* TABS */}
      <div className="rounded-xl p-3 mb-4 flex flex-col gap-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
        <div className="flex gap-1.5 flex-wrap">
          <Chip active={mode === "input"} onClick={() => setMode("input")}>Mode Kalibrasi</Chip>
          <Chip active={mode === "kerja"} onClick={() => { setMode("kerja"); setDraft(null); setDrawingPoints([]); setEditingShapeId(null); setEditPoints(null); setActionMenuId(null); }}>Mode Kerja</Chip>
          <Chip active={mode === "pengaturan"} onClick={() => setMode("pengaturan")}>Pengaturan</Chip>
        </div>
        {mode === "input" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: C.steel }}>Blok aktif:</span>
            {blocks.map((b) => (
              <Chip key={b.id} active={activeBlock === b.name} onClick={() => setActiveBlock(b.name)}>
                {b.name} ({blockProgress.find((p) => p.name === b.name)?.placed || 0}/{b.target})
              </Chip>
            ))}
          </div>
        )}
        {mode === "input" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: C.steel }}>Tipe aktif:</span>
            {tipeOptions.map((t) => (
              <Chip key={t.id} active={activeTipe === t.name} onClick={() => setActiveTipe(t.name)}>
                {t.name}
              </Chip>
            ))}
          </div>
        )}
        {mode === "kerja" && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: C.steel }}>Warna peta:</span>
              <select value={colorMode} onChange={(e) => setColorMode(e.target.value)} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="blok">Per Blok</option>
                <option value="tipe">Per Tipe</option>
                {statusFields.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: C.steel }}>Opacity warna:</span>
              <input type="range" min="10" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} style={{ width: 100 }} />
              <span className="text-xs" style={{ color: C.steel, fontFamily: "IBM Plex Mono, monospace" }}>{opacity}%</span>
            </div>
            <button onClick={printSitePlan} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink, background: "#fff" }}>🖨️ Cetak Site Plan</button>
          </div>
        )}
      </div>
      {mode === "input" && (
        (blocks.length === 0 || tipeOptions.length === 0) ? (
          <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: C.amber, background: "#FFF7E8", border: `1px solid ${C.amber}` }}>
            Cluster ini belum punya {blocks.length === 0 && tipeOptions.length === 0 ? "Blok maupun Tipe" : blocks.length === 0 ? "Blok" : "Tipe"}. Tambahkan dulu lewat menu "Pengaturan" sebelum bisa menggambar kavling.
          </p>
        ) : (
          <p className="text-xs mb-3" style={{ color: C.steel }}>Pilih Blok & Tipe aktif di atas, lalu klik tiap sudut kavling mengikuti bentuknya (min. 3 titik), lalu "Selesai Poligon" dan isi nomor kavlingnya. Klik bentuk yang sudah ada untuk menghapusnya.</p>
        )
      )}

      {/* ===================== PENGATURAN ===================== */}
      {mode === "pengaturan" && (
        <div className="mb-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="text-sm font-medium mb-1" style={{ color: C.ink }}>Blok</div>
            <p className="text-xs mb-3" style={{ color: C.steel }}>Ganti nama di sini akan otomatis memindahkan semua kavling yang sudah dikalibrasi — tidak perlu gambar ulang di peta.</p>
            {settingsMsg && <div className="text-xs mb-3 p-2 rounded-lg" style={{ background: "#FFF7E8", color: C.amber, border: `1px solid ${C.amber}` }}>{settingsMsg}</div>}
            <div className="flex flex-col gap-2 mb-3">
              {blockProgress.map((b) => {
                const isDuplicateName = blocks.some((x) => x.id !== b.id && x.name === b.name);
                const canDelete = isDuplicateName || b.placed === 0;
                return (
                  <div key={b.id} className="flex items-center gap-2 text-sm py-1" style={{ borderBottom: `1px solid ${C.line}` }}>
                    <span className="w-3 h-3 rounded-sm inline-block shrink-0" style={{ background: blockColor(b.name) }} />
                    <input
                      defaultValue={b.name}
                      onBlur={(e) => renameBlock(b.id, e.target.value)}
                      style={{ ...cellInput, minWidth: 90, fontWeight: 600, borderColor: isDuplicateName ? C.red : C.line }}
                    />
                    <input
                      type="number"
                      value={b.target}
                      onChange={(e) => updateBlockTarget(b.id, e.target.value)}
                      style={{ ...cellInput, minWidth: 60, maxWidth: 70 }}
                      title="Target unit"
                    />
                    <span className="text-xs whitespace-nowrap" style={{ color: isDuplicateName ? C.red : C.steel }}>{b.placed} terpetakan{isDuplicateName ? " · nama duplikat" : ""}</span>
                    {confirmDeleteBlokId === b.id ? (
                      <span className="flex items-center gap-1 ml-auto">
                        <button onClick={() => { removeBlock(b.id); setConfirmDeleteBlokId(null); }} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                        <button onClick={() => setConfirmDeleteBlokId(null)} className="text-xs px-2 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteBlokId(b.id)}
                        disabled={!canDelete}
                        title={!canDelete ? `Masih ada ${b.placed} kavling di blok ini` : "Hapus blok"}
                        className="text-xs ml-auto"
                        style={{ color: canDelete ? C.red : C.faint, cursor: canDelete ? "pointer" : "not-allowed" }}
                      >Hapus</button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input placeholder="Nama blok, mis. RB/K" style={formInput} value={newBlock.name} onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })} />
              <input placeholder="Target unit" type="number" style={{ ...formInput, maxWidth: 100 }} value={newBlock.target} onChange={(e) => setNewBlock({ ...newBlock, target: e.target.value })} />
              <button onClick={addBlock} className="text-xs px-3 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Tambah</button>
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="text-sm font-medium mb-1" style={{ color: C.ink }}>Gambar Site Plan</div>
            <p className="text-xs mb-3" style={{ color: C.steel }}>Ganti dengan revisi terbaru kapan saja. Titik-titik kavling yang sudah dikalibrasi tetap tersimpan (posisinya persentase, jadi sesuaikan lagi kalau layout gambarnya berubah total).</p>
            <img src={siteImage} alt="Preview site plan" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.line}`, marginBottom: 10 }} />
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: C.accent, color: "#fff" }}>
                {imgUploading ? "Memproses..." : "Unggah Gambar Baru"}
                <input type="file" accept="image/*,.pdf" onChange={handleImageUpload} style={{ display: "none" }} disabled={imgUploading} />
              </label>
              {siteImage !== SITE_IMAGE_DEFAULT && (
                <button onClick={resetImage} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Kembalikan Gambar Bawaan</button>
              )}
            </div>
            <p className="text-xs mt-2" style={{ color: C.steel }}>Format gambar (JPG/PNG). Kalau file Anda masih PDF, screenshot atau export halamannya jadi gambar dulu.</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium" style={{ color: C.ink }}>Tipe / Ukuran Kavling</div>
              <button onClick={refreshTipeColors} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}>Segarkan Warna</button>
            </div>
            <p className="text-xs mb-3" style={{ color: C.steel }}>Luas Bangunan diatur di sini per tipe — kavling yang pakai tipe ini otomatis ikut nilainya, tidak perlu diisi satu-satu.</p>
            <div className="flex flex-col gap-1.5 mb-3">
              {tipeOptions.map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-sm py-1" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <span className="w-3 h-3 rounded-sm inline-block shrink-0" style={{ background: t.color }} />
                  <input
                    defaultValue={t.name}
                    onBlur={(e) => renameTipe(t.name, e.target.value)}
                    style={{ ...cellInput, width: "auto", flex: "0 1 140px", fontWeight: 600 }}
                  />
                  <input
                    type="number" min="0"
                    value={t.luasBangunan || ""}
                    onChange={(e) => updateTipeLuas(t.name, e.target.value)}
                    placeholder="Luas Bangunan m²"
                    style={{ ...cellInput, width: "auto", flex: "0 1 130px" }}
                  />
                  <span className="text-xs" style={{ color: C.steel }}>m²</span>
                  {confirmDeleteTipeName === t.name ? (
                    <span className="flex items-center gap-1 ml-auto">
                      <button onClick={() => { removeTipe(t.name); setConfirmDeleteTipeName(null); }} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                      <button onClick={() => setConfirmDeleteTipeName(null)} className="text-xs px-2 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDeleteTipeName(t.name)} className="text-xs ml-auto" style={{ color: C.red }}>Hapus</button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Tipe baru, mis. Standar 8x12" style={formInput} value={newTipe} onChange={(e) => setNewTipe(e.target.value)} />
              <input placeholder="Luas Bangunan m²" type="number" min="0" style={{ ...formInput, maxWidth: 140 }} value={newTipeLuas} onChange={(e) => setNewTipeLuas(e.target.value)} />
              <button onClick={addTipe} className="text-xs px-3 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Tambah</button>
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="text-sm font-medium mb-1" style={{ color: C.ink }}>Status yang Dilacak</div>
            <p className="text-xs mb-3" style={{ color: C.steel }}>Centang "Detail" kalau status ini butuh keterangan tambahan (kayak "Order AC" — muncul kotak isian begitu dicentang).</p>
            <div className="flex flex-col gap-1.5 mb-3">
              {statusFields.map((s, idx) => (
                <div key={s.key} className="flex items-center justify-between gap-3 text-sm py-1.5" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col">
                      <button onClick={() => moveStatusField(s.key, -1)} disabled={idx === 0} className="leading-none" style={{ color: idx === 0 ? C.faint : C.steel, fontSize: 10, cursor: idx === 0 ? "not-allowed" : "pointer" }}>▲</button>
                      <button onClick={() => moveStatusField(s.key, 1)} disabled={idx === statusFields.length - 1} className="leading-none" style={{ color: idx === statusFields.length - 1 ? C.faint : C.steel, fontSize: 10, cursor: idx === statusFields.length - 1 ? "not-allowed" : "pointer" }}>▼</button>
                    </div>
                    <input
                      defaultValue={s.label}
                      onBlur={(e) => renameStatusLabel(s.key, e.target.value)}
                      style={{ ...cellInput, width: "auto", flex: "0 1 180px", fontWeight: 600 }}
                    />
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs" style={{ color: C.steel }}>
                      <input type="checkbox" checked={!!s.hasDetail} onChange={() => toggleStatusDetail(s.key)} /> Detail
                    </label>
                    {confirmDeleteStatusKey === s.key ? (
                      <span className="flex items-center gap-1">
                        <button onClick={() => { removeStatusField(s.key); setConfirmDeleteStatusKey(null); }} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                        <button onClick={() => setConfirmDeleteStatusKey(null)} className="text-xs px-2 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmDeleteStatusKey(s.key)} className="text-xs" style={{ color: C.red }}>Hapus</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <input placeholder="Status baru, mis. Order Pagar" style={{ ...formInput, flex: 1, minWidth: 160 }} value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: C.steel }}>
                <input type="checkbox" checked={newStatusHasDetail} onChange={(e) => setNewStatusHasDetail(e.target.checked)} /> Punya detail
              </label>
              <button onClick={addStatus} className="text-xs px-3 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Tambah</button>
            </div>
            <p className="text-xs mt-2" style={{ color: C.steel }}>Kavling yang sudah ada otomatis dapat status baru = "belum", tinggal dicentang di tabel.</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="text-sm font-medium mb-3" style={{ color: C.ink }}>Kategori Rumah</div>
            <div className="flex flex-col gap-1.5 mb-3">
              {kategoriOptions.map((k) => (
                <div key={k} className="flex items-center justify-between gap-3 text-sm py-1" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <input
                    defaultValue={k}
                    onBlur={(e) => renameKategori(k, e.target.value)}
                    style={{ ...cellInput, width: "auto", flex: "0 1 180px" }}
                  />
                  {confirmDeleteKategoriName === k ? (
                    <span className="flex items-center gap-1">
                      <button onClick={() => { removeKategori(k); setConfirmDeleteKategoriName(null); }} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff" }}>Ya, Hapus</button>
                      <button onClick={() => setConfirmDeleteKategoriName(null)} className="text-xs px-2 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel }}>Batal</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDeleteKategoriName(k)} className="text-xs" style={{ color: C.red }}>Hapus</button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Kategori baru" style={formInput} value={newKategori} onChange={(e) => setNewKategori(e.target.value)} />
              <button onClick={addKategori} className="text-xs px-3 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Tambah</button>
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="text-sm font-medium mb-1" style={{ color: C.ink }}>Cadangkan / Pulihkan Data</div>
            <p className="text-xs mb-3" style={{ color: C.steel }}>Simpan salinan semua data (kavling, blok, tipe, status) ke file — supaya aman kalau ada perubahan besar pada aplikasinya. Lakukan ini sesering mungkin selagi masih sering ada pembaruan.</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={exportBackup} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Unduh Cadangan (JSON)</button>
              <label className="text-xs px-3 py-1.5 rounded-lg cursor-pointer" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                Pulihkan dari File
                <input type="file" accept="application/json" onChange={importBackup} style={{ display: "none" }} />
              </label>
            </div>
          </div>
        </div>
      )}


      {/* ===================== MAP + DATA (resizable; stacks on narrow windows) ===================== */}
      {(mode === "input" || mode === "kerja") && (
        <>
          {mode === "input" && (
            <div className="flex items-center justify-end mb-2">
              <button
                onClick={() => setDashboardPos((p) => (p === "bawah" ? "kanan" : "bawah"))}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}
              >
                Pindahkan Dashboard ke {dashboardPos === "bawah" ? "Kanan" : "Bawah"}
              </button>
            </div>
          )}
          <div ref={rowRef} className="map-data-row" style={{ display: "flex", flexWrap: "nowrap", gap: 0, marginBottom: 16 }}>
            {mode === "kerja" || dashboardPos === "kanan" ? (
              <>
                <div className="map-panel-col" style={{ flexBasis: `${mapPct}%`, flexGrow: 0, flexShrink: 0, minWidth: 320, paddingRight: 8 }}>
                  {mapPanelJSX}
                </div>
                <div
                  onMouseDown={startDrag}
                  title="Geser untuk mengubah lebar"
                  className="panel-resize-handle"
                  style={{ flex: "0 0 8px", cursor: "col-resize", background: C.line, borderRadius: 8, margin: "0 4px", alignSelf: "stretch", minHeight: 40 }}
                />
                <div className="inspector-panel-col" style={{ flex: "1 1 300px", minWidth: 300, paddingLeft: 8 }}>
                  {mode === "kerja" && (
                    <div className="rounded-xl p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                      {InspectorPanel()}
                    </div>
                  )}
                  {mode === "input" && dashboardPos === "kanan" && dashboardJSX}
                </div>
              </>
            ) : (
              <div style={{ width: "100%" }}>{mapPanelJSX}</div>
            )}
          </div>
        </>
      )}

      {/* ===================== TABLE (input & kerja) — full width below the row ===================== */}
      {(mode === "input" || mode === "kerja") && (
        <div className="rounded-xl p-3 mb-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          {followUpFilterActive && (
            <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ background: "#FFF7E8", border: `1px solid ${C.amber}` }}>
              <span className="text-xs" style={{ color: C.amber }}>Menampilkan hanya kavling yang perlu ditindaklanjuti.</span>
              <button onClick={() => setFollowUpFilterActive(false)} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.amber}`, color: C.amber, background: "#fff" }}>Tampilkan Semua</button>
            </div>
          )}
          {lastDeleted && (
            <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ background: "#FFF7E8", border: `1px solid ${C.amber}` }}>
              <span className="text-xs" style={{ color: C.amber }}>Kavling {lastDeleted.blok}-{lastDeleted.noKavling} dihapus.</span>
              <button onClick={undoDelete} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.amber, color: "#fff" }}>Undo</button>
            </div>
          )}
          {lastDeletedBulk && (
            <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ background: "#FFF7E8", border: `1px solid ${C.amber}` }}>
              <span className="text-xs" style={{ color: C.amber }}>{lastDeletedBulk.length} kavling dihapus.</span>
              <button onClick={undoBulkDelete} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.amber, color: "#fff" }}>Undo</button>
            </div>
          )}
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap mb-3 p-2 rounded-lg" style={{ background: "#EFF3F6", border: `1px solid ${C.accent}` }}>
              <span className="text-xs font-semibold" style={{ color: C.ink }}>{selectedRows.length} kavling dipilih</span>
              <select onChange={(e) => { bulkSetKategori(e.target.value); e.target.value = ""; }} defaultValue="" className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="" disabled>Set Kategori...</option>
                {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <select onChange={(e) => { bulkSetTipe(e.target.value); e.target.value = ""; }} defaultValue="" className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="" disabled>Set Tipe...</option>
                {tipeOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
              <select onChange={(e) => { const [key, val] = e.target.value.split(":"); if (key) bulkSetStatus(key, val === "true"); e.target.value = ""; }} defaultValue="" className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="" disabled>Set Status...</option>
                {statusFields.map((s) => (
                  <React.Fragment key={s.key}>
                    <option value={`${s.key}:true`}>{s.label}: Sudah</option>
                    <option value={`${s.key}:false`}>{s.label}: Belum</option>
                  </React.Fragment>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: C.steel }}>Follow-up:</span>
                <input type="date" onChange={(e) => { if (e.target.value) { bulkSetFollowUp(e.target.value); e.target.value = ""; } }} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }} />
              </div>
              {bulkDeleteArmed ? (
                <button onClick={() => { bulkDelete(); setBulkDeleteArmed(false); }} className="text-xs px-2 py-1 rounded-lg" style={{ color: "#fff", background: C.red }}>Yakin? Klik lagi untuk hapus {selectedRows.length} kavling</button>
              ) : (
                <button onClick={() => setBulkDeleteArmed(true)} className="text-xs px-2 py-1 rounded-lg" style={{ color: C.red, border: `1px solid ${C.red}`, background: "#fff" }}>Hapus Terpilih</button>
              )}
              <button onClick={() => { setSelectedRows([]); setBulkDeleteArmed(false); }} className="text-xs ml-auto" style={{ color: C.steel }}>Batal pilih</button>
            </div>
          )}
          <div className="mb-2">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs" style={{ color: C.steel, minWidth: 40 }}>Blok:</span>
              <button onClick={() => setTableBlocks(blocks.map((b) => b.name))} className="text-xs" style={{ color: C.accent }}>Select All</button>
              <span className="text-xs" style={{ color: C.line }}>|</span>
              <button onClick={() => setTableBlocks([])} className="text-xs" style={{ color: C.steel }}>Clear All</button>
              <div className="flex items-center gap-1.5 flex-wrap">
                {blocks.map((b) => (
                  <Chip key={b.id} active={tableBlocks.includes(b.name)} onClick={() => toggleTableBlock(b.name)}>{b.name}</Chip>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: C.steel, minWidth: 40 }}>Tipe:</span>
              <button onClick={() => setTableTipes(tipeOptions.map((t) => t.name))} className="text-xs" style={{ color: C.accent }}>Select All</button>
              <span className="text-xs" style={{ color: C.line }}>|</span>
              <button onClick={() => setTableTipes([])} className="text-xs" style={{ color: C.steel }}>Clear All</button>
              <div className="flex items-center gap-1.5 flex-wrap">
                {tipeOptions.map((t) => (
                  <Chip key={t.id} active={tableTipes.includes(t.name)} onClick={() => toggleTableTipe(t.name)}>{t.name}</Chip>
                ))}
              </div>
            </div>
          </div>
          {importMsg && (
            <div className="mb-2 p-2 rounded-lg text-xs" style={{ background: "#F0F5FA", border: `1px solid ${C.line}`, color: C.ink, position: "relative" }}>
              <button
                onClick={() => setImportMsg("")}
                title="Tutup"
                className="flex items-center justify-center"
                style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 8, color: "#fff", background: C.steel, fontSize: 12, lineHeight: 1 }}
              >✕</button>
              <div style={{ paddingRight: 24 }}>
                {typeof importMsg === "string" ? (
                  <div>{importMsg}</div>
                ) : (
                  <div>
                    <div style={{ color: C.green }}>✓ {importMsg.updated.length} diperbarui: {importMsg.updated.length ? importMsg.updated.join(", ") : "-"}</div>
                    {importMsg.skipped.length > 0 && (
                      <div style={{ color: C.amber, marginTop: 2 }}>✕ {importMsg.skipped.length} dilewati (tidak ditemukan di cluster ini): {importMsg.skipped.join(", ")}</div>
                    )}
                  </div>
                )}
                <div style={{ color: C.steel, marginTop: 4 }}>Tips: gunakan file hasil "Export Excel" sebagai template, edit kolomnya, lalu import lagi — kavling dicocokkan lewat kolom "Kavling".</div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium" style={{ color: C.ink }}>Data Blok ({tableRows.length})</div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs" style={{ color: C.steel }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, display: "inline-block" }} /> No. duplikat</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: C.steel }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, display: "inline-block" }} /> Data belum lengkap</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Cari nomor kavling... (mis. A-11)"
                className="text-xs px-2 py-1 rounded-lg border"
                style={{ borderColor: C.line, color: C.ink, minWidth: 180 }}
              />
              <select value={tableStatusFilter} onChange={(e) => setTableStatusFilter(e.target.value)} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value="semua">Semua Status</option>
                {statusFields.map((s) => (
                  <React.Fragment key={s.key}>
                    <option value={`${s.key}:true`}>{s.label}: Sudah</option>
                    <option value={`${s.key}:false`}>{s.label}: Belum</option>
                  </React.Fragment>
                ))}
              </select>
              <button onClick={exportExcel} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.green, background: "#fff" }}>Export Excel</button>
              <label className="text-xs px-2 py-1 rounded-lg border cursor-pointer" style={{ borderColor: C.line, color: C.accent, background: "#fff" }}>
                Import Excel/CSV
                <input type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} style={{ display: "none" }} />
              </label>
              <button onClick={resetColWidths} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.steel, background: "#fff" }}>Reset</button>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowColMenu((v) => !v)} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink, background: "#fff" }}>Kolom</button>
                {showColMenu && (
                  <div style={{ position: "absolute", right: 0, top: "110%", zIndex: 20, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 180, maxHeight: 260, overflowY: "auto" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: C.ink }}>Tampilkan kolom</div>
                    {columns.filter((c) => c.key !== "kavling" && c.key !== "aksi" && c.key !== "select").map((c) => (
                      <label key={c.key} className="flex items-center gap-2 text-xs py-1" style={{ color: C.ink }}>
                        <input type="checkbox" checked={!hiddenCols.includes(c.key)} onChange={() => toggleColHidden(c.key)} />
                        {c.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto", maxHeight: 480, overflowY: "auto" }}>
            <table className="dataTbl w-full" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                {columns.map((c) => (
                  <col key={c.key} style={{ width: colWidth(c.key), visibility: hiddenCols.includes(c.key) ? "collapse" : "visible" }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} style={{ position: "relative", borderRight: (c.key !== "aksi" && c.key !== "select") ? `1px solid ${C.line}` : "none" }}>
                      {c.key === "aksi" ? c.label : c.key === "select" ? (
                        <input
                          type="checkbox"
                          checked={pageRows.length > 0 && pageRows.every((h) => selectedRows.includes(h.id))}
                          onChange={(e) => setSelectedRows(e.target.checked ? pageRows.map((h) => h.id) : [])}
                          title="Pilih semua di halaman ini"
                        />
                      ) : (
                        <span onClick={() => toggleSort(c.key)} style={{ cursor: "pointer" }} title="Klik untuk urutkan">
                          {c.label}{sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                        </span>
                      )}
                      {c.key !== "aksi" && c.key !== "select" && (
                        <span
                          onMouseDown={(e) => startColResize(c.key, e)}
                          title="Geser untuk ubah lebar kolom"
                          className="col-resize-handle"
                          style={{ position: "absolute", right: -3, top: 0, bottom: 0, width: 7, cursor: "col-resize" }}
                        >
                          <span style={{ display: "block", marginLeft: 3, width: 1, height: "100%", background: "transparent" }} />
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr><td colSpan={15 + statusFields.length} className="text-center py-4" style={{ color: C.steel }}>
                    {houses.length === 0
                      ? "Belum ada data. Tambahkan lewat Mode Kalibrasi di peta."
                      : totalRows === 0
                        ? "Tidak ada kavling yang cocok dengan filter Blok/Tipe/Status yang aktif. Coba klik \"Select All\" di atas."
                        : "Tidak ada data di halaman ini."}
                  </td></tr>
                )}
                {pageRows.map((h) => (
                  <tr key={h.id} ref={(el) => (rowRefs.current[h.id] = el)} style={{ background: selectedRows.includes(h.id) ? "#FFF7E8" : selectedId === h.id ? "#EFF3F6" : "transparent", cursor: "pointer" }} onClick={() => setSelectedId(h.id)}>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedRows.includes(h.id)} onChange={() => toggleRowSelect(h.id)} />
                    </td>
                    <td style={{ fontFamily: "IBM Plex Mono, monospace", overflow: "hidden" }} onClick={(e) => { if (mode === "input") { e.stopPropagation(); setSelectedId(h.id); } }}>
                      <div className="flex items-center gap-1">
                        {isDuplicateKavling(h) && <span title="Nomor kavling ini duplikat di bloknya" style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, flexShrink: 0 }} />}
                        {!isDuplicateKavling(h) && isIncomplete(h) && <span title="Data harga/luas bangunan belum lengkap" style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />}
                        {mode === "input" ? (
                          <div className="flex items-center gap-1" style={{ minWidth: 0 }}>
                            <span style={{ color: C.steel, flexShrink: 0, fontSize: 11 }}>{h.blok}-</span>
                            <input
                              defaultValue={h.noKavling}
                              onBlur={(e) => updateHouse(h.id, { noKavling: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                              style={{ ...cellInput, minWidth: 0, flex: 1, padding: "3px 4px" }}
                            />
                          </div>
                        ) : (
                          <span style={{ color: C.accent, fontWeight: 600, textDecoration: "underline", textDecorationColor: "transparent" }} className="kavling-link">{h.blok}-{h.noKavling}</span>
                        )}
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select style={cellInput} value={h.tipe} onChange={(e) => updateHouse(h.id, { tipe: e.target.value })}>
                        {tipeOptions.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select style={cellInput} value={h.kategori} onChange={(e) => updateHouse(h.id, { kategori: e.target.value })}>
                        {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </td>
                    {statusFields.map((s) => (
                      <td key={s.key} className={s.hasDetail ? "" : "text-center"} style={s.hasDetail ? { minWidth: 170 } : undefined}>
                        <div className="text-center">
                          <input type="checkbox" checked={!!h.status[s.key]} onChange={(e) => { updateStatus(h.id, s.key, e.target.checked); if (s.hasDetail && e.target.checked) setDetailEditingKey(`${h.id}:${s.key}`); }} />
                        </div>
                        {s.hasDetail && h.status[s.key] && (
                          detailEditingKey === `${h.id}:${s.key}` ? (
                            <div className="flex items-center gap-1" style={{ marginTop: 4 }} onClick={(e) => e.stopPropagation()}>
                              <input
                                autoFocus
                                style={{ ...cellInput, fontFamily: "Inter, sans-serif" }}
                                value={getDetail(h, s.key)}
                                onChange={(e) => setDetail(h.id, s.key, e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") setDetailEditingKey(null); }}
                                placeholder="mis. keterangan"
                              />
                              <button onClick={() => setDetailEditingKey(null)} style={{ fontSize: 11, color: "#fff", background: C.accent, borderRadius: 8, padding: "2px 6px", flexShrink: 0 }}>✓</button>
                            </div>
                          ) : (
                            <div
                              onClick={(e) => { e.stopPropagation(); setDetailEditingKey(`${h.id}:${s.key}`); }}
                              style={{ marginTop: 4, fontSize: 10, color: getDetail(h, s.key) ? C.ink : C.steel, cursor: "pointer", padding: "3px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, minHeight: 14 }}
                            >
                              {getDetail(h, s.key) || "Klik untuk isi"}
                            </div>
                          )
                        )}
                      </td>
                    ))}
                    <td>
                      {textEditingKey === `${h.id}:kontraktor` || !h.kontraktor ? (
                        <input
                          autoFocus={textEditingKey === `${h.id}:kontraktor`}
                          style={{ ...cellInput, minWidth: 110 }}
                          value={h.kontraktor || ""}
                          onChange={(e) => { setTextEditingKey(`${h.id}:kontraktor`); updateHouse(h.id, { kontraktor: e.target.value }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }}
                        />
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); setTextEditingKey(`${h.id}:kontraktor`); }} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "5px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {h.kontraktor}
                        </div>
                      )}
                    </td>
                    <td>
                      {textEditingKey === `${h.id}:spkNo` || !h.spkNo ? (
                        <input
                          autoFocus={textEditingKey === `${h.id}:spkNo`}
                          style={{ ...cellInput, minWidth: 110 }}
                          value={h.spkNo || ""}
                          onChange={(e) => { setTextEditingKey(`${h.id}:spkNo`); updateHouse(h.id, { spkNo: e.target.value }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }}
                        />
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); setTextEditingKey(`${h.id}:spkNo`); }} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "5px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {h.spkNo}
                        </div>
                      )}
                    </td>
                    <td>
                      {textEditingKey === `${h.id}:spkTahun` || !h.spkTahun ? (
                        <input
                          autoFocus={textEditingKey === `${h.id}:spkTahun`}
                          type="number" style={{ ...cellInput, minWidth: 64 }}
                          value={h.spkTahun || ""}
                          onChange={(e) => { setTextEditingKey(`${h.id}:spkTahun`); const v = e.target.value; updateHouse(h.id, { spkTahun: v === "" ? null : Number(v) }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }}
                        />
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); setTextEditingKey(`${h.id}:spkTahun`); }} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "5px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, fontFamily: "IBM Plex Mono, monospace", width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {h.spkTahun}
                        </div>
                      )}
                    </td>
                    <td>
                      {monthEditingKey === h.id || !h.spkBulan ? (
                        <input
                          autoFocus={monthEditingKey === h.id}
                          type="number" min="1" max="12" style={{ ...cellInput, minWidth: 50 }}
                          value={h.spkBulan || ""}
                          onChange={(e) => { setMonthEditingKey(h.id); const v = e.target.value; updateHouse(h.id, { spkBulan: v === "" ? null : Math.min(12, Math.max(1, Number(v))) }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setMonthEditingKey(null); }}
                        />
                      ) : (
                        <div
                          onClick={(e) => { e.stopPropagation(); setMonthEditingKey(h.id); }}
                          style={{ fontSize: 11, color: C.ink, cursor: "pointer", padding: "5px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, textAlign: "center" }}
                        >
                          {MONTHS[h.spkBulan - 1]}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: "IBM Plex Mono, monospace", color: C.steel, textAlign: "center" }}>{luasBangunanOf(h)} m²</td>
                    <td>
                      {priceEditingKey === `${h.id}:hpp` || !h.hppPerM2 ? (
                        <input
                          autoFocus={priceEditingKey === `${h.id}:hpp`}
                          type="number" min="0" style={{ ...cellInput, minWidth: 100 }}
                          value={h.hppPerM2 || ""}
                          onChange={(e) => { setPriceEditingKey(`${h.id}:hpp`); updateHouse(h.id, { hppPerM2: Number(e.target.value) || 0 }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }}
                          placeholder="Rp/m²"
                        />
                      ) : (
                        <div
                          onClick={(e) => { e.stopPropagation(); setPriceEditingKey(`${h.id}:hpp`); }}
                          style={{ fontSize: 11, color: C.ink, cursor: "pointer", padding: "5px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, whiteSpace: "normal", wordBreak: "break-word" }}
                        >
                          {rupiah(h.hppPerM2)}
                          {luasBangunanOf(h) ? <> → <b>{rupiah(hppTotal(h))}</b></> : <span style={{ color: C.amber }}> (atur LB Tipe)</span>}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <input type="checkbox" checked={h.adendum} onChange={(e) => updateHouse(h.id, { adendum: e.target.checked })} />
                        {h.adendum && <input type="number" style={{ ...cellInput, minWidth: 90 }} value={h.adendumAmount || ""} onChange={(e) => updateHouse(h.id, { adendumAmount: Number(e.target.value) || 0 })} />}
                      </div>
                      {h.adendum && h.adendumAmount ? (
                        <div style={{ fontSize: 10, color: h.adendumAmount < 0 ? C.red : C.steel, marginTop: 2, whiteSpace: "normal", wordBreak: "break-word" }}>{rupiah(h.adendumAmount)}</div>
                      ) : null}
                    </td>
                    <td>
                      {priceEditingKey === `${h.id}:harga` || !h.hargaJualPerM2 ? (
                        <input
                          autoFocus={priceEditingKey === `${h.id}:harga`}
                          type="number" min="0" style={{ ...cellInput, minWidth: 100 }}
                          value={h.hargaJualPerM2 || ""}
                          onChange={(e) => { setPriceEditingKey(`${h.id}:harga`); updateHouse(h.id, { hargaJualPerM2: Number(e.target.value) || 0 }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setPriceEditingKey(null); }}
                          placeholder="Rp/m²"
                        />
                      ) : (
                        <div
                          onClick={(e) => { e.stopPropagation(); setPriceEditingKey(`${h.id}:harga`); }}
                          style={{ fontSize: 11, color: C.ink, cursor: "pointer", padding: "5px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, whiteSpace: "normal", wordBreak: "break-word" }}
                        >
                          {rupiah(h.hargaJualPerM2)}
                          {luasBangunanOf(h) ? <> → <b>{rupiah(hargaJualTotal(h))}</b></> : <span style={{ color: C.amber }}> (atur LB Tipe)</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: "IBM Plex Mono, monospace", color: marginOf(h) >= 0 ? C.green : C.red, fontWeight: 600, whiteSpace: "normal", wordBreak: "break-word" }}>
                      {!luasBangunanOf(h) ? <span style={{ color: C.steel, fontWeight: 400, fontSize: 11 }}>atur LB Tipe</span> : (
                        <>
                          {marginPct(h).toFixed(2)}%
                          <div style={{ fontSize: 10, fontWeight: 400, color: C.steel }}>{rupiah(marginOf(h))}</div>
                          {h.adendum && h.adendumAmount ? <div style={{ fontSize: 9, fontWeight: 400, color: C.steel }}>HPP/m² efektif: {rupiah(Math.round(finalHppPerM2(h)))}</div> : null}
                        </>
                      )}
                    </td>
                    <td>
                      {textEditingKey === `${h.id}:catatan` || !h.catatan ? (
                        <input
                          autoFocus={textEditingKey === `${h.id}:catatan`}
                          style={{ ...cellInput, minWidth: 110 }}
                          value={h.catatan || ""}
                          onChange={(e) => { setTextEditingKey(`${h.id}:catatan`); updateHouse(h.id, { catatan: e.target.value }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") setTextEditingKey(null); }}
                          placeholder="..."
                        />
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); setTextEditingKey(`${h.id}:catatan`); }} style={{ fontSize: 12, color: C.ink, cursor: "pointer", padding: "5px 6px", border: `1px dashed ${C.line}`, borderRadius: 8, width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {h.catatan}
                        </div>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {confirmDeleteId === h.id ? (
                        <div className="flex items-center gap-1" style={{ whiteSpace: "nowrap" }}>
                          <button onClick={() => { removeHouse(h.id); setConfirmDeleteId(null); }} className="text-xs px-1.5 py-0.5 rounded-lg" style={{ background: C.red, color: "#fff", whiteSpace: "nowrap" }}>Ya</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-1.5 py-0.5 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.steel, whiteSpace: "nowrap" }}>Batal</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2" style={{ whiteSpace: "nowrap" }}>
                          <button onClick={() => duplicateHouse(h.id)} className="text-xs" style={{ color: C.accent }} title="Salin data kavling ini jadi kavling baru">Duplikat</button>
                          <button onClick={() => setConfirmDeleteId(h.id)} className="text-xs" style={{ color: C.red }}>Hapus</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, (typeof pageSize === "number" ? pageSize : 10) - pageRows.length) }).map((_, i) => (
                  <tr key={`fill-${i}`} style={{ height: 33 }}>
                    <td colSpan={15 + statusFields.length}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: C.steel }}>
              <span>Show</span>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value === "all" ? "all" : Number(e.target.value))} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              <span>entries</span>
            </div>
            <div className="text-xs" style={{ color: C.steel }}>Menampilkan {rangeStart}–{rangeEnd} dari {totalRows} data</div>
            <div className="flex items-center gap-1.5">
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: currentPage <= 1 ? C.faint : C.ink, background: "#fff" }}>‹ Prev</button>
              <span className="text-xs" style={{ color: C.steel }}>{currentPage} / {totalPages}</span>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: currentPage >= totalPages ? C.faint : C.ink, background: "#fff" }}>Next ›</button>
            </div>
          </div>
        </div>
      )}

      {((mode === "input" && dashboardPos === "bawah") || mode === "kerja") && dashboardJSX}

      </>
      )}
    </div>
  );
}
