import { GoogleGenAI } from "@google/genai";
import { shoppingPlanSchema, adCopySchema, dashboardReportSchema } from "./config/constants.js";
import { ShoppingPlan, AdCopy, DashboardReport } from "./types.js";

const apiKey = process.env.API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
    console.warn("API key is missing or invalid. AI features will be disabled. Set the API_KEY environment variable in your build process.");
}

function ensureApiIsReady() {
    if (!ai) {
        throw new Error("AI service is not available due to a missing API key.");
    }
}

/**
 * Generates a comprehensive shopping plan from a single user description.
 * @param {string} description The user's shopping goal.
 * @returns {Promise<ShoppingPlan>} A promise that resolves to the structured shopping plan.
 */
export async function generateShoppingPlan(description: string): Promise<ShoppingPlan> {
    ensureApiIsReady();
    const prompt = `A user in Nigeria provides the following shopping goal: "${description}". 
    From this text, you must extract the items, the user's total budget, and their location (e.g., city/area).
    Then, generate a complete shopping plan based on current, realistic Nigerian market prices (in NGN).
    Your response must be a single JSON object that strictly follows the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: shoppingPlanSchema,
            },
        });

        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error("AI returned an empty or invalid response.");
        }
        return JSON.parse(responseText);
    } catch (err) {
        console.error("AI Generation Error (Shopping Plan):", err);
        throw new Error("Failed to generate a shopping plan from the AI service.");
    }
}

/**
 * Generates structured social media ad copy from a description.
 * @param {string} description The merchant's description of their product/offer.
 * @returns {Promise<AdCopy>} A promise resolving to an AdCopy object.
 */
export async function generateAdCopy(description: string): Promise<AdCopy> {
    ensureApiIsReady();
    const prompt = `Based on this description: "${description}", generate professional, engaging social media ad copy for a business in Nigeria. Return a JSON object following the schema.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: adCopySchema
            }
        });
        
        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error("AI returned empty ad copy data.");
        }
        return JSON.parse(responseText);
    } catch (err) {
        console.error("AI Generation Error (Ad Copy):", err);
        throw new Error("Failed to generate ad copy from the AI service.");
    }
}

/**
 * Generates a dashboard report with sample data.
 * @returns {Promise<DashboardReport>} A promise resolving to a DashboardReport object.
 */
export async function generateDashboardReport(): Promise<DashboardReport> {
    ensureApiIsReady();
    const prompt = "Generate a sample monthly expense report dashboard in Nigerian Naira (NGN) for a young professional in Lagos. Include total spending, average daily spend, the top spending category name, a breakdown of spending by 4-5 categories, and a list of 4 sample transactions (include one 'in' type transaction like 'Wallet Top-up').";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: dashboardReportSchema },
        });

        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error("AI returned empty dashboard data.");
        }
        return JSON.parse(responseText);
    } catch (err) {
        console.error("AI Generation Error (Dashboard Report):", err);
        throw new Error("Failed to generate the dashboard report from the AI service.");
    }
}