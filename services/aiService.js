const { GoogleGenAI } = require('@google/genai');
const { shoppingPlanSchema } = require('./schemas.js');

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

module.exports = {
    generateShoppingPlan,
};
