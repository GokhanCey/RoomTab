# RoomTab

**RoomTab is an AI-powered fairness agent for splitting costs in complex shared situations.**

> Built for the **Commit to Change: AI Agents Hackathon** 2026.

![Status: Live](https://img.shields.io/badge/Status-Live-success?style=flat-square) ![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square) ![Tech](https://img.shields.io/badge/Tech-Next.js%20%7C%20Tailwind%20%7C%20Opik-black?style=flat-square)

## Live Demo
**[Try RoomTab Instantly](https://room-tab.vercel.app)**
*(No signup required)*

---

## The Problem
Splitting bills is rarely as simple as dividing the total by the number of people. Real life involves nuance:
*   "I didn't drink alcohol."
*   "I arrived two days late to the Airbnb."
*   "I'm sleeping on the couch, not a bedroom."

Traditional apps require complex manual mathematics to account for these variables. RoomTab uses AI to deduce the fair share automatically based on natural language context.

## How It Works
1.  **Describe the Context**: Tell the Agent what you are splitting (e.g., "Weekend Trip", "Team Dinner").
2.  **Add Expenses**: List receipts or costs.
3.  **Tag Participants**: Add natural language tags like "Non-drinker", "Early departure", or "Organizer".
4.  **Get a Fair Split**: Our AI Agent analyzes the context and generates a breakdown with explained reasoning for every dollar.

## Tech Stack
*   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
*   **AI Inference**: Google Gemini 2.5 Flash (Mocked for Demo reliability)
*   **Observability**: **[Opik](https://comet.com/site/products/opik/)** for tracing agent decisions and evaluating fairness scores.
*   **Deployment**: Vercel

## Evaluation & Observability (Opik)
We use Opik to ensure our Agent provides reliable outputs and fair reasoning.
*   **Traces**: Every "Generate Split" action is logged as a trace.
*   **Scoring**: We verify that the sum of splits equals the total (Mathematical Correctness) and check against fairness heuristics (e.g., verifying that a "non-drinker" pays less than the average share).

## Key Features (Hackathon Updates)
*   **Fairness Logic v2**: Now uses multiplicative weighting (e.g., *0.7 for Students) and context-aware filtering (e.g., Non-drinkers don't get discounts on Rent).
*   **Financial Health**: Automatically detects "Student", "Unemployed", or "Intern" tags to apply subsidy logic, reducing financial stress for vulnerable groups.
*   **Opik Observability**: Full tracing of every decision. See the [Fairness Evaluation Report](FAIRNESS_REPORT.md) for a 10-scenario audit.
*   **Smart Templates**: One-click setup for "Rent", "Trips", or "Dinner" that pre-fills standard context rules.

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/GokhanCey/RoomTab.git

# 2. Install dependencies
npm install

# 3. Verification (Optional)
# This runs the 10-scenario stress test locally
node evaluate_scenarios.js

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Evidence of Fairness
We take fairness seriously. We ran our Agent against 10 complex edge cases (Mixed diets, Late joiners, Income disparity).
👉 **[Read the Full Fairness Report](FAIRNESS_REPORT.md)**

## Hackathon Tracks
*   **Best Use of Opik**: Deep integration of observability to prove AI fairness. We log model versions, decision paths, and fairness scores.
*   **Financial Health**: Reducing social friction and financial stress among peers/students via automated subsidies.

---
*Built by Gokhan Ceylan.*
