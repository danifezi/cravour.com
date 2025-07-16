import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
    shoppingPlanSchema, adCopySchema, dashboardReportSchema,
    shoppingPlanSchemaZod, adCopySchemaZod, dashboardReportSchemaZod
} from "./config/constants.js";
import { ShoppingPlan, AdCopy, DashboardReport } from "./types.js";
import { withRetry } from "./utils.js";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
    console.warn("API key is missing or invalid. AI features will be disabled. Set the API_KEY environment variable in your build process.");
}

/**
 * Custom error class for more specific AI-related failures.
 */
class AIGenerationError extends Error {
    constructor(message: string, public readonly details?: any) {
        super(message);
        this.name = "AIGenerationError";
    }
}

/**
 * Type assertion function to ensure the AI instance is ready.
 */
function ensureApiIsReady(aiInstance: typeof ai): asserts aiInstance is NonNullable<typeof ai> {
    if (!aiInstance) {
        throw new AIGenerationError("AI service is not available due to a missing API key.");
    }
}

/**
 * A generic, robust function to generate and validate structured content from the AI.
 * @param prompt The instructional prompt for the AI.
 * @param aiResponseSchema The schema for the Google GenAI API call.
 * @param zodSchema The Zod schema for runtime validation of the response.
 * @returns A promise that resolves to the validated, structured data.
 */
async function generateStructuredContent<T>(
    prompt: string,
    aiResponseSchema: any,
    zodSchema: z.ZodSchema<T>
): Promise<T> {
    ensureApiIsReady(ai);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: aiResponseSchema,
            temperature: 0.2, // Low temperature for more predictable, structured JSON output
        },
    });

    const responseText = response.text;
    if (!responseText) {
        throw new AIGenerationError("AI returned an empty response.");
    }

    let parsedContent;
    try {
        parsedContent = JSON.parse(responseText);
    } catch (e) {
        console.error("Failed to parse AI JSON response:", responseText);
        throw new AIGenerationError("AI returned a malformed response.", { response: responseText });
    }

    const validationResult = zodSchema.safeParse(parsedContent);
    if (!validationResult.success) {
        console.error("Zod validation failed:", validationResult.error.flatten());
        throw new AIGenerationError("AI response did not match the expected structure.", { errors: validationResult.error.flatten() });
    }

    return validationResult.data;
}

// --- EXPORTED API FUNCTIONS ---

export async function generateShoppingPlan(description: string): Promise<ShoppingPlan> {
    const prompt = `A user in Nigeria provides the following shopping goal: "${description}". If the user does not specify a budget, assume a default budget of 50000 NGN. If no location is provided, assume 'Lagos'.
    From this text, you must extract the items, the user's total budget, and their location.
    Then, generate a complete shopping plan based on current, realistic Nigerian market prices (in NGN).
    Your response must be a single JSON object that strictly follows the provided schema.
    Crucially, in the 'recommendedMerchants' array, prioritize merchants that offer the best value or lowest prices. Sort the merchants based on who offers the best overall value for the requested items.`;

    try {
        return await withRetry(() =>
            generateStructuredContent(prompt, shoppingPlanSchema, shoppingPlanSchemaZod)
        );
    } catch (err) {
        console.error("AI Generation Error (Shopping Plan):", err);
        const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
        throw new Error(`Failed to generate shopping plan: ${errorMessage}`);
    }
}

export async function generateAdCopy(description: string): Promise<AdCopy> {
    const prompt = `An advertiser in Nigeria provides this description for a promotion: "${description}".
    Generate professional and highly engaging social media ad copy.
    Your response must be a JSON object strictly following the schema, containing:
    - 'headline': A short, punchy, and attention-grabbing title.
    - 'body': Persuasive and clear ad text (2-3 sentences).
    - 'callToAction': A strong and direct call to action (e.g., 'Shop Now & Save!', 'Visit Our Lekki Store Today!').
    - 'hashtags': An array of 5-7 relevant and targeted hashtags for platforms like Instagram and Facebook.`;

    try {
        return await withRetry(() =>
            generateStructuredContent(prompt, adCopySchema, adCopySchemaZod)
        );
    } catch (err) {
        console.error("AI Generation Error (Ad Copy):", err);
        const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
        throw new Error(`Failed to generate ad copy: ${errorMessage}`);
    }
}

export async function generateDashboardReport(): Promise<DashboardReport> {
    const prompt = `Generate a realistic sample monthly expense report dashboard in Nigerian Naira (NGN) for a young professional living in Lagos.
    The response must be a JSON object that strictly follows the provided schema, containing:
    - totalSpent: A plausible total amount spent for the month.
    - avgDailySpend: The calculated average daily spending.
    - topCategory: The single highest spending category name (e.g., 'Food & Dining').
    - spendingByCategory: An array of 4-5 diverse categories (e.g., 'Transport', 'Groceries', 'Bills & Utilities', 'Entertainment') with their respective total amounts.
    - transactions: An array of 4 realistic sample transactions, including at least one 'in' type transaction (e.g., 'Salary', 'Wallet Top-up'). Dates should be concise (e.g., 'Sep 21').`;

    try {
        return await withRetry(() =>
            generateStructuredContent(prompt, dashboardReportSchema, dashboardReportSchemaZod)
        );
    } catch (err) {
        console.error("AI Generation Error (Dashboard Report):", err);
        const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
        throw new Error(`Failed to generate dashboard report: ${errorMessage}`);
    }
}