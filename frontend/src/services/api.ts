// src/services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  // 1. Money Health Score
  getHealthScore: async (data: any) => {
    const res = await fetch(`${BASE_URL}/health-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Health score failed");
    return res.json();
  },

  // 2. Portfolio X-Ray
// src/services/api.ts  ← Update only this function
  analyzePortfolio: async (fundCode: string) => {
    const res = await fetch(`${BASE_URL}/portfolio-xray?code=${fundCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Portfolio X-Ray failed");
    return res.json();
  },

  // 3. AI Chat (for AIMentor)
  sendChat: async (message: string, profile: any) => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        income: profile.income || 0,
        savings: profile.savings || 0,
        investments: profile.investments || 0,
        debt: profile.debt || 0,
      }),
    });
    return res.json();
  },

  // 4. Monte Carlo (for LifeSimulator)
  runMonteCarlo: async (data: any) => {
    const res = await fetch(`${BASE_URL}/monte-carlo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 5. Tax Wizard
  calculateTax: async (data: any) => {
    const res = await fetch(`${BASE_URL}/tax-wizard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 6. Couple Planner
  calculateCouplePlan: async (data: any) => {
    const res = await fetch(`${BASE_URL}/couple-planner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};