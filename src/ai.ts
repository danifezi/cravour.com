
import { GoogleGenAI } from "@google/genai";
import { shoppingPlanSchema } from "./config/constants";
import { ShoppingPlan } from "./types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a comprehensive shopping plan from a single user description.
 * @param description The user's shopping goal, including items, budget, and location.
 * @returns A promise that resolves to the structured, typed shopping plan object.
 * @throws An error if the AI call fails or returns an invalid response.
 */
export async function generateShoppingPlan(description: string): Promise<ShoppingPlan> {
    if (!apiKey) {
        throw new Error("API key is missing. Please configure your environment variables.");
    }
    
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

        const planData: ShoppingPlan = JSON.parse(response.text);
        
        // Basic validation to ensure the AI returned a structured object
        if (!planData || !planData.budgetAnalysis || !planData.budgetItems) {
            throw new Error("AI returned an incomplete or invalid data structure.");
        }

        return planData;

    } catch (err) {
        console.error("AI Generation Error:", err);
        throw new Error("Failed to generate a shopping plan from the AI service.");
    }
}
