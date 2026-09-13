import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export default function DashboardCharts({ C, progressPerBlok, marginPerTipe, statusBreakdown, tipePie, tipeColor }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
      <div className="rounded-xl p-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Kalibrasi per Blok (unit)</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={progressPerBlok} barCategoryGap={8} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke={C.line} />
            <XAxis dataKey="blok" tick={{ fontSize: 10, fill: C.steel }} />
            <YAxis tick={{ fontSize: 10, fill: C.steel }} allowDecimals={false} width={24} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="Terpetakan" stackId="a" fill={C.accent} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Target" stackId="a" fill={C.faint} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl p-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Margin per Tipe (%)</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={marginPerTipe} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke={C.line} />
            <XAxis dataKey="tipe" tick={{ fontSize: 8, fill: C.steel }} interval={0} angle={-20} textAnchor="end" height={32} />
            <YAxis tick={{ fontSize: 10, fill: C.steel }} width={28} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="margin" fill={C.accent} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl p-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Kelengkapan Status (semua kavling)</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={statusBreakdown} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke={C.line} />
            <XAxis type="number" tick={{ fontSize: 10, fill: C.steel }} allowDecimals={false} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: C.steel }} width={80} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="Selesai" stackId="s" fill={C.green} />
            <Bar dataKey="Belum" stackId="s" fill={C.faint} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl p-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Distribusi Tipe Kavling</div>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={tipePie} dataKey="value" nameKey="name" innerRadius={32} outerRadius={55}>
              {tipePie.map((entry) => <Cell key={entry.name} fill={tipeColor(entry.name)} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
