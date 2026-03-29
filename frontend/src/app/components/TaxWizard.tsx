import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend, ComposedChart, Area
} from "recharts";
import { FileText, Upload, ChevronDown, Check, Zap, TrendingDown, ArrowRight, Info } from "lucide-react";
import { useUserData, formatCr } from "../context/UserDataContext";

// ─── Tax computation helpers ───────────────────────────────────────────────────
function computeOldRegimeTax(grossIncome: number): number {
  // Standard deduction 50K + assumed 80C 1.5L + 80D 25K + HRA est = 2.25L deductions
  const deductions = Math.min(225000, grossIncome * 0.25);
  const taxable = Math.max(grossIncome - deductions, 0);

  let tax = 0;
  if (taxable <= 250000) tax = 0;
  else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
  else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
  else tax = 112500 + (taxable - 1000000) * 0.30;

  // 4% cess
  return Math.round(tax * 1.04);
}

function computeNewRegimeTax(grossIncome: number): number {
  // Standard deduction 75K (FY 2025-26)
  const taxable = Math.max(grossIncome - 75000, 0);

  let tax = 0;
  if (taxable <= 300000) tax = 0;
  else if (taxable <= 700000) tax = (taxable - 300000) * 0.05;
  else if (taxable <= 1000000) tax = 20000 + (taxable - 700000) * 0.10;
  else if (taxable <= 1200000) tax = 50000 + (taxable - 1000000) * 0.15;
  else if (taxable <= 1500000) tax = 80000 + (taxable - 1200000) * 0.20;
  else tax = 140000 + (taxable - 1500000) * 0.30;

  // Rebate u/s 87A: if taxable ≤ 7L, tax = 0 in new regime
  if (taxable <= 700000) tax = 0;

  return Math.round(tax * 1.04);
}

/** Generate slab-by-slab cumulative tax for the bar chart */
function buildSlabData(grossIncome: number) {
  const slabs = [
    { range: "0–3L",   upTo: 300000  },
    { range: "3–6L",   upTo: 600000  },
    { range: "6–9L",   upTo: 900000  },
    { range: "9–12L",  upTo: 1200000 },
    { range: "12–15L", upTo: 1500000 },
    { range: "15–20L", upTo: 2000000 },
    { range: "20–25L", upTo: 2500000 },
    { range: ">25L",   upTo: 5000000 },
  ].filter(s => grossIncome >= (s.upTo - 300000));

  return slabs.map(slab => {
    const income = Math.min(grossIncome, slab.upTo);
    return {
      range: slab.range,
      old: computeOldRegimeTax(income),
      new: computeNewRegimeTax(income),
    };
  });
}

/** Per-rupee effective tax rate at various income points */
function buildEffectiveRateData(maxIncome: number) {
  const points = [300000, 500000, 700000, 900000, 1200000, 1500000, 1800000, 2100000, 2500000, 3000000];
  return points
    .filter(p => p <= Math.max(maxIncome * 1.2, 1500000))
    .map(income => ({
      income: `₹${(income / 100000).toFixed(0)}L`,
      old: Number(((computeOldRegimeTax(income) / income) * 100).toFixed(1)),
      new: Number(((computeNewRegimeTax(income) / income) * 100).toFixed(1)),
    }));
}

// ─── ET Card helpers ──────────────────────────────────────────────────────────
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

// ─── Tooltips ─────────────────────────────────────────────────────────────────
function SlabTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const oldT = payload.find((p: any) => p.dataKey === "old")?.value ?? 0;
  const newT = payload.find((p: any) => p.dataKey === "new")?.value ?? 0;
  return (
    <div className="p-3 text-xs" style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
      <p className="text-gray-300 font-bold mb-2">Income up to {label}</p>
      <div className="flex justify-between gap-4"><span style={{ color: "#EF4444" }}>Old Regime</span><span className="text-white font-bold">{formatCr(oldT)}</span></div>
      <div className="flex justify-between gap-4"><span style={{ color: "#22C55E" }}>New Regime</span><span className="text-white font-bold">{formatCr(newT)}</span></div>
      {oldT !== newT && (
        <div className="mt-1.5 font-bold" style={{ color: oldT > newT ? "#22C55E" : "#EF4444" }}>
          {oldT > newT ? `New saves: ${formatCr(oldT - newT)}` : `Old saves: ${formatCr(newT - oldT)}`}
        </div>
      )}
    </div>
  );
}

function RateTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const oldR = payload.find((p: any) => p.dataKey === "old")?.value ?? 0;
  const newR = payload.find((p: any) => p.dataKey === "new")?.value ?? 0;
  return (
    <div className="p-3 text-xs" style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
      <p className="text-gray-300 font-bold mb-2">Income {label}</p>
      <div className="flex justify-between gap-4"><span style={{ color: "#EF4444" }}>Old Regime ETR</span><span className="text-white font-bold">{oldR}%</span></div>
      <div className="flex justify-between gap-4"><span style={{ color: "#22C55E" }}>New Regime ETR</span><span className="text-white font-bold">{newR}%</span></div>
    </div>
  );
}

// ─── Investment Card ──────────────────────────────────────────────────────────
function InvestmentCard({ inv, index }: {
  inv: { id: string; icon: string; title: string; limit: string; taxSaving: number; color: string; description: string; detail: string; currentUsage: number; maxLimit: number };
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round((inv.currentUsage / inv.maxLimit) * 100);
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
      layout className="overflow-hidden cursor-pointer bg-white" onClick={() => setExpanded(!expanded)}
      whileHover={{ y: -1 }} style={{ border: `1px solid ${inv.color}25`, borderLeft: `3px solid ${inv.color}`, borderRadius: 2 }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span style={{ fontSize: "20px" }} className="shrink-0">{inv.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold" style={{ fontSize: "13px", color: "#1A1A1A" }}>{inv.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold px-1.5 py-0.5 text-white" style={{ fontSize: "9px", background: inv.color, borderRadius: 1 }}>
                  Save {formatCr(inv.taxSaving)}
                </span>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown size={14} style={{ color: "#AAA" }} /></motion.div>
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#888", marginTop: 2 }}>{inv.description}</p>
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: "10px", color: "#AAA" }}>Used: ₹{(inv.currentUsage / 1000).toFixed(0)}K</span>
                <span style={{ fontSize: "10px", color: "#AAA" }}>Limit: {inv.limit}</span>
              </div>
              <div className="h-1.5" style={{ background: "#F0F0F0", borderRadius: 1 }}>
                <motion.div className="h-full" style={{ background: inv.color, borderRadius: 1 }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }} />
              </div>
              {pct < 100 && <p style={{ fontSize: "10px", color: inv.color, marginTop: 2 }}>+₹{((inv.maxLimit - inv.currentUsage) / 1000).toFixed(0)}K more to maximise</p>}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${inv.color}15` }}>
                <p style={{ fontSize: "11px", color: "#666", lineHeight: 1.6 }}>{inv.detail}</p>
                <button className="mt-3 flex items-center gap-1.5 px-4 py-2 text-white font-bold transition-opacity hover:opacity-80"
                  style={{ background: inv.color, fontSize: "11px", borderRadius: 1 }}>
                  Invest Now <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main TaxWizard ───────────────────────────────────────────────────────────
export function TaxWizard() {
  const { userData: u, metrics: m } = useUserData();
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [chartTab, setChartTab] = useState<"slab" | "rate">("slab");

  const grossIncome = u ? u.annualSalary + u.otherIncome : 1200000;

  const oldTax = useMemo(() => computeOldRegimeTax(grossIncome), [grossIncome]);
  const newTax = useMemo(() => computeNewRegimeTax(grossIncome), [grossIncome]);
  const betterRegime = newTax <= oldTax ? "new" : "old";
  const savedWith = Math.abs(oldTax - newTax);
  const [activeRegime, setActiveRegime] = useState<"old" | "new">(u?.taxRegime ?? "new");

  const slabData       = useMemo(() => buildSlabData(grossIncome), [grossIncome]);
  const effectiveRates = useMemo(() => buildEffectiveRateData(grossIncome), [grossIncome]);

  // Tax-saving investments based on real data
  const investments = useMemo(() => {
    const taxBracket = grossIncome > 1500000 ? 0.30 : grossIncome > 1000000 ? 0.20 : 0.10;
    const ppfUsed = Math.min(u?.ppfEpf ?? 0, 150000);
    const mfUsed  = Math.min((u?.mutualFunds ?? 0) * 0.2, 150000 - ppfUsed); // assume 20% in ELSS
    const used80C = Math.min(ppfUsed + mfUsed, 150000);

    return [
      {
        id: "elss", icon: "📊", title: "ELSS Mutual Funds",
        limit: "₹1.5L (80C)", taxSaving: Math.round(Math.max(150000 - used80C, 0) * taxBracket * 1.04),
        color: "#E21B23",
        description: `Best 80C option — 3-yr lock-in, equity returns. You've used ₹${Math.round(used80C / 1000)}K of ₹1.5L limit.`,
        detail: `ELSS gives the shortest lock-in (3 yrs) among 80C instruments while providing equity returns. Invest ₹${Math.round((150000 - used80C) / 1000)}K more to max out your 80C and save an additional ₹${Math.round(Math.max(150000 - used80C, 0) * taxBracket * 1.04 / 1000)}K in taxes.`,
        currentUsage: used80C, maxLimit: 150000,
      },
      {
        id: "nps", icon: "🏛️", title: "National Pension System (NPS)",
        limit: "₹50K (80CCD)", taxSaving: Math.round(50000 * taxBracket * 1.04),
        color: "#2563EB",
        description: "Exclusive ₹50K deduction OVER 80C limit under Section 80CCD(1B). Separate from all other limits.",
        detail: `NPS gives an exclusive ₹50,000 deduction under 80CCD(1B) — completely separate from 80C. At your ${Math.round(taxBracket * 100)}% bracket, this saves ₹${Math.round(50000 * taxBracket * 1.04 / 1000)}K/year. Tier-I is locked till 60; Tier-II is liquid.`,
        currentUsage: 0, maxLimit: 50000,
      },
      {
        id: "health", icon: "🏥", title: "Health Insurance Premium",
        limit: "₹25K+₹50K (80D)", taxSaving: Math.round(Math.max(25000 - (u?.healthInsuranceCover ?? 0) * 0.02, 0) * taxBracket * 1.04),
        color: "#16A34A",
        description: "₹25K for self/spouse/kids + ₹50K for senior citizen parents — Section 80D.",
        detail: `Claim ₹25,000 for your family's health insurance and ₹50,000 more if you pay for senior-citizen parents. Total: ₹75,000 potential deduction = ₹${Math.round(75000 * taxBracket * 1.04 / 1000)}K tax saved.`,
        currentUsage: Math.min((u?.healthInsuranceCover ?? 0) * 0.02, 25000), maxLimit: 75000,
      },
    ];
  }, [grossIncome, u]);

  const totalOptimisedSaving = investments.reduce((a, inv) => a + inv.taxSaving, 0);

  if (!u || !m) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", background: "#F2F2F2" }}>
      {/* ET Page Header */}
      <div style={{ background: "#E21B23", padding: "8px 16px" }} className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
            TAX WIZARD — {u.name.toUpperCase()} · FY 2025–26
          </p>
          <p className="text-white opacity-70" style={{ fontSize: "10px" }}>
            Income: {formatCr(grossIncome)} · {u.taxRegime === "new" ? "Currently on New Regime" : "Currently on Old Regime"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-white" style={{ fontSize: "11px" }}>
            Potential savings: <span style={{ color: "#FDE68A" }}>{formatCr(totalOptimisedSaving)}</span>
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Verdict Banner ── */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4"
          style={{
            background: betterRegime === "new" ? "#F0FDF4" : "#FFF5F5",
            border: `1px solid ${betterRegime === "new" ? "#BBF7D0" : "#FECACA"}`,
            borderLeft: `4px solid ${betterRegime === "new" ? "#16A34A" : "#E21B23"}`,
            borderRadius: 1,
          }}>
          <div className="w-10 h-10 flex items-center justify-center shrink-0"
            style={{ background: betterRegime === "new" ? "#16A34A" : "#E21B23", borderRadius: 2 }}>
            <TrendingDown size={20} color="white" />
          </div>
          <div className="flex-1">
            <p className="font-bold" style={{ color: betterRegime === "new" ? "#14532D" : "#991B1B", fontSize: "13px" }}>
              ET AI VERDICT: {betterRegime === "new" ? "New" : "Old"} Tax Regime saves you{" "}
              <span style={{ color: betterRegime === "new" ? "#16A34A" : "#E21B23" }}>{formatCr(savedWith)}</span>{" "}
              on your ₹{(grossIncome / 100000).toFixed(1)}L income
            </p>
            <p style={{ fontSize: "11px", color: betterRegime === "new" ? "#166534" : "#B91C1C", marginTop: 2 }}>
              Old regime tax: {formatCr(oldTax)} · New regime tax: {formatCr(newTax)} · Difference: {formatCr(savedWith)}
              {betterRegime === "old" ? " — worth managing your deduction proofs" : " — simpler, lower rate wins at your income"}
            </p>
          </div>
          <div className="text-center shrink-0">
            <p style={{ fontSize: "9px", color: "#AAA", textTransform: "uppercase" }}>You save</p>
            <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
              className="font-black" style={{ color: betterRegime === "new" ? "#16A34A" : "#E21B23", fontSize: "1.6rem" }}>
              {formatCr(savedWith)}
            </motion.p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* ── Left Column ── */}
          <div className="space-y-4">
            {/* Form-16 Upload */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <ETCard>
                <ETCardHeader title="Form-16 Upload" sub="AI extracts data automatically" />
                <div className="p-4">
                  <AnimatePresence mode="wait">
                    {uploaded ? (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-2 py-4">
                        <div className="w-10 h-10 flex items-center justify-center" style={{ background: "#D1FAE5", borderRadius: 2 }}>
                          <Check size={22} style={{ color: "#16A34A" }} />
                        </div>
                        <p className="font-bold" style={{ color: "#16A34A", fontSize: "13px" }}>Form-16 Analysed</p>
                        <p style={{ fontSize: "11px", color: "#888", textAlign: "center" }}>
                          Income: {formatCr(grossIncome)} · TDS: {formatCr(Math.round(oldTax * 0.8))}
                        </p>
                        <button onClick={() => setUploaded(false)} style={{ fontSize: "11px", color: "#AAA", textDecoration: "underline" }}>Upload different file</button>
                      </motion.div>
                    ) : (
                      <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-2 border-dashed p-6 text-center cursor-pointer transition-colors"
                        style={{ borderColor: dragOver ? "#E21B23" : "#E0E0E0", background: dragOver ? "#FFF5F5" : "#FAFAFA", borderRadius: 1 }}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={() => { setDragOver(false); setUploaded(true); }}
                        onClick={() => setUploaded(true)}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Upload size={24} className="mx-auto mb-2" style={{ color: "#E21B23" }} />
                        <p className="font-semibold" style={{ fontSize: "13px", color: "#1A1A1A" }}>Drop Form-16 PDF here</p>
                        <p style={{ fontSize: "11px", color: "#888", marginTop: 2 }}>or click to browse · AI extraction</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ETCard>
            </motion.div>

            {/* Regime Switcher */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <ETCard>
                <ETCardHeader title="Compare Tax Regimes" sub={`For your ₹${(grossIncome / 100000).toFixed(1)}L income`} />
                <div className="p-3 grid grid-cols-2 gap-2">
                  {[
                    { key: "old", label: "Old Regime", tax: oldTax, sub: "With deductions" },
                    { key: "new", label: "New Regime", tax: newTax, sub: "Flat rates, simple" },
                  ].map(r => (
                    <button key={r.key} onClick={() => setActiveRegime(r.key as "old" | "new")}
                      className="p-3 text-left transition-all"
                      style={{
                        background: activeRegime === r.key ? (r.key === "new" ? "#F0FDF4" : "#FFF5F5") : "#FAFAFA",
                        border: `2px solid ${activeRegime === r.key ? (r.key === "new" ? "#16A34A" : "#E21B23") : "#E8E8E8"}`,
                        borderRadius: 1,
                      }}>
                      <p style={{ fontSize: "9px", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.sub}</p>
                      <p className="font-bold mt-0.5" style={{ fontSize: "12px", color: activeRegime === r.key ? (r.key === "new" ? "#16A34A" : "#E21B23") : "#444" }}>{r.label}</p>
                      <p className="font-black mt-1" style={{ fontSize: "20px", color: activeRegime === r.key ? (r.key === "new" ? "#16A34A" : "#E21B23") : "#888" }}>
                        {formatCr(r.tax)}
                      </p>
                      {betterRegime === r.key && (
                        <span className="font-bold mt-1 inline-block px-1.5 py-0.5 text-white"
                          style={{ fontSize: "8px", background: r.key === "new" ? "#16A34A" : "#E21B23", borderRadius: 1 }}>
                          ✓ BETTER FOR YOU
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Breakdown for selected regime */}
                <div className="p-3" style={{ borderTop: "1px solid #F0F0F0" }}>
                  {[
                    { label: "Gross Income",       val: formatCr(grossIncome),           color: "#1A1A1A" },
                    { label: activeRegime === "new" ? "Std. Deduction (75K)" : "Est. Deductions (~2.25L)", val: activeRegime === "new" ? "₹75,000" : formatCr(Math.min(225000, grossIncome * 0.25)), color: "#888" },
                    { label: "Tax Before Cess",     val: formatCr(Math.round((activeRegime === "new" ? newTax : oldTax) / 1.04)), color: "#D97706" },
                    { label: "Total Tax (with 4% cess)", val: formatCr(activeRegime === "new" ? newTax : oldTax), color: "#E21B23" },
                    { label: "Effective Tax Rate",  val: `${((activeRegime === "new" ? newTax : oldTax) / grossIncome * 100).toFixed(1)}%`, color: "#2563EB" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <span style={{ fontSize: "10px", color: "#666" }}>{r.label}</span>
                      <span className="font-bold" style={{ fontSize: "11px", color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </ETCard>
            </motion.div>

            {/* Dark savings card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="p-4" style={{ background: "#1A1A1A", borderRadius: 2 }}>
                <p style={{ fontSize: "9px", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Regime Difference</p>
                <div className="flex items-end gap-2 mt-1">
                  <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="font-black text-white" style={{ fontSize: "2rem" }}>{formatCr(savedWith)}</motion.span>
                  <span style={{ color: "#16A34A", fontSize: "12px", fontWeight: 700, marginBottom: 4 }}>
                    {betterRegime === "new" ? "saved with New" : "saved with Old"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Zap size={12} style={{ color: "#F59E0B" }} />
                  <p style={{ fontSize: "10px", color: "#888" }}>With tax investments: <span style={{ color: "#FDE68A", fontWeight: 600 }}>+{formatCr(totalOptimisedSaving)} more</span></p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Info size={11} style={{ color: "#888" }} />
                  <p style={{ fontSize: "10px", color: "#666" }}>Assumes standard deduction + basic 80C only. Consult a CA for precise advice.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column ── */}
          <div className="xl:col-span-2 space-y-4">
            {/* Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <ETCard>
                {/* Chart tabs */}
                <div className="flex" style={{ borderBottom: "2px solid #E21B23" }}>
                  <button onClick={() => setChartTab("slab")}
                    className="px-4 py-2.5 font-bold transition-all"
                    style={{ fontSize: "11px", borderBottom: chartTab === "slab" ? "2px solid transparent" : "none", color: chartTab === "slab" ? "#E21B23" : "#888", marginBottom: "-2px", background: chartTab === "slab" ? "#FFF5F5" : "transparent" }}>
                    TAX BY INCOME SLAB
                  </button>
                  <button onClick={() => setChartTab("rate")}
                    className="px-4 py-2.5 font-bold transition-all"
                    style={{ fontSize: "11px", borderBottom: chartTab === "rate" ? "2px solid transparent" : "none", color: chartTab === "rate" ? "#E21B23" : "#888", marginBottom: "-2px", background: chartTab === "rate" ? "#FFF5F5" : "transparent" }}>
                    EFFECTIVE TAX RATE
                  </button>
                  <div className="ml-auto flex gap-3 items-center pr-4">
                    <div className="flex items-center gap-1"><div className="w-3 h-2" style={{ background: "#EF4444" }} /><span style={{ fontSize: "10px", color: "#888" }}>Old</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-2" style={{ background: "#16A34A" }} /><span style={{ fontSize: "10px", color: "#888" }}>New</span></div>
                  </div>
                </div>

                <div className="p-4" style={{ height: 280 }}>
                  <AnimatePresence mode="wait">
                    {chartTab === "slab" ? (
                      <motion.div key="slab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: 240 }}>
                        <p style={{ fontSize: "10px", color: "#AAA", marginBottom: 6 }}>
                          Cumulative tax liability at each income band for {formatCr(grossIncome)} annual income
                        </p>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={slabData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                            <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={v => formatCr(v)} tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} width={55} />
                            <Tooltip content={<SlabTooltip />} />
                            <Bar dataKey="old" fill="#EF4444" fillOpacity={0.75} radius={[2, 2, 0, 0]} name="old" isAnimationActive animationBegin={200} />
                            <Bar dataKey="new" fill="#16A34A" fillOpacity={0.80} radius={[2, 2, 0, 0]} name="new" isAnimationActive animationBegin={400} />
                          </BarChart>
                        </ResponsiveContainer>
                      </motion.div>
                    ) : (
                      <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: 240 }}>
                        <p style={{ fontSize: "10px", color: "#AAA", marginBottom: 6 }}>
                          Effective tax rate (%) at various income levels — your income {formatCr(grossIncome)} marked
                        </p>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={effectiveRates} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                            <XAxis dataKey="income" tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 9, fill: "#AAA" }} axisLine={false} tickLine={false} width={35} />
                            <Tooltip content={<RateTooltip />} />
                            <Area key="etr-old" type="monotone" dataKey="old" fill="#EF444415" stroke="#EF4444" strokeWidth={2} dot={false} name="old" isAnimationActive />
                            <Line key="etr-new" type="monotone" dataKey="new" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: "#16A34A", r: 3 }} name="new" isAnimationActive />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ETCard>
            </motion.div>

            {/* Tax-Saving Investments */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3.5" style={{ background: "#E21B23" }} />
                <p className="font-bold uppercase tracking-widest" style={{ fontSize: "9px", color: "#888", letterSpacing: "0.1em" }}>
                  AI-SUGGESTED TAX INVESTMENTS · Click to expand
                </p>
              </div>
              <div className="space-y-2">
                {investments.map((inv, i) => <InvestmentCard key={inv.id} inv={inv} index={i} />)}
              </div>
            </div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-4 p-4"
              style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderLeft: "4px solid #16A34A", borderRadius: 1 }}>
              <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: "#16A34A", borderRadius: 2 }}>
                <Check size={18} color="white" />
              </div>
              <div className="flex-1">
                <p className="font-bold" style={{ fontSize: "13px", color: "#14532D" }}>
                  Implement all 3 strategies → Save {formatCr(totalOptimisedSaving)} in taxes this year
                </p>
                <p style={{ fontSize: "11px", color: "#166534" }}>
                  ELSS + NPS + Health Insurance — maximise all deductions
                </p>
              </div>
              <button className="flex items-center gap-1.5 font-bold text-white px-4 py-2 shrink-0 transition-opacity hover:opacity-90"
                style={{ background: "#16A34A", fontSize: "12px", borderRadius: 1 }}>
                Implement All <ArrowRight size={12} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}