import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis
} from "recharts";
import { AlertTriangle, Shield, TrendingDown, X, ChevronDown, ExternalLink, CheckCircle } from "lucide-react";

// ─── Alert Data ───────────────────────────────────────────────────────────────
const alerts = [
  {
    id: "emergency",
    severity: "CRITICAL",
    icon: "🚨",
    title: "Emergency Fund Warning",
    shortDesc: "Only 1.5 months of expenses covered — need 6 months",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
    current: 75000,
    required: 300000,
    pct: 25,
    detail: "You currently have ₹75,000 in liquid savings, covering only 1.5 months of your ₹50,000/month expenses. Financial experts recommend 6 months of emergency funds. You need ₹2,25,000 more.",
    action: "Move ₹15,000/month to liquid mutual fund for 15 months to build emergency corpus",
    impact: "Protects against job loss, medical emergency, or unexpected expenses",
    steps: ["Open a separate Liquid Fund SIP", "Auto-debit ₹15,000 on salary day", "Target: ₹3L in 15 months"],
  },
  {
    id: "sector",
    severity: "HIGH",
    icon: "⚠️",
    title: "Overexposure to Banking Sector",
    shortDesc: "38% of portfolio in banking — double the recommended 15-20%",
    color: "#F97316",
    bgColor: "#FFF7ED",
    borderColor: "#FED7AA",
    current: 38,
    required: 20,
    pct: 38,
    detail: "Your portfolio has 38% exposure to banking and financial services, primarily through 3 large-cap funds that all hold HDFC Bank, ICICI Bank, and Axis Bank in their top holdings. Any regulatory change or NPA crisis could severely impact returns.",
    action: "Rebalance 18% of banking exposure to diversified sectors like IT, Pharma, and Consumer",
    impact: "Reduces single-sector risk. Banking sector fell 32% in 2020 during NPA crisis",
    steps: ["Switch 15% from banking-heavy funds", "Add sectoral diversification", "Consider International fund for global exposure"],
  },
  {
    id: "expense",
    severity: "MEDIUM",
    icon: "💸",
    title: "High Expense Ratio Funds",
    shortDesc: "3 funds with expense ratio above 2% — draining ₹34,700/year",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
    current: 2.1,
    required: 0.5,
    pct: 67,
    detail: "You hold 3 regular plan mutual funds with expense ratios of 2.1%, 1.9%, and 1.8%. Switching to direct plans of the same funds would reduce expense ratios to 0.5-0.8%, saving ₹34,700 per year. Over 20 years, this compounds to ₹28.4L.",
    action: "Switch to Direct Plans — same fund, same manager, lower cost",
    impact: "₹34,700 saved annually → ₹28.4L more corpus over 20 years",
    steps: ["Use ET Money / MF Central to switch", "Process takes 1-3 business days", "No exit load if held >1 year"],
  },
  {
    id: "insurance",
    severity: "MEDIUM",
    icon: "🛡️",
    title: "Insufficient Life Insurance",
    shortDesc: "₹50L cover — recommended minimum ₹1.2Cr (10x annual income)",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    current: 5000000,
    required: 12000000,
    pct: 42,
    detail: "Your current life cover of ₹50L is only 4.2x your annual income of ₹12L. The 10x income rule suggests minimum ₹1.2Cr. With dependents, home loan, and retirement goals, underinsurance is a critical financial risk.",
    action: "Add a ₹75L term insurance plan — costs only ₹8,500/year at age 32",
    impact: "Complete financial protection for your family in case of untimely event",
    steps: ["Get quotes from HDFC Life, ICICI Prudential, LIC", "Choose 30-year term till age 62", "Monthly premium: ~₹700/month"],
  },
];

// ─── Risk Radar Data ──────────────────────────────────────────────────────────
const radarData = [
  { risk: "Emergency Fund", score: 25 },
  { risk: "Insurance Cover", score: 42 },
  { risk: "Sector Diversification", score: 45 },
  { risk: "Debt Management", score: 72 },
  { risk: "Goal Alignment", score: 65 },
  { risk: "Tax Efficiency", score: 55 },
];

