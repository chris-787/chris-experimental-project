import { C } from "../../theme";
import SidePanel from "./SidePanel";
import InspectorPanel from "./InspectorPanel";
import KpiStrip from "./KpiStrip";
import MapPanel from "./MapPanel";
import { useBoard } from "./BoardContext";

export default function MainLayout() {
  const { calibrating, mapPct, rowRef, setMapHeight, siteImage, startDrag, startHeightDrag } = useBoard();
  return (
    <>
      <KpiStrip />
      <div ref={rowRef} className="map-data-row" style={{ display: "flex", flexWrap: "nowrap", alignItems: "flex-start", gap: 0, marginBottom: 6 }}>
        <div className="map-panel-col" style={{ flexBasis: `${mapPct}%`, flexGrow: 0, flexShrink: 0, minWidth: 320, paddingRight: 8 }}>
          <MapPanel />
        </div>
        <div
          onMouseDown={startDrag}
          title="Geser untuk mengubah lebar"
          className="panel-resize-handle drag-handle"
          style={{ flex: "0 0 6px", cursor: "col-resize", borderRadius: 6, margin: "0 5px", alignSelf: "stretch", minHeight: 40 }}
        />
        <div className="inspector-panel-col" style={{ flex: "1 1 300px", minWidth: 300, paddingLeft: 8 }}>
          <SidePanel />
        </div>
      </div>
      {siteImage && (
        <div
          onMouseDown={startHeightDrag}
          onDoubleClick={() => setMapHeight(null)}
          title="Tarik ke atas/bawah untuk mengubah tinggi Site Plan (klik 2x untuk kembali ke awal)"
          className="panel-height-handle drag-handle"
          style={{ height: 6, borderRadius: 6, cursor: "row-resize", marginBottom: 12, userSelect: "none" }}
        />
      )}
      {!calibrating && (
        <div className="rounded-xl p-3 mb-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
          <InspectorPanel />
        </div>
      )}
    </>
  );
}
