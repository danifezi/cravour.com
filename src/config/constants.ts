
// Schemas for reference or potential future client-side use.
// The primary schemas are now located on the backend in `functions/services/schemas.js`.

import { Type } from '@google/genai';

export const shoppingPlanSchema = {
    type: Type.OBJECT,
    properties: {
        budgetAnalysis: {
            type: Type.OBJECT,
            properties: {
                userBudget: { type: Type.NUMBER },
                estimatedCost: { type: Type.NUMBER },
                difference: { type: Type.NUMBER },
                summary: { type: Type.STRING },
                optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        budgetItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    estimatedPrice: { type: Type.NUMBER }
                }
            }
        },
        priceAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    priceStability: { type: Type.STRING },
                    savingTip: { type: Type.STRING }
                }
            }
        },
        recommendedMerchants: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    address: { type: Type.STRING },
                    deals: { type: Type.STRING },
                    verified: { type: Type.BOOLEAN }
                }
            }
        }
    }
};

export const adCopySchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING },
        body: { type: Type.STRING },
        callToAction: { type: Type.STRING },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
};

export const transactionCategorySchema = {
    type: Type.OBJECT,
    properties: {
        category: { type: Type.STRING }
    }
};