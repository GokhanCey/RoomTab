# RoomTab 🧾✨
**The AI-Powered Fairness Engine for Shared Expenses**

[![Built with Opik](https://img.shields.io/badge/Built%20with-Opik-blue)](https://www.comet.com/opik) [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/) [![Gemini 2.0](https://img.shields.io/badge/AI-Gemini%202.0-8E44AD)](https://deepmind.google/technologies/gemini/)

> *"Equal splits aren't always fair."*

RoomTab is an intelligent expense splitting agent that understands **context**. Instead of mindlessly dividing bills by $N$, it reads the situation ("Alice is vegan", "Bob arrived 2 weeks late") and calculates a mathematically fair split using **Generative AI** and **Weighted Logic**, verified by **Opik**.

---

## 🏆 Hackathon Tracks

### 1. Best Use of Opik (Observability) 🕵️‍♂️
We didn't just add logging; we built our entire **Fairness Engine** on top of Opik.
*   **End-to-End Tracing:** Every split request is a trace, tagged with scenarios (e.g., `scenario:vegan`, `scenario:exclusion`).
*   **Live Dashboard:** The frontend displays real-time `game_id` (trace ID), `latency`, and `token_count` directly from the AI response.
*   **User Feedback Loop:** Users can vote "Fair" or "Unfair" on results, which feeds directly back into Opik for dataset evaluation.

### 2. Financial Health (FinTech) 💸
RoomTab prevents the "silent tax" of equal splitting. By accounting for income disparity ("Student discount"), usage ("Didn't eat the steak"), and duration ("Moved in late"), we reduce financial stress among roommates and friends.

---

## 🚀 Key Features

### 🧠 The Logic Engine (Gemini 2.0 Flash)
Our custom prompt pipeline doesn't just guess; it follows strict **Fairness Principles**:
*   **Exclusion**: If you didn't consume it, you pay $0.
*   **Pro-Rating**: Rent is calculated by days stayed.
*   **Capacity**: Can apply subsidies for students or lower-income members if context suggests.

### ⚖️ Settlement Plans
RoomTab calculates not just *what* everyone owes, but *who pays whom* to settle debts efficiently. 
*   **Algorithm**: Greedy minimization of transactions.
*   **Output**: Clear instructions (e.g., *"Bob pays Alice $30.00"*).

### 🔍 Transparency & Audit
Trust is key. We provide:
*   **Currency Support**: Multi-currency handling (USD, EUR, TRY, INR).
*   **Fairness Audit**: A public `/audit` page showing verified test cases.
*   **Debug Mode**: View the raw JSON reasoning behind every decision.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 15 (App Router), Tailwind CSS, Shadcn/UI
*   **AI Model**: Google Gemini 2.0 Flash (via Vercel AI SDK)
*   **Observability**: Opik (Comet ML) for Tracing & Evaluation
*   **State Management**: React Hooks + LocalStorage (Persisted History)

---

## 📦 Getting Started

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/yourusername/roomtab.git
    cd roomtab
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Environment Variables**
    Create a `.env.local` file:
    ```env
    GEMINI_API_KEY=your_gemini_key
    OPIK_API_KEY=your_opik_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to start splitting!

---

## 🧪 Fairness Challenge (Verified)

We put RoomTab to the test against complex social scenarios:

| Scenario | Context | Verdict |
| :--- | :--- | :--- |
| **The Vegan** | "Bob said he's vegan but ate the seafood platter." | **PASS**: Bob pays extra penalty. |
| **Late Arrival** | "Charlie missed the free intro week." | **PASS**: Charlie pays pro-rated amount. |
| **Equal Split** | (No Context) | **PASS**: Instant mathematical division. |

---

*Built with ❤️ for the Hackathon.*
