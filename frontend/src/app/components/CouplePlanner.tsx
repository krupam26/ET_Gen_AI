import { useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Users, TrendingUp, Shield, Zap, Heart, ArrowRight } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const partnerA = {
  name: "Rajesh Kumar",
  initials: "RK",
  income: 1200000,
  sip: 25000,
  investments: 3890000,
  insurance: 5000000,
  color: "#E21B23",
  age: 32,
};

const partnerB = {
  name: "Priya Kumar",
  initials: "PK",
  income: 800000,
  sip: 15000,
  investments: 2100000,
  insurance: 3000000,
  color: "#8B5CF6",
  age: 29,
};

function generateJointData() {
  const years = 20;
  const combinedSip = (partnerA.sip + partnerB.sip) * 1000 / 1000;
  const rate = 12 / 100 / 12;
  return Array.from({ length: years + 1 }, (_, i) => {
    const m = i * 12;
    const aCorpus = m === 0 ? partnerA.investments : partnerA.investments * Math.pow(1.12, i) + partnerA.sip * ((Math.pow(1 + rate, m) - 1) / rate);
    const bCorpus = m === 0 ? partnerB.investments : partnerB.investments * Math.pow(1.12, i) + partnerB.sip * ((Math.pow(1 + rate, m) - 1) / rate);
    return {
      year: 2026 + i,
      partnerA: Math.round(aCorpus),
      partnerB: Math.round(bCorpus),
      combined: Math.round(aCorpus + bCorpus),
    };
  });
}

const jointData = generateJointData();

function formatCr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const sipSplitData = [
  { name: "Rajesh SIP", value: 25, color: "#E21B23" },
  { name: "Priya SIP", value: 15, color: "#8B5CF6" },
];

const insuranceData = [
  { name: "Rajesh Cover", value: 50, color: "#E21B23" },
  { name: "Priya Cover", value: 30, color: "#8B5CF6" },
];

