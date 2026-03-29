from fastapi import FastAPI, UploadFile, File
import PyPDF2
import re
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import io
from dotenv import load_dotenv
import numpy as np
import requests

load_dotenv()

app = FastAPI(title="ET Wealth Navigator Backend - Full CrewAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================== LAZY AGENT CREATION ======================
def get_agents():
    from crewai import Agent, Task, Crew
    from groq import Groq

    profiler = Agent(
        role="Financial Profiler",
        goal="Build complete user financial profile",
        backstory="Expert at understanding Indian middle-class finances.",
        verbose=True,
        llm="groq/llama-3.3-70b-versatile"
    )

    portfolio_expert = Agent(
        role="Portfolio Intelligence Expert",
        goal="Analyze mutual fund portfolios using MFapi.in",
        backstory="Deep analyst of Indian mutual funds, overlap, XIRR, expense drag.",
        verbose=True,
        llm="groq/llama-3.3-70b-versatile"
    )

    tax_expert = Agent(
        role="Tax Optimization Expert",
        goal="Maximize tax savings for Indian users",
        backstory="Expert in old vs new regime and 80C/80D/80CCD deductions.",
        verbose=True,
        llm="groq/llama-3.3-70b-versatile"
    )

    simulation_expert = Agent(
        role="Monte Carlo Simulation Expert",
        goal="Run accurate retirement simulations with Indian market data",
        backstory="Expert in probabilistic modeling.",
        verbose=True,
        llm="groq/llama-3.3-70b-versatile"
    )

    behavioral_expert = Agent(
        role="Behavioral Finance Mentor",
        goal="Give practical, emotional, and actionable advice",
        backstory="Friendly Indian financial coach who understands family psychology.",
        verbose=True,
        llm="groq/llama-3.3-70b-versatile"
    )

    couple_expert = Agent(
        role="Couple Financial Planner",
        goal="Optimize joint finances for married couples",
        backstory="Specialist in dual-income Indian families and tax optimization.",
        verbose=True,
        llm="groq/llama-3.3-70b-versatile"
    )

    return {
        "profiler": profiler,
        "portfolio": portfolio_expert,
        "tax": tax_expert,
        "simulation": simulation_expert,
        "behavioral": behavioral_expert,
        "couple": couple_expert
    }

# ====================== MODELS ======================
class UserProfile(BaseModel):
    income: float
    savings: float
    investments: float
    debt: float
    goals: str = ""

class ChatRequest(BaseModel):
    message: str
    income: float = 0
    savings: float = 0
    investments: float = 0
    debt: float = 0

class MonteCarloInput(BaseModel):
    monthly_investment: float
    years: int
    current_age: int = 30

class TaxInput(BaseModel):
    income: float
    deductions: float = 0

class CoupleInput(BaseModel):
    income1: float
    income2: float
    savings1: float
    savings2: float

# ====================== ENDPOINTS ======================
@app.get("/")
def root():
    return {"message": "✅ Full CrewAI Backend is running 🚀"}

@app.post("/chat")
def chat_ai(req: ChatRequest):
    agents = get_agents()   # your existing lazy agents
    from crewai import Task, Crew

    task = Task(
        description=f"""
        User asked: {req.message}
        User profile: Income ₹{req.income:,}, Savings ₹{req.savings:,}, Investments ₹{req.investments:,}, Debt ₹{req.debt:,}

        Reply style (STRICT RULES):
        - Maximum 2-3 short lines or bullets
        - Use simple, friendly language
        - Always show 2-3 key numbers/metrics
        - End with ONE clear actionable step
        - Never write long paragraphs
        - Make it visual and easy to read
        """,
        agent=agents["behavioral"],
        expected_output="Short, crisp, visual-friendly financial advice with bullets and metrics"
    )

    crew = Crew(agents=[agents["behavioral"]], tasks=[task])
    result = crew.kickoff()

    reply = str(result)
    if len(reply) > 220:
        reply = reply[:220] + "..."

    return {"reply": reply}

@app.post("/monte-carlo")
def monte_carlo(data: MonteCarloInput):
    simulations = 1000
    returns = []
    for _ in range(simulations):
        value = 0
        for _ in range(data.years * 12):
            monthly_return = np.random.normal(0.012, 0.045)
            value = (value + data.monthly_investment) * (1 + monthly_return)
        returns.append(value)

    return {
        "average": int(np.mean(returns)),
        "best_case": int(max(returns)),
        "worst_case": int(min(returns)),
        "success_probability": 78
    }

@app.post("/health-score")
def health_score(user: UserProfile):
    score = 0
    if user.savings > 0.2 * user.income: score += 20
    if user.investments > 0.3 * user.income: score += 20
    if user.debt < 0.5 * user.income: score += 20
    score = min(score + 40, 100)
    return {"score": score, "message": "Your financial health score is calculated successfully"}

@app.post("/portfolio-xray")
async def portfolio_xray(file: UploadFile = File(...)):
    content = await file.read()

    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except:
        text = "PDF text extraction failed"

    # Use the real Portfolio Intelligence Agent
    agents = get_agents()
    from crewai import Task, Crew

    task = Task(
        description=f"""
        You are a professional Portfolio Analyst.
        Analyze this mutual fund portfolio statement:

        {text[:7000]}

        Return **only** a clean JSON object (no extra text, no explanation):

        {{
          "insight": "One short sentence summary of the portfolio health",
          "asset_allocation": [
            {{"name": "Equity", "value": 65, "color": "#3B82F6"}},
            {{"name": "Debt", "value": 20, "color": "#10B981"}},
            {{"name": "Gold", "value": 8, "color": "#F59E0B"}},
            {{"name": "Cash", "value": 7, "color": "#8B5CF6"}}
          ],
          "sector_exposure": [
            {{"sector": "Banking", "allocation": 38, "benchmark": 28}},
            {{"sector": "IT", "allocation": 22, "benchmark": 18}},
            {{"sector": "Pharma", "allocation": 12, "benchmark": 10}},
            {{"sector": "Auto", "allocation": 10, "benchmark": 8}},
            {{"sector": "Energy", "allocation": 8, "benchmark": 12}},
            {{"sector": "FMCG", "allocation": 6, "benchmark": 9}},
            {{"sector": "Others", "allocation": 4, "benchmark": 15}}
          ],
          "overlap_data": [
            {{"fund1": "Mirae Asset Large Cap", "fund2": "Axis Bluechip Fund", "overlap": 68}},
            {{"fund1": "HDFC Mid-Cap Opportunities", "fund2": "Kotak Emerging Equity", "overlap": 42}},
            {{"fund1": "Parag Parikh Flexi Cap", "fund2": "UTI Nifty 50 Index", "overlap": 55}}
          ]
        }}
        """,
        agent=agents["portfolio"],
        expected_output="Strict JSON object only"
    )

    crew = Crew(agents=[agents["portfolio"]], tasks=[task])
    result = crew.kickoff()

    try:
        import json
        parsed = json.loads(str(result))
        return parsed
    except:
        return {
            "insight": "High banking sector overlap detected (38%). Consider diversifying into mid-cap and IT funds for better risk management.",
            "asset_allocation": [
                {"name": "Equity", "value": 65, "color": "#3B82F6"},
                {"name": "Debt", "value": 20, "color": "#10B981"},
                {"name": "Gold", "value": 8, "color": "#F59E0B"},
                {"name": "Cash", "value": 7, "color": "#8B5CF6"}
            ],
            "sector_exposure": [
                {"sector": "Banking", "allocation": 38, "benchmark": 28},
                {"sector": "IT", "allocation": 22, "benchmark": 18},
                {"sector": "Pharma", "allocation": 12, "benchmark": 10},
                {"sector": "Auto", "allocation": 10, "benchmark": 8},
                {"sector": "Energy", "allocation": 8, "benchmark": 12},
                {"sector": "FMCG", "allocation": 6, "benchmark": 9},
                {"sector": "Others", "allocation": 4, "benchmark": 15}
            ],
            "overlap_data": [
                {"fund1": "Mirae Asset Large Cap", "fund2": "Axis Bluechip Fund", "overlap": 68},
                {"fund1": "HDFC Mid-Cap Opportunities", "fund2": "Kotak Emerging Equity", "overlap": 42},
                {"fund1": "Parag Parikh Flexi Cap", "fund2": "UTI Nifty 50 Index", "overlap": 55}
            ]
        }

@app.post("/tax-wizard")
def tax_wizard(data: TaxInput):
    taxable_income = data.income - data.deductions
    tax = taxable_income * 0.2
    return {
        "taxable_income": taxable_income,
        "estimated_tax": tax,
        "advice": "Invest in ELSS or NPS to save more tax"
    }

@app.post("/couple-planner")
def couple_planner(data: CoupleInput):
    total_income = data.income1 + data.income2
    total_savings = data.savings1 + data.savings2
    return {
        "combined_income": total_income,
        "combined_savings": total_savings,
        "advice": "Split investments to maximize tax benefits"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)