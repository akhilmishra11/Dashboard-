import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Activity, DollarSign, Users, TrendingDown, FileWarning, Wallet, HeartPulse,
} from "lucide-react";

// ---------- Design tokens ----------
const COLORS = {
  bg: "#F6F4EF",
  surface: "#FFFFFF",
  ink: "#1E2A28",
  inkSoft: "#5B6B67",
  teal: "#2F6F63",
  tealSoft: "#BFE0D8",
  gold: "#B8862B",
  goldSoft: "#EBD9B4",
  coral: "#C15B4A",
  coralSoft: "#F0CFC7",
  line: "#E4E0D5",
};

const DEPARTMENTS = ["Cardiology", "Oncology", "Orthopedics", "Pediatrics", "Emergency", "Neurology"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAYERS = ["Medicare", "Medicaid", "Private – Aetna", "Private – BlueCross", "Self-Pay"];

// ---------- Seeded synthetic data ----------
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seeded(42);
const between = (min, max) => min + rand() * (max - min);

const departmentData = DEPARTMENTS.map((dept, i) => {
  const patients = Math.round(between(180, 620));
  const revenuePerPatient = between(2400, 6200);
  const revenue = Math.round(patients * revenuePerPatient);
  const cost = Math.round(revenue * between(0.55, 0.85));
  return {
    department: dept,
    patients,
    revenue,
    cost,
    profit: revenue - cost,
    margin: Number((((revenue - cost) / revenue) * 100).toFixed(1)),
    avgLOS: Number(between(1.8, 6.5).toFixed(1)),
    readmissionRate: Number(between(4, 18).toFixed(1)),
  };
});

const monthlyTrend = MONTHS.map((month, i) => {
  const seasonal = 1 + 0.15 * Math.sin(i / 2);
  const patients = Math.round(between(850, 1150) * seasonal);
  const revenue = Math.round(patients * between(3200, 4100));
  const cost = Math.round(revenue * between(0.62, 0.74));
  return { month, patients, revenue, cost };
});

const claimsData = [
  { status: "Approved", value: 68, color: COLORS.teal },
  { status: "Pending", value: 19, color: COLORS.gold },
  { status: "Denied", value: 13, color: COLORS.coral },
];

const payerData = PAYERS.map((payer) => ({
  payer,
  revenue: Math.round(between(180000, 720000)),
  claims: Math.round(between(120, 480)),
}));

const totalReceivables = 1840000;
const pendingReceivables = Math.round(totalReceivables * 0.19);

// ---------- Small presentational pieces ----------
function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div
      className="p-4 flex flex-col gap-3"
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 4 }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: COLORS.inkSoft, letterSpacing: "0.02em" }}>
          {label}
        </span>
        <Icon size={16} color={accent} strokeWidth={2} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 26, color: COLORS.ink, fontWeight: 500 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontFamily: "var(--body)", fontSize: 12, color: COLORS.inkSoft }}>{sub}</span>
      )}
    </div>
  );
}

function Panel({ title, note, children }) {
  return (
    <div
      className="p-5"
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 4 }}
    >
      <div className="flex items-baseline justify-between mb-4">
        <h3 style={{ fontFamily: "var(--body)", fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{title}</h3>
        {note && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: COLORS.inkSoft }}>{note}</span>}
      </div>
      {children}
    </div>
  );
}

const axisStyle = { fontFamily: "var(--mono)", fontSize: 11, fill: COLORS.inkSoft };
const tooltipStyle = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 4,
  fontFamily: "var(--mono)",
  fontSize: 12,
};