// ─── Joint Chart Tooltip ──────────────────────────────────────────────────────
function JointTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl p-3 text-xs" style={{ background: "#1F2933", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="text-gray-300 font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: p.color }}>{p.dataKey === "partnerA" ? "Rajesh" : p.dataKey === "partnerB" ? "Priya" : "Combined"}</span>
          <span className="text-white font-bold">{formatCr(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Partner Card ─────────────────────────────────────────────────────────────
function PartnerCard({ partner, delay }: { partner: typeof partnerA; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-5 shadow-sm"
      style={{ border: `2px solid ${partner.color}20` }}
    >
      {/* Avatar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ background: `linear-gradient(135deg, ${partner.color}, ${partner.color}99)` }}>
          {partner.initials}
        </div>
        <div>
          <p className="font-bold text-gray-900">{partner.name}</p>
          <p className="text-xs text-gray-400">Age {partner.age} • Active Investor</p>
        </div>
        <div className="ml-auto w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: `${partner.color}15` }}>
          <Heart size={14} style={{ color: partner.color }} />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {[
          { label: "Annual Income", value: formatCr(partner.income), icon: "💰" },
          { label: "Monthly SIP", value: `₹${(partner.sip / 1000).toFixed(0)}K`, icon: "📈" },
          { label: "Total Investments", value: formatCr(partner.investments), icon: "🏦" },
          { label: "Life Cover", value: formatCr(partner.insurance), icon: "🛡️" },
        ].map(stat => (
          <div key={stat.label} className="flex items-center justify-between py-2 px-3 rounded-xl"
            style={{ background: "#F9FAFB" }}>
            <div className="flex items-center gap-2">
              <span>{stat.icon}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: partner.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Progress ring placeholder */}
      <div className="mt-4 p-3 rounded-xl" style={{ background: `${partner.color}08`, border: `1px solid ${partner.color}15` }}>
        <p className="text-xs font-semibold" style={{ color: partner.color }}>Financial Health</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: partner.color }}
              initial={{ width: 0 }}
              animate={{ width: partner.name === "Rajesh Kumar" ? "72%" : "65%" }}
              transition={{ delay: delay + 0.3, duration: 1 }}
            />
          </div>
          <span className="text-xs font-bold" style={{ color: partner.color }}>
            {partner.name === "Rajesh Kumar" ? "72/100" : "65/100"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CouplePlanner() {
  const [showOptimization, setShowOptimization] = useState(true);
  const finalJoint = jointData[jointData.length - 1];

  const ETCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white ${className}`} style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>{children}</div>
  );
  const ETCardHeader = ({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) => (
    <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: "2px solid #E21B23" }}>
      <div>
        <p className="font-bold uppercase tracking-wide" style={{ fontSize: "11px", color: "#1A1A1A", letterSpacing: "0.06em", fontFamily: "'IBM Plex Sans',sans-serif" }}>{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "#AAA" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", background: "#F2F2F2" }}>
      {/* ET Page Header */}
      <div style={{ background: "#E21B23", padding: "8px 16px" }} className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold" style={{ fontSize: "11px", letterSpacing: "0.06em", fontFamily: "'IBM Plex Sans',sans-serif" }}>
            COUPLE'S JOINT MONEY PLANNER
          </p>
          <p className="text-white opacity-70" style={{ fontSize: "10px" }}>Unified financial intelligence for two · Tax-optimised</p>
        </div>
        <span className="font-bold text-white" style={{ fontSize: "11px" }}>Combined NW: {formatCr(partnerA.investments + partnerB.investments)}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Tax Optimization Banner */}
        {showOptimization && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3"
            style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderLeft: "3px solid #16A34A", borderRadius: 1 }}>
            <Zap size={15} style={{ color: "#16A34A" }} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold" style={{ fontSize: "12px", color: "#14532D", fontFamily: "'IBM Plex Sans',sans-serif" }}>
                ET AI INSIGHT: Splitting SIP between partners saves <span style={{ color: "#16A34A" }}>₹1.2L tax annually</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#166534" }}>
                Transfer ₹8,000/month from Rajesh's SIP to Priya's account. Both claim individual 80C deductions.
              </p>
            </div>
            <button className="flex items-center gap-1 font-bold shrink-0" style={{ fontSize: "11px", color: "#16A34A" }}>
              Apply <ArrowRight size={11} />
            </button>
            <button onClick={() => setShowOptimization(false)} style={{ color: "#16A34A", fontSize: "12px" }}>✕</button>
          </motion.div>
        )}

        {/* Partner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[partnerA, partnerB].map((partner, idx) => (
            <motion.div key={partner.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <ETCard>
                {/* Partner header */}
                <div className="px-4 pt-3 pb-2 flex items-center gap-3" style={{ borderBottom: `2px solid ${partner.color}` }}>
                  <div className="w-10 h-10 flex items-center justify-center text-white font-black"
                    style={{ background: partner.color, borderRadius: 2, fontSize: "14px" }}>
                    {partner.initials}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "#1A1A1A", fontSize: "14px", fontFamily: "'IBM Plex Serif',serif" }}>{partner.name}</p>
                    <p style={{ fontSize: "10px", color: "#888" }}>Age {partner.age} · Active Investor</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p style={{ fontSize: "9px", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.06em" }}>Health Score</p>
                    <p className="font-black" style={{ color: partner.color, fontSize: "18px" }}>
                      {partner.name === "Rajesh Kumar" ? "72" : "65"}
                    </p>
                  </div>
                </div>
                <div>
                  {[
                    { label: "Annual Income", value: formatCr(partner.income) },
                    { label: "Monthly SIP", value: `₹${(partner.sip / 1000).toFixed(0)}K/month` },
                    { label: "Total Investments", value: formatCr(partner.investments) },
                    { label: "Life Cover", value: formatCr(partner.insurance) },
                  ].map((stat, i, arr) => (
                    <div key={stat.label} className="flex items-center justify-between px-4 py-2.5"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                      <span style={{ fontSize: "12px", color: "#666" }}>{stat.label}</span>
                      <span className="font-bold" style={{ fontSize: "12px", color: partner.color }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5" style={{ background: "#FAFAFA", borderTop: "1px solid #F0F0F0" }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: "10px", color: "#888" }}>Financial Health Progress</span>
                    <span className="font-bold" style={{ fontSize: "10px", color: partner.color }}>
                      {partner.name === "Rajesh Kumar" ? "72%" : "65%"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full" style={{ background: "#F0F0F0" }}>
                    <motion.div className="h-full" style={{ background: partner.color }}
                      initial={{ width: 0 }}
                      animate={{ width: partner.name === "Rajesh Kumar" ? "72%" : "65%" }}
                      transition={{ delay: idx * 0.1 + 0.4, duration: 1 }} />
                  </div>
                </div>
              </ETCard>
            </motion.div>
          ))}
        </div>

        {/* Joint Wealth Graph */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ETCard>
            <ETCardHeader title="Combined Wealth Growth — 20-Year Projection"
              sub="At 12% CAGR with current SIP contributions"
              right={
                <div className="text-right">
                  <p style={{ fontSize: "9px", color: "#AAA", textTransform: "uppercase" }}>Combined by 2046</p>
                  <p className="font-black" style={{ color: "#8B5CF6", fontSize: "18px" }}>{formatCr(finalJoint.combined)}</p>
                </div>
              } />
            <div className="p-4">
              <div className="flex gap-4 mb-3">
                {[{ label: "Rajesh", color: "#E21B23" }, { label: "Priya", color: "#8B5CF6" }, { label: "Combined", color: "#16A34A" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-2" style={{ background: l.color }} />
                    <span style={{ fontSize: "11px", color: "#666" }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={jointData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <defs>
                      {[{ id: "cp-aGrad", color: "#E21B23" }, { id: "cp-bGrad", color: "#8B5CF6" }, { id: "cp-cGrad", color: "#16A34A" }].map(({ id, color }) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tickFormatter={v => formatCr(v)} tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip content={<JointTooltip />} />
                    <Area type="monotone" dataKey="partnerA" stroke="#E21B23" fill="url(#cp-aGrad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="partnerB" stroke="#8B5CF6" fill="url(#cp-bGrad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="combined" stroke="#16A34A" fill="url(#cp-cGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ETCard>
        </motion.div>

        {/* SIP Split + Insurance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SIP Split */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <ETCard>
              <ETCardHeader title="SIP Contribution Split" />
              <div className="p-4 flex items-center gap-4">
                <div style={{ width: 120, height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sipSplitData} cx="50%" cy="50%" innerRadius={36} outerRadius={56} dataKey="value" isAnimationActive animationBegin={400}>
                        {sipSplitData.map((entry, idx) => <Cell key={`sip-cell-${entry.name}-${idx}`} fill={entry.color} stroke="white" strokeWidth={2} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {sipSplitData.map(d => (
                    <div key={d.name}>
                      <div className="flex justify-between mb-1">
                        <span style={{ fontSize: "11px", color: "#666" }}>{d.name}</span>
                        <span className="font-bold" style={{ fontSize: "11px", color: d.color }}>₹{d.value}K/mo</span>
                      </div>
                      <div className="h-1.5" style={{ background: "#F0F0F0" }}>
                        <motion.div className="h-full" style={{ background: d.color }}
                          initial={{ width: 0 }} animate={{ width: `${(d.value / 40) * 100}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2" style={{ borderTop: "1px solid #F0F0F0" }}>
                    <div className="flex justify-between">
                      <span style={{ fontSize: "11px", color: "#888" }}>Total Monthly SIP</span>
                      <span className="font-black" style={{ fontSize: "14px", color: "#8B5CF6" }}>₹40K/mo</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-3">
                <div className="p-2" style={{ background: "#F0FDF4", borderLeft: "3px solid #16A34A", borderRadius: 1 }}>
                  <p style={{ fontSize: "11px", color: "#14532D" }}>
                    <strong>ET AI:</strong> Move ₹8K from Rajesh to Priya's ELSS → save ₹1.2L tax
                  </p>
                </div>
              </div>
            </ETCard>
          </motion.div>

          {/* Insurance */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <ETCard>
              <ETCardHeader title="Insurance Coverage Balance" sub="vs recommended 10x income rule" />
              <div className="p-4">
                {[
                  { name: "Rajesh", cover: 5000000, required: 7200000, color: "#E21B23" },
                  { name: "Priya", cover: 3000000, required: 4800000, color: "#8B5CF6" },
                ].map(p => {
                  const pct = Math.round((p.cover / p.required) * 100);
                  return (
                    <div key={p.name} className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="font-semibold" style={{ fontSize: "12px", color: "#1A1A1A" }}>{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "11px", color: "#888" }}>{formatCr(p.cover)} / {formatCr(p.required)}</span>
                          <span className="font-bold px-1.5 py-0.5"
                            style={{ fontSize: "9px", background: pct < 100 ? "#FEE2E2" : "#D1FAE5", color: pct < 100 ? "#DC2626" : "#16A34A", borderRadius: 1 }}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2" style={{ background: "#F0F0F0" }}>
                        <motion.div className="h-full" style={{ background: pct < 100 ? `linear-gradient(90deg, ${p.color}, #F59E0B)` : p.color }}
                          initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ delay: 0.5, duration: 0.9 }} />
                      </div>
                      {pct < 100 && (
                        <p style={{ fontSize: "10px", color: "#F97316", marginTop: 3 }}>⚠ Underinsured by {formatCr(p.required - p.cover)}</p>
                      )}
                    </div>
                  );
                })}
                <div className="p-2 mt-2" style={{ background: "#FFF8E7", borderLeft: "3px solid #D97706", borderRadius: 1 }}>
                  <p style={{ fontSize: "11px", color: "#78350F" }}>
                    <strong>Recommended:</strong> ₹50L family floater health + ₹5Cr term cover per partner
                  </p>
                </div>
              </div>
            </ETCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}