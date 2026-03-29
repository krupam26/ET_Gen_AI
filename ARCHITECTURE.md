# ET Wealth Navigator – System Architecture

**ET AI Hackathon 2026**  
**Problem Statement #9 – AI Money Mentor**

---

# 1. Overview

ET Wealth Navigator is a voice-first AI financial mentor that helps users plan their finances using personalized insights, probabilistic simulations, and portfolio analytics.

The platform combines a modern web interface with a multi-agent AI system capable of performing complex financial reasoning including portfolio diagnostics, retirement simulations, tax optimization, and behavioral finance nudges.

The system is designed to transform raw financial data into clear and actionable insights.

---

# 2. System Architecture

The platform follows a modular architecture consisting of:

1. Frontend Interface
2. API Backend
3. AI Multi-Agent Intelligence Layer
4. External Financial Data Sources
5. Visualization and Insight Delivery

---

# 3. High-Level Architecture
![Architecture](frontend/screenshots/architecture.png)


---

# 4. Core Innovation – Multi-Agent Intelligence System

The core intelligence layer is built using a multi-agent architecture where specialized agents handle different financial reasoning tasks.

Each agent operates independently but collaborates through the orchestration layer to generate coherent financial advice.

| Agent | Responsibility |
|-----|-----|
| Profiling Agent | Builds and maintains the user’s financial profile |
| Portfolio Intelligence Agent | Analyzes investments, sector exposure, XIRR, and expense drag |
| Tax Wizard Agent | Evaluates tax regimes and suggests optimal deductions |
| Monte Carlo Simulation Agent | Runs 1000+ probabilistic retirement simulations |
| Behavioral Finance Agent | Generates alerts, nudges, and risk insights |
| Couple Planner Agent | Optimizes financial strategy for dual-income households |

This architecture improves:

- modularity
- explainability
- extensibility
- parallel reasoning capability

---

# 5. Frontend Architecture

The frontend provides a responsive and interactive dashboard for financial insights.

### Technologies

- React
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- Framer Motion

### Core Functional Modules

Dashboard  
Portfolio X-Ray  
Monte Carlo Life Simulator  
AI Voice Mentor  
Tax Wizard  
Couple Financial Planner  
Risk Alerts Panel

### Voice Interface

Voice interaction is implemented using the Web Speech API.

Capabilities:

- speech recognition
- text-to-speech responses
- conversational interaction with AI mentor

---

# 6. Backend Architecture

The backend acts as an orchestration layer between the frontend interface and AI reasoning engine.

### Framework

FastAPI (Python)

### AI Orchestration

CrewAI coordinates specialized agents that process financial data and generate insights.

### Language Model

Groq LLM (Llama-3.3-70B) provides reasoning, explanations, and conversational responses.

### Key API Endpoints

| Endpoint | Function |
|---|---|
| POST /health-score | Calculates financial health score |
| POST /portfolio-xray | Performs portfolio diagnostics |
| POST /chat | Handles AI mentor conversations |
| POST /monte-carlo | Runs retirement simulation engine |
| POST /tax-wizard | Provides tax optimization analysis |
| POST /couple-planner | Generates joint financial strategies |

---

# 7. Data Sources

The platform integrates real financial data providers to ensure authenticity.

### Mutual Fund Data

MFapi.in

Used for:

- fund metadata
- NAV values
- portfolio composition

### Market Benchmarks

yfinance

Used for:

- benchmark index returns
- market volatility modeling
- comparison metrics

---

# 8. Data Flow Example – Monte Carlo Life Simulator

Step 1  
User adjusts parameters on the frontend:

- monthly SIP
- expected return
- retirement age

Step 2  
Frontend sends request to backend:


Step 3  
Monte Carlo Agent runs 1000 probabilistic simulations using historical market volatility.

Step 4  
Simulation outputs probability bands:

- best case
- median projection
- worst case

Step 5  
Backend sends structured data to frontend.

Step 6  
Frontend renders fan chart visualization using Recharts.

---

# 9. Visualization Layer

Financial insights are presented through interactive charts and dashboards.

### Visualization Tools

Recharts  
Framer Motion

### Chart Types

Portfolio allocation pie charts  
Sector exposure bar charts  
Retirement projection fan charts  
Tax comparison graphs  
Financial health score gauges

These visualizations help users quickly understand complex financial data.

---

# 10. Scalability Considerations

The architecture is designed to evolve into a production-grade fintech platform.

Future improvements include:

- real-time brokerage integration
- automated portfolio sync
- cloud-based AI inference
- mobile application support
- persistent financial profiles

---

# 11. Security Considerations

Financial data requires strong security protections.

Recommended practices include:

- HTTPS encrypted communication
- secure authentication layer
- minimal storage of financial documents
- anonymized analytics pipelines

---

# 12. Key Design Decisions

Multi-Agent Architecture  
Allows modular reasoning and specialized financial analysis.

Voice-First Interface  
Designed for accessibility and mass adoption in India.

Real Market Data Integration  
Ensures realistic financial insights.

Frontend Fallback Mode  
System can run using mock data if backend APIs are unavailable.

---

# 13. Summary

ET Wealth Navigator combines AI reasoning, financial analytics, and interactive visualization to create a next-generation personal finance mentor.

The architecture ensures:

- modular AI reasoning
- scalable financial analytics
- interactive user experience
- real-world data integration

This system demonstrates how AI can democratize financial planning and empower users to make better financial decisions.