// ─── Pulse Alert Card ─────────────────────────────────────────────────────────
function AlertCard({ alert, index }: { alert: typeof alerts[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      {/* Pulsing border animation for critical alerts */}
      <motion.div
        animate={alert.severity === "CRITICAL" ? {
          boxShadow: [
            `0 0 0 0 ${alert.color}30`,
            `0 0 0 8px ${alert.color}00`,
          ],
        } : {}}
        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        className="rounded-2xl overflow-hidden"
        style={{ border: `2px solid ${alert.borderColor}` }}
      >
        <div className="p-4" style={{ background: alert.bgColor }}>
          {/* Header */}
          <div className="flex items-start gap-3">
            <motion.span
              animate={alert.severity === "CRITICAL" ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xl shrink-0 mt-0.5"
            >
              {alert.icon}
            </motion.span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: alert.color, color: "white" }}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800">{alert.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{alert.shortDesc}</p>

              {/* Progress bar showing current vs required */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: alert.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(alert.pct, 100)}%` }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 1 }}
                  />
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: alert.color }}>{alert.pct}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <button onClick={() => setDismissed(true)} className="text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Expanded detail */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t" style={{ borderColor: `${alert.color}20` }}>
                  <p className="text-xs text-gray-700 leading-relaxed mb-3">{alert.detail}</p>

                  {/* Action */}
                  <div className="p-3 rounded-xl mb-3"
                    style={{ background: "white", border: `1px solid ${alert.color}20` }}>
                    <div className="flex items-start gap-2">
                      <TrendingDown size={13} className="shrink-0 mt-0.5" style={{ color: alert.color }} />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{alert.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5" style={{ color: alert.color }}>{alert.impact}</p>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-1.5">
                    {alert.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${alert.color}15` }}>
                          <span className="text-xs font-bold" style={{ color: alert.color, fontSize: "9px" }}>{i + 1}</span>
                        </div>
                        <p className="text-xs text-gray-600">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                      style={{ background: alert.color }}>
                      Fix This <ExternalLink size={11} />
                    </button>
                    <button
                      onClick={() => setDismissed(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 bg-white"
                      style={{ border: "1px solid #E5E7EB" }}
                    >
                      <CheckCircle size={11} /> Mark Reviewed
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function RiskAlerts() {
  const overallRisk = 42;
  const riskColor = overallRisk < 40 ? "#DC2626" : overallRisk < 60 ? "#D97706" : "#16A34A";

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
            RISK ALERTS PANEL
          </p>
          <p className="text-white opacity-70" style={{ fontSize: "10px" }}>4 active alerts · Portfolio Safety Score: 42/100</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2 h-2 rounded-full bg-white" />
          <span className="font-bold text-white" style={{ fontSize: "10px" }}>4 ALERTS ACTIVE</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Breaking alerts banner (ET style) */}
        <div className="flex items-stretch overflow-hidden" style={{ background: "#1A1A1A", borderRadius: 1 }}>
          <div className="px-3 py-2 flex items-center shrink-0" style={{ background: "#DC2626" }}>
            <span className="font-bold uppercase text-white" style={{ fontSize: "9px", letterSpacing: "0.12em" }}>ALERTS</span>
          </div>
          <div className="flex items-center px-4 gap-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {[
              "🚨 Emergency fund at 25% — needs immediate action",
              "⚠ 38% banking sector overexposure — rebalance recommended",
              "💸 ₹34,700/year lost to high expense ratio funds",
            ].map((msg, i) => (
              <span key={i} className="text-white whitespace-nowrap" style={{ fontSize: "11px", opacity: 0.85 }}>{msg}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Alert Cards */}
          <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-1 h-3.5" style={{ background: "#E21B23" }} />
                <p className="font-bold uppercase tracking-widest" style={{ fontSize: "9px", color: "#888", letterSpacing: "0.1em" }}>ACTIVE RISK ALERTS — SORTED BY SEVERITY</p>
              </div>
            </div>
            {alerts.map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} />
            ))}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Risk Score */}
            <ETCard>
              <ETCardHeader title="Portfolio Safety Score" sub="Resolve alerts to improve" />
              <div className="p-4 text-center">
                <div className="relative w-28 h-28 mx-auto mb-3">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F0F0F0" strokeWidth="10" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke={riskColor} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - overallRisk / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-black" style={{ color: "#1A1A1A", fontSize: "2rem" }}>{overallRisk}</span>
                    <span style={{ fontSize: "10px", color: "#AAA" }}>/100</span>
                  </div>
                </div>
                <p className="font-bold" style={{ color: riskColor, fontSize: "13px" }}>
                  {overallRisk < 40 ? "AT RISK" : overallRisk < 60 ? "MODERATE RISK" : "SAFE"}
                </p>
                <div className="mt-2 p-2" style={{ background: "#F5F5F5", borderRadius: 1 }}>
                  <p style={{ fontSize: "11px", color: "#666" }}>
                    Fix all 4 alerts → Score improves to <strong style={{ color: "#16A34A" }}>78/100</strong>
                  </p>
                </div>
              </div>
            </ETCard>

            {/* Risk Radar */}
            <ETCard>
              <ETCardHeader title="Risk Dimension Radar" />
              <div className="p-3" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                    <PolarGrid stroke="#F0F0F0" />
                    <PolarAngleAxis dataKey="risk" tick={{ fontSize: 9, fill: "#888" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="score" stroke="#E21B23" fill="#E21B23" fillOpacity={0.12} strokeWidth={2}
                      isAnimationActive animationBegin={500} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ETCard>

            {/* Fix Impact chart */}
            <ETCard>
              <ETCardHeader title="Score Gain by Fix" sub="Points added per alert resolved" />
              <div className="p-3" style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Emergency", score: 75 },
                    { name: "Insurance", score: 30 },
                    { name: "Expenses", score: 20 },
                    { name: "Sector", score: 18 },
                  ]} layout="vertical" margin={{ left: 10, right: 28 }}>
                    <XAxis type="number" domain={[0, 80]} tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} unit="pt" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip formatter={(v: number) => [`+${v} pts`, "Score gain"]} />
                    <Bar dataKey="score" radius={[0, 2, 2, 0]} isAnimationActive animationBegin={600}>
                      {["#DC2626", "#8B5CF6", "#D97706", "#F97316"].map((color, i) => <Cell key={`risk-bar-cell-${i}`} fill={color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ETCard>

            {/* ET-style bottom CTA */}
            <div className="p-3 flex items-center gap-3" style={{ background: "#1A1A1A", borderRadius: 1 }}>
              <Shield size={18} style={{ color: "#D97706" }} />
              <div>
                <p className="text-white font-bold" style={{ fontSize: "11px" }}>Fix all alerts → Score: 78/100</p>
                <p style={{ fontSize: "10px", color: "#888" }}>Est. time: 2 weeks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}