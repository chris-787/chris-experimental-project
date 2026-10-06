import { C } from "../../theme";

// Layar "kerangka" saat data masih diunduh: bentuk halaman (header, tab,
// kotak site plan, kartu, tabel) langsung tampil sebagai kotak abu-abu
// berdenyut, jadi tidak ada layar kosong lalu tiba-tiba muncul semua.
const Box = ({ h, w = "100%", style }) => <div className="sk" style={{ height: h, width: w, ...style }} />;

export default function LoadingSkeleton({ kind, title }) {
  return (
    <div style={{ background: C.paper, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="p-4" role="status" aria-label="Memuat data">
      {kind === "cluster" ? (
        <>
          <div className="flex items-center gap-2.5 mb-4">
            <Box h={26} w={72} style={{ borderRadius: 999 }} />
            <Box h={14} w={180} />
          </div>
          <div className="mb-3">
            <div className="text-lg font-semibold" style={{ color: C.ink }}>{title || <Box h={22} w={200} />}</div>
            <Box h={14} w={240} style={{ marginTop: 6 }} />
          </div>
          <div className="rounded-xl p-2.5 mb-3 flex gap-1.5" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            <Box h={28} w={92} style={{ borderRadius: 999 }} />
            <Box h={28} w={92} style={{ borderRadius: 999 }} />
            <Box h={28} w={80} style={{ borderRadius: 999 }} />
          </div>
          <div className="skel-grid mb-3">
            <Box h={300} />
            <div className="flex flex-col gap-2.5">
              <Box h={64} /><Box h={64} /><Box h={64} /><Box h={90} />
            </div>
          </div>
          <div className="rounded-xl p-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
            {[0, 1, 2, 3, 4, 5].map((i) => <Box key={i} h={14} w={`${96 - i * 6}%`} style={{ marginBottom: 12 }} />)}
          </div>
        </>
      ) : (
        <>
          <Box h={26} w={260} style={{ marginBottom: 8 }} />
          <Box h={14} w={180} style={{ marginBottom: 20 }} />
          <div className="skel-cards">
            <Box h={190} /><Box h={190} /><Box h={190} />
          </div>
        </>
      )}
    </div>
  );
}
