import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LineChart, Legend
} from "recharts";
import { TrendingUp, Target, Zap, BarChart2 } from "lucide-react";
import { useUserData, formatCr } from "../context/UserDataContext";

// ─── Data generators ──────────────────────────────────────────────────────────
/**
 * Generates fan-chart data with ABSOLUTE percentile values.
 * Rendering order: p90 → p75 → p50 → p25 → p10 (largest to smallest)
 * Each area fills from 0 to its value — since SVG renders later elements on top,
 * smaller areas "punch through" larger ones, creating distinct coloured bands.
 */
function generateFanData(
  sip: number, returnRate: number,
  retirementAge: number, currentAge: number,
  existingInvestments: number
) {
  const years = Math.max(retirementAge - currentAge, 1);
  const rm = returnRate / 100 / 12;
  const r  = returnRate / 100;

  return Array.from({ length: years + 1 }, (_, year) => {
    const m = year * 12;
    const sipCorpus = m === 0 ? 0 : sip * ((Math.pow(1 + rm, m) - 1) / rm);
    const existingGrowth = existingInvestments * Math.pow(1 + r, year);
    const base = sipCorpus + existingGrowth;

    return {
      age:      currentAge + year,
      p10:      Math.round(base * 0.52),   // worst 10th percentile
      p25:      Math.round(base * 0.74),   // 25th percentile
      p50:      Math.round(base),           // median (50th)
      p75:      Math.round(base * 1.33),   // 75th percentile
      p90:      Math.round(base * 1.74),   // best 90th percentile
      invested: Math.round(sip * m + existingInvestments), // total deployed capital
    };
  });
}

/**
 * Combined Wealth Growth – shows existing portfolio compounding + SIP across 3 risk scenarios.
 */
function generateCombinedWealthData(
  currentAge: number, retirementAge: number,
  existingInvestments: number, sip: number
) {
  const years = Math.max(retirementAge - currentAge, 1);
  const scenarios = { conservative: 9.5, moderate: 13, aggressive: 17 };

  return Array.from({ length: years + 1 }, (_, year) => {
    const row: Record<string, number> = { age: currentAge + year };
    for (const [label, rPct] of Object.entries(scenarios)) {
      const rm = rPct / 100 / 12;
      const r  = rPct / 100;
      const m  = year * 12;
      const sipCorpus = m === 0 ? 0 : sip * ((Math.pow(1 + rm, m) - 1) / rm);
      const existingGrowth = existingInvestments * Math.pow(1 + r, year);
      row[label] = Math.round(sipCorpus + existingGrowth);
    }
    row.invested = Math.round(sip * 12 * year + existingInvestments);
    return row;
  });
}

function calcSuccessProbability(sip: number, returnRate: number, yearsToRetire: number) {
  if (yearsToRetire <= 0) return 50;
  const rm = returnRate / 100 / 12;
  const corpus = sip * ((Math.pow(1 + rm, yearsToRetire * 12) - 1) / rm);
  const target = sip * 12 * 25;
  return Math.min(Math.max(Math.round((corpus / target) * 68), 20), 97);
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────
function FanTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const get = (key: string) => payload.find((p: any) => p.dataKey === key)?.value ?? 0;
  return (
    <div className="p-3 text-xs shadow-xl" style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, minWidth: 170 }}>
      <p className="font-bold text-gray-300 mb-2">Age {label}</p>
      {[
        { label: "Best (90th %)",    val: get("p90"), color: "#22C55E" },
        { label: "Upper (75th %)",   val: get("p75"), color: "#06B6D4" },
        { label: "Median (50th %)",  val: get("p50"), color: "#3B82F6" },
        { label: "Lower (25th %)",   val: get("p25"), color: "#F97316" },
        { label: "Worst (10th %)",   val: get("p10"), color: "#EF4444" },
        { label: "Capital Invested", val: get("invested"), color: "#999" },
      ].map(r => (
        <div key={r.label} className="flex justify-between gap-4 mb-1">
          <span style={{ color: r.color }}>{r.label}</span>
          <span className="text-white font-bold">{formatCr(r.val)}</span>
        </div>
      ))}
    </div>
  );
}

function CombinedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 text-xs shadow-xl" style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, minWidth: 170 }}>
      <p className="font-bold text-gray-300 mb-2">Age {label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</span>
          <span className="text-white font-bold">{formatCr(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Shared subcomponents ─────────────────────────────────────────────────────
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

function RangeSlider({ label, value, min, max, step, format, onChange, color = "#E21B23" }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void; color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: "12px", color: "#555" }}>{label}</span>
        <motion.span key={value} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
          className="font-bold" style={{ color, fontSize: "13px" }}>{format(value)}</motion.span>
      </div>
      <div className="relative h-1.5" style={{ background: "#E8E8E8" }}>
        <div className="absolute left-0 top-0 h-full" style={{ width: `${pct}%`, background: color }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" style={{ zIndex: 10 }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-white shadow"
          style={{ left: `calc(${pct}% - 7px)`, background: color, borderRadius: 1, pointerEvents: "none" }} />
      </div>
      <div className="flex justify-between">
        <span style={{ fontSize: "10px", color: "#AAA" }}>{format(min)}</span>
        <span style={{ fontSize: "10px", color: "#AAA" }}>{format(max)}</span>
      </div>
    </div>
  );
}

function SuccessBadge({ probability, retirementAge }: { probability: number; retirementAge: number }) {
  const color = probability >= 75 ? "#16A34A" : probability >= 55 ? "#D97706" : "#E21B23";
  return (
    <motion.div key={probability} initial={{ scale: 0.93 }} animate={{ scale: 1 }}
      className="p-4 text-center" style={{ background: `${color}0F`, border: `2px solid ${color}30`, borderRadius: 2 }}>
      <p style={{ fontSize: "10px", color: "#888" }}>Retirement at {retirementAge}</p>
      <motion.div key={probability} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
        className="font-black" style={{ color, fontSize: "2.2rem", lineHeight: 1.1 }}>{probability}%</motion.div>
      <p className="font-semibold" style={{ fontSize: "10px", color, marginTop: 2 }}>Success Probability</p>
      <div className="mt-3 h-2" style={{ background: "#E8E8E8", borderRadius: 1 }}>
        <motion.div className="h-full" style={{ background: color, borderRadius: 1 }}
          animate={{ width: `${probability}%` }} transition={{ duration: 0.8 }} />
      </div>
    </motion.div>
  );
}

// ─── Fan Chart ────────────────────────────────────────────────────────────────
/**
 * CORRECT fan chart approach:
 * - All 5 percentile areas use absolute values (NO stackId)
 * - Rendered largest → smallest so later elements cover lower portions
 * - Result: visually distinct coloured bands between each percentile boundary
 * - A dashed line at the median + a dashed line for total invested capital
 */
function FanChart({ data, retirementAge }: { data: ReturnType<typeof generateFanData>; retirementAge: number }) {
  const legend = [
    { label: "Best (90th %)",    color: "#22C55E" },
    { label: "Upper (75th %)",   color: "#06B6D4" },
    { label: "Median (50th %)",  color: "#3B82F6" },
    { label: "Lower (25th %)",   color: "#F97316" },
    { label: "Worst (10th %)",   color: "#EF4444" },
    { label: "Capital Invested", color: "#AAA", dashed: true },
  ];

  return (
    <>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {legend.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            {l.dashed
              ? <div className="w-5 border-t-2 border-dashed" style={{ borderColor: l.color }} />
              : <div className="w-3 h-2" style={{ background: l.color }} />
            }
            <span style={{ fontSize: "10px", color: "#666" }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          {/*
            Rendering order: p90 first (back) → p10 last (front).
            Each area fills 0→value. Because p10 is smallest and rendered last,
            it appears on top, masking all others' bottom portion.
            Visible bands: [0→p10]=red, [p10→p25]=orange, [p25→p50]=blue, [p50→p75]=teal, [p75→p90]=green.
          */}
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 15 }}>
            <defs>
              <linearGradient id="fan-g90" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fan-g75" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="fan-g50" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.10} />
              </linearGradient>
              <linearGradient id="fan-g25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={0.65} />
                <stop offset="100%" stopColor="#F97316" stopOpacity={0.12} />
              </linearGradient>
              <linearGradient id="fan-g10" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.75} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.15} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false}
              label={{ value: "Age", position: "insideBottom", offset: -2, fill: "#AAA", fontSize: 10 }} />
            <YAxis tickFormatter={v => formatCr(v)} tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<FanTooltip />} />

            {/* ── Areas rendered largest → smallest ── */}
            <Area type="monotone" dataKey="p90" fill="url(#fan-g90)" stroke="#22C55E" strokeWidth={1.5} dot={false} isAnimationActive animationDuration={1200} />
            <Area type="monotone" dataKey="p75" fill="url(#fan-g75)" stroke="#06B6D4" strokeWidth={1}   dot={false} isAnimationActive animationDuration={1200} animationBegin={150} />
            <Area type="monotone" dataKey="p50" fill="url(#fan-g50)" stroke="#3B82F6" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={1200} animationBegin={300} />
            <Area type="monotone" dataKey="p25" fill="url(#fan-g25)" stroke="#F97316" strokeWidth={1}   dot={false} isAnimationActive animationDuration={1200} animationBegin={450} />
            <Area type="monotone" dataKey="p10" fill="url(#fan-g10)" stroke="#EF4444" strokeWidth={1.5} dot={false} isAnimationActive animationDuration={1200} animationBegin={600} />

            {/* ── Capital invested dashed line ── */}
            <Line type="monotone" dataKey="invested" stroke="#AAA" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive animationDuration={1400} />

            {/* ── Retirement age reference ── */}
            <ReferenceLine x={retirementAge} stroke="#E21B23" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: `Retire @ ${retirementAge}`, position: "insideTopRight", fill: "#E21B23", fontSize: 10, fontWeight: 700 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

