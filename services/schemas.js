
const shoppingPlanSchema = {
    type: 'OBJECT',
    properties: {
        budgetAnalysis: {
            type: 'OBJECT',
            properties: {
                userBudget: { type: 'NUMBER', description: "The budget amount mentioned by the user." },
                estimatedCost: { type: 'NUMBER', description: "The AI's total estimated cost for all items." },
                difference: { type: 'NUMBER', description: "The difference between userBudget and estimatedCost (positive if under budget, negative if over)." },
                summary: { type: 'STRING', description: "A brief, sharp summary, like 'Your budget is sufficient' or 'You are over budget'." },
                optimizationTips: { type: 'ARRAY', items: { type: 'STRING' }, description: "An array of 2-3 actionable tips to optimize the budget." }
            },
            required: ["userBudget", "estimatedCost", "difference", "summary", "optimizationTips"]
        },
        budgetItems: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    itemName: { type: 'STRING' },
                    quantity: { type: 'STRING' },
                    estimatedPrice: { type: 'NUMBER' }
                },
                required: ["itemName", "quantity", "estimatedPrice"]
            }
        },
        priceAnalysis: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    itemName: { type: 'STRING' },
                    priceStability: { type: 'STRING', description: "e.g., 'Stable', 'Slight Increase', 'Volatile'" },
                    savingTip: { type: 'STRING', description: "An actionable tip for this specific item." }
                },
                required: ["itemName", "priceStability", "savingTip"]
            }
        },
        recommendedMerchants: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    name: { type: 'STRING' },
                    address: { type: 'STRING', description: "Location within the specified area." },
                    deals: { type: 'STRING', description: "What they are known for or their current deals." },
                    verified: { type: 'BOOLEAN', description: "Set to true if this is a major, well-known merchant (e.g., Shoprite, Justrite), otherwise false." }
                },
                required: ["name", "address", "deals", "verified"]
            }
        }
    },
    required: ["budgetAnalysis", "budgetItems", "priceAnalysis", "recommendedMerchants"]
};

const adCopySchema = {
    type: 'OBJECT',
    properties: {
        headline: {
            type: 'STRING',
            description: "A short, punchy, and irresistible headline for the ad."
        },
        body: {
            type: 'STRING',
            description: "The main text of the ad, 2-3 sentences long. It should evoke emotion and clearly state the benefit."
        },
        callToAction: {
            type: 'STRING',
            description: "A strong, clear, and urgent call to action, e.g., 'Shop Now & Save 50%!' or 'Get Yours Before It's Gone'."
        },
        hashtags: {
            type: 'ARRAY',
            items: {
                type: 'STRING',
            },
            description: "An array of 5-7 highly relevant and trending hashtags."
        }
    },
    required: ["headline", "body", "callToAction", "hashtags"]
};

const financialHealthSchema = {
    type: 'OBJECT',
    properties: {
        score: { type: 'NUMBER', description: "A score from 0-100 indicating financial health." },
        summary: { type: 'STRING', description: "A one-sentence summary of the user's financial health this month." },
        recommendations: { type: 'ARRAY', items: { type: 'STRING' }, description: "An array of 1-2 actionable recommendations." }
    },
    required: ["score", "summary", "recommendations"]
};

const transactionCategorySchema = {
    type: 'OBJECT',
    properties: {
        category: {
            type: 'STRING',
            description: "The most appropriate financial category for the transaction, selected from the provided list."
        }
    },
    required: ["category"]
};

module.exports = {
    shoppingPlanSchema,
    adCopySchema,
    financialHealthSchema,
    transactionCategorySchema
};
