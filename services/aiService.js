
const { GoogleGenAI } = require('@google/genai');
const {
    shoppingPlanSchema,
    adCopySchema,
    dashboardReportSchema,
    transactionCategorySchema
} = require('../src/config/constants');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

/**
 * A helper function to call the Gemini API with a given prompt and schema.
 * @param {string} prompt - The text prompt to send to the model.
 * @param {object} schema - The response schema for structured JSON output.
 * @returns {Promise<object>} The parsed JSON response from the AI.
 */
async function generateStructuredContent(prompt, schema) {
    try {
        const response = await ai.models.generateContent({
            model,
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

const generateDashboardReport = (transactionsString) => {
    const prompt = `You are a financial analyst AI. Generate a dashboard report in Nigerian Naira (NGN) for a user with these recent transactions:
    ${transactionsString}.
    Your response MUST be a valid JSON object.
    1.  Calculate 'totalSpent' (sum of outgoing transactions only).
    2.  Calculate 'avgDailySpend' (assume a 30-day month).
    3.  Identify the 'topCategory' by spending.
    4.  For 'financialHealth', provide a 'score' (0-100), a one-sentence 'summary', and 1-2 concise, actionable 'recommendations'.
    5.  The 'transactions' array in your response should only include the 5 most recent transactions from the provided data.
    Adhere strictly to the response schema.`;
    return generateStructuredContent(prompt, dashboardReportSchema);
};

const generateAdCopy = (description) => {
    const prompt = `You are a professional marketing copywriter for the Nigerian market. Use this description: "${description}" to generate exciting and professional ad copy. Return a JSON object following the schema.`;
    return generateStructuredContent(prompt, adCopySchema);
};

const categorizeTransaction = (description) => {
    const prompt = `From the transaction description "${description}", pick the single best category from this list: Groceries, Transport, Utilities, Food & Dining, Health, Education, Rent, Bills, Airtime & Data, Savings, Miscellaneous. Your response must be a JSON object with a single key "category".`;
    return generateStructuredContent(prompt, transactionCategorySchema);
};

module.exports = {
    generateShoppingPlan,
    generateDashboardReport,
    generateAdCopy,
    categorizeTransaction,
};