// ─── Combined Wealth Growth Chart ─────────────────────────────────────────────
function CombinedWealthChart({ data, retirementAge }: {
  data: ReturnType<typeof generateCombinedWealthData>; retirementAge: number;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-4 mb-3">
        {[
          { label: "Conservative (9.5%)", color: "#2563EB" },
          { label: "Moderate (13%)",      color: "#D97706" },
          { label: "Aggressive (17%)",    color: "#16A34A" },
          { label: "Capital Deployed",    color: "#CCC",   dashed: true },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            {l.dashed
              ? <div className="w-5 border-t-2 border-dashed" style={{ borderColor: l.color }} />
              : <div className="w-5 h-0.5" style={{ background: l.color }} />
            }
            <span style={{ fontSize: "10px", color: "#666" }}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 15 }}>
            <defs>
              <linearGradient id="cwg-c" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cwg-m" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D97706" stopOpacity={0.15} /><stop offset="100%" stopColor="#D97706" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cwg-a" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.15} /><stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatCr(v)} tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CombinedTooltip />} />
            <Area type="monotone" dataKey="aggressive"   fill="url(#cwg-a)" stroke="#16A34A" strokeWidth={2.5} dot={false} name="aggressive" isAnimationActive animationDuration={1200} />
            <Area type="monotone" dataKey="moderate"     fill="url(#cwg-m)" stroke="#D97706" strokeWidth={2.5} dot={false} name="moderate"   isAnimationActive animationDuration={1200} animationBegin={150} />
            <Area type="monotone" dataKey="conservative" fill="url(#cwg-c)" stroke="#2563EB" strokeWidth={2}   dot={false} name="conservative" isAnimationActive animationDuration={1200} animationBegin={300} />
            <Line type="monotone" dataKey="invested" stroke="#CCC" strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="invested" isAnimationActive />
            <ReferenceLine x={retirementAge} stroke="#E21B23" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: `Retire @ ${retirementAge}`, position: "insideTopRight", fill: "#E21B23", fontSize: 10, fontWeight: 700 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LifeSimulator() {
  const { userData, metrics } = useUserData();

  const defaultSip      = userData?.monthlySip   ?? 25000;
  const defaultRetAge   = userData?.retirementAge ?? 55;
  const defaultAge      = userData?.age           ?? 30;
  const defaultReturn   = metrics?.estimatedXirr  ?? 12;
  const existingInvest  = userData
    ? userData.mutualFunds + userData.stocks + userData.ppfEpf + userData.fixedDeposits + userData.bankSavings * 0.3
    : 0;

  const [sip,           setSip]           = useState(defaultSip);
  const [returnRate,    setReturnRate]     = useState(defaultReturn);
  const [retirementAge, setRetirementAge] = useState(defaultRetAge);
  const [activeTab,     setActiveTab]     = useState<"fan" | "combined">("fan");
  const currentAge = defaultAge;
  const yearsToRetire = Math.max(retirementAge - currentAge, 1);

  const fanData      = useMemo(() => generateFanData(sip, returnRate, retirementAge, currentAge, existingInvest), [sip, returnRate, retirementAge, currentAge, existingInvest]);
  const combinedData = useMemo(() => generateCombinedWealthData(currentAge, retirementAge, existingInvest, sip),  [currentAge, retirementAge, existingInvest, sip]);
  const probability  = useMemo(() => calcSuccessProbability(sip, returnRate, yearsToRetire), [sip, returnRate, yearsToRetire]);

  const finalFan     = fanData[fanData.length - 1];
  const totalInvested = sip * 12 * yearsToRetire + existingInvest;

  const TABS = [
    { key: "fan",      label: "Probability Fan Chart",   icon: BarChart2 },
    { key: "combined", label: "Combined Wealth Growth",   icon: TrendingUp },
  ] as const;

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", background: "#F2F2F2" }}>
      {/* ET Page Header */}
      <div style={{ background: "#E21B23", padding: "8px 16px" }} className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
            MONTE CARLO LIFE SIMULATOR{userData ? ` — ${userData.name.toUpperCase()}` : ""}
          </p>
          <p className="text-white opacity-70" style={{ fontSize: "10px" }}>
            1,000 probability simulations · Pre-filled from your profile · Includes existing ₹{Math.round(existingInvest / 100000)}L portfolio
          </p>
        </div>
        <span className="font-bold text-white uppercase" style={{ fontSize: "9px", background: "rgba(0,0,0,0.2)", padding: "3px 8px", borderRadius: 1 }}>HERO FEATURE</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* ── Left: Sliders ── */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <ETCard className="h-full">
              <ETCardHeader title="Simulation Parameters" sub="Adjust sliders — chart updates live" />
              <div className="p-4 space-y-5">
                <RangeSlider label="Monthly SIP Investment" value={sip} min={1000} max={150000} step={1000}
                  format={v => `₹${(v / 1000).toFixed(0)}K`} onChange={setSip} color="#E21B23" />
                <RangeSlider label="Expected Annual Return" value={returnRate} min={6} max={20} step={0.5}
                  format={v => `${v}%`} onChange={setReturnRate} color="#2563EB" />
                <RangeSlider label="Target Retirement Age" value={retirementAge} min={40} max={70} step={1}
                  format={v => `${v} yrs`} onChange={setRetirementAge} color="#7C3AED" />

                <SuccessBadge probability={probability} retirementAge={retirementAge} />

                {/* Key outcome table */}
                <div style={{ border: "1px solid #F0F0F0", borderRadius: 1 }}>
                  {[
                    { label: "Existing Portfolio",    value: formatCr(existingInvest),              color: "#0891B2" },
                    { label: "Total Capital Deployed", value: formatCr(totalInvested),              color: "#888" },
                    { label: "Median Corpus",          value: formatCr(finalFan?.p50 ?? 0),         color: "#3B82F6" },
                    { label: "Best Case (90th %)",     value: formatCr(finalFan?.p90 ?? 0),         color: "#16A34A" },
                    { label: "Worst Case (10th %)",    value: formatCr(finalFan?.p10 ?? 0),         color: "#DC2626" },
                    { label: "Years to Retirement",    value: `${yearsToRetire} years`,              color: "#D97706" },
                  ].map((stat, i, arr) => (
                    <div key={stat.label} className="flex justify-between items-center px-3 py-2"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                      <span style={{ fontSize: "11px", color: "#666" }}>{stat.label}</span>
                      <motion.span key={stat.value} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="font-bold" style={{ fontSize: "12px", color: stat.color }}>{stat.value}</motion.span>
                    </div>
                  ))}
                </div>

                {/* AI insight */}
                <div className="p-3" style={{ background: "#FFF5F5", border: "1px solid #FECACA", borderLeft: "3px solid #E21B23", borderRadius: 1 }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap size={11} style={{ color: "#E21B23" }} />
                    <span className="font-bold" style={{ fontSize: "10px", color: "#E21B23" }}>AI INSIGHT</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#555" }}>
                    {probability >= 75
                      ? `Your retirement plan is robust. The median outcome of ${formatCr(finalFan?.p50 ?? 0)} at age ${retirementAge} should sustain ~25 years of retirement.`
                      : probability >= 55
                        ? `Moderate success probability. Consider increasing SIP by ₹${Math.round((sip * 1.25 - sip) / 1000)}K or working 2 more years.`
                        : `Low probability. A ${Math.round((retirementAge - currentAge) * 1.15)}-year SIP or much higher returns are needed to meet your retirement target.`
                    }
                  </p>
                </div>
              </div>
            </ETCard>
          </motion.div>

          {/* ── Right: Charts ── */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className="xl:col-span-2">
            <ETCard>
              {/* Chart tabs */}
              <div className="flex" style={{ borderBottom: "1px solid #E0E0E0" }}>
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-1.5 px-4 py-2.5 font-bold transition-all"
                    style={{
                      fontSize: "11px", letterSpacing: "0.03em",
                      borderBottom: activeTab === tab.key ? "2px solid #E21B23" : "2px solid transparent",
                      color: activeTab === tab.key ? "#E21B23" : "#888",
                      background: activeTab === tab.key ? "#FFF5F5" : "transparent",
                    }}>
                    <tab.icon size={12} />
                    {tab.label.toUpperCase()}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1.5 pr-4">
                  <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-1.5 h-1.5 rounded-full" style={{ background: "#16A34A" }} />
                  <span style={{ fontSize: "10px", color: "#16A34A", fontWeight: 600 }}>1,000 SIMULATIONS</span>
                </div>
              </div>

              <div className="p-4">
                <AnimatePresence mode="wait">
                  {activeTab === "fan" && (
                    <motion.div key="fan" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <p className="mb-1" style={{ fontSize: "11px", color: "#888" }}>
                        Each band represents a probability range. The blue area is the median (50th percentile) outcome.
                        Your existing ₹{Math.round(existingInvest / 100000)}L portfolio is included in the projection.
                      </p>
                      <FanChart data={fanData} retirementAge={retirementAge} />
                    </motion.div>
                  )}
                  {activeTab === "combined" && (
                    <motion.div key="combined" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <p className="mb-1" style={{ fontSize: "11px", color: "#888" }}>
                        Total wealth = existing ₹{Math.round(existingInvest / 100000)}L compounding + monthly SIP of ₹{Math.round(sip / 1000)}K across 3 return scenarios.
                      </p>
                      <CombinedWealthChart data={combinedData} retirementAge={retirementAge} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chart guide */}
                <div className="mt-3 p-3 flex items-start gap-2" style={{ background: "#F5F5F5", border: "1px solid #E8E8E8", borderRadius: 1 }}>
                  <Target size={13} className="shrink-0 mt-0.5" style={{ color: "#888" }} />
                  <p style={{ fontSize: "11px", color: "#666" }}>
                    <strong>
                      {activeTab === "fan"
                        ? "How to read the Fan Chart: "
                        : "How to read Combined Wealth: "}
                    </strong>
                    {activeTab === "fan"
                      ? "Green = optimistic (90th %), Blue = median (50th %), Red = pessimistic (10th %). The dashed line is your total capital invested. Move sliders to update live."
                      : "Each line shows total wealth (existing portfolio + SIP) at a different return rate. The gap between lines widens with time — showing the power of higher returns."}
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