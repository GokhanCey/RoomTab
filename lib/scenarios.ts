
export const scenarios = [
    {
        title: "Scenario 1: Simple Equal Split",
        category: "dinner",
        currency: "USD",
        expenses: [{ id: "1", description: "Sushi Night", amount: 150 }],
        participants: [
            { id: "1", name: "Alex", tags: [] },
            { id: "2", name: "Jamie", tags: [] },
            { id: "3", name: "Riley", tags: [] }
        ],
        output: {
            summary: "Split equally among all participants.",
            split: [
                { name: "Alex", share: 50.00, percent: 33, reasoning: "Equal share." },
                { name: "Jamie", share: 50.00, percent: 33, reasoning: "Equal share." },
                { name: "Riley", share: 50.00, percent: 33, reasoning: "Equal share." }
            ]
        }
    },
    {
        title: "Scenario 2: One Non-Drinker",
        category: "dinner",
        currency: "USD",
        expenses: [{ id: "1", description: "Drinks", amount: 120 }],
        participants: [
            { id: "1", name: "Dana", tags: ["Non-drinker"] },
            { id: "2", name: "Mia", tags: [] },
            { id: "3", name: "Leo", tags: [] }
        ],
        output: {
            summary: "Applies 20% discount to non-drinker for consumption events.",
            split: [
                { name: "Dana", share: 34.29, percent: 29, reasoning: "Adjusted: Non-drinker (-20%)." },
                { name: "Mia", share: 42.86, percent: 36, reasoning: "Increased share." },
                { name: "Leo", share: 42.86, percent: 36, reasoning: "Increased share." }
            ]
        }
    },
    {
        title: "Scenario 3: Housing, Late Joiner",
        category: "rent",
        currency: "USD",
        expenses: [{ id: "1", description: "January Rent", amount: 2100 }],
        participants: [
            { id: "1", name: "Alex", tags: ["Organizer", "Student", "Arrived late"] },
            { id: "2", name: "Jamie", tags: ["Unemployed"] },
            { id: "3", name: "Riley", tags: [] }
        ],
        output: {
            summary: "Complex weighting: Late (-10%) + Student (-30%) vs Unemployed (-30%).",
            split: [
                { name: "Alex", share: 554.62, percent: 26, reasoning: "Adjusted: Partial Participation (-10%), Financial Relief (-30%). Total savings: USD 145.38." },
                { name: "Jamie", share: 641.18, percent: 31, reasoning: "Adjusted: Financial Relief (-30%). Total savings: USD 58.82." },
                { name: "Riley", share: 904.20, percent: 43, reasoning: "Increased share." }
            ]
        }
    },
    {
        title: "Scenario 4: Organizer Paid Deposit",
        category: "trip",
        currency: "USD",
        expenses: [
            { id: "1", description: "Hotel", amount: 800 },
            { id: "2", description: "Car Rental", amount: 300 }
        ],
        participants: [
            { id: "1", name: "Taylor", tags: ["Organizer", "Paid deposit"] },
            { id: "2", name: "Sam", tags: [] },
            { id: "3", name: "Jordan", tags: ["Student"] }
        ],
        output: {
            summary: "Student subsidy applied. Organizer gets no discount unless specified.",
            split: [
                { name: "Taylor", share: 407.41, percent: 37, reasoning: "Equal share." },
                { name: "Sam", share: 407.41, percent: 37, reasoning: "Equal share." },
                { name: "Jordan", share: 285.19, percent: 26, reasoning: "Adjusted: Financial Relief (-30%). Total savings: USD 81.48." }
            ]
        }
    },
    {
        title: "Scenario 5: High Earner Subsidizing",
        category: "dinner",
        currency: "USD",
        expenses: [{ id: "1", description: "Steakhouse", amount: 300 }],
        participants: [
            { id: "1", name: "Henry", tags: ["High earner"] },
            { id: "2", name: "Ben", tags: ["Unemployed"] },
            { id: "3", name: "Carla", tags: ["Student"] }
        ],
        output: {
            summary: "High earner pays extra (+25%) to subsidize others.",
            split: [
                { name: "Henry", share: 141.51, percent: 47, reasoning: "Adjusted: High Earner Contribution (+25%)." },
                { name: "Ben", share: 79.25, percent: 26, reasoning: "Adjusted: Financial Relief (-30%). Total savings: USD 20.75." },
                { name: "Carla", share: 79.25, percent: 26, reasoning: "Adjusted: Financial Relief (-30%). Total savings: USD 20.75." }
            ]
        }
    }
];
