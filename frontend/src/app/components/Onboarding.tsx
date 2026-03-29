import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Briefcase, TrendingUp, PieChart, CreditCard,
  Target, Shield, ChevronRight, ChevronLeft, Check, Zap,
  IndianRupee, AlertCircle, Info
} from "lucide-react";
import { UserData, useUserData } from "../context/UserDataContext";

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Profile",     icon: User,         color: "#E21B23", desc: "Personal details" },
  { id: 2, label: "Income",      icon: Briefcase,    color: "#2563EB", desc: "Earnings & tax" },
  { id: 3, label: "Expenses",    icon: IndianRupee,  color: "#D97706", desc: "Monthly outflows" },
  { id: 4, label: "Assets",      icon: PieChart,     color: "#16A34A", desc: "Savings & investments" },
  { id: 5, label: "Debt",        icon: CreditCard,   color: "#7C3AED", desc: "Loans & liabilities" },
  { id: 6, label: "Goals",       icon: Target,       color: "#0891B2", desc: "Future milestones" },
  { id: 7, label: "Protection",  icon: Shield,       color: "#EA580C", desc: "Insurance & risk" },
];

// ─── Default empty form ───────────────────────────────────────────────────────
const DEFAULT: UserData = {
  name: "", partnerName: "", age: 30, city: "", occupation: "", maritalStatus: "single",
  annualSalary: 0, otherIncome: 0, taxRegime: "new",
  rentEmi: 0, groceries: 0, utilities: 0, transport: 0, dining: 0, entertainment: 0, education: 0, otherExpenses: 0,
  bankSavings: 0, mutualFunds: 0, stocks: 0, fixedDeposits: 0, ppfEpf: 0, gold: 0, realEstate: 0,
  homeLoanBalance: 0, homeLoanEmi: 0, carLoanBalance: 0, personalLoanBalance: 0, creditCardOutstanding: 0,
  monthlySip: 0, retirementAge: 60, emergencyTarget: 0, homeTarget: 0, homeTimelineYears: 5,
  childEducationTarget: 0, childEducationYears: 10, otherGoalLabel: "", otherGoalTarget: 0, otherGoalYears: 3,
  lifeInsuranceCover: 0, healthInsuranceCover: 0, riskAppetite: "moderate",
};

// ─── Reusable input components ────────────────────────────────────────────────
function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <label className="font-semibold" style={{ fontSize: "12px", color: "#333", fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {children}
      </label>
      {hint && (
        <span className="relative group cursor-pointer">
          <Info size={12} style={{ color: "#AAA" }} />
          <span className="absolute left-5 top-0 w-48 p-2 bg-gray-800 text-white rounded shadow-lg z-50 hidden group-hover:block"
            style={{ fontSize: "10px" }}>{hint}</span>
        </span>
      )}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder = "", hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 outline-none transition-all"
        style={{ border: "1px solid #E0E0E0", borderRadius: 2, fontSize: "13px", background: "white", fontFamily: "'IBM Plex Sans', sans-serif" }}
        onFocus={e => (e.target.style.borderColor = "#E21B23")}
        onBlur={e => (e.target.style.borderColor = "#E0E0E0")}
      />
    </div>
  );
}

