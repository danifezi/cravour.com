
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { GoogleGenAI } from "@google/genai";
import { shoppingPlanSchema } from '../src/config/constants';
import { ShoppingPlan } from '../src/types';

// Mock the @google/genai module.
jest.mock('@google/genai');

const MockedGoogleGenAI = GoogleGenAI as jest.Mock;

// Explicitly type the mock function to satisfy TypeScript.
const mockGenerateContent = jest.fn<(args: {
    model: string;
    contents: string;
    config: {
        responseMimeType: string;
        responseSchema: any;
    };
}) => Promise<{ text: string }>>();

MockedGoogleGenAI.mockImplementation(() => ({
    models: {
        generateContent: mockGenerateContent,
    },
}));

// Use dynamic import to test changes to process.env
let generateShoppingPlan: (description: string) => Promise<ShoppingPlan>;

describe('AI Function: generateShoppingPlan', () => {
    const originalApiKey = process.env.API_KEY;

    beforeEach(async () => {
        // Reset mocks and environment before each test
        mockGenerateContent.mockClear();
        MockedGoogleGenAI.mockClear();
        process.env.API_KEY = 'mock-api-key';

        // Re-import the module to get a fresh instance with the updated environment
        const aiModule = await import('../src/ai');
        generateShoppingPlan = aiModule.generateShoppingPlan;
    });

    afterEach(() => {
        // Restore original environment and reset modules
        process.env.API_KEY = originalApiKey;
        jest.resetModules();
    });

    it('should successfully call the AI and return parsed JSON data', async () => {
        const description = "Test description";
        const mockAiResponseData: ShoppingPlan = {
            budgetAnalysis: { userBudget: 2000, estimatedCost: 1500, difference: 500, summary: "Budget is sufficient." },
            budgetItems: [{ itemName: "Milk", quantity: "1 tin", estimatedPrice: 1200 }],
            priceAnalysis: [{ itemName: "Milk", priceStability: "Stable", savingTip: "Buy in bulk." }],
            recommendedMerchants: [{ name: "Shoprite", address: "Ikeja", deals: "Discount available." }]
        };
        
        mockGenerateContent.mockResolvedValue({
            text: JSON.stringify(mockAiResponseData),
        });

        const result = await generateShoppingPlan(description);

        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const callArgs = mockGenerateContent.mock.calls[0][0];
        expect(callArgs.model).toBe("gemini-2.5-flash");
        expect(callArgs.contents).toContain(description);
        expect(callArgs.config.responseSchema).toEqual(shoppingPlanSchema);
        expect(result).toEqual(mockAiResponseData);
    });

    it('should throw an error when the AI service call fails', async () => {
        const description = "some goal";
        const aiError = new Error("Network failure");
        mockGenerateContent.mockRejectedValue(aiError);
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(generateShoppingPlan(description)).rejects.toThrow(
            "Failed to generate a shopping plan from the AI service."
        );
        
        expect(consoleSpy).toHaveBeenCalledWith("AI Generation Error:", aiError);
        consoleSpy.mockRestore();
    });

    it('should throw an error if API key is not configured', async () => {
        process.env.API_KEY = '';

        const { generateShoppingPlan: newGenerateShoppingPlan } = await import('../src/ai');
        
        await expect(newGenerateShoppingPlan('any description')).rejects.toThrow(
            'API key is missing. Please configure your environment variables.'
        );

        expect(mockGenerateContent).not.toHaveBeenCalled();
    });
});
