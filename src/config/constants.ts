import { Type } from "@google/genai";
import { z } from "zod";

// Zod Schemas for Runtime Validation
export const shoppingPlanSchemaZod = z.object({
    budgetAnalysis: z.object({
        userBudget: z.number(),
        estimatedCost: z.number(),
        difference: z.number(),
        summary: z.string(),
        optimizationTips: z.array(z.string()),
    }),
    budgetItems: z.array(
        z.object({
            itemName: z.string(),
            quantity: z.string(),
            estimatedPrice: z.number(),
        })
    ),
    priceAnalysis: z.array(
        z.object({
            itemName: z.string(),
            priceStability: z.string(),
            savingTip: z.string(),
        })
    ),
    recommendedMerchants: z.array(
        z.object({
            name: z.string(),
            address: z.string(),
            deals: z.string(),
            verified: z.boolean(),
        })
    ),
});

export const adCopySchemaZod = z.object({
    headline: z.string(),
    body: z.string(),
    callToAction: z.string(),
    hashtags: z.array(z.string()),
});

export const dashboardReportSchemaZod = z.object({
    totalSpent: z.number(),
    avgDailySpend: z.number(),
    topCategory: z.string(),
    spendingByCategory: z.array(
        z.object({
            category: z.string(),
            amount: z.number(),
        })
    ),
    transactions: z.array(
        z.object({
            date: z.string(),
            description: z.string(),
            category: z.string(),
            amount: z.number(),
            type: z.enum(['in', 'out']),
        })
    ),
    financialHealth: z.object({
        score: z.number().min(0).max(100),
        summary: z.string(),
        recommendations: z.array(z.string()),
    }),
});

export const transactionCategorySchemaZod = z.object({
    category: z.string(),
});


// Schemas for Google GenAI API

export const financialHealthSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "A score from 0-100 indicating financial health." },
        summary: { type: Type.STRING, description: "A one-sentence summary of the user's financial health this month." },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 1-2 actionable recommendations." }
    },
    required: ["score", "summary", "recommendations"]
};

export const shoppingPlanSchema = {
    type: Type.OBJECT,
    properties: {
        budgetAnalysis: {
            type: Type.OBJECT,
            properties: {
                userBudget: { type: Type.NUMBER, description: "The budget amount mentioned by the user." },
                estimatedCost: { type: Type.NUMBER, description: "The AI's total estimated cost for all items." },
                difference: { type: Type.NUMBER, description: "The difference between userBudget and estimatedCost (positive if under budget, negative if over)." },
                summary: { type: Type.STRING, description: "A brief, sharp summary, like 'Your budget is sufficient' or 'You are over budget'." },
                optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 actionable tips to optimize the budget." }
            },
            required: ["userBudget", "estimatedCost", "difference", "summary", "optimizationTips"]
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
                    deals: { type: Type.STRING, description: "What they are known for or their current deals." },
                    verified: { type: Type.BOOLEAN, description: "Set to true if this is a major, well-known merchant (e.g., Shoprite, Justrite), otherwise false." }
                },
                required: ["name", "address", "deals", "verified"]
            }
        }
    },
    required: ["budgetAnalysis", "budgetItems", "priceAnalysis", "recommendedMerchants"]
};

export const adCopySchema = {
    type: Type.OBJECT,
    properties: {
        headline: {
            type: Type.STRING,
            description: "A short, punchy, and irresistible headline for the ad."
        },
        body: {
            type: Type.STRING,
            description: "The main text of the ad, 2-3 sentences long. It should evoke emotion and clearly state the benefit."
        },
        callToAction: {
            type: Type.STRING,
            description: "A strong, clear, and urgent call to action, e.g., 'Shop Now & Save 50%!' or 'Get Yours Before It's Gone'."
        },
        hashtags: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "An array of 5-7 highly relevant and trending hashtags."
        }
    },
    required: ["headline", "body", "callToAction", "hashtags"]
};

export const transactionCategorySchema = {
    type: Type.OBJECT,
    properties: {
        category: {
            type: Type.STRING,
            description: "The most appropriate financial category for the transaction, selected from the provided list."
        }
    },
    required: ["category"]
};
