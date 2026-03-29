import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  Target, Shield, Zap, ArrowRight, CheckCircle, ExternalLink, LogOut
} from "lucide-react";
import { useUserData, formatCr, DerivedMetrics, UserData } from "../context/UserDataContext";

// ─── Animated Counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return value;
}

// ─── ET Card ──────────────────────────────────────────────────────────────────
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
        <p className="font-bold uppercase tracking-wide" style={{ fontSize: "11px", color: "#1A1A1A", letterSpacing: "0.06em", fontFamily: "'IBM Plex Sans',sans-serif" }}>{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "#AAA" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// ─── Market Indices ───────────────────────────────────────────────────────────
const marketIndices = [
  { name: "SENSEX",   value: "73,487", change: "+901",  pct: "+1.24%", up: true  },
  { name: "NIFTY 50", value: "22,327", change: "+217",  pct: "+0.98%", up: true  },
  { name: "GOLD",     value: "₹72,450",change: "+340",  pct: "+0.47%", up: true  },
  { name: "USD/INR",  value: "83.42",  change: "-0.18", pct: "-0.22%", up: false },
];

function MarketIndexWidget({ item, delay }: { item: typeof marketIndices[0]; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <ETCard className="p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="font-bold uppercase" style={{ fontSize: "10px", color: "#888", letterSpacing: "0.06em" }}>{item.name}</p>
          <p className="font-bold mt-0.5" style={{ fontSize: "15px", color: "#1A1A1A", fontFamily: "'IBM Plex Sans',sans-serif" }}>{item.value}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end">
            {item.up ? <TrendingUp size={12} style={{ color: "#16A34A" }} /> : <TrendingDown size={12} style={{ color: "#DC2626" }} />}
            <span className="font-bold" style={{ fontSize: "11px", color: item.up ? "#16A34A" : "#DC2626" }}>{item.pct}</span>
          </div>
          <p style={{ fontSize: "10px", color: item.up ? "#16A34A" : "#DC2626" }}>{item.change}</p>
        </div>
      </ETCard>
    </motion.div>
  );
}

// ─── Quick Stats Bar ──────────────────────────────────────────────────────────
function QuickStatsBar({ m, u }: { m: DerivedMetrics; u: UserData }) {
  const nw = useCountUp(m.netWorth, 1800, 100);
  const stats = [
    { label: "NET WORTH",       value: formatCr(nw),               sub: `Savings rate: ${Math.round(m.savingsRate)}%`,   up: m.netWorth >= 0 },
    { label: "MONTHLY SIP",     value: `₹${Math.round(u.monthlySip / 1000)}K`,  sub: "Across your funds",              up: true  },
    { label: "PORTFOLIO XIRR",  value: `${m.estimatedXirr}%`,       sub: "Expected annual return",              up: true  },
    { label: "MONEY HEALTH",    value: `${m.moneyHealthScore}/100`,  sub: m.moneyHealthScore >= 70 ? "Good — keep it up" : "Needs attention", up: null },
    { label: "TAX SAVED (EST)", value: formatCr(m.annualTax * 0.15), sub: `${u.taxRegime === "new" ? "New" : "Old"} regime`,  up: true  },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-0 bg-white" style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>
      {stats.map((stat, i) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="p-3 flex flex-col justify-between"
          style={{ borderRight: i < stats.length - 1 ? "1px solid #F0F0F0" : "none" }}>
          <p className="font-bold uppercase tracking-wider" style={{ fontSize: "9px", color: "#AAA", letterSpacing: "0.08em" }}>{stat.label}</p>
          <p className="font-bold mt-1" style={{ fontSize: "16px", color: "#1A1A1A", fontFamily: "'IBM Plex Sans',sans-serif" }}>{stat.value}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {stat.up === true  && <TrendingUp  size={9} style={{ color: "#16A34A" }} />}
            {stat.up === false && <TrendingDown size={9} style={{ color: "#DC2626" }} />}
            <p style={{ fontSize: "10px", color: stat.up === true ? "#16A34A" : stat.up === false ? "#DC2626" : "#888" }}>{stat.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
function ETAlertBanner({ m, u }: { m: DerivedMetrics; u: UserData }) {
  const alerts = [
    m.debtToAssetRatio > 30  && `⚠ Debt-to-asset ratio ${Math.round(m.debtToAssetRatio)}% — consider debt reduction`,
    m.savingsRate < 20       && `⚠ Savings rate ${Math.round(m.savingsRate)}% — aim for 20%+ for healthy finances`,
    u.lifeInsuranceCover < u.annualSalary * 10 && `⚠ Life cover ₹${(u.lifeInsuranceCover / 100000).toFixed(0)}L — recommended ${(u.annualSalary / 10000).toFixed(0)}L (10x income)`,
    u.monthlySip < m.monthlyIncome * 0.15 && `💡 Increase SIP to ₹${Math.round(m.monthlyIncome * 0.15 / 1000)}K/mo for 15% savings rate`,
    m.moneyHealthScore >= 75 && `✅ Money Health Score ${m.moneyHealthScore}/100 — excellent financial discipline!`,
  ].filter(Boolean) as string[];

  if (alerts.length === 0) return null;

  return (
    <div className="flex items-stretch overflow-hidden" style={{ background: "#1A1A1A", borderRadius: 2 }}>
      <div className="px-3 py-2 flex items-center shrink-0" style={{ background: "#E21B23" }}>
        <span className="font-bold uppercase text-white" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>ALERT</span>
      </div>
      <div className="flex items-center px-4 gap-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {alerts.map((msg, i) => (
          <span key={i} className="text-white whitespace-nowrap" style={{ fontSize: "11px", opacity: 0.9 }}>{msg}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Circular Gauge ───────────────────────────────────────────────────────────
const GAUGE_R = 62;
const GAUGE_PATH_LEN = Math.PI * GAUGE_R;
const GAUGE_PATH = `M ${-GAUGE_R} 0 A ${GAUGE_R} ${GAUGE_R} 0 0 0 ${GAUGE_R} 0`;

function CircularGauge({ score, m, u }: { score: number; m: DerivedMetrics; u: UserData }) {
  const [hovered, setHovered] = useState(false);
  const scoreColor = score >= 75 ? "#16A34A" : score >= 50 ? "#D97706" : "#E21B23";

  const totalMonthlyExp = u.rentEmi + u.groceries + u.utilities + u.transport + u.dining + u.entertainment + u.education + u.otherExpenses;
  const emergencyTarget = totalMonthlyExp * 6;

  const categories = [
    { label: "Savings Rate",    score: Math.min(Math.round(m.savingsRate * 2.5), 100), color: "#16A34A" },
    { label: "Debt Management", score: Math.max(Math.round(100 - m.debtToAssetRatio * 1.5), 0), color: "#D97706" },
    { label: "Investment Mix",  score: Math.min(Math.round((m.totalInvestments / (m.totalAssets || 1)) * 100), 100), color: "#2563EB" },
    { label: "Insurance Cover", score: u.annualSalary > 0 ? Math.min(Math.round((u.lifeInsuranceCover / (u.annualSalary * 10)) * 100), 100) : 0, color: "#EA580C" },
    { label: "Emergency Fund",  score: emergencyTarget > 0 ? Math.min(Math.round((u.bankSavings / emergencyTarget) * 100), 100) : 50, color: "#7C3AED" },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="cursor-pointer" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <svg viewBox="-80 -78 160 98" className="w-48">
          <path d={GAUGE_PATH} fill="none" stroke="#F0F0F0" strokeWidth="14" strokeLinecap="round" />
          <motion.path d={GAUGE_PATH} fill="none" stroke={scoreColor} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={GAUGE_PATH_LEN}
            initial={{ strokeDashoffset: GAUGE_PATH_LEN }}
            animate={{ strokeDashoffset: GAUGE_PATH_LEN * (1 - score / 100) }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }} />
          <motion.path d={GAUGE_PATH} fill="none" stroke={scoreColor} strokeWidth="22" strokeLinecap="round" strokeOpacity="0.1"
            strokeDasharray={GAUGE_PATH_LEN}
            initial={{ strokeDashoffset: GAUGE_PATH_LEN }}
            animate={{ strokeDashoffset: GAUGE_PATH_LEN * (1 - score / 100) }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }} />
          <text x="0" y="-18" textAnchor="middle" fill="#1A1A1A" fontSize="32" fontWeight="700" fontFamily="'IBM Plex Sans',sans-serif">{score}</text>
          <text x="0" y="2" textAnchor="middle" fill="#999" fontSize="11" fontFamily="'IBM Plex Sans',sans-serif">/ 100</text>
          <text x="0" y="16" textAnchor="middle" fill={scoreColor} fontSize="11" fontWeight="600" fontFamily="'IBM Plex Sans',sans-serif">
            {score >= 75 ? "EXCELLENT" : score >= 50 ? "GOOD" : "AT RISK"}
          </text>
          <text x={-GAUGE_R - 2} y="12" textAnchor="middle" fill="#CCC" fontSize="9">0</text>
          <text x={GAUGE_R + 2}  y="12" textAnchor="middle" fill="#CCC" fontSize="9">100</text>
        </svg>
      </div>
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full space-y-2 px-1">
            {categories.map((cat, i) => (
              <motion.div key={cat.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2">
                <span className="text-xs w-28 shrink-0" style={{ color: "#666" }}>{cat.label}</span>
                <div className="flex-1 h-1.5 overflow-hidden" style={{ background: "#F0F0F0" }}>
                  <motion.div className="h-full" style={{ background: cat.color }}
                    initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} transition={{ delay: i * 0.05 + 0.1, duration: 0.5 }} />
                </div>
                <span className="text-xs font-bold w-6 text-right" style={{ color: cat.color }}>{cat.score}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {!hovered && <p className="text-xs text-center" style={{ color: "#AAA" }}>Hover to see parameter breakdown</p>}
    </div>
  );
}

// ─── Snapshot Stat Row ────────────────────────────────────────────────────────
function SnapshotStat({ label, value, change, color, delay }: {
  label: string; value: number; change: string; color: string; delay: number;
}) {
  const animated = useCountUp(value, 1800, delay);
  const isPos = change.startsWith("+");
  return (
    <div className="py-3 px-4 flex items-center justify-between" style={{ borderBottom: "1px solid #F5F5F5" }}>
      <p className="text-xs font-medium" style={{ color: "#555" }}>{label}</p>
      <div className="text-right">
        <p className="font-bold" style={{ color: "#1A1A1A", fontSize: "14px", fontFamily: "'IBM Plex Sans',sans-serif" }}>{formatCr(animated)}</p>
        <div className="flex items-center gap-1 justify-end">
          {isPos ? <TrendingUp size={9} style={{ color }} /> : <TrendingDown size={9} style={{ color: "#DC2626" }} />}
          <span className="font-semibold" style={{ fontSize: "10px", color: isPos ? color : "#DC2626" }}>{change}</span>
        </div>
      </div>
    </div>
  );
}

// ─── AI Recommendations (dynamic) ────────────────────────────────────────────
function buildRecs(m: DerivedMetrics, u: UserData) {
  const recs = [];
  if (m.sipRecommendation > u.monthlySip) {
    const gap = Math.round((m.sipRecommendation - u.monthlySip) / 1000);
    recs.push({
      id: 1, tag: "HIGH PRIORITY", tagColor: "#E21B23", icon: Zap,
      title: `Increase SIP by ₹${gap}K/month`,
      sub: `Currently at ${Math.round(u.monthlySip / m.monthlyIncome * 100)}% savings rate — target 15%+`,
      impact: `+${formatCr(gap * 1000 * 12 * (u.retirementAge - u.age))} over ${u.retirementAge - u.age} yrs`,
      detail: `Based on your income of ${formatCr(u.annualSalary)}/yr, you should invest at least ₹${Math.round(m.sipRecommendation / 1000)}K/month. This adds approximately ${formatCr(gap * 1000 * 12 * (u.retirementAge - u.age))} to your retirement corpus at ${m.estimatedXirr}% XIRR.`,
    });
  }
  if (m.totalDebt > 0 && m.debtToAssetRatio > 30) {
    recs.push({
      id: 2, tag: "DEBT ALERT", tagColor: "#DC2626", icon: Shield,
      title: "High debt — prioritise loan repayment",
      sub: `Debt is ${Math.round(m.debtToAssetRatio)}% of your assets — target <30%`,
      impact: "Free cash flow",
      detail: `Your total debt of ${formatCr(m.totalDebt)} represents ${Math.round(m.debtToAssetRatio)}% of assets. Focus on clearing credit card (highest interest) and personal loans first. Once cleared, redirect those EMIs to SIP for compounding.`,
    });
  }
  if (u.lifeInsuranceCover < u.annualSalary * 7 && u.annualSalary > 0) {
    recs.push({
      id: 3, tag: "INSURANCE", tagColor: "#D97706", icon: Shield,
      title: `Increase life cover to ${formatCr(u.annualSalary * 10)}`,
      sub: `Current cover: ${formatCr(u.lifeInsuranceCover)} — recommended 10x income`,
      impact: "Family protection",
      detail: `Your current life cover of ${formatCr(u.lifeInsuranceCover)} is below the recommended 10x annual income (${formatCr(u.annualSalary * 10)}). A term policy for the shortfall would cost as little as ₹800-1,200/month.`,
    });
  }
  if (recs.length === 0) {
    recs.push({
      id: 1, tag: "OPTIMISATION", tagColor: "#2563EB", icon: Target,
      title: "Switch to Direct Mutual Funds",
      sub: "Eliminate commission costs — save 0.5-1% annually",
      impact: "+₹10-20K/year",
      detail: `Your portfolio looks healthy! A key optimisation: switching from Regular to Direct mutual fund plans eliminates distributor commissions (0.5-1% annually), which compounds significantly over ${u.retirementAge - u.age} years.`,
    });
  }
  return recs;
}

function AIRecs({ m, u }: { m: DerivedMetrics; u: UserData }) {
  const recs = buildRecs(m, u);
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div>
      {recs.map((rec, i) => (
        <motion.div key={rec.id} layout onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
          className="cursor-pointer" whileHover={{ backgroundColor: "#FAFAFA" }}
          style={{ borderBottom: i < recs.length - 1 ? "1px solid #F0F0F0" : "none", background: expanded === rec.id ? "#FFF9F9" : "white" }}>
          <div className="flex items-start gap-3 p-3">
            <div className="w-0.5 self-stretch shrink-0 rounded-full" style={{ background: rec.tagColor, minHeight: 36 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold uppercase tracking-wide px-1.5 py-0.5"
                  style={{ fontSize: "9px", background: `${rec.tagColor}15`, color: rec.tagColor, letterSpacing: "0.06em", borderRadius: 1 }}>
                  {rec.tag}
                </span>
              </div>
              <p className="font-semibold" style={{ color: "#1A1A1A", fontSize: "13px", fontFamily: "'IBM Plex Serif',serif" }}>{rec.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "#888" }}>{rec.sub}</p>
            </div>
            <div className="flex items-start gap-1 shrink-0">
              <span className="font-bold text-xs" style={{ color: rec.tagColor }}>{rec.impact}</span>
              <motion.div animate={{ rotate: expanded === rec.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} style={{ color: "#AAA" }} />
              </motion.div>
            </div>
          </div>
          <AnimatePresence>
            {expanded === rec.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="px-4 pb-3 pt-1 ml-3">
                  <p className="text-xs leading-relaxed" style={{ color: "#555" }}>{rec.detail}</p>
                  <button className="mt-2 flex items-center gap-1 text-xs font-bold" style={{ color: rec.tagColor }}>
                    Take Action <ArrowRight size={11} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Goal Progress ────────────────────────────────────────────────────────────
function GoalProgress({ goals }: { goals: DerivedMetrics["goals"] }) {
  return (
    <div>
      {goals.map((goal, i) => {
        const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
        return (
          <motion.div key={goal.label} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 + 0.3 }}
            className="p-3" style={{ borderBottom: i < goals.length - 1 ? "1px solid #F5F5F5" : "none" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "13px" }}>{goal.icon}</span>
                <div>
                  <p className="font-semibold" style={{ fontSize: "12px", color: "#1A1A1A" }}>{goal.label}</p>
                  <p style={{ fontSize: "10px", color: "#AAA" }}>Target by {goal.by}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold" style={{ fontSize: "12px", color: goal.color }}>{pct}%</p>
                <p style={{ fontSize: "10px", color: "#AAA" }}>{formatCr(goal.current)}</p>
              </div>
            </div>
            <div className="h-1.5 w-full" style={{ background: "#F0F0F0" }}>
              <motion.div className="h-full" style={{ background: goal.color }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.08 + 0.5, duration: 0.9, ease: "easeOut" }} />
            </div>
            {pct >= 100 && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle size={10} style={{ color: "#16A34A" }} />
                <span style={{ fontSize: "10px", color: "#16A34A" }}>Goal achieved!</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function Dashboard() {
  const { userData: u, metrics: m, resetUserData } = useUserData();
  if (!u || !m) return null;

  const firstName = u.name.split(" ")[0];
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const snapshotStats = [
    { label: "Net Worth",          value: m.netWorth,          change: m.netWorth >= 0 ? "+2.4%" : "-1.2%", color: "#16A34A"  },
    { label: "Monthly Savings",    value: m.monthlySavings,    change: m.savingsRate > 20 ? "+8.3%" : "+1.1%", color: "#2563EB" },
    { label: "Total Investments",  value: m.totalInvestments,  change: "+3.1%",                              color: "#7C3AED"  },
    { label: "Outstanding Debt",   value: m.totalDebt,         change: m.totalDebt > 0 ? "-1.2%" : "—",     color: "#DC2626"  },
  ];

  const yearsToRetire = u.retirementAge - u.age;
  const projectedCorpus = u.monthlySip * 12 * yearsToRetire * ((m.estimatedXirr / 100) + 1.5);

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", background: "#F2F2F2" }}>
      {/* Red header strip */}
      <div style={{ background: "#E21B23", padding: "8px 16px" }} className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold" style={{ fontSize: "11px", letterSpacing: "0.06em", fontFamily: "'IBM Plex Sans',sans-serif" }}>
            MY WEALTH DASHBOARD — {u.name.toUpperCase()}
          </p>
          <p className="text-white opacity-70" style={{ fontSize: "10px" }}>{today} · Personalised for you</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-white font-bold" style={{ fontSize: "11px" }}>LIVE</span>
          </motion.div>
          <span className="text-white opacity-60 hidden sm:block" style={{ fontSize: "11px" }}>Good morning, {firstName} 👋</span>
          <button onClick={resetUserData} className="flex items-center gap-1 transition-opacity hover:opacity-100 opacity-70"
            style={{ color: "white" }} title="Edit profile / re-enter data">
            <LogOut size={12} />
            <span style={{ fontSize: "10px" }}>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Alerts */}
        <ETAlertBanner m={m} u={u} />

        {/* Market Indices */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <div className="w-1 h-3.5" style={{ background: "#E21B23" }} />
            <p className="font-bold uppercase tracking-widest" style={{ fontSize: "9px", color: "#888", letterSpacing: "0.1em" }}>MARKET SNAPSHOT</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {marketIndices.map((item, i) => <MarketIndexWidget key={item.name} item={item} delay={i * 0.06} />)}
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <div className="w-1 h-3.5" style={{ background: "#E21B23" }} />
            <p className="font-bold uppercase tracking-widest" style={{ fontSize: "9px", color: "#888", letterSpacing: "0.1em" }}>YOUR FINANCIAL OVERVIEW</p>
          </div>
          <QuickStatsBar m={m} u={u} />
        </div>

        {/* 3-column row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Health Score */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <ETCard>
              <ETCardHeader title="Money Health Score" sub="Based on your financial data"
                right={<span className="font-bold uppercase px-2 py-0.5 text-white" style={{ fontSize: "9px", background: "#E21B23", borderRadius: 1 }}>Personalised</span>} />
              <div className="p-4">
                <CircularGauge score={m.moneyHealthScore} m={m} u={u} />
              </div>
            </ETCard>
          </motion.div>

          {/* Financial Snapshot */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <ETCard className="h-full flex flex-col">
              <ETCardHeader title="Financial Snapshot" sub="Your live numbers"
                right={
                  <div className="flex items-center gap-1.5">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 h-1.5 rounded-full" style={{ background: "#16A34A" }} />
                    <span style={{ fontSize: "10px", color: "#16A34A", fontWeight: 600 }}>Live</span>
                  </div>
                } />
              <div className="flex-1">
                {snapshotStats.map((s, i) => (
                  <SnapshotStat key={s.label} label={s.label} value={s.value} change={s.change} color={s.color} delay={(i + 1) * 150} />
                ))}
              </div>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "#FAFAFA", borderTop: "1px solid #F0F0F0" }}>
                <p style={{ fontSize: "11px", color: "#888" }}>
                  Debt-to-Asset: <strong style={{ color: "#1A1A1A" }}>{Math.round(m.debtToAssetRatio)}%</strong>
                </p>
                <span className="ml-auto font-bold" style={{ fontSize: "10px", color: m.debtToAssetRatio < 30 ? "#16A34A" : m.debtToAssetRatio < 50 ? "#D97706" : "#DC2626" }}>
                  {m.debtToAssetRatio < 30 ? "✓ Healthy" : m.debtToAssetRatio < 50 ? "⚠ Moderate" : "⚠ High"}
                </span>
              </div>
            </ETCard>
          </motion.div>

          {/* AI Recs */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <ETCard className="h-full flex flex-col">
              <ETCardHeader title="AI Recommendations" sub="Based on your profile"
                right={
                  <div className="flex items-center gap-1 px-1.5 py-0.5" style={{ background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 1 }}>
                    <Zap size={9} style={{ color: "#E21B23" }} />
                    <span style={{ fontSize: "9px", color: "#E21B23", fontWeight: 700 }}>AI POWERED</span>
                  </div>
                } />
              <div className="flex-1">
                <AIRecs m={m} u={u} />
              </div>
              <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                <p style={{ fontSize: "10px", color: "#888" }}>{buildRecs(m, u).length} actions pending</p>
                <button className="flex items-center gap-1 font-bold" style={{ fontSize: "11px", color: "#E21B23" }}>
                  View All <ExternalLink size={10} />
                </button>
              </div>
            </ETCard>
          </motion.div>
        </div>

        {/* Goal Tracker */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <ETCard>
            <ETCardHeader title="Goal Progress Tracker" sub="Your personalised milestones"
              right={
                <button className="flex items-center gap-1 font-bold" style={{ fontSize: "11px", color: "#E21B23" }}>
                  + Add Goal <ChevronRight size={12} />
                </button>
              } />
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div style={{ borderRight: "1px solid #F5F5F5" }}>
                <GoalProgress goals={m.goals} />
              </div>
              <div className="p-4 flex flex-col gap-3 justify-center">
                <p className="font-bold" style={{ fontSize: "13px", color: "#1A1A1A", fontFamily: "'IBM Plex Serif',serif" }}>
                  Retire at {u.retirementAge} — {yearsToRetire} years away
                </p>
                <p style={{ fontSize: "12px", color: "#555" }}>
                  At your current SIP of {formatCr(u.monthlySip)}/month with {m.estimatedXirr}% expected XIRR,
                  you are building towards your retirement goal.
                </p>
                <div className="pt-2" style={{ borderTop: "1px solid #F0F0F0" }}>
                  {[
                    { label: "Current net worth",     value: formatCr(m.netWorth),                  color: m.netWorth >= 0 ? "#16A34A" : "#DC2626" },
                    { label: "Monthly savings rate",  value: `${Math.round(m.savingsRate)}%`,        color: m.savingsRate > 20 ? "#16A34A" : "#D97706" },
                    { label: "Expected XIRR",         value: `${m.estimatedXirr}%`,                  color: "#2563EB" },
                    { label: `Projected by age ${u.retirementAge}`, value: formatCr(projectedCorpus), color: "#E21B23" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <span style={{ fontSize: "11px", color: "#666" }}>{item.label}</span>
                      <span className="font-bold" style={{ fontSize: "11px", color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 font-bold text-white px-4 py-2 self-start transition-opacity hover:opacity-90"
                  style={{ background: "#E21B23", fontSize: "11px", borderRadius: 1 }}>
                  <Target size={12} /> Optimise Goal Plan
                </button>
              </div>
            </div>
          </ETCard>
        </motion.div>

        {/* Footer */}
        <div className="flex items-center justify-between py-2 px-1" style={{ borderTop: "1px solid #E0E0E0" }}>
          <p style={{ fontSize: "10px", color: "#AAA" }}>
            © 2026 The Economic Times · WealthNavigator is for informational purposes only. Not financial advice.
          </p>
          <p style={{ fontSize: "10px", color: "#E21B23", fontWeight: 600 }}>ET PREMIUM MEMBER</p>
        </div>
      </div>
    </div>
  );
}
