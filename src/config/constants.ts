import { Type } from "@google/genai";

/**
 * Defines the comprehensive JSON structure for the AI's shopping plan response.
 */
export const shoppingPlanSchema = {
    type: Type.OBJECT,
    properties: {
        budgetAnalysis: {
            type: Type.OBJECT,
            properties: {
                userBudget: { type: Type.NUMBER, description: "The budget amount mentioned by the user." },
                estimatedCost: { type: Type.NUMBER, description: "The AI's total estimated cost for all items." },
                difference: { type: Type.NUMBER, description: "The difference between userBudget and estimatedCost (positive if under budget, negative if over)." },
                summary: { type: Type.STRING, description: "A brief, sharp summary, like 'Your budget is sufficient' or 'You are over budget'." }
            },
            required: ["userBudget", "estimatedCost", "difference", "summary"]
        },
        budgetItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    estimatedPrice: { type: Type.NUMBER }
                },
                required: ["itemName", "quantity", "estimatedPrice"]
            }
        },
        priceAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    priceStability: { type: Type.STRING, description: "e.g., 'Stable', 'Slight Increase', 'Volatile'" },
                    savingTip: { type: Type.STRING, description: "An actionable tip for this specific item." }
                },
                required: ["itemName", "priceStability", "savingTip"]
            }
        },
        recommendedMerchants: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    address: { type: Type.STRING, description: "Location within the specified area." },
                    deals: { type: Type.STRING, description: "What they are known for or their current deals." }
                },
                required: ["name", "address", "deals"]
            }
        }
    },
    required: ["budgetAnalysis", "budgetItems", "priceAnalysis", "recommendedMerchants"]
};

/**
 * Defines the JSON structure for the AI's ad copy response.
 */
export const adCopySchema = {
    type: Type.OBJECT,
    properties: {
        headline: {
            type: Type.STRING,
            description: "A short, catchy title for the ad."
        },
        body: {
            type: Type.STRING,
            description: "The main text of the ad, 2-3 sentences long."
        },
        callToAction: {
            type: Type.STRING,
            description: "A compelling call to action, e.g., 'Shop Now!' or 'Visit Us Today'."
        },
        hashtags: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "An array of 5-7 relevant hashtags."
        }
    },
    required: ["headline", "body", "callToAction", "hashtags"]
};

/**
 * Defines the JSON structure for the AI's dashboard report response.
 */
export const dashboardReportSchema = {
    type: Type.OBJECT,
    properties: {
        totalSpent: { type: Type.NUMBER },
        avgDailySpend: { type: Type.NUMBER },
        topCategory: { type: Type.STRING },
        spendingByCategory: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, amount: { type: Type.NUMBER } }, required: ["category", "amount"] }
        },
        transactions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING, description: "e.g., Aug 20" },
                    item: { type: Type.STRING },
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    type: { type: Type.STRING, description: "'in' for income, 'out' for expense" }
                },
                required: ["date", "item", "category", "amount", "type"]
            }
        }
    },
    required: ["totalSpent", "avgDailySpend", "topCategory", "spendingByCategory", "transactions"]
};
