import { createContext, useContext, useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Goal {
  label: string;
  icon: string;
  current: number;
  target: number;
  by: string;
  color: string;
}

export interface UserData {
  // Personal
  name: string;
  partnerName: string;
  age: number;
  city: string;
  occupation: string;
  maritalStatus: "single" | "married" | "couple";

  // Income
  annualSalary: number;
  otherIncome: number;       // annual
  taxRegime: "old" | "new";

  // Monthly Expenses
  rentEmi: number;
  groceries: number;
  utilities: number;
  transport: number;
  dining: number;
  entertainment: number;
  education: number;
  otherExpenses: number;

  // Assets
  bankSavings: number;
  mutualFunds: number;
  stocks: number;
  fixedDeposits: number;
  ppfEpf: number;
  gold: number;
  realEstate: number;        // market value

  // Debt
  homeLoanBalance: number;
  homeLoanEmi: number;
  carLoanBalance: number;
  personalLoanBalance: number;
  creditCardOutstanding: number;

  // SIP & Goals
  monthlySip: number;
  retirementAge: number;
  emergencyTarget: number;
  homeTarget: number;
  homeTimelineYears: number;
  childEducationTarget: number;
  childEducationYears: number;
  otherGoalLabel: string;
  otherGoalTarget: number;
  otherGoalYears: number;

  // Insurance & Risk
  lifeInsuranceCover: number;
  healthInsuranceCover: number;
  riskAppetite: "conservative" | "moderate" | "aggressive";
}

export interface DerivedMetrics {
  totalAssets: number;
  totalDebt: number;
  netWorth: number;
  monthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;        // %
  debtToAssetRatio: number;  // %
  moneyHealthScore: number;   // 0–100
  estimatedXirr: number;      // %
  annualTax: number;
  recommendedLifeCover: number;
  goals: Goal[];
  totalInvestments: number;
  sipRecommendation: number;
  taxSavingPotential: number;
  sectorAllocation: {
    equity: number;
    debt: number;
    gold: number;
    realEstate: number;
    cash: number;
  };
}

// ─── Derive computed metrics from raw inputs ──────────────────────────────────
export function deriveMetrics(d: UserData): DerivedMetrics {
  const totalAssets =
    d.bankSavings + d.mutualFunds + d.stocks + d.fixedDeposits +
    d.ppfEpf + d.gold + d.realEstate;

  const totalDebt =
    d.homeLoanBalance + d.carLoanBalance + d.personalLoanBalance + d.creditCardOutstanding;

  const netWorth = totalAssets - totalDebt;

  const monthlyIncome = (d.annualSalary + d.otherIncome) / 12;

  const totalMonthlyExpenses =
    d.rentEmi + d.groceries + d.utilities + d.transport +
    d.dining + d.entertainment + d.education + d.otherExpenses;

  const monthlySavings = monthlyIncome - totalMonthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const debtToAssetRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  const totalInvestments = d.mutualFunds + d.stocks + d.fixedDeposits + d.ppfEpf + d.gold;

  // Money Health Score (0-100) — weighted factors
  const savingsScore = Math.min(savingsRate * 2.5, 100); // 40% savings rate = full score
  const debtScore = Math.max(100 - debtToAssetRatio * 1.5, 0);
  const investmentScore = Math.min((totalInvestments / (d.annualSalary || 1)) * 20, 100);
  const insuranceScore = (() => {
    const rec = d.annualSalary * 10;
    if (rec === 0) return 50;
    return Math.min((d.lifeInsuranceCover / rec) * 100, 100);
  })();
  const emergencyCurrent = d.bankSavings;
  const emergencyTarget = totalMonthlyExpenses * 6;
  const emergencyScore = emergencyTarget > 0 ? Math.min((emergencyCurrent / emergencyTarget) * 100, 100) : 50;

  const moneyHealthScore = Math.round(
    savingsScore * 0.25 +
    debtScore * 0.20 +
    investmentScore * 0.25 +
    insuranceScore * 0.15 +
    emergencyScore * 0.15
  );

  // Estimated XIRR based on risk appetite
  const xirrMap = { conservative: 9.5, moderate: 13, aggressive: 17 };
  const estimatedXirr = xirrMap[d.riskAppetite];

  // Annual tax (simplified slabs)
  const taxableIncome = d.annualSalary + d.otherIncome;
  let annualTax = 0;
  if (d.taxRegime === "new") {
    if (taxableIncome <= 300000) annualTax = 0;
    else if (taxableIncome <= 700000) annualTax = (taxableIncome - 300000) * 0.05;
    else if (taxableIncome <= 1000000) annualTax = 20000 + (taxableIncome - 700000) * 0.10;
    else if (taxableIncome <= 1200000) annualTax = 50000 + (taxableIncome - 1000000) * 0.15;
    else if (taxableIncome <= 1500000) annualTax = 80000 + (taxableIncome - 1200000) * 0.20;
    else annualTax = 140000 + (taxableIncome - 1500000) * 0.30;
  } else {
    const deductions = Math.min(150000, 150000); // basic 80C
    const net = Math.max(taxableIncome - deductions - 50000, 0); // std deduction
    if (net <= 250000) annualTax = 0;
    else if (net <= 500000) annualTax = (net - 250000) * 0.05;
    else if (net <= 1000000) annualTax = 12500 + (net - 500000) * 0.20;
    else annualTax = 112500 + (net - 1000000) * 0.30;
  }

  const recommendedLifeCover = d.annualSalary * 10;
  const taxSavingPotential = Math.max(150000 - (d.ppfEpf + d.mutualFunds * 0.3), 0) * 0.30;

  // Goals
  const goals: Goal[] = [
    {
      label: "Retirement Fund",
      icon: "🏖️",
      current: totalInvestments,
      target: d.annualSalary * 25,
      by: String(new Date().getFullYear() + (d.retirementAge - d.age)),
      color: "#E21B23",
    },
    {
      label: "Emergency Fund",
      icon: "🛡️",
      current: d.bankSavings,
      target: emergencyTarget,
      by: "Dec " + String(new Date().getFullYear() + 1),
      color: "#16A34A",
    },
  ];

  if (d.homeTarget > 0) {
    goals.push({
      label: "Home Down Payment",
      icon: "🏠",
      current: Math.min(d.bankSavings * 0.4, d.homeTarget),
      target: d.homeTarget,
      by: String(new Date().getFullYear() + d.homeTimelineYears),
      color: "#2563EB",
    });
  }

  if (d.childEducationTarget > 0) {
    goals.push({
      label: "Child Education",
      icon: "🎓",
      current: Math.min(d.ppfEpf * 0.3, d.childEducationTarget),
      target: d.childEducationTarget,
      by: String(new Date().getFullYear() + d.childEducationYears),
      color: "#D97706",
    });
  }

  if (d.otherGoalTarget > 0 && d.otherGoalLabel) {
    goals.push({
      label: d.otherGoalLabel,
      icon: "🎯",
      current: 0,
      target: d.otherGoalTarget,
      by: String(new Date().getFullYear() + d.otherGoalYears),
      color: "#7C3AED",
    });
  }

  // Portfolio sector allocation estimate
  const investTotal = totalInvestments + d.bankSavings || 1;
  const sectorAllocation = {
    equity: Math.round(((d.mutualFunds * 0.7 + d.stocks) / investTotal) * 100),
    debt: Math.round(((d.fixedDeposits + d.ppfEpf + d.mutualFunds * 0.3) / investTotal) * 100),
    gold: Math.round((d.gold / investTotal) * 100),
    realEstate: Math.round((d.realEstate / investTotal) * 100),
    cash: Math.round((d.bankSavings / investTotal) * 100),
  };

  // Recommended SIP (15% of income if below, else current)
  const sipRecommendation = Math.max(d.monthlySip, Math.round(monthlyIncome * 0.15 / 1000) * 1000);

  return {
    totalAssets, totalDebt, netWorth, monthlyIncome, totalMonthlyExpenses,
    monthlySavings, savingsRate, debtToAssetRatio, moneyHealthScore,
    estimatedXirr, annualTax, recommendedLifeCover, goals, totalInvestments,
    sipRecommendation, taxSavingPotential, sectorAllocation,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface UserDataContextType {
  userData: UserData | null;
  metrics: DerivedMetrics | null;
  setUserData: (data: UserData) => void;
  resetUserData: () => void;
}

const UserDataContext = createContext<UserDataContextType>({
  userData: null,
  metrics: null,
  setUserData: () => {},
  resetUserData: () => {},
});

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [metrics, setMetrics] = useState<DerivedMetrics | null>(null);

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    setMetrics(deriveMetrics(data));
  };

  const resetUserData = () => {
    setUserDataState(null);
    setMetrics(null);
  };

  return (
    <UserDataContext.Provider value={{ userData, metrics, setUserData, resetUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  return useContext(UserDataContext);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatCr(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}
