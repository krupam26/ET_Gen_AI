import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, Legend
} from "recharts";
import {
  Target, Zap, TrendingUp, CheckCircle, AlertTriangle,
  ArrowRight, ChevronDown, Info, Sliders
} from "lucide-react";
import { useUserData, formatCr } from "../context/UserDataContext";

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────
function ETCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white ${className}`} style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>{children}</div>;
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

function sipFV(monthlyAmount: number, ratePercent: number, years: number): number {
  if (years <= 0 || monthlyAmount <= 0) return 0;
  const r = ratePercent / 100 / 12;
  const n = years * 12;
  return monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

function requiredSip(target: number, existing: number, ratePercent: number, years: number): number {
  if (years <= 0 || target <= existing) return 0;
  const gap = target - existing;
  const r = ratePercent / 100 / 12;
  const n = years * 12;
  const fvFactor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return fvFactor > 0 ? gap / fvFactor : 0;
}

// ─── Goal Card (unchanged) ────────────────────────────────────────────────────
function GoalCard({ goal, xirr, allocatedSip, idx }: {
  goal: { label: string; icon: string; current: number; target: number; by: string; color: string };
  xirr: number; allocatedSip: number; idx: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const yearsLeft = Math.max(parseInt(goal.by) - new Date().getFullYear(), 0.1);
  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const remaining = Math.max(goal.target - goal.current, 0);
  const reqSip = requiredSip(goal.target, goal.current, xirr, yearsLeft);
  const sipCorpus = sipFV(allocatedSip, xirr, yearsLeft);
  const projectedTotal = goal.current + sipCorpus;
  const willAchieve = projectedTotal >= goal.target;
  const surplus = projectedTotal - goal.target;

  let yearsNeeded = yearsLeft;
  if (!willAchieve && allocatedSip > 0) {
    for (let y = 1; y <= 50; y++) {
      const fv = goal.current + sipFV(allocatedSip, xirr, y);
      if (fv >= goal.target) { yearsNeeded = y; break; }
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
      className="cursor-pointer" onClick={() => setExpanded(!expanded)}
      style={{ border: "1px solid #E8E8E8", borderLeft: `3px solid ${goal.color}`, borderRadius: 2, background: "white" }}>
      <div className="flex items-start gap-3 p-4">
        <span style={{ fontSize: "20px" }}>{goal.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-bold" style={{ fontSize: "13px", color: "#1A1A1A" }}>{goal.label}</p>
              <p style={{ fontSize: "10px", color: "#AAA" }}>Target: {formatCr(goal.target)} · By {goal.by}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold px-2 py-0.5 text-white"
                style={{ fontSize: "9px", background: willAchieve ? "#16A34A" : "#E21B23", borderRadius: 1 }}>
                {willAchieve ? "✓ ON TRACK" : "⚠ SHORTFALL"}
              </span>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown size={14} style={{ color: "#AAA" }} />
              </motion.div>
            </div>
          </div>

          <div className="h-1.5 mt-2 mb-2" style={{ background: "#F0F0F0", borderRadius: 1 }}>
            <motion.div className="h-full" style={{ background: goal.color, borderRadius: 1 }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: idx * 0.07 + 0.3, duration: 0.7 }} />
          </div>

          <div className="flex flex-wrap gap-3">
            <span style={{ fontSize: "11px", color: "#555" }}>Saved: <strong style={{ color: goal.color }}>{formatCr(goal.current)}</strong></span>
            <span style={{ fontSize: "11px", color: "#555" }}>Gap: <strong style={{ color: willAchieve ? "#16A34A" : "#DC2626" }}>{willAchieve ? `+${formatCr(surplus)}` : `-${formatCr(remaining)}`}</strong></span>
            <span style={{ fontSize: "11px", color: "#555" }}>Reqd SIP: <strong style={{ color: "#7C3AED" }}>₹{Math.round(reqSip / 1000)}K/mo</strong></span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 ml-9">
              <div className="pt-3" style={{ borderTop: "1px solid #F0F0F0" }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { label: "Projected Corpus", val: formatCr(projectedTotal), color: willAchieve ? "#16A34A" : "#DC2626" },
                    { label: "Required SIP/mo",  val: `₹${Math.round(reqSip / 1000)}K`,  color: "#7C3AED" },
                    { label: "Years Left",        val: `${yearsLeft.toFixed(0)} yrs`,      color: "#2563EB" },
                    { label: "At Allocated SIP",  val: willAchieve ? `On time` : `${yearsNeeded} yrs`, color: willAchieve ? "#16A34A" : "#D97706" },
                  ].map(s => (
                    <div key={s.label} className="p-2" style={{ background: "#F9F9F9", borderRadius: 1 }}>
                      <p style={{ fontSize: "9px", color: "#AAA" }}>{s.label}</p>
                      <p className="font-bold" style={{ fontSize: "12px", color: s.color }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                {!willAchieve && (
                  <div className="flex items-start gap-2 p-2" style={{ background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: 1 }}>
                    <AlertTriangle size={12} style={{ color: "#D97706" }} className="shrink-0 mt-0.5" />
                    <p style={{ fontSize: "11px", color: "#B45309" }}>
                      To achieve this goal on time, increase your total SIP by ₹{Math.round((reqSip - allocatedSip) / 1000)}K/month,
                      or extend the timeline by {Math.round(yearsNeeded - yearsLeft)} year(s).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── SIP Allocation Slider (unchanged) ────────────────────────────────────────
function SipSlider({ label, value, max, color, onChange }: {
  label: string; value: number; max: number; color: string; onChange: (v: number) => void;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span style={{ fontSize: "11px", color: "#555" }}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ fontSize: "12px", color }}>₹{Math.round(value / 1000)}K/mo</span>
          <span style={{ fontSize: "10px", color: "#AAA" }}>({pct}%)</span>
        </div>
      </div>
      <div className="relative h-1.5" style={{ background: "#F0F0F0" }}>
        <div className="absolute left-0 top-0 h-full" style={{ width: `${pct}%`, background: color }} />
        <input type="range" min={0} max={max} step={500} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" style={{ zIndex: 10 }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-white shadow"
          style={{ left: `calc(${pct}% - 6px)`, background: color, borderRadius: 1, pointerEvents: "none" }} />
      </div>
    </div>
  );
}

// ─── What-If Simulator (unchanged) ────────────────────────────────────────────
function WhatIfSimulator({ goals, xirr }: {
  goals: Array<{ label: string; icon: string; current: number; target: number; by: string; color: string }>;
  xirr: number;
}) {
  const [extraSip, setExtraSip] = useState(5000);

  const impacts = goals.map(g => {
    const yearsLeft = Math.max(parseInt(g.by) - new Date().getFullYear(), 0.1);
    const withExtra = g.current + sipFV(extraSip, xirr, yearsLeft);
    const withoutExtra = g.current;
    return {
      label: g.label,
      icon: g.icon,
      color: g.color,
      extraCorpus: Math.round(withExtra - withoutExtra),
      achieves: withExtra >= g.target && withoutExtra < g.target,
    };
  });

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Sliders size={14} style={{ color: "#E21B23" }} />
        <span style={{ fontSize: "12px", color: "#555" }}>If I invest ₹ more per month:</span>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <input type="range" min={1000} max={50000} step={1000} value={extraSip}
              onChange={e => setExtraSip(Number(e.target.value))}
              className="flex-1 accent-red-600" style={{ height: 4 }} />
            <span className="font-black shrink-0" style={{ color: "#E21B23", fontSize: "16px", minWidth: 60 }}>
              ₹{Math.round(extraSip / 1000)}K
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {impacts.map(imp => (
          <div key={imp.label} className="flex items-center gap-3 p-2"
            style={{ background: imp.achieves ? "#F0FDF4" : "#FAFAFA", border: `1px solid ${imp.achieves ? "#BBF7D0" : "#F0F0F0"}`, borderRadius: 1 }}>
            <span style={{ fontSize: "16px" }}>{imp.icon}</span>
            <span style={{ fontSize: "11px", color: "#555", flex: 1 }}>{imp.label}</span>
            <div className="text-right">
              <p className="font-bold" style={{ fontSize: "12px", color: imp.color }}>+{formatCr(imp.extraCorpus)}</p>
              {imp.achieves && <p style={{ fontSize: "9px", color: "#16A34A", fontWeight: 700 }}>GOAL NOW ACHIEVABLE ✓</p>}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3" style={{ fontSize: "10px", color: "#AAA" }}>
        * Projection at {xirr}% XIRR over respective timelines
      </p>
    </div>
  );
}

// ─── Timeline Chart (unchanged) ───────────────────────────────────────────────
function GoalTimelineChart({ goals, xirr, sipAllocations }: {
  goals: Array<{ label: string; current: number; target: number; by: string; color: string }>;
  xirr: number;
  sipAllocations: number[];
}) {
  const currentYear = new Date().getFullYear();
  const maxYear = goals.reduce((m, g) => Math.max(m, parseInt(g.by)), currentYear + 2);

  const chartData = Array.from({ length: maxYear - currentYear + 1 }, (_, i) => {
    const year = currentYear + i;
    const row: any = { year };
    goals.forEach((g, j) => {
      const yearsElapsed = year - currentYear;
      const corpus = g.current + sipFV(sipAllocations[j] || 0, xirr, yearsElapsed);
      row[`goal_${j}`] = Math.round(corpus);
    });
    return row;
  });

  const COLORS = ["#E21B23", "#2563EB", "#16A34A", "#D97706", "#7C3AED"];

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => formatCr(v)} tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} width={55} />
          <Tooltip
            formatter={(v: any, name: string) => {
              const idx = parseInt(name.replace("goal_", ""));
              return [formatCr(Number(v)), goals[idx]?.label ?? name];
            }}
            contentStyle={{ background: "#1A1A1A", border: "none", borderRadius: 2, fontSize: 11, color: "white" }}
          />
          <Legend
            formatter={(value: string) => {
              const idx = parseInt(value.replace("goal_", ""));
              return goals[idx]?.label ?? value;
            }}
            wrapperStyle={{ fontSize: "10px" }}
          />
          {goals.map((g, i) => (
            <Line key={`goal-line-${i}`} type="monotone" dataKey={`goal_${i}`}
              stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} name={`goal_${i}`} isAnimationActive />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── SIP Allocation Bar (unchanged) ───────────────────────────────────────────
function SipAllocationBar({ goals, allocations, totalSip }: {
  goals: Array<{ label: string; icon: string; color: string }>;
  allocations: number[];
  totalSip: number;
}) {
  const COLORS = ["#E21B23", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#EA580C"];
  const allocated = allocations.reduce((a, b) => a + b, 0);
  const unallocated = Math.max(totalSip - allocated, 0);

  const barData = [
    ...goals.map((g, i) => ({ label: g.label, amount: allocations[i], color: COLORS[i % COLORS.length] })),
    ...(unallocated > 0 ? [{ label: "Unallocated", amount: unallocated, color: "#E0E0E0" }] : []),
  ];

  return (
    <div className="p-4">
      <div className="flex h-6 rounded overflow-hidden mb-3 gap-0.5">
        {barData.filter(b => b.amount > 0).map((b, i) => (
          <motion.div key={b.label} initial={{ width: 0 }} animate={{ width: `${(b.amount / Math.max(totalSip, 1)) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            style={{ background: b.color, height: "100%" }}
            title={`${b.label}: ₹${Math.round(b.amount / 1000)}K`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {barData.map(b => (
          <div key={b.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5" style={{ background: b.color, borderRadius: 1 }} />
            <span style={{ fontSize: "10px", color: "#666" }}>{b.label}: <strong style={{ color: b.color }}>₹{Math.round(b.amount / 1000)}K</strong></span>
          </div>
        ))}
      </div>
      {unallocated > 0 && (
        <div className="mt-2 flex items-center gap-1.5" style={{ background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: 1, padding: "6px 10px" }}>
          <Info size={11} style={{ color: "#D97706" }} />
          <p style={{ fontSize: "10px", color: "#B45309" }}>
            ₹{Math.round(unallocated / 1000)}K/month unallocated — consider distributing across your goals for better coverage.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main GoalOptimizer with Real-Time AI Recommendations ─────────────────────
export function GoalOptimizer() {
  const { userData: u, metrics: m } = useUserData();
  if (!u || !m) return null;

  const goals = m.goals;
  const xirr = m.estimatedXirr;
  const totalSip = u.monthlySip;
  const totalMonthlyExp = u.rentEmi + u.groceries + u.utilities + u.transport + u.dining + u.entertainment + u.education + u.otherExpenses;
  const monthlySavings = m.monthlySavings;

  const evenSplit = goals.length > 0 ? Math.floor(totalSip / goals.length) : 0;
  const [allocations, setAllocations] = useState<number[]>(goals.map(() => evenSplit));
  const [activeTab, setActiveTab] = useState<"goals" | "allocate" | "whatif" | "timeline">("goals");

  const totalAllocated = allocations.reduce((a, b) => a + b, 0);
  const over = totalAllocated > totalSip;

  const reqSips = goals.map(g => {
    const yearsLeft = Math.max(parseInt(g.by) - new Date().getFullYear(), 0.1);
    return requiredSip(g.target, g.current, xirr, yearsLeft);
  });
  const totalRequired = reqSips.reduce((a, b) => a + b, 0);

  const canFundAll = totalRequired <= totalSip;
  const sipSurplus = totalSip - totalRequired;

  const TABS = [
    { key: "goals",    label: "All Goals" },
    { key: "allocate", label: "SIP Allocator" },
    { key: "whatif",   label: "What-If" },
    { key: "timeline", label: "Timeline Chart" },
  ] as const;

  // ─── Real-time AI Recommendations from Backend ─────────────────────────────
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Give me 4 short, actionable AI recommendations for my goals. 
            Current SIP: ₹${totalSip}, Total required SIP: ₹${totalRequired}, 
            Goals: ${goals.map(g => g.label).join(", ")}, XIRR: ${xirr}%`,
            income: u.income || 0,
            savings: u.savings || 0,
            investments: u.investments || 0,
            debt: u.debt || 0,
          }),
        });

        const data = await res.json();
        let reply = data.reply || "";

        const recs = reply.split("\n")
          .filter(line => line.trim().length > 10)
          .slice(0, 4)
          .map((line, i) => ({
            tag: ["CRITICAL", "GROWTH", "RETURNS", "DIVERSIFY"][i % 4],
            color: ["#DC2626", "#2563EB", "#D97706", "#16A34A"][i % 4],
            text: line.replace(/^\*+|\*+$/g, "").trim()
          }));

        setRecommendations(recs.length > 0 ? recs : [
          { tag: "GROWTH", color: "#2563EB", text: `Your current SIP can be optimized. Consider increasing by ₹${Math.round((totalRequired - totalSip) / 1000)}K/month.` },
          { tag: "DIVERSIFY", color: "#16A34A", text: "Diversify your equity allocation to reduce risk across goals." },
        ]);
      } catch (err) {
        console.error(err);
        setRecommendations([
          { tag: "GROWTH", color: "#2563EB", text: `Your current SIP can be optimized. Consider increasing by ₹${Math.round((totalRequired - totalSip) / 1000)}K/month.` },
          { tag: "DIVERSIFY", color: "#16A34A", text: "Diversify your equity allocation to reduce risk across goals." },
        ]);
      }
    };

    fetchRecommendations();
  }, [totalSip, totalRequired, goals, xirr]);

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", background: "#F2F2F2" }}>
      {/* Page Header */}
      <div style={{ background: "#E21B23", padding: "8px 16px" }} className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>GOAL OPTIMIZER — {u.name.toUpperCase()}</p>
          <p className="text-white opacity-70" style={{ fontSize: "10px" }}>AI-powered goal planning · {goals.length} active goals</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-white" style={{ fontSize: "11px" }}>
            Total SIP: <span style={{ color: "#FDE68A" }}>₹{Math.round(totalSip / 1000)}K/mo</span>
          </span>
          <span className="font-bold" style={{ fontSize: "11px", color: canFundAll ? "#BBF7D0" : "#FCA5A5" }}>
            {canFundAll ? "✓ All goals fundable" : `⚠ Shortfall ₹${Math.round((totalRequired - totalSip) / 1000)}K/mo`}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Banner */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4"
          style={{
            background: canFundAll ? "#F0FDF4" : "#FFF5F5",
            border: `1px solid ${canFundAll ? "#BBF7D0" : "#FECACA"}`,
            borderLeft: `4px solid ${canFundAll ? "#16A34A" : "#E21B23"}`,
            borderRadius: 1,
          }}>
          <div className="w-10 h-10 flex items-center justify-center shrink-0"
            style={{ background: canFundAll ? "#16A34A" : "#E21B23", borderRadius: 2 }}>
            {canFundAll ? <CheckCircle size={20} color="white" /> : <AlertTriangle size={20} color="white" />}
          </div>
          <div className="flex-1">
            <p className="font-bold" style={{ color: canFundAll ? "#14532D" : "#991B1B", fontSize: "13px" }}>
              ET AI VERDICT: {canFundAll
                ? `Your SIP of ₹${Math.round(totalSip / 1000)}K can fund all goals with ₹${Math.round(sipSurplus / 1000)}K to spare`
                : `Need ₹${Math.round((totalRequired - totalSip) / 1000)}K more SIP per month to fund all ${goals.length} goals on time`
              }
            </p>
            <p style={{ fontSize: "11px", color: canFundAll ? "#166534" : "#B91C1C", marginTop: 2 }}>
              Total required SIP: ₹{Math.round(totalRequired / 1000)}K · Current: ₹{Math.round(totalSip / 1000)}K · XIRR assumption: {xirr}%
            </p>
          </div>
          <div className="text-center shrink-0">
            <p style={{ fontSize: "9px", color: "#AAA", textTransform: "uppercase" }}>Goals on track</p>
            <p className="font-black" style={{ fontSize: "1.8rem", color: canFundAll ? "#16A34A" : "#E21B23" }}>
              {goals.filter((g, i) => {
                const yearsLeft = Math.max(parseInt(g.by) - new Date().getFullYear(), 0.1);
                return g.current + sipFV(allocations[i], xirr, yearsLeft) >= g.target;
              }).length}/{goals.length}
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Current SIP",        val: `₹${Math.round(totalSip / 1000)}K/mo`,           color: "#E21B23" },
            { label: "Total Required SIP",  val: `₹${Math.round(totalRequired / 1000)}K/mo`,      color: "#2563EB" },
            { label: "SIP Surplus/Gap",     val: canFundAll ? `+₹${Math.round(sipSurplus / 1000)}K` : `-₹${Math.round((totalRequired - totalSip) / 1000)}K`, color: canFundAll ? "#16A34A" : "#DC2626" },
            { label: "Total Goal Target",   val: formatCr(goals.reduce((a, g) => a + g.target, 0)), color: "#D97706" },
          ].map(s => (
            <div key={s.label} className="p-3 bg-white" style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>
              <p style={{ fontSize: "9px", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <p className="font-black mt-1" style={{ fontSize: "18px", color: s.color, fontFamily: "'IBM Plex Sans',sans-serif" }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
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

        {/* Tab: All Goals */}
        {activeTab === "goals" && (
          <div className="space-y-3">
            {goals.map((goal, i) => (
              <GoalCard key={goal.label} goal={goal} xirr={xirr} allocatedSip={allocations[i]} idx={i} />
            ))}
          </div>
        )}

        {/* Tab: SIP Allocator */}
        {activeTab === "allocate" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ETCard>
              <ETCardHeader title="Allocate Your SIP Across Goals"
                sub={`Total available: ₹${Math.round(totalSip / 1000)}K/month`}
                right={
                  <span className="font-bold px-2 py-1 text-white" style={{ fontSize: "10px", background: over ? "#DC2626" : "#16A34A", borderRadius: 1 }}>
                    {over ? `OVER BY ₹${Math.round((totalAllocated - totalSip) / 1000)}K` : `₹${Math.round((totalSip - totalAllocated) / 1000)}K left`}
                  </span>
                } />
              <div className="p-4">
                {goals.map((g, i) => (
                  <SipSlider key={g.label} label={`${g.icon} ${g.label}`}
                    value={allocations[i]} max={totalSip} color={["#E21B23", "#2563EB", "#16A34A", "#D97706", "#7C3AED"][i % 5]}
                    onChange={v => { const next = [...allocations]; next[i] = v; setAllocations(next); }} />
                ))}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #F0F0F0" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>Total allocated</span>
                  <span className="font-black" style={{ fontSize: "16px", color: over ? "#DC2626" : "#1A1A1A" }}>
                    ₹{Math.round(totalAllocated / 1000)}K / ₹{Math.round(totalSip / 1000)}K
                  </span>
                </div>
                <button onClick={() => {
                  const auto = reqSips.map((r, i) => Math.min(Math.round(r), Math.round(totalSip / goals.length)));
                  setAllocations(auto);
                }} className="mt-3 w-full py-2 font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#E21B23", borderRadius: 1, fontSize: "12px" }}>
                  <Zap size={12} className="inline mr-1" />
                  Auto-Allocate Optimally
                </button>
              </div>
            </ETCard>

            <ETCard>
              <ETCardHeader title="Allocation Breakdown" sub="Visual split of your monthly SIP" />
              <SipAllocationBar goals={goals} allocations={allocations} totalSip={totalSip} />
            </ETCard>
          </div>
        )}

        {/* Tab: What-If */}
        {activeTab === "whatif" && (
          <ETCard>
            <ETCardHeader title="What-If Simulator"
              sub="See impact of extra monthly investment on each goal"
              right={
                <div className="flex items-center gap-1 px-2 py-1" style={{ background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 1 }}>
                  <Zap size={10} style={{ color: "#E21B23" }} />
                  <span style={{ fontSize: "9px", color: "#E21B23", fontWeight: 700 }}>INTERACTIVE</span>
                </div>
              } />
            <WhatIfSimulator goals={goals} xirr={xirr} />
          </ETCard>
        )}

        {/* Tab: Timeline Chart */}
        {activeTab === "timeline" && (
          <ETCard>
            <ETCardHeader title="Goal Wealth Trajectory" sub="Projected corpus growth per goal over time" />
            <div className="p-4">
              <GoalTimelineChart goals={goals} xirr={xirr} sipAllocations={allocations} />
            </div>
          </ETCard>
        )}

        {/* ── Real-time AI Recommendations ── */}
        <ETCard>
          <ETCardHeader title="AI Recommendations" sub="Personalised action items from ET AI" />
          <div className="p-4 space-y-2">
            {recommendations.map((rec: any, i) => (
              <div key={i} className="flex items-start gap-3 p-3"
                style={{ background: "#FAFAFA", border: `1px solid #F0F0F0`, borderLeft: `3px solid ${rec.color}`, borderRadius: 1 }}>
                <span className="font-bold shrink-0 px-1.5 py-0.5 text-white" style={{ fontSize: "8px", background: rec.color, borderRadius: 1 }}>{rec.tag}</span>
                <p style={{ fontSize: "11px", color: "#555", lineHeight: 1.5 }}>{rec.text}</p>
                <ArrowRight size={12} style={{ color: "#CCC" }} className="shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </ETCard>

        <div className="flex items-center justify-center py-2">
          <p style={{ fontSize: "10px", color: "#AAA" }}>© 2026 ET WealthNavigator · Projections are illustrative only. Not financial advice.</p>
        </div>
      </div>
    </div>
  );
}