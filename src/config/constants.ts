import { Type } from "@google/genai";

export const API_CONFIG = {
    TEMPERATURE: 0.7,
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000,
    CACHE_TTL: 60 * 60 * 1000, // 1 hour
    FALLBACK_MESSAGE: "I apologize, but I couldn't generate the requested data right now. Please try again later.",
};

const objectType = Type.OBJECT;
const arrayType = Type.ARRAY;
const stringType = Type.STRING;
const numberType = Type.NUMBER;

export const PRICE_SCHEMA = {
    type: arrayType,
    items: {
        type: objectType,
        properties: {
            itemName: { type: stringType },
            currentPrice: { type: numberType },
            priceChange: { type: numberType }
        },
        required: ["itemName", "currentPrice", "priceChange"]
    }
};

export const PLAN_SCHEMA = {
    type: objectType,
    properties: {
        estimatedTotal: { type: numberType },
        items: {
            type: arrayType,
            items: {
                type: objectType,
                properties: {
                    itemName: { type: stringType },
                    category: { type: stringType },
                    quantity: { type: stringType },
                    estimatedPrice: { type: numberType }
                },
                required: ["itemName", "category", "quantity", "estimatedPrice"]
            }
        },
        notes: { type: stringType }
    },
    required: ["estimatedTotal", "items"]
};

export const PRICE_REPORT_SCHEMA = {
    type: objectType,
    properties: {
        overallSummary: { type: stringType },
        savingTips: { type: stringType },
        itemReports: {
            type: arrayType,
            items: {
                type: objectType,
                properties: {
                    itemName: { type: stringType },
                    averagePrice: { type: stringType },
                    stability: { type: stringType }
                },
                required: ["itemName", "averagePrice", "stability"]
            }
        }
    },
    required: ["overallSummary", "savingTips", "itemReports"]
};

export const MERCHANT_SCHEMA = {
    type: arrayType,
    items: {
        type: objectType,
        properties: {
            name: { type: stringType },
            address: { type: stringType },
            deals: { type: stringType },
        },
        required: ["name", "address", "deals"]
    }
};

export const EXPENSE_REPORT_SCHEMA = {
    type: objectType,
    properties: {
        totalSpent: { type: numberType },
        avgDailySpend: { type: numberType },
        spendingByCategory: {
            type: arrayType,
            items: {
                type: objectType,
                properties: { category: { type: stringType }, amount: { type: numberType } },
                required: ["category", "amount"]
            }
        },
        transactions: {
            type: arrayType,
            items: {
                type: objectType,
                properties: {
                    date: { type: stringType },
                    item: { type: stringType },
                    category: { type: stringType },
                    amount: { type: numberType }
                },
                required: ["date", "item", "category", "amount"]
            }
        },
        insights: { type: stringType }
    },
    required: ["totalSpent", "avgDailySpend", "spendingByCategory", "transactions"]
};

export const FALLBACK_DATA = {
    PRICE_DATA: [
        { itemName: "Rice (50kg Bag)", currentPrice: 55000, priceChange: 500 },
        { itemName: "Petrol (1L)", currentPrice: 650, priceChange: -5 },
        { itemName: "Eggs (Crate)", currentPrice: 2800, priceChange: 0 },
        { itemName: "Garri (Paint Bucket)", currentPrice: 4200, priceChange: 150 },
        { itemName: "Yam (Medium)", currentPrice: 1800, priceChange: -100 },
        { itemName: "Detergent (1kg)", currentPrice: 1200, priceChange: 20 },
    ],
    EXPENSE_REPORT: {
        totalSpent: 120000, avgDailySpend: 4000,
        spendingByCategory: [
            { category: "Food", amount: 50000 }, { category: "Transport", amount: 25000 },
            { category: "Utilities", amount: 20000 }, { category: "Entertainment", amount: 15000 },
        ],
        transactions: [
            { date: "Aug 25", item: "Groceries", category: "Food", amount: 15000 },
            { date: "Aug 24", item: "Uber", category: "Transport", amount: 3500 },
        ],
        insights: "Spending seems consistent. Consider bulk buying for food to save more."
    },
    EMPTY_MERCHANTS: [],
    EMPTY_PLAN: {
        estimatedTotal: 0, items: [], notes: "Could not generate a plan. Please try rephrasing your goal.",
    },
    EMPTY_PRICE_REPORT: {
        overallSummary: "Market data could not be retrieved.", savingTips: "Compare prices from different vendors.", itemReports: [],
    }
};
