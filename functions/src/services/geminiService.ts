import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part, Schema } from '@google/genai';
import { ApiError } from '../middleware/errorMiddleware';
import * as schemas from '../config/aiSchemas';

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
    console.warn("WARNING: GEMINI_API_KEY is not set. AI services will be unavailable.");
}

function ensureAiReady(): GoogleGenAI {
    if (!ai) {
        throw new ApiError("AI service is not configured on the server. Please set the GEMINI_API_KEY.", 503);
    }
    return ai;
}

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

async function generateStructuredContent(prompt: string, schema: Schema) {
    const aiClient = ensureAiReady();
    try {
        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                safetySettings,
            },
        });
        
        const responseText = response.text?.trim();
        if (!responseText) {
            throw new ApiError("AI returned an empty response.", 500);
        }
        
        return JSON.parse(responseText);
    } catch (error) {
        console.error(`AI Structured Content Error: ${(error as Error).message}`);
        throw new ApiError("The AI failed to generate a valid response. Please try rephrasing your request.", 500);
    }
}

export const geminiService = {
    generateShoppingPlan: (description: string) => {
        const prompt = `You are an expert Nigerian financial planner. A user wants a shopping plan for: "${description}". Analyze the request to identify items, budget, and location. Generate a detailed financial plan using current, realistic Nigerian market prices (in NGN). Your response MUST be a single, valid JSON object that strictly adheres to the provided schema.`;
        return generateStructuredContent(prompt, schemas.shoppingPlanSchema);
    },

    generateAdCopy: (description: string) => {
        const prompt = `Create professional, engaging social media ad copy for a Nigerian business based on this: "${description}". The tone should be exciting and clear. Return a JSON object adhering to the schema.`;
        return generateStructuredContent(prompt, schemas.adCopySchema);
    },

    generateFinancialHealthInsight: (context: any) => {
        const prompt = `Analyze this user's financial data for the month: ${JSON.stringify(context)}. Provide a financial health score (0-100), a one-sentence summary, and 1-2 concise, actionable recommendations for a Nigerian user. The tone should be encouraging but direct.`;
        return generateStructuredContent(prompt, schemas.financialHealthSchema);
    },

    categorizeTransaction: (description: string): Promise<{ category: string }> => {
        const prompt = `Given the transaction description "${description}" and the available categories [Groceries, Transport, Utilities, Entertainment, Health, Other], pick the single most appropriate category.`;
        return generateStructuredContent(prompt, schemas.transactionCategorySchema);
    },

    generateAdImage: async (description: string): Promise<string> => {
        const aiClient = ensureAiReady();
        const prompt = `A vibrant, professional, and eye-catching advertisement image for a Nigerian audience, suitable for social media. The ad is for: ${description}. The image should be clean, modern, and aspirational.`;
        try {
            const response = await aiClient.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: '1:1',
                },
            });
            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
            throw new Error('AI did not return an image.');
        } catch (error) {
            console.error(`AI Image Generation Error: ${(error as Error).message}`);
            return "https://via.placeholder.com/300?text=Image+Gen+Failed";
        }
    }
};
