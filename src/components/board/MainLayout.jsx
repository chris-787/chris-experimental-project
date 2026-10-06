import { C } from "../../theme";
import SidePanel from "./SidePanel";
import InspectorPanel from "./InspectorPanel";
import KpiStrip from "./KpiStrip";
import MapPanel from "./MapPanel";
import { useBoard } from "./BoardContext";

export default function MainLayout() {
  const { calibrating, mapPct, rowRef, startDrag } = useBoard();
  return (
    <>
      <KpiStrip />
      <div ref={rowRef} className="map-data-row" style={{ display: "flex", flexWrap: "nowrap", alignItems: "flex-start", gap: 0, marginBottom: 12 }}>
        <div className="map-panel-col" style={{ flexBasis: `${mapPct}%`, flexGrow: 0, flexShrink: 0, minWidth: 320, paddingRight: 8 }}>
          <MapPanel />
        </div>
        <div
          onMouseDown={startDrag}
          title="Geser untuk mengubah lebar"
          className="panel-resize-handle"
          style={{ flex: "0 0 8px", cursor: "col-resize", background: C.line, borderRadius: 8, margin: "0 4px", alignSelf: "stretch", minHeight: 40 }}
        />
        <div className="inspector-panel-col" style={{ flex: "1 1 300px", minWidth: 300, paddingLeft: 8 }}>
          <SidePanel />
        </div>
      </div>
      {!calibrating && (
        <div className="rounded-xl p-3 mb-3" style={{ background: C.panel, boxShadow: C.cardShadow }}>
          <InspectorPanel />
        </div>
      )}
    </>
  );
}
