import { useState } from "react";
import { motion } from "motion/react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import {
  User, MapPin, Briefcase, Heart, TrendingUp, TrendingDown,
  Shield, Target, Edit3, LogOut, CheckCircle, AlertTriangle,
  Activity, DollarSign, Home, GraduationCap
} from "lucide-react";
import { useUserData, formatCr } from "../context/UserDataContext";
import { useNavigate } from "react-router";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ETCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white ${className}`} style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>
      {children}
    </div>
  );
}
function ETCardHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: "2px solid #E21B23" }}>
      <div>
        <p className="font-bold uppercase tracking-wide" style={{ fontSize: "11px", color: "#1A1A1A", letterSpacing: "0.06em" }}>{title}</p>
        {sub && <p style={{ fontSize: "10px", color: "#AAA", marginTop: 2 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
function StatBadge({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center px-3 py-2" style={{ background: `${color}0F`, border: `1px solid ${color}25`, borderRadius: 2 }}>
      <p className="font-black" style={{ fontSize: "18px", color, fontFamily: "'IBM Plex Sans',sans-serif" }}>{value}</p>
      <p style={{ fontSize: "9px", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</p>
    </div>
  );
}
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid #F5F5F5" }}>
      <Icon size={14} style={{ color: "#E21B23" }} className="shrink-0" />
      <span style={{ fontSize: "11px", color: "#888", width: 110, flexShrink: 0 }}>{label}</span>
      <span className="font-semibold" style={{ fontSize: "12px", color: "#1A1A1A" }}>{value || "—"}</span>
    </div>
  );
}
function HealthBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span style={{ fontSize: "11px", color: "#555" }}>{label}</span>
        <span className="font-bold" style={{ fontSize: "11px", color }}>{pct}%</span>
      </div>
      <div className="h-2" style={{ background: "#F0F0F0", borderRadius: 1 }}>
        <motion.div className="h-full" style={{ background: color, borderRadius: 1 }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
      </div>
    </div>
  );
}

// ─── Custom Pie Tooltip ───────────────────────────────────────────────────────
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-2 text-xs" style={{ background: "#1A1A1A", borderRadius: 2, color: "white" }}>
      <p className="font-bold">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.color }}>{formatCr(payload[0].value)}</p>
      <p style={{ color: "#AAA" }}>{payload[0].payload.pct}%</p>
    </div>
  );
}
function ExpPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-2 text-xs" style={{ background: "#1A1A1A", borderRadius: 2, color: "white" }}>
      <p className="font-bold">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.color }}>₹{payload[0].value.toLocaleString("en-IN")}/mo</p>
    </div>
  );
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────
export function ProfilePage() {
  const { userData: u, metrics: m, resetUserData } = useUserData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "goals" | "risk">("overview");

  if (!u || !m) return null;

  const initials = u.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const monthlyIncome = Math.round(m.monthlyIncome);
  const totalMonthlyExp = u.rentEmi + u.groceries + u.utilities + u.transport + u.dining + u.entertainment + u.education + u.otherExpenses;

  // ── Asset Allocation Pie data
  const totalAssets = m.totalAssets || 1;
  const assetPieData = [
    { name: "Mutual Funds",    value: u.mutualFunds,     color: "#E21B23",  pct: Math.round(u.mutualFunds / totalAssets * 100) },
    { name: "Stocks",          value: u.stocks,           color: "#2563EB",  pct: Math.round(u.stocks / totalAssets * 100) },
    { name: "Bank / FD",       value: u.bankSavings + u.fixedDeposits, color: "#16A34A", pct: Math.round((u.bankSavings + u.fixedDeposits) / totalAssets * 100) },
    { name: "PPF / EPF / NPS", value: u.ppfEpf,           color: "#D97706",  pct: Math.round(u.ppfEpf / totalAssets * 100) },
    { name: "Gold",            value: u.gold,             color: "#F59E0B",  pct: Math.round(u.gold / totalAssets * 100) },
    { name: "Real Estate",     value: u.realEstate,       color: "#7C3AED",  pct: Math.round(u.realEstate / totalAssets * 100) },
  ].filter(d => d.value > 0);

  // ── Expense Breakdown Pie data
  const expPieData = [
    { name: "Rent / EMI",     value: u.rentEmi,        color: "#E21B23" },
    { name: "Groceries",      value: u.groceries,      color: "#16A34A" },
    { name: "Utilities",      value: u.utilities,      color: "#2563EB" },
    { name: "Transport",      value: u.transport,      color: "#7C3AED" },
    { name: "Dining",         value: u.dining,         color: "#D97706" },
    { name: "Entertainment",  value: u.entertainment,  color: "#EA580C" },
    { name: "Education",      value: u.education,      color: "#0891B2" },
    { name: "Other",          value: u.otherExpenses,  color: "#6B7280" },
  ].filter(d => d.value > 0);

  // ── Income vs Expenses monthly bar data
  const incomeVsExpData = [
    { label: "Income",   amount: monthlyIncome,       fill: "#16A34A" },
    { label: "Expenses", amount: totalMonthlyExp,     fill: "#E21B23" },
    { label: "SIP/Inv.", amount: u.monthlySip,        fill: "#2563EB" },
    { label: "Savings",  amount: Math.max(m.monthlySavings - u.monthlySip, 0), fill: "#D97706" },
  ];

  // ── Radar data for financial health dimensions
  const totalMonthlyExpRaw = totalMonthlyExp;
  const emergencyTarget6M = totalMonthlyExpRaw * 6;
  const radarData = [
    { dim: "Savings Rate",    score: Math.min(Math.round(m.savingsRate * 2.5), 100) },
    { dim: "Debt Health",     score: Math.max(100 - Math.round(m.debtToAssetRatio * 1.5), 0) },
    { dim: "Investments",     score: Math.min(Math.round((m.totalInvestments / (u.annualSalary || 1)) * 20), 100) },
    { dim: "Insurance",       score: u.annualSalary > 0 ? Math.min(Math.round((u.lifeInsuranceCover / (u.annualSalary * 10)) * 100), 100) : 0 },
    { dim: "Emergency Fund",  score: emergencyTarget6M > 0 ? Math.min(Math.round((u.bankSavings / emergencyTarget6M) * 100), 100) : 50 },
    { dim: "Goal Progress",   score: Math.min(Math.round(m.goals.reduce((acc, g) => acc + (g.current / g.target) * 100, 0) / Math.max(m.goals.length, 1)), 100) },
  ];

  // ── Key Financial Ratios
  const ratios = [
    { label: "Savings Rate",         value: `${Math.round(m.savingsRate)}%`,            status: m.savingsRate > 20 ? "good" : m.savingsRate > 10 ? "ok" : "bad",  benchmark: "Target: >20%" },
    { label: "Debt-to-Asset",         value: `${Math.round(m.debtToAssetRatio)}%`,       status: m.debtToAssetRatio < 30 ? "good" : m.debtToAssetRatio < 50 ? "ok" : "bad", benchmark: "Target: <30%" },
    { label: "Emergency Fund Cover",  value: `${Math.round(u.bankSavings / Math.max(totalMonthlyExpRaw, 1))} months`, status: u.bankSavings >= totalMonthlyExpRaw * 6 ? "good" : u.bankSavings >= totalMonthlyExpRaw * 3 ? "ok" : "bad", benchmark: "Target: 6 months" },
    { label: "Life Cover Adequacy",   value: u.annualSalary > 0 ? `${Math.round((u.lifeInsuranceCover / (u.annualSalary * 10)) * 100)}%` : "N/A", status: u.lifeInsuranceCover >= u.annualSalary * 10 ? "good" : u.lifeInsuranceCover >= u.annualSalary * 5 ? "ok" : "bad", benchmark: "Target: 10x income" },
    { label: "Investment-to-Income",  value: `${m.totalInvestments > 0 ? Math.round(m.totalInvestments / (u.annualSalary || 1) * 10) / 10 : 0}x`, status: m.totalInvestments > u.annualSalary * 2 ? "good" : m.totalInvestments > u.annualSalary ? "ok" : "bad", benchmark: "Target: >3x" },
    { label: "SIP as % Income",       value: `${monthlyIncome > 0 ? Math.round((u.monthlySip / monthlyIncome) * 100) : 0}%`, status: u.monthlySip / Math.max(monthlyIncome, 1) > 0.2 ? "good" : u.monthlySip / Math.max(monthlyIncome, 1) > 0.1 ? "ok" : "bad", benchmark: "Target: >15%" },
  ];

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "assets",   label: "Portfolio" },
    { key: "goals",    label: "Goals" },
    { key: "risk",     label: "Health Metrics" },
  ] as const;

  const statusColor = (s: string) => s === "good" ? "#16A34A" : s === "ok" ? "#D97706" : "#DC2626";
  const statusIcon  = (s: string) => s === "good" ? "✓" : s === "ok" ? "⚠" : "✗";

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", background: "#F2F2F2" }}>
      {/* Page Header */}
      <div style={{ background: "#E21B23", padding: "8px 16px" }} className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>MY FINANCIAL PROFILE</p>
          <p className="text-white opacity-70" style={{ fontSize: "10px" }}>Complete financial snapshot · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/goals")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white font-bold transition-opacity hover:opacity-80"
            style={{ background: "rgba(0,0,0,0.2)", borderRadius: 1, fontSize: "11px" }}>
            <Target size={12} /> Goal Optimizer
          </button>
          <button onClick={resetUserData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white font-bold transition-opacity hover:opacity-80"
            style={{ background: "rgba(0,0,0,0.2)", borderRadius: 1, fontSize: "11px" }}>
            <Edit3 size={12} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Profile Hero Card ── */}
        <ETCard>
          <div className="p-5 flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 flex items-center justify-center font-black text-white"
                style={{ background: "linear-gradient(135deg, #E21B23, #C01018)", borderRadius: 4, fontSize: "2rem" }}>
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center text-white"
                style={{ background: "#16A34A", borderRadius: "50%", border: "2px solid white" }}>
                <CheckCircle size={12} />
              </div>
            </div>

            {/* Name / bio */}
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h1 className="font-black" style={{ fontSize: "1.5rem", color: "#1A1A1A", fontFamily: "'IBM Plex Serif',serif" }}>{u.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {u.occupation && <div className="flex items-center gap-1"><Briefcase size={11} style={{ color: "#888" }} /><span style={{ fontSize: "12px", color: "#666" }}>{u.occupation}</span></div>}
                    {u.city && <div className="flex items-center gap-1"><MapPin size={11} style={{ color: "#888" }} /><span style={{ fontSize: "12px", color: "#666" }}>{u.city}</span></div>}
                    <div className="flex items-center gap-1"><User size={11} style={{ color: "#888" }} /><span style={{ fontSize: "12px", color: "#666" }}>Age {u.age}</span></div>
                    {u.maritalStatus !== "single" && u.partnerName && (
                      <div className="flex items-center gap-1"><Heart size={11} style={{ color: "#E21B23" }} /><span style={{ fontSize: "12px", color: "#666" }}>with {u.partnerName}</span></div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5"
                  style={{ background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 1 }}>
                  <Activity size={11} style={{ color: "#E21B23" }} />
                  <span style={{ fontSize: "10px", color: "#E21B23", fontWeight: 700 }}>
                    HEALTH SCORE: {m.moneyHealthScore}/100
                  </span>
                </div>
              </div>

              {/* 6 key stats */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
                <StatBadge value={formatCr(m.netWorth)}                                          label="Net Worth"       color="#16A34A" />
                <StatBadge value={`₹${Math.round(monthlyIncome / 1000)}K`}                       label="Monthly Income"  color="#2563EB" />
                <StatBadge value={`${Math.round(m.savingsRate)}%`}                               label="Savings Rate"    color={m.savingsRate > 20 ? "#16A34A" : "#D97706"} />
                <StatBadge value={`${m.estimatedXirr}%`}                                         label="Expected XIRR"   color="#7C3AED" />
                <StatBadge value={formatCr(m.totalAssets)}                                        label="Total Assets"    color="#0891B2" />
                <StatBadge value={formatCr(m.annualTax)}                                          label="Est. Annual Tax" color="#E21B23" />
              </div>
            </div>
          </div>
        </ETCard>

        {/* ── Tabs ── */}
        <div className="flex gap-0 bg-white" style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2.5 font-bold transition-all flex-1"
              style={{
                fontSize: "11px", letterSpacing: "0.04em",
                borderBottom: activeTab === tab.key ? "2px solid #E21B23" : "2px solid transparent",
                color: activeTab === tab.key ? "#E21B23" : "#888",
                background: activeTab === tab.key ? "#FFF5F5" : "transparent",
              }}>
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Tab: Overview ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Personal Info */}
            <ETCard>
              <ETCardHeader title="Personal Information" sub="Your profile details" />
              <div className="p-4">
                <InfoRow icon={User}         label="Full Name"      value={u.name} />
                <InfoRow icon={User}         label="Age"            value={`${u.age} years`} />
                <InfoRow icon={MapPin}       label="City"           value={u.city} />
                <InfoRow icon={Briefcase}    label="Occupation"     value={u.occupation} />
                <InfoRow icon={Heart}        label="Status"         value={u.maritalStatus.charAt(0).toUpperCase() + u.maritalStatus.slice(1)} />
                {u.partnerName && <InfoRow icon={User} label="Partner" value={u.partnerName} />}
                <InfoRow icon={Shield}       label="Tax Regime"     value={u.taxRegime === "new" ? "New Regime" : "Old Regime"} />
                <InfoRow icon={Activity}     label="Risk Appetite"  value={u.riskAppetite.charAt(0).toUpperCase() + u.riskAppetite.slice(1)} />
                <InfoRow icon={Target}       label="Retire At"      value={`Age ${u.retirementAge}`} />
              </div>
            </ETCard>

            {/* Financial Ratios */}
            <ETCard>
              <ETCardHeader title="Key Financial Ratios" sub="vs. benchmarks" />
              <div className="p-4 space-y-3">
                {ratios.map(r => (
                  <div key={r.label} className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#555" }}>{r.label}</p>
                      <p style={{ fontSize: "9px", color: "#AAA" }}>{r.benchmark}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ fontSize: "13px", color: statusColor(r.status) }}>{r.value}</span>
                      <span className="font-bold" style={{ fontSize: "12px", color: statusColor(r.status) }}>{statusIcon(r.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ETCard>

            {/* Monthly Cash Flow */}
            <ETCard>
              <ETCardHeader title="Monthly Cash Flow" sub="Income → Expenses → Savings" />
              <div className="p-4">
                <div className="mb-4" style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeVsExpData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `₹${Math.round(v / 1000)}K`} tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} contentStyle={{ background: "#1A1A1A", border: "none", borderRadius: 2, fontSize: 11, color: "white" }} />
                      <Bar dataKey="amount" radius={[2, 2, 0, 0]} isAnimationActive name="amount">
                        {incomeVsExpData.map((d, i) => <Cell key={`cashflow-cell-${d.label}-${i}`} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {[
                  { label: "Monthly Income",   val: `₹${monthlyIncome.toLocaleString("en-IN")}`,     color: "#16A34A" },
                  { label: "Monthly Expenses",  val: `₹${totalMonthlyExp.toLocaleString("en-IN")}`,   color: "#E21B23" },
                  { label: "Monthly SIP",       val: `₹${u.monthlySip.toLocaleString("en-IN")}`,      color: "#2563EB" },
                  { label: "Net Savings",       val: formatCr(Math.max(m.monthlySavings, 0)),          color: "#D97706" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: "11px", color: "#666" }}>{r.label}</span>
                    <span className="font-bold" style={{ fontSize: "11px", color: r.color }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </ETCard>
          </div>
        )}

        {/* ── Tab: Portfolio ── */}
        {activeTab === "assets" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Asset Allocation Pie */}
            <ETCard>
              <ETCardHeader title="Asset Allocation" sub={`Total: ${formatCr(m.totalAssets)}`} />
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div style={{ height: 200, width: 200, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={assetPieData} cx="50%" cy="50%" outerRadius={85} innerRadius={42} dataKey="value" paddingAngle={2}>
                          {assetPieData.map((d, i) => <Cell key={`asset-cell-${d.name}-${i}`} fill={d.color} />)}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {assetPieData.map(d => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 shrink-0" style={{ background: d.color, borderRadius: 1 }} />
                          <span style={{ fontSize: "11px", color: "#555" }}>{d.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold" style={{ fontSize: "11px", color: "#1A1A1A" }}>{formatCr(d.value)}</span>
                          <span style={{ fontSize: "10px", color: "#AAA", marginLeft: 4 }}>{d.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3" style={{ borderTop: "1px solid #F0F0F0" }}>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Equity", val: `${m.sectorAllocation.equity}%`, color: "#E21B23" },
                      { label: "Debt",   val: `${m.sectorAllocation.debt}%`,   color: "#2563EB" },
                      { label: "Gold",   val: `${m.sectorAllocation.gold}%`,   color: "#D97706" },
                      { label: "Cash",   val: `${m.sectorAllocation.cash}%`,   color: "#16A34A" },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between px-2 py-1.5"
                        style={{ background: "#F9F9F9", border: "1px solid #F0F0F0", borderRadius: 1 }}>
                        <span style={{ fontSize: "10px", color: "#666" }}>{r.label}</span>
                        <span className="font-bold" style={{ fontSize: "12px", color: r.color }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ETCard>

            {/* Expense Breakdown Pie */}
            <ETCard>
              <ETCardHeader title="Monthly Expense Breakdown" sub={`Total: ₹${totalMonthlyExp.toLocaleString("en-IN")}/month`} />
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div style={{ height: 200, width: 200, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expPieData} cx="50%" cy="50%" outerRadius={85} innerRadius={42} dataKey="value" paddingAngle={2}>
                          {expPieData.map((d, i) => <Cell key={`exp-cell-${d.name}-${i}`} fill={d.color} />)}
                        </Pie>
                        <Tooltip content={<ExpPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {expPieData.map(d => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 shrink-0" style={{ background: d.color, borderRadius: 1 }} />
                          <span style={{ fontSize: "11px", color: "#555" }}>{d.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold" style={{ fontSize: "11px", color: "#1A1A1A" }}>₹{Math.round(d.value / 1000)}K</span>
                          <span style={{ fontSize: "10px", color: "#AAA", marginLeft: 4 }}>{totalMonthlyExp > 0 ? Math.round((d.value / totalMonthlyExp) * 100) : 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ETCard>

            {/* Debt Breakdown */}
            <ETCard>
              <ETCardHeader title="Debt & Liabilities" sub={`Total: ${formatCr(m.totalDebt)}`} />
              <div className="p-4">
                {m.totalDebt === 0 ? (
                  <div className="flex items-center gap-2 py-4">
                    <CheckCircle size={18} style={{ color: "#16A34A" }} />
                    <p className="font-semibold" style={{ color: "#16A34A", fontSize: "13px" }}>Debt-free! Great financial discipline.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: "Home Loan",     value: u.homeLoanBalance,         color: "#E21B23", emi: u.homeLoanEmi },
                      { label: "Car Loan",      value: u.carLoanBalance,          color: "#D97706", emi: 0 },
                      { label: "Personal Loan", value: u.personalLoanBalance,     color: "#7C3AED", emi: 0 },
                      { label: "Credit Card",   value: u.creditCardOutstanding,   color: "#DC2626", emi: 0 },
                    ].filter(d => d.value > 0).map(d => (
                      <div key={d.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #F5F5F5" }}>
                        <div>
                          <p style={{ fontSize: "12px", color: "#333" }}>{d.label}</p>
                          {d.emi > 0 && <p style={{ fontSize: "10px", color: "#AAA" }}>EMI: ₹{d.emi.toLocaleString("en-IN")}/mo</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ fontSize: "13px", color: d.color }}>{formatCr(d.value)}</p>
                          <p style={{ fontSize: "10px", color: "#AAA" }}>{m.totalDebt > 0 ? Math.round((d.value / m.totalDebt) * 100) : 0}% of debt</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2">
                      <span style={{ fontSize: "12px", color: "#555" }}>Debt-to-Asset Ratio</span>
                      <span className="font-bold" style={{ fontSize: "12px", color: m.debtToAssetRatio < 30 ? "#16A34A" : m.debtToAssetRatio < 50 ? "#D97706" : "#DC2626" }}>
                        {Math.round(m.debtToAssetRatio)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ETCard>

            {/* Net Worth Summary */}
            <ETCard>
              <ETCardHeader title="Net Worth Summary" sub="Assets minus Liabilities" />
              <div className="p-4">
                <div className="text-center mb-4">
                  <p style={{ fontSize: "10px", color: "#AAA", letterSpacing: "0.06em" }}>TOTAL NET WORTH</p>
                  <p className="font-black" style={{ fontSize: "2.2rem", color: m.netWorth >= 0 ? "#16A34A" : "#DC2626", fontFamily: "'IBM Plex Serif',serif" }}>
                    {formatCr(m.netWorth)}
                  </p>
                  <p style={{ fontSize: "11px", color: "#888" }}>
                    {m.netWorth >= u.annualSalary * 3 ? "✓ Strong financial base" : m.netWorth > 0 ? "Building wealth steadily" : "⚠ Liabilities exceed assets"}
                  </p>
                </div>
                {[
                  { label: "Total Assets",      value: m.totalAssets, color: "#16A34A",  bar: 100 },
                  { label: "Total Liabilities", value: m.totalDebt,   color: "#DC2626",  bar: m.totalAssets > 0 ? Math.round((m.totalDebt / m.totalAssets) * 100) : 0 },
                  { label: "Net Worth",         value: m.netWorth,    color: m.netWorth >= 0 ? "#2563EB" : "#DC2626", bar: null },
                ].map(r => (
                  <div key={r.label} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span style={{ fontSize: "11px", color: "#555" }}>{r.label}</span>
                      <span className="font-bold" style={{ fontSize: "12px", color: r.color }}>{formatCr(r.value)}</span>
                    </div>
                    {r.bar !== null && (
                      <div className="h-1.5" style={{ background: "#F0F0F0" }}>
                        <div className="h-full" style={{ width: `${r.bar}%`, background: r.color }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ETCard>
          </div>
        )}

        {/* ── Tab: Goals ── */}
        {activeTab === "goals" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {m.goals.map((goal, i) => {
              const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
              const remaining = Math.max(goal.target - goal.current, 0);
              const yearsLeft = parseInt(goal.by) - new Date().getFullYear();
              const monthsLeft = Math.max(yearsLeft * 12, 1);
              const reqMonthlySip = remaining / monthsLeft;
              return (
                <motion.div key={goal.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <ETCard>
                    <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: `2px solid ${goal.color}` }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "18px" }}>{goal.icon}</span>
                        <div>
                          <p className="font-bold" style={{ fontSize: "12px", color: "#1A1A1A" }}>{goal.label}</p>
                          <p style={{ fontSize: "10px", color: "#AAA" }}>Target by {goal.by}</p>
                        </div>
                      </div>
                      <span className="font-black" style={{ fontSize: "22px", color: goal.color }}>{pct}%</span>
                    </div>
                    <div className="p-4">
                      <div className="h-2 mb-3" style={{ background: "#F0F0F0", borderRadius: 1 }}>
                        <motion.div className="h-full" style={{ background: goal.color, borderRadius: 1 }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.07 + 0.3, duration: 0.8 }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Current",           val: formatCr(goal.current),    color: goal.color },
                          { label: "Target",            val: formatCr(goal.target),     color: "#1A1A1A" },
                          { label: "Gap",               val: formatCr(remaining),       color: remaining > 0 ? "#DC2626" : "#16A34A" },
                          { label: "Reqd. SIP/mo",      val: `₹${Math.round(reqMonthlySip / 1000)}K`, color: "#7C3AED" },
                        ].map(r => (
                          <div key={r.label} className="px-2 py-1.5" style={{ background: "#F9F9F9", borderRadius: 1 }}>
                            <p style={{ fontSize: "9px", color: "#AAA" }}>{r.label}</p>
                            <p className="font-bold" style={{ fontSize: "12px", color: r.color }}>{r.val}</p>
                          </div>
                        ))}
                      </div>
                      {pct >= 100 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <CheckCircle size={13} style={{ color: "#16A34A" }} />
                          <p style={{ fontSize: "11px", color: "#16A34A", fontWeight: 600 }}>Goal Achieved! 🎉</p>
                        </div>
                      )}
                    </div>
                  </ETCard>
                </motion.div>
              );
            })}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <button onClick={() => navigate("/goals")} className="w-full h-full min-h-[140px] flex flex-col items-center justify-center gap-2 transition-opacity hover:opacity-80"
                style={{ border: "2px dashed #E21B23", borderRadius: 2, background: "#FFF5F5" }}>
                <Target size={24} style={{ color: "#E21B23" }} />
                <p className="font-bold" style={{ fontSize: "13px", color: "#E21B23" }}>Open Goal Optimizer</p>
                <p style={{ fontSize: "11px", color: "#AAA" }}>Analyse & optimise all your goals</p>
              </button>
            </motion.div>
          </div>
        )}

        {/* ── Tab: Risk / Health ── */}
        {activeTab === "risk" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar chart */}
            <ETCard>
              <ETCardHeader title="Financial Health Radar" sub="6 dimensions of financial wellness" />
              <div className="p-4" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#F0F0F0" />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "#888" }} />
                    <Radar dataKey="score" stroke="#E21B23" fill="#E21B23" fillOpacity={0.18} strokeWidth={2} dot={{ fill: "#E21B23", r: 3 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ETCard>

            {/* Insurance & Risk */}
            <ETCard>
              <ETCardHeader title="Insurance & Risk Profile" />
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3" style={{ background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: 1 }}>
                    <p style={{ fontSize: "9px", color: "#AAA", letterSpacing: "0.06em" }}>LIFE COVER</p>
                    <p className="font-black mt-1" style={{ fontSize: "1.3rem", color: "#E21B23" }}>{formatCr(u.lifeInsuranceCover)}</p>
                    <p style={{ fontSize: "10px", color: u.lifeInsuranceCover >= u.annualSalary * 10 ? "#16A34A" : "#D97706" }}>
                      {u.lifeInsuranceCover >= u.annualSalary * 10 ? "✓ Adequate" : `⚠ Short by ${formatCr(u.annualSalary * 10 - u.lifeInsuranceCover)}`}
                    </p>
                  </div>
                  <div className="p-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 1 }}>
                    <p style={{ fontSize: "9px", color: "#AAA", letterSpacing: "0.06em" }}>HEALTH COVER</p>
                    <p className="font-black mt-1" style={{ fontSize: "1.3rem", color: "#16A34A" }}>{formatCr(u.healthInsuranceCover)}</p>
                    <p style={{ fontSize: "10px", color: u.healthInsuranceCover >= 500000 ? "#16A34A" : "#D97706" }}>
                      {u.healthInsuranceCover >= 500000 ? "✓ Adequate" : "⚠ Increase cover"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold mb-2" style={{ fontSize: "11px", color: "#555", letterSpacing: "0.04em" }}>RISK APPETITE: {u.riskAppetite.toUpperCase()}</p>
                  {[
                    { label: "Recommended equity allocation", val: u.riskAppetite === "aggressive" ? "75-85%" : u.riskAppetite === "moderate" ? "50-60%" : "20-30%" },
                    { label: "Current equity allocation",     val: `${m.sectorAllocation.equity}%` },
                    { label: "Expected XIRR",                 val: `${m.estimatedXirr}%` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-2" style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <span style={{ fontSize: "11px", color: "#666" }}>{r.label}</span>
                      <span className="font-bold" style={{ fontSize: "11px", color: "#1A1A1A" }}>{r.val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <p className="font-bold mb-2" style={{ fontSize: "11px", color: "#555" }}>FINANCIAL HEALTH SCORES</p>
                  <HealthBar label="Savings Rate" value={m.savingsRate} max={30} color="#16A34A" />
                  <HealthBar label="Investment Coverage" value={m.totalInvestments / Math.max(u.annualSalary, 1)} max={5} color="#2563EB" />
                  <HealthBar label="Insurance Coverage" value={u.lifeInsuranceCover / Math.max(u.annualSalary * 10, 1)} max={1} color="#E21B23" />
                  <HealthBar label="Emergency Fund" value={u.bankSavings / Math.max(totalMonthlyExp * 6, 1)} max={1} color="#D97706" />
                </div>
              </div>
            </ETCard>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between py-2 px-1" style={{ borderTop: "1px solid #E0E0E0" }}>
          <p style={{ fontSize: "10px", color: "#AAA" }}>© 2026 ET WealthNavigator · Data is processed locally</p>
          <button onClick={resetUserData} className="flex items-center gap-1 font-bold" style={{ fontSize: "10px", color: "#E21B23" }}>
            <LogOut size={10} /> Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}