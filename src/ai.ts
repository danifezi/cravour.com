import { GoogleGenAI } from "@google/genai";
import { shoppingPlanSchema, adCopySchema } from "./config/constants";
import { ShoppingPlan, AdCopy } from "./types";

const apiKey = process.env.API_KEY || '';
if (!apiKey) {
    console.error("API key is missing. Please configure your .env file. AI features will not work.");
}
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a comprehensive shopping plan from a single user description.
 * @param description The user's shopping goal, including items, budget, and location.
 * @returns A promise that resolves to the structured, typed shopping plan object.
 * @throws An error if the AI call fails or returns an invalid response.
 */
export async function generateShoppingPlan(description: string): Promise<ShoppingPlan> {
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

        const responseText = response.text;
        if (typeof responseText !== 'string' || !responseText.trim()) {
            throw new Error("AI returned an empty or invalid response.");
        }

        const planData: ShoppingPlan = JSON.parse(responseText);
        // Basic validation on the parsed object
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
 * @param description The merchant's description of their product/offer.
 * @returns A promise resolving to an AdCopy object.
 */
export async function generateAdCopy(description: string): Promise<AdCopy> {
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
        const data = JSON.parse(response.text);
        if (!data.headline || !data.body || !data.hashtags || !data.callToAction) {
            throw new Error("AI returned incomplete ad copy data.");
        }
        return data;
    } catch (err) {
        console.error("AI Generation Error (Ad Copy):", err);
        throw new Error("Failed to generate ad copy.");
    }
}

/**
 * Generates a promotional image from a description.
 * @param description The merchant's description of their product/offer.
 * @returns A promise resolving to the Base64 encoded string of the generated image.
 */
export async function generateAdImage(description: string): Promise<string> {
    const prompt = `Create a visually stunning, professional promotional flier suitable for social media in Nigeria. The flier is for: ${description}. The design should be modern, clean, and vibrant, using brand colors of gold (#FFC107) and dark charcoal grey. It should prominently feature the product or offer. It should look like a polished piece of graphic design, not a raw photograph. Feel free to incorporate abstract design elements that match the product's feel. Do not include any placeholder text like 'Your text here'. The image must feel like a finished advertisement.`;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("AI did not return any images.");
        }

        return response.generatedImages[0].image.imageBytes;
    } catch (err) {
        console.error("AI Generation Error (Ad Image):", err);
        throw new Error("Failed to generate ad image.");
    }
}