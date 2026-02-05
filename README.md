# RoomTab: The Fairness Engine 🧾

> **Stop arguing about the bill. Let Logic handle it.**

RoomTab is an AI-driven fairness engine for splitting shared costs, built for **Commit To Change: An AI Agents Hackathon**. Existing split apps are lazy calculators—they force you to manually input who owes what. RoomTab acts as the **arbiter**, handling the messy, real-life parts of shared costs: the roommate who arrives late, the vegan who skips the steak, or the ghost who "pays nothing."

## Links

*   **Live Demo**: [https://room-tab.vercel.app/](https://room-tab.vercel.app/)
*   **Video Walkthrough**: [https://youtu.be/DkIFt4YB28s](https://youtu.be/DkIFt4YB28s)
*   **Source Code**: [https://github.com/GokhanCey/RoomTab](https://github.com/GokhanCey/RoomTab)
*   **Pitch Deck**: [https://github.com/GokhanCey/RoomTab/blob/main/PD.pdf](https://github.com/GokhanCey/RoomTab/blob/main/PD.pdf)

## How it Works

RoomTab decouples **reasoning** from **calculation** to ensure fairness without hallucination.

1.  **AI Judge (Gemini 2.0 Flash)**: Analyzing natural language context ("Jack didn't use gas") to assign specific *Role Tags* (e.g., `exclude:gas`, `partial:rent`). It does **not** do math.
2.  **Deterministic Engine**: A custom algorithm applies these tags to calculate exact splits down to the cent. Same inputs always produce identical results.

## Observability (Opik)

We adhere to "Log Everything" to enable debugging and audit trails.

*   **Live Traces**: Every decision generates a Trace ID, logged to Opik with latency and token usage.
*   **Conflict Detection**: If modifiers create impossible math (e.g., everyone excluded), we flag `scenario:conflict` for human review.
*   **Evaluation Suite**: We run a structured regression suite against canonical scenarios to verify zero-sum integrity.

## Technology Stack

*   **Frontend**: Next.js 15
*   **AI**: Gemini 2.0 Flash (Vercel AI SDK)
*   **Observability**: Opik SDK
*   **Styling**: Tailwind CSS
*   **Storage**: LocalStorage (Privacy-first)

## Verified Scenarios

We verified the engine against common "absurd" edge cases:

| Scenario | Input | Result |
| :--- | :--- | :--- |
| **The Vegan** | "Bob is vegan, no steak." | Bob pays $0 for steak. |
| **The Late Arrival** | "Alice arrived 2 days late." | Alice pays pro-rated rent. |
| **The Ghost** | "King pays nothing." | King pays $0 (or plan rejected). |
| **Micro-Usage** | "Dave watched 13 mins." | Dave pays exactly ~11%. |

*All scenarios are logged as evaluation cases in Opik.*

---
*Project submitted by Team RoomTab.*
