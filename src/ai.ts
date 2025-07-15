import { GoogleGenAI, Type } from "@google/genai";
import { API_CONFIG, FALLBACK_DATA, PRICE_SCHEMA, PLAN_SCHEMA, PRICE_REPORT_SCHEMA, MERCHANT_SCHEMA, EXPENSE_REPORT_SCHEMA } from './config/constants';
import { BudgetPlanItem, BudgetPlanResponse, PriceReportResponse, Merchant, ExpenseReportResponse, PriceDataItem } from './types';
import { getCachedData, setCachedData } from './utils';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Gemini API Key is missing. Please set GEMINI_API_KEY in your .env file.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

async function callAIWithRetry<T>(prompt: string, schema: any, retries: number = 0): Promise<T> {
    if (!apiKey) {
        console.warn("API Key not available. Returning empty data structure.");
        if (schema.type === Type.ARRAY) return [] as T;
        if (schema.type === Type.OBJECT) {
             return { totalSpent: 0, items: [], spendingByCategory: [], transactions: [], overallSummary: "", savingTips: "", itemReports: [] } as T;
        }
        return {} as T;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: API_CONFIG.TEMPERATURE,
            },
        });

        const parsedResponse: T = JSON.parse(response.text);
        if (!parsedResponse || (Array.isArray(parsedResponse) && parsedResponse.length === 0) || (typeof parsedResponse === 'object' && Object.keys(parsedResponse).length === 0)) {
             throw new Error("AI returned empty structured response.");
        }
        return parsedResponse;
    } catch (err) {
        console.error(`AI call failed (attempt ${retries + 1}/${API_CONFIG.MAX_RETRIES}):`, err);
        if (retries < API_CONFIG.MAX_RETRIES) {
            const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, retries);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callAIWithRetry<T>(prompt, schema, retries + 1);
        }
        throw new Error(`AI request failed after ${API_CONFIG.MAX_RETRIES} retries: ${err instanceof Error ? err.message : String(err)}`);
    }
}

export async function fetchPriceData(): Promise<PriceDataItem[]> {
    const cacheKey = 'cravour-price-data';
    const cachedData = getCachedData<PriceDataItem[]>(cacheKey);
    if (cachedData) return cachedData;

    const prompt = `Generate a realistic list of exactly 6 common daily food and essential items in Nigeria (e.g., Rice, Petrol, Eggs, Garri, Tomatoes, Cooking Gas), typical of recent market conditions. For each item, provide a plausible current average price in Nigerian Naira (NGN) and a recent 24-hour price change value (positive for increase, negative for decrease, or zero for no change). Ensure prices are reasonable for the Nigerian market.`;

    try {
        const data = await callAIWithRetry<PriceDataItem[]>(prompt, PRICE_SCHEMA);
        if (!data || data.length === 0) throw new Error("Empty data from AI");
        setCachedData(cacheKey, data);
        return data;
    } catch (err) {
        console.error("Error fetching price data from AI:", err);
        return FALLBACK_DATA.PRICE_DATA;
    }
}

export async function generatePlan(description: string): Promise<BudgetPlanResponse> {
    const prompt = `Based on the user's financial goal: "${description}", create a detailed, actionable budget plan in Nigerian Naira (NGN). The plan should include an array of clear and specific items with their names, relevant categories (e.g., 'Groceries', 'Utilities'), realistic quantities, and estimated prices. Also provide an overall estimated total cost. Add a brief note or recommendation for the user. Ensure all prices are realistic for current Nigerian market conditions. If the description is too vague, return an empty items array and a relevant note.`;

    try {
        const plan = await callAIWithRetry<BudgetPlanResponse>(prompt, PLAN_SCHEMA);
        if (!plan || !plan.items) return { ...FALLBACK_DATA.EMPTY_PLAN, notes: plan?.notes || FALLBACK_DATA.EMPTY_PLAN.notes };
        return plan;
    } catch (err) {
        console.error("Error generating plan from AI:", err);
        return FALLBACK_DATA.EMPTY_PLAN;
    }
}

export async function generatePriceReportForPlan(items: BudgetPlanItem[]): Promise<PriceReportResponse> {
    if (items.length === 0) return FALLBACK_DATA.EMPTY_PRICE_REPORT;
    const itemNames = items.map(i => i.itemName).join(', ');
    const prompt = `For the following shopping list items for a user in Nigeria: "${itemNames}", generate a concise market price report. The report should include the average market price (or plausible price range) for each item in NGN, a brief comment on price stability/trend (e.g., 'Stable', 'Slight Increase'), one or two actionable money-saving tips related to these items, and a general market summary for these specific items.`;

    try {
        const report = await callAIWithRetry<PriceReportResponse>(prompt, PRICE_REPORT_SCHEMA);
        if (!report || !report.itemReports) return FALLBACK_DATA.EMPTY_PRICE_REPORT;
        return report;
    } catch (err) {
        console.error("Error generating price report from AI:", err);
        return FALLBACK_DATA.EMPTY_PRICE_REPORT;
    }
}

export async function findMerchantsForPlan(items: BudgetPlanItem[], location: { city: string, lga: string, category?: string }): Promise<Merchant[]> {
    if (items.length === 0 && !location.category) {
        return FALLBACK_DATA.EMPTY_MERCHANTS;
    }

    const itemNames = items.slice(0, 5).map(i => i.itemName).join(', ');
    const locationPart = location.lga ? `${location.lga}, ${location.city}` : location.city;
    
    let contextPrompt: string;
    if (itemNames) {
        contextPrompt = `Based on a shopping list containing items like "${itemNames}"`;
    } else if (location.category) {
        contextPrompt = `For the category "${location.category}"`;
    } else {
        // This case should not be reached due to the initial check.
        return FALLBACK_DATA.EMPTY_MERCHANTS;
    }

    const prompt = `${contextPrompt}, find 3-4 popular and realistic merchants in ${locationPart}, Nigeria. These merchants should be suitable for these types of goods. For each, provide their practical name, local address (e.g., area/market name), and a short description of their deals or what they are known for. Ensure these are plausible Nigerian businesses.`;

    try {
        const merchants = await callAIWithRetry<Merchant[]>(prompt, MERCHANT_SCHEMA);
        if (!merchants) return FALLBACK_DATA.EMPTY_MERCHANTS;
        return merchants;
    } catch (err) {
        console.error("Error finding merchants for plan from AI:", err);
        return FALLBACK_DATA.EMPTY_MERCHANTS;
    }
}

export async function fetchExpenseReport(): Promise<ExpenseReportResponse> {
    const cacheKey = 'cravour-expense-report';
    const cachedData = getCachedData<ExpenseReportResponse>(cacheKey);
    if (cachedData) return cachedData;

    const prompt = `Generate a realistic sample monthly expense report in Nigerian Naira (NGN) for a young professional in Lagos. The report should include:
    1. A plausible total amount spent.
    2. An average daily spend.
    3. A breakdown of spending for 4-5 distinct categories (e.g., Food, Transport, Utilities).
    4. A list of 4-5 sample recent transactions with date, item, category, and amount.
    5. A brief insight or observation about the spending behavior.
    Ensure all amounts are realistic for someone living in Lagos.`;

    try {
        const report = await callAIWithRetry<ExpenseReportResponse>(prompt, EXPENSE_REPORT_SCHEMA);
        if (!report || !report.spendingByCategory) throw new Error("Empty report from AI");
        setCachedData(cacheKey, report);
        return report;
    } catch (err) {
        console.error("Error fetching expense report from AI:", err);
        return FALLBACK_DATA.EXPENSE_REPORT;
    }
}