export default function MediFinDashboard() {
  const [deptFilter, setDeptFilter] = useState("All");
  const [range, setRange] = useState(12);

  const trend = useMemo(() => monthlyTrend.slice(12 - range), [range]);
  const depts = useMemo(
    () => (deptFilter === "All" ? departmentData : departmentData.filter((d) => d.department === deptFilter)),
    [deptFilter]
  );

  const totals = useMemo(() => {
    const patients = depts.reduce((a, d) => a + d.patients, 0);
    const revenue = depts.reduce((a, d) => a + d.revenue, 0);
    const cost = depts.reduce((a, d) => a + d.cost, 0);
    const avgReadmission = (depts.reduce((a, d) => a + d.readmissionRate, 0) / depts.length).toFixed(1);
    return { patients, revenue, cost, avgReadmission, margin: (((revenue - cost) / revenue) * 100).toFixed(1) };
  }, [depts]);

  const fmtMoney = (n) => `$${(n / 1000).toFixed(0)}k`;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100%", color: COLORS.ink }} className="p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;600;700&display=swap');
        :root { --mono: 'IBM Plex Mono', monospace; --body: 'Manrope', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse size={18} color={COLORS.teal} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: COLORS.teal }}>MediFin Analytics</span>
          </div>
          <h1 style={{ fontFamily: "var(--body)", fontSize: 24, fontWeight: 700 }}>
            Hospital Operations & Financial Performance
          </h1>
          <p style={{ fontFamily: "var(--body)", fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>
            Synthetic data · clinical outcomes cross-referenced with revenue cycle
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2"
            style={{
              fontFamily: "var(--mono)", fontSize: 12, background: COLORS.surface,
              border: `1px solid ${COLORS.line}`, borderRadius: 4, color: COLORS.ink,
            }}
          >
            <option>All</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="px-3 py-2"
            style={{
              fontFamily: "var(--mono)", fontSize: 12, background: COLORS.surface,
              border: `1px solid ${COLORS.line}`, borderRadius: 4, color: COLORS.ink,
            }}
          >
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users} label="TOTAL PATIENTS" value={totals.patients.toLocaleString()} sub={`across ${depts.length} department${depts.length > 1 ? "s" : ""}`} accent={COLORS.teal} />
        <KpiCard icon={DollarSign} label="TOTAL REVENUE" value={fmtMoney(totals.revenue)} sub={`${totals.margin}% margin`} accent={COLORS.gold} />
        <KpiCard icon={TrendingDown} label="AVG READMISSION" value={`${totals.avgReadmission}%`} sub="30-day readmission rate" accent={COLORS.coral} />
        <KpiCard icon={Wallet} label="PENDING RECEIVABLES" value={fmtMoney(pendingReceivables)} sub={`of ${fmtMoney(totalReceivables)} total`} accent={COLORS.gold} />
      </div>

      {/* Trend + Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <Panel title="Patient Volume & Revenue Trend" note={`${range}-month view`}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <YAxis yAxisId="left" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} tickFormatter={fmtMoney} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: "var(--mono)", fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="patients" name="Patients" stroke={COLORS.teal} strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.gold} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <Panel title="Insurance Claims Status">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={claimsData} dataKey="value" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {claimsData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {claimsData.map((c) => (
              <div key={c.status} className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, display: "inline-block" }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: COLORS.inkSoft }}>{c.status} {c.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Department profitability + readmission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Panel title="Revenue vs Cost by Department">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={departmentData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="department" tick={{ ...axisStyle, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} tickFormatter={fmtMoney} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} />
              <Legend wrapperStyle={{ fontFamily: "var(--mono)", fontSize: 11 }} />
              <Bar dataKey="revenue" name="Revenue" fill={COLORS.teal} radius={[2, 2, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill={COLORS.goldSoft} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Patient Volume vs Profit Margin" note="bubble = department">
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.line} />
              <XAxis dataKey="patients" name="Patients" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <YAxis dataKey="margin" name="Margin %" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }}
                content={({ payload }) => payload?.[0] ? (
                  <div style={tooltipStyle} className="px-2 py-1">
                    <div>{payload[0].payload.department}</div>
                    <div>{payload[0].payload.patients} patients · {payload[0].payload.margin}% margin</div>
                  </div>
                ) : null}
              />
              <Scatter data={departmentData} fill={COLORS.coral} fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Readmission table + payer mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Readmission Rate & Length of Stay by Department">
          <div className="flex flex-col gap-2">
            {departmentData
              .slice()
              .sort((a, b) => b.readmissionRate - a.readmissionRate)
              .map((d) => (
                <div key={d.department} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  <div className="flex items-center gap-2">
                    <FileWarning size={14} color={d.readmissionRate > 12 ? COLORS.coral : COLORS.inkSoft} />
                    <span style={{ fontFamily: "var(--body)", fontSize: 13 }}>{d.department}</span>
                  </div>
                  <div className="flex gap-4">
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: d.readmissionRate > 12 ? COLORS.coral : COLORS.ink }}>
                      {d.readmissionRate}% readmit
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: COLORS.inkSoft }}>
                      {d.avgLOS}d avg LOS
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Panel>

        <Panel title="Revenue by Payer">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payerData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.line} horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} tickFormatter={fmtMoney} />
              <YAxis type="category" dataKey="payer" tick={{ ...axisStyle, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} />
              <Bar dataKey="revenue" fill={COLORS.gold} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="flex items-center gap-1.5 mt-6">
        <Activity size={12} color={COLORS.inkSoft} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: COLORS.inkSoft }}>
          Synthetic dataset for demonstration purposes only — not real patient or financial data.
        </span>
      </div>
    </div>
  );
}
