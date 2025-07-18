
const { GoogleGenAI } = require('@google/genai');
const {
    shoppingPlanSchema,
    adCopySchema,
    financialHealthSchema,
    transactionCategorySchema
} = require('./schemas.js');

// Conditionally initialize the AI client to prevent crashes on startup
let ai;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
    console.warn("WARNING: GEMINI_API_KEY is not set. AI services will be unavailable.");
}

/**
 * A helper function to call the Gemini API with a given prompt and schema.
 * Checks for AI client availability before making a request.
 * @param {string} prompt - The text prompt to send to the model.
 * @param {object} schema - The response schema for structured JSON output.
 * @returns {Promise<object>} The parsed JSON response from the AI.
 */
async function generateStructuredContent(prompt, schema) {
    if (!ai) {
        throw new Error("AI service is not configured on the server. Please set the GEMINI_API_KEY environment variable.");
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error("AI returned an empty response.");
        }
        return JSON.parse(responseText);
    } catch (error) {
        console.error(`AI Generation Error: ${error.message}`);
        throw new Error("Failed to generate content from the AI service.");
    }
}

const generateShoppingPlan = (description) => {
    const prompt = `You are an expert Nigerian financial planner. A user wants a shopping plan for: "${description}".
    Analyze the request to identify items, budget, and location.
    Generate a detailed financial plan using current, realistic Nigerian market prices (in NGN).
    Your response MUST be a single, valid JSON object that strictly adheres to the provided schema.`;
    return generateStructuredContent(prompt, shoppingPlanSchema);
};

const generateFinancialHealthInsight = (context) => {
    const prompt = `You are a financial analyst AI. Based on this monthly financial summary for a user in Nigeria (in NGN):
    - Total Spent: ${context.totalSpent.toLocaleString()}
    - Total Income: ${context.income.toLocaleString()}
    - Number of Expenses: ${context.numberOfExpenses}
    - Top Spending Category: ${context.topCategory}
    
    Please provide a financial health assessment. Your response MUST be a valid JSON object containing:
    1. 'score': A numerical score from 0-100 (higher is better).
    2. 'summary': A one-sentence summary of the user's financial health.
    3. 'recommendations': An array with 1-2 concise, actionable recommendations.
    Adhere strictly to the provided JSON schema.`;
    return generateStructuredContent(prompt, financialHealthSchema);
};

const generateAdCopy = (description) => {
    const prompt = `You are a professional marketing copywriter for the Nigerian market. Use this description: "${description}" to generate exciting and professional ad copy. Return a JSON object following the schema.`;
    return generateStructuredContent(prompt, adCopySchema);
};

const generateAdImage = async (description) => {
    if (!ai) {
        throw new Error("AI service is not configured on the server.");
    }
    const prompt = `Create a vibrant, professional, and eye-catching advertisement image that visually represents this promotion: "${description}". The style should be modern, clean, and appealing to a Nigerian audience. Focus on the key product or concept. For example, if it's about shoes, show stylish shoes. If it's a discount, incorporate percentage signs creatively.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("AI did not return an image.");
        }
        
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch(error) {
        console.error(`AI Image Generation Error: ${error.message}`);
        throw new Error("Failed to generate an image from the AI service.");
    }
};


const categorizeTransaction = (description) => {
    const prompt = `From the transaction description "${description}", pick the single best category from this list: Groceries, Transport, Utilities, Food & Dining, Health, Education, Rent, Bills, Airtime & Data, Savings, Miscellaneous. Your response must be a JSON object with a single key "category".`;
    return generateStructuredContent(prompt, transactionCategorySchema);
};

module.exports = {
    generateShoppingPlan,
    generateFinancialHealthInsight,
    generateAdCopy,
    generateAdImage,
    categorizeTransaction,
};