function NumberInput({ label, value, onChange, placeholder = "0", prefix = "₹", hint, suffix }: {
  label: string; value: number; onChange: (v: number) => void;
  placeholder?: string; prefix?: string; hint?: string; suffix?: string;
}) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 font-semibold" style={{ color: "#888", fontSize: "13px" }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value || ""}
          onChange={e => onChange(Number(e.target.value))}
          placeholder={placeholder}
          className="w-full py-2.5 outline-none transition-all"
          style={{
            border: "1px solid #E0E0E0", borderRadius: 2, fontSize: "13px",
            background: "white", fontFamily: "'IBM Plex Sans', sans-serif",
            paddingLeft: prefix ? "1.8rem" : "0.75rem",
            paddingRight: suffix ? "3rem" : "0.75rem",
          }}
          onFocus={e => (e.target.style.borderColor = "#E21B23")}
          onBlur={e => (e.target.style.borderColor = "#E0E0E0")}
        />
        {suffix && (
          <span className="absolute right-3 font-semibold" style={{ color: "#888", fontSize: "12px" }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function SelectInput({ label, value, onChange, options, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; hint?: string;
}) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 outline-none transition-all"
        style={{ border: "1px solid #E0E0E0", borderRadius: 2, fontSize: "13px", background: "white", fontFamily: "'IBM Plex Sans', sans-serif" }}
        onFocus={e => (e.target.style.borderColor = "#E21B23")}
        onBlur={e => (e.target.style.borderColor = "#E0E0E0")}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function RadioGroup({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string; desc?: string }[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="flex flex-col items-start px-3 py-2 transition-all flex-1 min-w-[100px]"
            style={{
              border: `2px solid ${value === o.value ? "#E21B23" : "#E0E0E0"}`,
              borderRadius: 2,
              background: value === o.value ? "#FFF5F5" : "white",
            }}
          >
            <span className="font-bold" style={{ fontSize: "12px", color: value === o.value ? "#E21B23" : "#333" }}>{o.label}</span>
            {o.desc && <span style={{ fontSize: "10px", color: "#888", marginTop: 2 }}>{o.desc}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="w-1 h-4 shrink-0" style={{ background: "#E21B23" }} />
      <p className="font-bold uppercase tracking-widest" style={{ fontSize: "9px", color: "#888", letterSpacing: "0.1em" }}>{label}</p>
      <div className="flex-1 h-px" style={{ background: "#F0F0F0" }} />
    </div>
  );
}

function QuickFill({ label, values, onApply }: { label: string; values: Partial<UserData>; onApply: (v: Partial<UserData>) => void }) {
  return (
    <button type="button" onClick={() => onApply(values)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 transition-colors"
      style={{ background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 1 }}>
      <Zap size={10} style={{ color: "#E21B23" }} />
      <span style={{ fontSize: "10px", color: "#E21B23", fontWeight: 700 }}>Try: {label}</span>
    </button>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────
function StepProfile({ data, update }: { data: UserData; update: (k: keyof UserData, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput label="Full Name *" value={data.name} onChange={v => update("name", v)} placeholder="e.g. Rajesh Kumar" />
        <NumberInput label="Your Age *" value={data.age} onChange={v => update("age", v)} prefix="" placeholder="30" suffix="yrs" />
        <TextInput label="City" value={data.city} onChange={v => update("city", v)} placeholder="e.g. Mumbai" />
        <TextInput label="Occupation" value={data.occupation} onChange={v => update("occupation", v)} placeholder="e.g. Software Engineer" />
      </div>
      <RadioGroup label="Marital Status"
        value={data.maritalStatus}
        onChange={v => update("maritalStatus", v as UserData["maritalStatus"])}
        options={[
          { value: "single", label: "Single", desc: "Planning solo" },
          { value: "married", label: "Married", desc: "Planning together" },
          { value: "couple", label: "Couple", desc: "Joint accounts" },
        ]}
      />
      {(data.maritalStatus === "married" || data.maritalStatus === "couple") && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <TextInput label="Partner's Name" value={data.partnerName} onChange={v => update("partnerName", v)} placeholder="e.g. Priya Kumar" />
        </motion.div>
      )}
    </div>
  );
}

function StepIncome({ data, update, applyQuick }: { data: UserData; update: (k: keyof UserData, v: unknown) => void; applyQuick: (v: Partial<UserData>) => void }) {
  const monthly = Math.round((data.annualSalary + data.otherIncome) / 12);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <QuickFill label="₹8L salary" values={{ annualSalary: 800000, otherIncome: 0, taxRegime: "new" }} onApply={applyQuick} />
        <QuickFill label="₹15L salary" values={{ annualSalary: 1500000, otherIncome: 50000, taxRegime: "new" }} onApply={applyQuick} />
        <QuickFill label="₹25L salary" values={{ annualSalary: 2500000, otherIncome: 120000, taxRegime: "old" }} onApply={applyQuick} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Annual Salary / CTC *" value={data.annualSalary} onChange={v => update("annualSalary", v)}
          hint="Your gross annual compensation before taxes" placeholder="1200000" />
        <NumberInput label="Other Annual Income" value={data.otherIncome} onChange={v => update("otherIncome", v)}
          hint="Rental income, freelance, dividends, etc." placeholder="0" />
      </div>
      {monthly > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-3"
          style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderLeft: "3px solid #16A34A", borderRadius: 1 }}>
          <span style={{ fontSize: "12px", color: "#166534" }}>
            Monthly take-home estimate: <strong style={{ color: "#16A34A" }}>₹{monthly.toLocaleString("en-IN")}/month</strong>
          </span>
        </motion.div>
      )}
      <SectionDivider label="Tax Regime" />
      <RadioGroup label="Which tax regime do you file under?"
        value={data.taxRegime}
        onChange={v => update("taxRegime", v as UserData["taxRegime"])}
        options={[
          { value: "new", label: "New Regime", desc: "Lower flat rates, no deductions" },
          { value: "old", label: "Old Regime", desc: "Higher rates but claim 80C, HRA, etc." },
        ]}
      />
    </div>
  );
}

function StepExpenses({ data, update, applyQuick }: { data: UserData; update: (k: keyof UserData, v: unknown) => void; applyQuick: (v: Partial<UserData>) => void }) {
  const total = data.rentEmi + data.groceries + data.utilities + data.transport +
    data.dining + data.entertainment + data.education + data.otherExpenses;
  const monthly = (data.annualSalary + data.otherIncome) / 12;
  const pct = monthly > 0 ? Math.round((total / monthly) * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <QuickFill label="City renter" values={{ rentEmi: 25000, groceries: 8000, utilities: 3000, transport: 5000, dining: 6000, entertainment: 3000, education: 0, otherExpenses: 5000 }} onApply={applyQuick} />
        <QuickFill label="Home owner" values={{ rentEmi: 35000, groceries: 10000, utilities: 4000, transport: 8000, dining: 5000, entertainment: 4000, education: 5000, otherExpenses: 6000 }} onApply={applyQuick} />
      </div>
      <SectionDivider label="Fixed Monthly Expenses" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Rent / Home Loan EMI" value={data.rentEmi} onChange={v => update("rentEmi", v)} placeholder="25000" />
        <NumberInput label="Groceries & Household" value={data.groceries} onChange={v => update("groceries", v)} placeholder="8000" />
        <NumberInput label="Utilities (electricity, internet)" value={data.utilities} onChange={v => update("utilities", v)} placeholder="3000" />
        <NumberInput label="Transport (fuel, cab, metro)" value={data.transport} onChange={v => update("transport", v)} placeholder="5000" />
      </div>
      <SectionDivider label="Variable Monthly Expenses" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Dining Out & Food Delivery" value={data.dining} onChange={v => update("dining", v)} placeholder="5000" />
        <NumberInput label="Entertainment & OTT" value={data.entertainment} onChange={v => update("entertainment", v)} placeholder="3000" />
        <NumberInput label="Education / Courses" value={data.education} onChange={v => update("education", v)} placeholder="0" />
        <NumberInput label="Other (shopping, misc)" value={data.otherExpenses} onChange={v => update("otherExpenses", v)} placeholder="5000" />
      </div>
      {total > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3 flex items-center gap-4"
          style={{
            background: pct > 80 ? "#FEF2F2" : pct > 60 ? "#FFF8E7" : "#F0FDF4",
            border: `1px solid ${pct > 80 ? "#FECACA" : pct > 60 ? "#FDE68A" : "#BBF7D0"}`,
            borderLeft: `3px solid ${pct > 80 ? "#DC2626" : pct > 60 ? "#D97706" : "#16A34A"}`,
            borderRadius: 1,
          }}>
          <div>
            <p className="font-bold" style={{ fontSize: "13px", color: "#1A1A1A" }}>
              Total monthly outflow: <span style={{ color: pct > 80 ? "#DC2626" : pct > 60 ? "#D97706" : "#16A34A" }}>
                ₹{total.toLocaleString("en-IN")}
              </span>
            </p>
            <p style={{ fontSize: "11px", color: "#666" }}>
              {pct}% of income · {pct > 80 ? "⚠ Very high — leaves little savings" : pct > 60 ? "Moderate — room to optimize" : "✓ Healthy expense ratio"}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StepAssets({ data, update, applyQuick }: { data: UserData; update: (k: keyof UserData, v: unknown) => void; applyQuick: (v: Partial<UserData>) => void }) {
  const total = data.bankSavings + data.mutualFunds + data.stocks + data.fixedDeposits + data.ppfEpf + data.gold + data.realEstate;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <QuickFill label="Early career" values={{ bankSavings: 200000, mutualFunds: 500000, stocks: 100000, fixedDeposits: 200000, ppfEpf: 300000, gold: 100000, realEstate: 0 }} onApply={applyQuick} />
        <QuickFill label="Mid career" values={{ bankSavings: 500000, mutualFunds: 2000000, stocks: 500000, fixedDeposits: 500000, ppfEpf: 800000, gold: 300000, realEstate: 5000000 }} onApply={applyQuick} />
      </div>
      <SectionDivider label="Liquid Assets" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Bank Savings / FD (liquid)" value={data.bankSavings} onChange={v => update("bankSavings", v)}
          hint="Total in savings accounts + short-term FDs" placeholder="200000" />
        <NumberInput label="Fixed Deposits (long-term)" value={data.fixedDeposits} onChange={v => update("fixedDeposits", v)} placeholder="0" />
      </div>
      <SectionDivider label="Market Investments" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Mutual Funds (current value)" value={data.mutualFunds} onChange={v => update("mutualFunds", v)}
          hint="Total current NAV value of all mutual fund holdings" placeholder="0" />
        <NumberInput label="Stocks / Direct Equity" value={data.stocks} onChange={v => update("stocks", v)}
          hint="Current market value of your stock portfolio" placeholder="0" />
      </div>
      <SectionDivider label="Long-Term Assets" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="PPF / EPF / NPS balance" value={data.ppfEpf} onChange={v => update("ppfEpf", v)}
          hint="Total provident fund and pension corpus so far" placeholder="0" />
        <NumberInput label="Gold (jewellery + ETF value)" value={data.gold} onChange={v => update("gold", v)} placeholder="0" />
        <NumberInput label="Real Estate (market value)" value={data.realEstate} onChange={v => update("realEstate", v)}
          hint="Current market value of property you own (excluding primary residence if rented)" placeholder="0" className="sm:col-span-2" />
      </div>
      {total > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderLeft: "3px solid #16A34A", borderRadius: 1 }}>
          <p className="font-bold" style={{ fontSize: "13px", color: "#14532D" }}>
            Total Assets: <span style={{ color: "#16A34A" }}>₹{(total / 100000).toFixed(2)} L</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}

function StepDebt({ data, update }: { data: UserData; update: (k: keyof UserData, v: unknown) => void }) {
  const total = data.homeLoanBalance + data.carLoanBalance + data.personalLoanBalance + data.creditCardOutstanding;
  const totalAssets = data.bankSavings + data.mutualFunds + data.stocks + data.fixedDeposits + data.ppfEpf + data.gold + data.realEstate;
  const dta = totalAssets > 0 ? Math.round((total / totalAssets) * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="p-3 flex items-start gap-2" style={{ background: "#F5F5F5", border: "1px solid #E8E8E8", borderRadius: 1 }}>
        <Info size={13} style={{ color: "#888" }} className="shrink-0 mt-0.5" />
        <p style={{ fontSize: "11px", color: "#666" }}>Enter <strong>outstanding balance</strong> (not original loan amount). Leave at 0 if no loans.</p>
      </div>
      <SectionDivider label="Secured Loans" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Home Loan Outstanding" value={data.homeLoanBalance} onChange={v => update("homeLoanBalance", v)} placeholder="0" />
        <NumberInput label="Home Loan EMI / month" value={data.homeLoanEmi} onChange={v => update("homeLoanEmi", v)} placeholder="0" />
        <NumberInput label="Car Loan Outstanding" value={data.carLoanBalance} onChange={v => update("carLoanBalance", v)} placeholder="0" />
      </div>
      <SectionDivider label="Unsecured Loans" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Personal Loan Outstanding" value={data.personalLoanBalance} onChange={v => update("personalLoanBalance", v)} placeholder="0" />
        <NumberInput label="Credit Card Outstanding" value={data.creditCardOutstanding} onChange={v => update("creditCardOutstanding", v)}
          hint="Total unpaid credit card balance across all cards" placeholder="0" />
      </div>
      {total > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3"
          style={{
            background: dta > 50 ? "#FEF2F2" : dta > 30 ? "#FFF8E7" : "#F0FDF4",
            border: `1px solid ${dta > 50 ? "#FECACA" : dta > 30 ? "#FDE68A" : "#BBF7D0"}`,
            borderLeft: `3px solid ${dta > 50 ? "#DC2626" : dta > 30 ? "#D97706" : "#16A34A"}`,
            borderRadius: 1,
          }}>
          <p className="font-bold" style={{ fontSize: "13px", color: "#1A1A1A" }}>
            Total Debt: ₹{(total / 100000).toFixed(2)}L
            {totalAssets > 0 && <span style={{ color: dta > 50 ? "#DC2626" : dta > 30 ? "#D97706" : "#16A34A" }}> · {dta}% of assets</span>}
          </p>
          <p style={{ fontSize: "11px", color: "#666" }}>
            {dta > 50 ? "⚠ High leverage — focus on debt reduction first" : dta > 30 ? "Moderate — manageable with discipline" : "✓ Healthy debt-to-asset ratio"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

function StepGoals({ data, update }: { data: UserData; update: (k: keyof UserData, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <SectionDivider label="Retirement" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Monthly SIP Investment *" value={data.monthlySip} onChange={v => update("monthlySip", v)}
          hint="Total SIP amount across all mutual funds per month" placeholder="10000" />
        <NumberInput label="Target Retirement Age *" value={data.retirementAge} onChange={v => update("retirementAge", v)}
          prefix="" suffix="yrs" placeholder="60" />
      </div>
      <SectionDivider label="Emergency Fund" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Emergency Fund Target" value={data.emergencyTarget} onChange={v => update("emergencyTarget", v)}
          hint="Recommended: 6 months of expenses. Leave 0 to auto-calculate." placeholder="300000" />
      </div>
      <SectionDivider label="Home Purchase (optional)" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Down Payment Target" value={data.homeTarget} onChange={v => update("homeTarget", v)} placeholder="0" />
        <NumberInput label="Timeline" value={data.homeTimelineYears} onChange={v => update("homeTimelineYears", v)}
          prefix="" suffix="yrs" placeholder="5" />
      </div>
      <SectionDivider label="Child Education (optional)" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Education Corpus Target" value={data.childEducationTarget} onChange={v => update("childEducationTarget", v)} placeholder="0" />
        <NumberInput label="Years Until Needed" value={data.childEducationYears} onChange={v => update("childEducationYears", v)}
          prefix="" suffix="yrs" placeholder="10" />
      </div>
      <SectionDivider label="Custom Goal (optional)" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextInput label="Goal Name" value={data.otherGoalLabel} onChange={v => update("otherGoalLabel", v)} placeholder="e.g. Europe Trip" />
        <NumberInput label="Target Amount" value={data.otherGoalTarget} onChange={v => update("otherGoalTarget", v)} placeholder="0" />
        <NumberInput label="Timeline" value={data.otherGoalYears} onChange={v => update("otherGoalYears", v)} prefix="" suffix="yrs" placeholder="3" />
      </div>
    </div>
  );
}

function StepProtection({ data, update }: { data: UserData; update: (k: keyof UserData, v: unknown) => void }) {
  const recLifeCover = data.annualSalary * 10;
  const lifeGap = Math.max(recLifeCover - data.lifeInsuranceCover, 0);
  return (
    <div className="space-y-4">
      <SectionDivider label="Insurance Coverage" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <NumberInput label="Life Insurance Cover (term)" value={data.lifeInsuranceCover} onChange={v => update("lifeInsuranceCover", v)}
            hint="Total sum assured of all life insurance policies" placeholder="5000000" />
          {recLifeCover > 0 && data.lifeInsuranceCover > 0 && (
            <p className="mt-1" style={{ fontSize: "10px", color: lifeGap > 0 ? "#D97706" : "#16A34A" }}>
              {lifeGap > 0
                ? `⚠ Underinsured by ₹${(lifeGap / 100000).toFixed(0)}L (10x income = ₹${(recLifeCover / 100000).toFixed(0)}L)`
                : "✓ Adequately covered"}
            </p>
          )}
        </div>
        <NumberInput label="Health Insurance Cover" value={data.healthInsuranceCover} onChange={v => update("healthInsuranceCover", v)}
          hint="Total family floater or individual health cover" placeholder="500000" />
      </div>
      <SectionDivider label="Risk Profile" />
      <RadioGroup label="Your Investment Risk Appetite *"
        value={data.riskAppetite}
        onChange={v => update("riskAppetite", v as UserData["riskAppetite"])}
        options={[
          { value: "conservative", label: "Conservative", desc: "FD, debt funds, PPF · ~9-10% returns" },
          { value: "moderate", label: "Moderate", desc: "Balanced equity + debt · ~12-14% returns" },
          { value: "aggressive", label: "Aggressive", desc: "Heavy equity, small-cap · ~16-18% returns" },
        ]}
      />
      <div className="p-3 mt-2" style={{ background: "#F5F5F5", border: "1px solid #E8E8E8", borderRadius: 1 }}>
        <p className="font-semibold mb-2" style={{ fontSize: "12px", color: "#333" }}>Risk appetite summary:</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Conservative", equity: "20-30%", debt: "60-70%", gold: "10%", color: "#2563EB" },
            { label: "Moderate", equity: "50-60%", debt: "30-40%", gold: "10%", color: "#D97706" },
            { label: "Aggressive", equity: "75-85%", debt: "10-15%", gold: "5%", color: "#DC2626" },
          ].map(r => (
            <div key={r.label} className="p-2"
              style={{ background: data.riskAppetite === r.label.toLowerCase() ? `${r.color}10` : "white", borderRadius: 1, border: `1px solid ${data.riskAppetite === r.label.toLowerCase() ? r.color + "40" : "#F0F0F0"}` }}>
              <p className="font-bold" style={{ fontSize: "10px", color: r.color }}>{r.label}</p>
              <p style={{ fontSize: "9px", color: "#666", marginTop: 2 }}>Equity: {r.equity}</p>
              <p style={{ fontSize: "9px", color: "#666" }}>Debt: {r.debt}</p>
              <p style={{ fontSize: "9px", color: "#666" }}>Gold: {r.gold}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Summary Preview ──────────────────────────────────────────────────────────
function SummaryPreview({ data }: { data: UserData }) {
  const totalAssets = data.bankSavings + data.mutualFunds + data.stocks + data.fixedDeposits + data.ppfEpf + data.gold + data.realEstate;
  const totalDebt = data.homeLoanBalance + data.carLoanBalance + data.personalLoanBalance + data.creditCardOutstanding;
  const netWorth = totalAssets - totalDebt;
  const monthlyIncome = (data.annualSalary + data.otherIncome) / 12;
  const totalMonthlyExp = data.rentEmi + data.groceries + data.utilities + data.transport + data.dining + data.entertainment + data.education + data.otherExpenses;
  const monthlySavings = monthlyIncome - totalMonthlyExp;

  const items = [
    { label: "Name", value: data.name || "—", color: "#1A1A1A" },
    { label: "Age", value: `${data.age} years`, color: "#1A1A1A" },
    { label: "Annual Income", value: data.annualSalary > 0 ? `₹${(data.annualSalary / 100000).toFixed(1)}L/yr` : "—", color: "#2563EB" },
    { label: "Monthly Expenses", value: totalMonthlyExp > 0 ? `₹${Math.round(totalMonthlyExp / 1000)}K/mo` : "—", color: "#D97706" },
    { label: "Monthly Savings", value: monthlySavings > 0 ? `₹${Math.round(monthlySavings / 1000)}K/mo` : "—", color: "#16A34A" },
    { label: "Total Assets", value: totalAssets > 0 ? `₹${(totalAssets / 100000).toFixed(1)}L` : "—", color: "#16A34A" },
    { label: "Total Debt", value: totalDebt > 0 ? `₹${(totalDebt / 100000).toFixed(1)}L` : "₹0", color: totalDebt > 0 ? "#DC2626" : "#16A34A" },
    { label: "Net Worth", value: netWorth !== 0 ? `₹${(netWorth / 100000).toFixed(1)}L` : "—", color: netWorth >= 0 ? "#16A34A" : "#DC2626" },
    { label: "Monthly SIP", value: data.monthlySip > 0 ? `₹${Math.round(data.monthlySip / 1000)}K/mo` : "—", color: "#7C3AED" },
    { label: "Risk Appetite", value: data.riskAppetite.charAt(0).toUpperCase() + data.riskAppetite.slice(1), color: data.riskAppetite === "aggressive" ? "#DC2626" : data.riskAppetite === "moderate" ? "#D97706" : "#2563EB" },
    { label: "Retire at", value: `${data.retirementAge} years`, color: "#E21B23" },
    { label: "Tax Regime", value: data.taxRegime === "new" ? "New Regime" : "Old Regime", color: "#888" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
      {items.map((item, i, arr) => (
        <div key={item.label} className="p-3"
          style={{ borderBottom: i < arr.length - 3 ? "1px solid #F5F5F5" : "none", borderRight: (i + 1) % 3 !== 0 ? "1px solid #F5F5F5" : "none" }}>
          <p style={{ fontSize: "10px", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</p>
          <p className="font-bold mt-0.5" style={{ fontSize: "13px", color: item.color, fontFamily: "'IBM Plex Sans',sans-serif" }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Onboarding ──────────────────────────────────────────────────────────
export function Onboarding() {
  const { setUserData } = useUserData();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<UserData>({ ...DEFAULT });
  const [showSummary, setShowSummary] = useState(false);
  const [direction, setDirection] = useState(1);

  const update = (key: keyof UserData, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const applyQuick = (values: Partial<UserData>) => {
    setData(prev => ({ ...prev, ...values }));
  };

  const goNext = () => {
    if (step < STEPS.length) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      setShowSummary(true);
    }
  };

  const goPrev = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleSubmit = () => {
    setUserData(data);
  };

  const canProceed = () => {
    if (step === 1) return data.name.trim().length > 0 && data.age >= 18;
    if (step === 2) return data.annualSalary > 0;
    if (step === 6) return data.monthlySip >= 0 && data.retirementAge > data.age;
    return true;
  };

  const currentStep = STEPS[step - 1];
  const progress = showSummary ? 100 : ((step - 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F2F2F2", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* ET Top bar */}
      <div className="flex items-center px-6 py-3 bg-white" style={{ borderBottom: "1px solid #E0E0E0" }}>
        <div className="flex items-center gap-2">
          <span className="font-black italic" style={{ color: "#E21B23", fontSize: "1.5rem", fontFamily: "'IBM Plex Serif', Georgia, serif", letterSpacing: "-1px" }}>ET</span>
          <div style={{ width: 1, height: 24, background: "#E0E0E0" }} />
          <div>
            <p className="font-bold" style={{ color: "#1A1A1A", fontSize: "0.65rem", letterSpacing: "0.06em" }}>WEALTH</p>
            <p className="font-bold" style={{ color: "#E21B23", fontSize: "0.65rem", letterSpacing: "0.06em" }}>NAVIGATOR</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Zap size={13} style={{ color: "#E21B23" }} />
          <span style={{ fontSize: "11px", color: "#888" }}>AI-powered financial analysis</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-2xl">

          {/* Hero title */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-black" style={{ color: "#1A1A1A", fontSize: "1.6rem", fontFamily: "'IBM Plex Serif', serif" }}>
              Build Your Financial Profile
            </h1>
            <p style={{ color: "#888", fontSize: "13px", marginTop: 4 }}>
              Takes 5 minutes · Your data stays private · AI analyses and personalises everything
            </p>
          </motion.div>

          {/* Step progress bar */}
          <div className="mb-6">
            {/* Step dots */}
            <div className="flex items-center gap-0 mb-3 overflow-x-auto pb-1">
              {STEPS.map((s, i) => {
                const done = s.id < step || showSummary;
                const active = s.id === step && !showSummary;
                return (
                  <div key={s.id} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : "none" }}>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <motion.div
                        animate={{
                          background: done ? "#16A34A" : active ? "#E21B23" : "#E0E0E0",
                          scale: active ? 1.1 : 1,
                        }}
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ borderRadius: 2 }}
                      >
                        {done
                          ? <Check size={14} color="white" />
                          : <s.icon size={14} color={active ? "white" : "#AAA"} />
                        }
                      </motion.div>
                      <span style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: done ? "#16A34A" : active ? "#E21B23" : "#AAA",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 mt-[-14px]" style={{ background: done ? "#16A34A" : "#E0E0E0" }} />
                    )}
                  </div>
                );
              })}
              {/* Summary dot */}
              <div className="flex items-center">
                <div className="w-0.5 h-0.5 mx-1 mt-[-14px]" style={{ background: showSummary ? "#16A34A" : "#E0E0E0" }} />
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <motion.div animate={{ background: showSummary ? "#E21B23" : "#E0E0E0", scale: showSummary ? 1.1 : 1 }}
                    className="w-8 h-8 flex items-center justify-center" style={{ borderRadius: 2 }}>
                    <Zap size={14} color={showSummary ? "white" : "#AAA"} />
                  </motion.div>
                  <span style={{ fontSize: "9px", fontWeight: 700, color: showSummary ? "#E21B23" : "#AAA", letterSpacing: "0.04em" }}>Analyse</span>
                </div>
              </div>
            </div>

            {/* Progress fill bar */}
            <div className="h-1" style={{ background: "#E8E8E8" }}>
              <motion.div className="h-full" style={{ background: "#E21B23" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>

          {/* Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white" style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>

            {showSummary ? (
              <>
                <div className="px-6 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: "2px solid #E21B23" }}>
                  <div>
                    <p className="font-bold uppercase tracking-wide" style={{ fontSize: "11px", color: "#1A1A1A", letterSpacing: "0.06em" }}>
                      YOUR FINANCIAL PROFILE SUMMARY
                    </p>
                    <p style={{ fontSize: "11px", color: "#888", marginTop: 2 }}>Review before AI analyses your data</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1" style={{ background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 1 }}>
                    <Zap size={10} style={{ color: "#E21B23" }} />
                    <span style={{ fontSize: "9px", color: "#E21B23", fontWeight: 700 }}>READY TO ANALYSE</span>
                  </div>
                </div>
                <SummaryPreview data={data} />
                <div className="px-6 py-4" style={{ borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                  <div className="flex items-start gap-2 mb-4">
                    <AlertCircle size={14} style={{ color: "#D97706" }} className="shrink-0 mt-0.5" />
                    <p style={{ fontSize: "11px", color: "#666" }}>
                      Your data is processed locally and never sent to any server. ET WealthNavigator uses AI to generate personalised insights based on your inputs.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ opacity: 0.92 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold"
                    style={{ background: "#E21B23", borderRadius: 1, fontSize: "14px", letterSpacing: "0.04em" }}
                  >
                    <Zap size={16} />
                    Analyse My Finances — Launch Dashboard
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                {/* Step Header */}
                <div className="px-6 pt-4 pb-3 flex items-center gap-3" style={{ borderBottom: "2px solid #E21B23" }}>
                  <div className="w-9 h-9 flex items-center justify-center text-white shrink-0"
                    style={{ background: currentStep.color, borderRadius: 2 }}>
                    <currentStep.icon size={17} />
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wide" style={{ fontSize: "11px", color: "#1A1A1A", letterSpacing: "0.06em" }}>
                      STEP {step} OF {STEPS.length} — {currentStep.label.toUpperCase()}
                    </p>
                    <p style={{ fontSize: "11px", color: "#AAA", marginTop: 1 }}>{currentStep.desc}</p>
                  </div>
                </div>

                {/* Step Body */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: direction * 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step === 1 && <StepProfile data={data} update={update} />}
                      {step === 2 && <StepIncome data={data} update={update} applyQuick={applyQuick} />}
                      {step === 3 && <StepExpenses data={data} update={update} applyQuick={applyQuick} />}
                      {step === 4 && <StepAssets data={data} update={update} applyQuick={applyQuick} />}
                      {step === 5 && <StepDebt data={data} update={update} />}
                      {step === 6 && <StepGoals data={data} update={update} />}
                      {step === 7 && <StepProtection data={data} update={update} />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="px-6 pb-5 flex items-center justify-between" style={{ borderTop: "1px solid #F0F0F0", paddingTop: 16 }}>
                  <button
                    onClick={goPrev}
                    disabled={step === 1}
                    className="flex items-center gap-1.5 px-4 py-2 font-semibold transition-colors"
                    style={{
                      border: "1px solid #E0E0E0", borderRadius: 1, fontSize: "12px",
                      color: step === 1 ? "#CCC" : "#555", background: step === 1 ? "#FAFAFA" : "white",
                      cursor: step === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={14} /> Back
                  </button>

                  <span style={{ fontSize: "11px", color: "#AAA" }}>{step} / {STEPS.length}</span>

                  <motion.button
                    whileHover={{ opacity: 0.9 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="flex items-center gap-1.5 px-5 py-2 font-bold text-white transition-opacity"
                    style={{
                      background: canProceed() ? "#E21B23" : "#E8E8E8",
                      borderRadius: 1, fontSize: "12px",
                      color: canProceed() ? "white" : "#AAA",
                      cursor: canProceed() ? "pointer" : "not-allowed",
                    }}
                  >
                    {step === STEPS.length ? "Review & Analyse" : "Next"}
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </>
            )}

            {showSummary && (
              <div className="px-6 pb-4 flex justify-center">
                <button onClick={goPrev} className="flex items-center gap-1 text-xs" style={{ color: "#AAA" }}>
                  <ChevronLeft size={12} /> Edit my answers
                </button>
              </div>
            )}
          </motion.div>

          {/* Skip link */}
          <p className="text-center mt-4" style={{ fontSize: "11px", color: "#CCC" }}>
            Already set up?{" "}
            <button onClick={() => setUserData({ ...DEFAULT, name: "Demo User", age: 30, occupation: "Professional", city: "Mumbai", annualSalary: 1200000, otherIncome: 60000, taxRegime: "new", rentEmi: 25000, groceries: 8000, utilities: 3000, transport: 5000, dining: 6000, entertainment: 3000, education: 0, otherExpenses: 5000, bankSavings: 500000, mutualFunds: 2000000, stocks: 500000, fixedDeposits: 500000, ppfEpf: 800000, gold: 300000, realEstate: 0, homeLoanBalance: 1250000, homeLoanEmi: 35000, carLoanBalance: 0, personalLoanBalance: 0, creditCardOutstanding: 0, monthlySip: 25000, retirementAge: 55, emergencyTarget: 300000, homeTarget: 2000000, homeTimelineYears: 5, childEducationTarget: 2000000, childEducationYears: 10, otherGoalLabel: "", otherGoalTarget: 0, otherGoalYears: 3, lifeInsuranceCover: 5000000, healthInsuranceCover: 500000, riskAppetite: "moderate", maritalStatus: "married", partnerName: "Priya Kumar" })}
              style={{ color: "#E21B23", fontWeight: 700 }}>
              Load demo profile →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
