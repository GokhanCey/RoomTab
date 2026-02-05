# RoomTab Fairness Logic Audit 🧾

**Project:** RoomTab
**Submission Track:** Best Use of Opik + Financial Health
**Verification Date:** Feb 2026

---

## 1. Audit Methodology

We maintain a regression suite of edge-case scenarios to validate that RoomTab’s logic behaves consistently and that all cost splits remain zero-sum. These scenarios simulate real-world usage conditions.

- **Zero-Sum Guarantee**: Total distributed cost equals the original total.
- **Context Isolation**: Modifiers only affect relevant items (e.g. Alcohol), not global totals.
- **Conflict Detection**: Invalid or contradictory rules are flagged for manual review, not auto-resolved.

All audit trails are logged to **Opik** with unique Trace IDs for reproducibility.

## 2. The Stress Tests (Regression Suite)

The following scenarios are part of our core evaluation dataset run via `scripts/run_eval.ts`.

| Scenario ID                | Context Input                               | Expected Behavior                                                                                      | Status      |
| :------------------------- | :------------------------------------------ | :----------------------------------------------------------------------------------------------------- | :---------- |
| **SC-001: The Vegan**      | "Bob is vegan, so he didn't eat the steak." | **PASS**: Bob pays $0.00 for steak.                                                                    | ✅ Verified |
| **SC-002: Late Arrival**   | "Alice arrived 2 days late to the Airbnb."  | **PASS**: Rent is pro-rated based on days present. Alice pays less than full-term guests.              | ✅ Verified |
| **SC-003: The Ghost**      | "King says he pays nothing."                | **PASS - Flagged**: Logic detects King pays $0. System triggers `scenario:conflict` for manual review. | ✅ Verified |
| **SC-004: The Teetotaler** | "Sarah doesn't drink alcohol."              | **PASS**: Sarah is excluded from all items tagged `category:alcohol` contextually.                     | ✅ Verified |

## 3. Trace Logging in Opik

Each evaluation run is logged in Opik with:

- Trace ID
- Model version
- Scenario tags
- Latency and token usage
- Linked user feedback (if available)

---

_Scenarios used for internal validation and hackathon evaluation._
