
import { GoogleGenAI, Type } from "@google/genai";
import { shoppingPlanSchema, adCopySchema, dashboardReportSchema } from "./config/constants.js";

const apiKey = process.env.API_KEY;

// Conditionally initialize `ai` only if a valid API key is provided.
// This prevents the constructor from throwing an error and crashing the script on load.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// If no API key is found at startup, log a warning for the developer.
if (!ai) {
    console.warn("API key is missing or invalid. AI features will not be available. Please set the API_KEY environment variable.");
}

/**
 * A helper function to ensure the AI instance is ready before making a call.
 * Throws a specific, catchable error if the AI is not available.
 */
function ensureApiIsReady() {
    if (!ai) {
        throw new Error("AI service is not available due to a missing API key.");
    }
}

/**
 * Generates a comprehensive shopping plan from a single user description.
 * @param {string} description The user's shopping goal, including items, budget, and location.
 * @returns {Promise<object>} A promise that resolves to the structured, typed shopping plan object.
 * @throws An error if the AI call fails or returns an invalid response.
 */
export async function generateShoppingPlan(description) {
    ensureApiIsReady();
    const prompt = `A user in Nigeria provides the following shopping goal: "${description}". 
    From this text, you must extract the items, the user's total budget, and their location (e.g., city/area).
    Then, generate a complete shopping plan based on current, realistic Nigerian market prices (in NGN).
    Your response must be a single JSON object that strictly follows the provided schema and includes:
    1.  A 'budgetAnalysis' object comparing the user's budget to the AI-estimated total cost.
    2.  A 'budgetItems' array detailing each item, its quantity, and its AI-estimated price.
    3.  A 'priceAnalysis' array for each item, commenting on its current price stability and offering a specific saving tip.
    4.  A 'recommendedMerchants' array of 3-4 real-sounding local merchants in the user's specified location that are suitable for purchasing these items.`;

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

        const planData = JSON.parse(responseText);
        if (!planData || !planData.budgetAnalysis || !planData.budgetItems) {
            throw new Error("AI returned an incomplete or invalid data structure.");
        }
        return planData;
    } catch (err) {
        console.error("AI Generation Error (Shopping Plan):", err);
        throw new Error("Failed to generate a shopping plan from the AI service.");
    }
}

/**
 * Generates structured social media ad copy from a description.
 * @param {string} description The merchant's description of their product/offer.
 * @returns {Promise<object>} A promise resolving to an AdCopy object.
 */
export async function generateAdCopy(description) {
    ensureApiIsReady();
    const prompt = `Based on this description: "${description}", generate professional, engaging social media ad copy for a business in Nigeria. The copy should be exciting and clear. Return a JSON object with a 'headline' (a short, catchy title), a 'body' (2-3 sentences of descriptive text), a short, punchy 'callToAction' (e.g., 'Shop Now!', 'Learn More'), and an array of 5-7 relevant 'hashtags'.`;
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
        
        const data = JSON.parse(responseText);
        if (!data.headline || !data.body || !data.hashtags || !data.callToAction) {
            throw new Error("AI returned incomplete ad copy data.");
        }
        return data;
    } catch (err) {
        console.error("AI Generation Error (Ad Copy):", err);
        throw new Error("Failed to generate ad copy from the AI service.");
    }
}

/**
 * Generates a dashboard report with sample data.
 * @returns {Promise<object>} A promise resolving to a DashboardReport object.
 */
export async function generateDashboardReport() {
    ensureApiIsReady();
    const prompt = "Generate a sample monthly expense report dashboard in Nigerian Naira (NGN) for a young professional in Lagos. Include total spending, average daily spend, the top spending category name, a breakdown of spending by 4-5 categories (like Food, Transport, Utilities), and a list of 4 sample transactions (include one 'in' type transaction like 'Wallet Top-up').";
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
        const data = JSON.parse(responseText);
        
        if (!data.totalSpent || !data.spendingByCategory || !data.transactions) {
            throw new Error("AI returned incomplete dashboard data.");
        }
        return data;
    } catch (err) {
        console.error("AI Generation Error (Dashboard Report):", err);
        throw new Error("Failed to generate the dashboard report from the AI service.");
    }
}
